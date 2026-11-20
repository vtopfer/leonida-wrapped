import type {
  MultiPeriodUserData,
  TalkVibe,
  UserArtistInput,
  UserTrackInput,
} from '../types';

export type YoutubePublicErrorCode =
  | 'YOUTUBE_INVALID_INPUT'
  | 'YOUTUBE_NO_PUBLIC_PLAYLISTS'
  | 'YOUTUBE_KEY_INVALID'
  | 'YOUTUBE_QUOTA'
  | 'YOUTUBE_MISSING_KEY'
  | 'NETWORK';

export class YoutubeServiceError extends Error {
  readonly code: YoutubePublicErrorCode;

  constructor(code: YoutubePublicErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'YoutubeServiceError';
  }
}

export type ParsedYoutubeTarget =
  | { kind: 'playlist'; id: string }
  | { kind: 'channel_id'; id: string }
  | { kind: 'handle'; handle: string };

export function parseYoutubeInput(rawInput: string): ParsedYoutubeTarget | null {
  const input = rawInput.trim();
  if (!input) return null;

  // Raw handle "@username"
  if (input.startsWith('@') && !input.includes('/')) {
    return { kind: 'handle', handle: input };
  }

  // Raw playlist ID
  if (/^(PL|OLAK5uy_|RDCLAK|UU|FL)[A-Za-z0-9_-]{8,}$/.test(input)) {
    return { kind: 'playlist', id: input };
  }

  // Raw channel ID
  if (/^UC[A-Za-z0-9_-]{18,}$/.test(input)) {
    return { kind: 'channel_id', id: input };
  }

  try {
    const withProtocol = input.startsWith('http') ? input : `https://${input}`;
    const url = new URL(withProtocol);
    const listParam = url.searchParams.get('list');
    if (listParam) {
      return { kind: 'playlist', id: listParam };
    }

    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0]?.startsWith('@')) {
      return { kind: 'handle', handle: parts[0] };
    }
    if (parts[0] === 'channel' && parts[1]) {
      return { kind: 'channel_id', id: parts[1] };
    }
  } catch {
    return null;
  }

  return null;
}

export function extractYoutubeArtistAndTitle(
  rawTitle: string,
  rawChannelTitle: string
): { artist: string; title: string } | null {
  const titleClean = rawTitle
    .replace(/\((official\s*(music\s*)?(video|audio|lyric\s*video|visualizer)|audio|lyrics?)\)/gi, '')
    .replace(/\[(official\s*(music\s*)?(video|audio|lyric\s*video|visualizer)|audio|lyrics?)\]/gi, '')
    .trim();

  if (
    !titleClean ||
    titleClean.toLowerCase() === 'deleted video' ||
    titleClean.toLowerCase() === 'private video'
  ) {
    return null;
  }

  const channelClean = rawChannelTitle
    .replace(/\s*-\s*Topic$/i, '')
    .replace(/VEVO$/i, '')
    .trim();

  // If the playlist item title itself is "Artist - Song", prefer splitting it when channel isn't a "- Topic" channel
  const isTopicChannel = /\s*-\s*Topic$/i.test(rawChannelTitle);
  if (!isTopicChannel) {
    const dashMatch = titleClean.match(/^(.+?)\s+[-–—]\s+(.+)$/);
    if (dashMatch && dashMatch[1].length >= 2 && dashMatch[2].length >= 2) {
      return {
        artist: dashMatch[1].trim(),
        title: dashMatch[2].trim(),
      };
    }
  }

  if (!channelClean) return null;
  return {
    artist: channelClean,
    title: titleClean,
  };
}

const YT_API_BASE = 'https://www.googleapis.com/youtube/v3';

async function fetchYtJson<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${YT_API_BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  let res: Response;
  try {
    res = await fetch(url.toString());
  } catch {
    throw new YoutubeServiceError('NETWORK');
  }

  if (!res.ok) {
    let reason = '';
    try {
      const errBody = (await res.json()) as { error?: { errors?: Array<{ reason?: string }> } };
      reason = errBody.error?.errors?.[0]?.reason ?? '';
    } catch {
      // ignore
    }
    if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded') {
      throw new YoutubeServiceError('YOUTUBE_QUOTA');
    }
    if (res.status === 400 || res.status === 403) {
      if (reason === 'keyInvalid') {
        throw new YoutubeServiceError('YOUTUBE_KEY_INVALID');
      }
      throw new YoutubeServiceError('YOUTUBE_NO_PUBLIC_PLAYLISTS');
    }
    if (res.status === 404) {
      throw new YoutubeServiceError('YOUTUBE_NO_PUBLIC_PLAYLISTS');
    }
    throw new YoutubeServiceError('NETWORK');
  }

  return (await res.json()) as T;
}

interface YtPlaylistItemsResponse {
  nextPageToken?: string;
  items?: Array<{
    snippet?: {
      title?: string;
      videoOwnerChannelTitle?: string;
      channelTitle?: string;
    };
  }>;
}

interface YtChannelsResponse {
  items?: Array<{
    id?: string;
    snippet?: { title?: string };
  }>;
}

interface YtPlaylistsResponse {
  items?: Array<{
    id?: string;
    snippet?: { title?: string };
  }>;
}

async function fetchPlaylistItems(
  playlistId: string,
  apiKey: string,
  maxPages = 2
): Promise<Array<{ artist: string; title: string }>> {
  const collected: Array<{ artist: string; title: string }> = [];
  let pageToken: string | undefined;

  for (let page = 0; page < maxPages; page += 1) {
    const params: Record<string, string> = {
      part: 'snippet',
      playlistId,
      maxResults: '50',
      key: apiKey,
    };
    if (pageToken) params.pageToken = pageToken;

    const data = await fetchYtJson<YtPlaylistItemsResponse>('playlistItems', params);
    for (const item of data.items ?? []) {
      const rawTitle = item.snippet?.title ?? '';
      const rawOwner =
        item.snippet?.videoOwnerChannelTitle ?? item.snippet?.channelTitle ?? '';
      const parsed = extractYoutubeArtistAndTitle(rawTitle, rawOwner);
      if (parsed) collected.push(parsed);
    }

    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }

  return collected;
}

export async function fetchYoutubePublicProfile(
  rawInput: string,
  apiKey: string,
  talkVibe?: TalkVibe
): Promise<MultiPeriodUserData> {
  if (!apiKey.trim()) {
    throw new YoutubeServiceError('YOUTUBE_MISSING_KEY');
  }

  const target = parseYoutubeInput(rawInput);
  if (!target) {
    throw new YoutubeServiceError('YOUTUBE_INVALID_INPUT');
  }

  let displayName = 'YT Music';
  const rawTracks: Array<{ artist: string; title: string }> = [];

  if (target.kind === 'playlist') {
    const [plMeta, items] = await Promise.all([
      fetchYtJson<YtPlaylistsResponse>('playlists', {
        part: 'snippet',
        id: target.id,
        key: apiKey.trim(),
      }).catch(() => ({ items: [] })),
      fetchPlaylistItems(target.id, apiKey.trim(), 2),
    ]);

    displayName = plMeta.items?.[0]?.snippet?.title?.trim() || 'YT Music Playlist';
    rawTracks.push(...items);
  } else {
    const channelRes = await fetchYtJson<YtChannelsResponse>('channels', {
      part: 'id,snippet',
      ...(target.kind === 'handle'
        ? { forHandle: target.handle.replace(/^@/, '') }
        : { id: target.id }),
      key: apiKey.trim(),
    });

    const channel = channelRes.items?.[0];
    if (!channel?.id) {
      throw new YoutubeServiceError('YOUTUBE_NO_PUBLIC_PLAYLISTS');
    }
    displayName =
      channel.snippet?.title?.trim() ||
      (target.kind === 'handle' ? target.handle : target.id);

    const playlistsRes = await fetchYtJson<YtPlaylistsResponse>('playlists', {
      part: 'snippet',
      channelId: channel.id,
      maxResults: '5',
      key: apiKey.trim(),
    });

    const playlists = playlistsRes.items ?? [];
    if (playlists.length === 0) {
      throw new YoutubeServiceError('YOUTUBE_NO_PUBLIC_PLAYLISTS');
    }

    const batches = await Promise.all(
      playlists
        .slice(0, 3)
        .filter((p) => Boolean(p.id))
        .map((p) => fetchPlaylistItems(p.id!, apiKey.trim(), 1))
    );
    batches.forEach((b) => rawTracks.push(...b));
  }

  if (rawTracks.length === 0) {
    throw new YoutubeServiceError('YOUTUBE_NO_PUBLIC_PLAYLISTS');
  }

  const artistMap = new Map<string, { name: string; count: number }>();
  const trackMap = new Map<string, { title: string; artist: string; count: number }>();

  for (const item of rawTracks) {
    const aKey = item.artist.toLowerCase();
    const prevA = artistMap.get(aKey);
    if (prevA) {
      prevA.count += 1;
    } else {
      artistMap.set(aKey, { name: item.artist, count: 1 });
    }

    const tKey = `${aKey}:::${item.title.toLowerCase()}`;
    const prevT = trackMap.get(tKey);
    if (prevT) {
      prevT.count += 1;
    } else {
      trackMap.set(tKey, { title: item.title, artist: item.artist, count: 1 });
    }
  }

  const artists: UserArtistInput[] = Array.from(artistMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 60)
    .map((a) => ({ name: a.name, playcount: a.count }));

  const tracks: UserTrackInput[] = Array.from(trackMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 80)
    .map((t) => ({ title: t.title, artist: t.artist, playcount: t.count }));

  return {
    displayName,
    source: 'youtube_public',
    talkVibe,
    periods: {
      overall: { artists, tracks },
    },
  };
}
