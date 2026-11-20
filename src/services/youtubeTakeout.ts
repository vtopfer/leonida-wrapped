import type {
  MultiPeriodUserData,
  PeriodInput,
  TalkVibe,
  TimePeriod,
  UserArtistInput,
  UserTrackInput,
} from '../types';

interface TakeoutWatchItem {
  header?: string;
  title?: string;
  titleUrl?: string;
  subtitles?: Array<{ name?: string; url?: string }>;
  time?: string;
}

interface NormalizedYtRecord {
  timestampMs: number;
  artist: string;
  title: string;
}

const DAY_MS = 86_400_000;

function cleanYtTitle(rawTitle: string): string {
  return rawTitle
    .replace(/^(Watched|Listened to|Assistiu a|Você assistiu a|Ouviu)\s+/i, '')
    .trim();
}

function cleanYtArtist(rawArtist: string): string {
  return rawArtist
    .replace(/\s*-\s*Topic$/i, '')
    .replace(/VEVO$/i, '')
    .trim();
}

function isYoutubeMusicEntry(item: TakeoutWatchItem): boolean {
  const header = (item.header ?? '').toLowerCase();
  const url = (item.titleUrl ?? '').toLowerCase();
  return header === 'youtube music' || url.includes('music.youtube.com');
}

function aggregateBucket(records: NormalizedYtRecord[]): PeriodInput {
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

export interface ParsedYoutubeExport {
  userData: MultiPeriodUserData;
  validPlayCount: number;
}

export function parseYoutubeTakeoutArrays(
  jsonPayloads: unknown[],
  displayName = 'YT Music',
  talkVibe?: TalkVibe
): ParsedYoutubeExport {
  const records: NormalizedYtRecord[] = [];

  for (const payload of jsonPayloads) {
    if (!Array.isArray(payload)) continue;
    for (const raw of payload) {
      if (!raw || typeof raw !== 'object') continue;
      const item = raw as TakeoutWatchItem;
      if (!isYoutubeMusicEntry(item)) continue;

      const rawTitle = (item.title ?? '').trim();
      const rawArtist = (item.subtitles?.[0]?.name ?? '').trim();
      const ts = item.time ? Date.parse(item.time) : NaN;

      if (!rawTitle || !rawArtist || !Number.isFinite(ts)) continue;
      const title = cleanYtTitle(rawTitle);
      const artist = cleanYtArtist(rawArtist);
      if (!title || !artist) continue;

      records.push({ timestampMs: ts, artist, title });
    }
  }

  if (records.length === 0) {
    throw new Error('YOUTUBE_PARSE');
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
      displayName: displayName.trim() || 'YT Music',
      source: 'youtube_json',
      talkVibe,
      periods,
    },
  };
}

export async function parseYoutubeTakeoutFiles(
  files: File[],
  displayName?: string,
  talkVibe?: TalkVibe
): Promise<ParsedYoutubeExport> {
  const parsedArrays: unknown[] = [];
  for (const file of files) {
    const text = await file.text();
    try {
      const json = JSON.parse(text) as unknown;
      parsedArrays.push(json);
    } catch {
      // Ignore invalid JSON files
    }
  }
  return parseYoutubeTakeoutArrays(parsedArrays, displayName, talkVibe);
}
