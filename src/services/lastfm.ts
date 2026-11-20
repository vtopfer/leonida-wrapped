import { lookupArtistGenres, normalizeArtistKey } from '../data/artistCatalog';
import type {
  MultiPeriodUserData,
  PeriodInput,
  TalkVibe,
  TimePeriod,
  UserArtistInput,
  UserTrackInput,
} from '../types';

export type LastfmErrorCode =
  | 'USER_NOT_FOUND'
  | 'INVALID_KEY'
  | 'PRIVATE_PROFILE'
  | 'RATE_LIMIT'
  | 'MISSING_KEY'
  | 'EMPTY_DATA'
  | 'NETWORK';

export class LastfmServiceError extends Error {
  readonly code: LastfmErrorCode;

  constructor(code: LastfmErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'LastfmServiceError';
  }
}

const LASTFM_ENDPOINT = 'https://ws.audioscrobbler.com/2.0/';

function mapApiError(code: number | undefined, message?: string): LastfmServiceError {
  switch (code) {
    case 6:
      return new LastfmServiceError('USER_NOT_FOUND', message);
    case 10:
    case 26:
      return new LastfmServiceError('INVALID_KEY', message);
    case 17:
      return new LastfmServiceError('PRIVATE_PROFILE', message);
    case 29:
      return new LastfmServiceError('RATE_LIMIT', message);
    default:
      return new LastfmServiceError('NETWORK', message);
  }
}

async function fetchLastfmJson<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(LASTFM_ENDPOINT);
  url.searchParams.set('format', 'json');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  let res: Response;
  try {
    res = await fetch(url.toString());
  } catch {
    throw new LastfmServiceError('NETWORK');
  }

  let data: T & { error?: number; message?: string };
  try {
    data = (await res.json()) as T & { error?: number; message?: string };
  } catch {
    throw new LastfmServiceError('NETWORK');
  }

  if (typeof data.error === 'number') {
    throw mapApiError(data.error, data.message);
  }

  if (!res.ok) {
    throw new LastfmServiceError('NETWORK');
  }

  return data;
}

interface TopArtistsResponse {
  topartists?: {
    artist?: Array<{ name?: string; playcount?: string }> | { name?: string; playcount?: string };
  };
}

interface TopTracksResponse {
  toptracks?: {
    track?:
      | Array<{ name?: string; playcount?: string; artist?: { name?: string } }>
      | { name?: string; playcount?: string; artist?: { name?: string } };
  };
}

interface ArtistTagsResponse {
  toptags?: {
    tag?: Array<{ name?: string; count?: number }> | { name?: string; count?: number };
  };
}

function toArray<T>(val: T | T[] | undefined): T[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

async function fetchPeriodData(
  username: string,
  apiKey: string,
  period: TimePeriod
): Promise<PeriodInput> {
  const [artistsRes, tracksRes] = await Promise.all([
    fetchLastfmJson<TopArtistsResponse>({
      method: 'user.gettopartists',
      user: username,
      api_key: apiKey,
      period,
      limit: '40',
    }),
    fetchLastfmJson<TopTracksResponse>({
      method: 'user.gettoptracks',
      user: username,
      api_key: apiKey,
      period,
      limit: '40',
    }),
  ]);

  const artists: UserArtistInput[] = toArray(artistsRes.topartists?.artist)
    .filter((a) => Boolean(a?.name))
    .map((a) => ({
      name: a.name!.trim(),
      playcount: Number.parseInt(a.playcount ?? '0', 10) || 1,
    }));

  const tracks: UserTrackInput[] = toArray(tracksRes.toptracks?.track)
    .filter((t) => Boolean(t?.name && t?.artist?.name))
    .map((t) => ({
      title: t.name!.trim(),
      artist: t.artist!.name!.trim(),
      playcount: Number.parseInt(t.playcount ?? '0', 10) || 1,
    }));

  return { artists, tracks };
}

async function fetchArtistTopTags(artistName: string, apiKey: string): Promise<string[]> {
  try {
    const res = await fetchLastfmJson<ArtistTagsResponse>({
      method: 'artist.gettoptags',
      artist: artistName,
      api_key: apiKey,
      autocorrect: '1',
    });
    return toArray(res.toptags?.tag)
      .slice(0, 6)
      .map((tag) => (tag.name ?? '').trim().toLowerCase())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function fetchLastfmProfile(
  rawUsername: string,
  apiKey: string,
  talkVibe?: TalkVibe
): Promise<MultiPeriodUserData> {
  const username = rawUsername.trim().replace(/^@/, '');
  if (!username) {
    throw new LastfmServiceError('USER_NOT_FOUND');
  }
  if (!apiKey.trim()) {
    throw new LastfmServiceError('MISSING_KEY');
  }

  const periodsList: TimePeriod[] = ['1month', '6month', 'overall'];
  const [oneMonth, sixMonth, overall] = await Promise.all(
    periodsList.map((p) => fetchPeriodData(username, apiKey.trim(), p))
  );

  const periods: Partial<Record<TimePeriod, PeriodInput>> = {};
  if (oneMonth.artists.length > 0 || oneMonth.tracks.length > 0) periods['1month'] = oneMonth;
  if (sixMonth.artists.length > 0 || sixMonth.tracks.length > 0) periods['6month'] = sixMonth;
  if (overall.artists.length > 0 || overall.tracks.length > 0) periods.overall = overall;

  if (Object.keys(periods).length === 0) {
    throw new LastfmServiceError('EMPTY_DATA');
  }

  // Enrich up to 8 unknown top artists with Last.fm tags across periods
  const unknownMap = new Map<string, string>();
  for (const periodData of Object.values(periods)) {
    if (!periodData) continue;
    for (const artist of periodData.artists.slice(0, 12)) {
      const key = normalizeArtistKey(artist.name);
      if (!key || unknownMap.has(key)) continue;
      if (lookupArtistGenres(artist.name).length === 0) {
        unknownMap.set(key, artist.name);
      }
      if (unknownMap.size >= 8) break;
    }
    if (unknownMap.size >= 8) break;
  }

  if (unknownMap.size > 0) {
    const tagEntries = await Promise.all(
      Array.from(unknownMap.entries()).map(async ([key, name]) => [
        key,
        await fetchArtistTopTags(name, apiKey.trim()),
      ] as const)
    );
    const fetchedTagMap = new Map<string, string[]>(tagEntries);

    for (const periodData of Object.values(periods)) {
      if (!periodData) continue;
      for (const artist of periodData.artists) {
        const key = normalizeArtistKey(artist.name);
        const fetched = fetchedTagMap.get(key);
        if (fetched && fetched.length > 0) {
          artist.tags = fetched;
        }
      }
    }
  }

  return {
    displayName: username,
    source: 'lastfm',
    talkVibe,
    periods,
  };
}
