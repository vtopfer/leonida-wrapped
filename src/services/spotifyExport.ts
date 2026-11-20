import type {
  MultiPeriodUserData,
  PeriodInput,
  TalkVibe,
  TimePeriod,
  UserArtistInput,
  UserTrackInput,
} from '../types';

interface SpotifyBasicRecord {
  endTime?: string;
  artistName?: string | null;
  trackName?: string | null;
  msPlayed?: number;
}

interface SpotifyExtendedRecord {
  ts?: string;
  master_metadata_track_name?: string | null;
  master_metadata_album_artist_name?: string | null;
  ms_played?: number;
}

interface NormalizedPlayRecord {
  timestampMs: number;
  artist: string;
  title: string;
}

const MIN_MS_PLAYED = 30_000;
const DAY_MS = 86_400_000;

function parseTimestampMs(raw: string | undefined): number | null {
  if (!raw) return null;
  // Basic Spotify format uses "YYYY-MM-DD HH:MM" (without T/Z); normalize for consistent parsing
  const normalized = raw.includes('T') ? raw : `${raw.replace(' ', 'T')}:00Z`;
  const parsed = Date.parse(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractPlayRecords(rawItems: unknown[]): NormalizedPlayRecord[] {
  const results: NormalizedPlayRecord[] = [];
  for (const item of rawItems) {
    if (!item || typeof item !== 'object') continue;
    const obj = item as SpotifyBasicRecord & SpotifyExtendedRecord;

    const msPlayed =
      typeof obj.ms_played === 'number'
        ? obj.ms_played
        : typeof obj.msPlayed === 'number'
          ? obj.msPlayed
          : 0;

    if (msPlayed < MIN_MS_PLAYED) continue;

    const artist = (obj.master_metadata_album_artist_name ?? obj.artistName ?? '').trim();
    const title = (obj.master_metadata_track_name ?? obj.trackName ?? '').trim();
    if (!artist || !title) continue;

    const ts = parseTimestampMs(obj.ts ?? obj.endTime);
    if (ts === null) continue;

    results.push({ timestampMs: ts, artist, title });
  }
  return results;
}

function aggregateBucket(records: NormalizedPlayRecord[]): PeriodInput {
  const artistMap = new Map<string, { name: string; count: number }>();
  const trackMap = new Map<string, { title: string; artist: string; count: number }>();

  for (const rec of records) {
    const aKey = rec.artist.toLowerCase();
    const prevA = artistMap.get(aKey);
    if (prevA) {
      prevA.count += 1;
    } else {
      artistMap.set(aKey, { name: rec.artist, count: 1 });
    }

    const tKey = `${aKey}:::${rec.title.toLowerCase()}`;
    const prevT = trackMap.get(tKey);
    if (prevT) {
      prevT.count += 1;
    } else {
      trackMap.set(tKey, { title: rec.title, artist: rec.artist, count: 1 });
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

  return { artists, tracks };
}

export interface ParsedSpotifyExport {
  userData: MultiPeriodUserData;
  validPlayCount: number;
}

export function parseSpotifyJsonArrays(
  jsonPayloads: unknown[],
  displayName = 'Spotify Listener',
  talkVibe?: TalkVibe
): ParsedSpotifyExport {
  const records: NormalizedPlayRecord[] = [];
  for (const payload of jsonPayloads) {
    if (Array.isArray(payload)) {
      records.push(...extractPlayRecords(payload));
    }
  }

  if (records.length === 0) {
    throw new Error('SPOTIFY_PARSE');
  }

  let maxTs = -Infinity;
  for (const r of records) {
    if (r.timestampMs > maxTs) maxTs = r.timestampMs;
  }

  const monthCutoff = maxTs - 30 * DAY_MS;
  const sixMonthCutoff = maxTs - 180 * DAY_MS;

  const oneMonthRecords = records.filter((r) => r.timestampMs >= monthCutoff);
  const sixMonthRecords = records.filter((r) => r.timestampMs >= sixMonthCutoff);

  const periods: Partial<Record<TimePeriod, PeriodInput>> = {};
  if (oneMonthRecords.length > 0) periods['1month'] = aggregateBucket(oneMonthRecords);
  if (sixMonthRecords.length > 0) periods['6month'] = aggregateBucket(sixMonthRecords);
  periods.overall = aggregateBucket(records);

  return {
    validPlayCount: records.length,
    userData: {
      displayName: displayName.trim() || 'Spotify Listener',
      source: 'spotify_json',
      talkVibe,
      periods,
    },
  };
}

export async function parseSpotifyFiles(
  files: File[],
  displayName?: string,
  talkVibe?: TalkVibe
): Promise<ParsedSpotifyExport> {
  const parsedArrays: unknown[] = [];
  for (const file of files) {
    const text = await file.text();
    try {
      const json = JSON.parse(text) as unknown;
      parsedArrays.push(json);
    } catch {
      // Ignore invalid/non-JSON files in multi-selection
    }
  }
  return parseSpotifyJsonArrays(parsedArrays, displayName, talkVibe);
}
