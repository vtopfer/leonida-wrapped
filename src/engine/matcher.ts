import { lookupArtistGenres, normalizeArtistKey, splitCollaborators } from '../data/artistCatalog';
import { GTA6_STATIONS, GTA6_TALK_SHOWS, TALK_BY_ID } from '../data/gta6Radios';
import type {
  DiscoveryTrackItem,
  FeaturedStationTrack,
  FullAnalysisResult,
  MatchedArtistItem,
  MatchedTrackItem,
  MultiPeriodUserData,
  PeriodInput,
  PeriodMatchResult,
  RadioStation,
  RadioTrack,
  StationMatchResult,
  TalkShow,
  TalkVibe,
  TimePeriod,
} from '../types';

const PERIOD_ORDER: TimePeriod[] = ['1month', '6month', 'overall'];

export function normalizeText(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
    .replace(/\b(feat|ft|featuring|remaster|remastered|radio edit|version|remix)\b/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractArtistTokens(raw: string): string[] {
  const parts = splitCollaborators(raw);
  const tokens = parts.map((p) => normalizeArtistKey(p)).filter(Boolean);
  if (tokens.length === 0) {
    const fallback = normalizeArtistKey(raw);
    return fallback ? [fallback] : [];
  }
  return Array.from(new Set(tokens));
}

function buildDiscoveryLinks(artist: string, title: string): Omit<DiscoveryTrackItem, 'title' | 'artist' | 'year'> {
  const query = encodeURIComponent(`${artist} ${title}`);
  return {
    spotifyUrl: `https://open.spotify.com/search/${query}`,
    youtubeMusicUrl: `https://music.youtube.com/search?q=${query}`,
    appleMusicUrl: `https://music.apple.com/search?term=${query}`,
  };
}

// Map noisy Last.fm / user tags to canonical genre keys used by GTA6_STATIONS
const GENRE_ALIAS_MAP: Record<string, string[]> = {
  pop: ['pop', 'dance-pop', 'electropop'],
  'synth pop': ['synth-pop', '80s', 'new-wave'],
  synthpop: ['synth-pop', '80s', 'new-wave'],
  'indie pop': ['indie-pop', 'alt-pop'],
  'alt pop': ['alt-pop', 'indie-pop'],
  'dance pop': ['dance-pop', 'pop'],
  'hip hop': ['hip-hop', 'rap', 'modern-rap'],
  'hip-hop': ['hip-hop', 'rap', 'modern-rap'],
  rap: ['rap', 'hip-hop', 'modern-rap'],
  trap: ['trap', 'modern-rap', 'hip-hop'],
  'southern hip hop': ['southern-hip-hop', 'classic-rap'],
  'classic rock': ['classic-rock', 'rock', 'hard-rock'],
  'hard rock': ['hard-rock', 'classic-rock'],
  'soft rock': ['soft-rock', 'power-ballad', '80s'],
  rock: ['rock', 'classic-rock', 'alt-rock'],
  metal: ['metal', 'heavy-metal'],
  'heavy metal': ['heavy-metal', 'metal'],
  'thrash metal': ['thrash-metal', 'metal'],
  'nu metal': ['nu-metal', 'metal'],
  'nu-metal': ['nu-metal', 'metal'],
  'alternative rock': ['alt-rock', 'indie', 'rock'],
  indie: ['indie', 'indie-dance', 'indie-pop'],
  'indie rock': ['indie', 'indie-rock', 'rock'],
  'indie dance': ['indie-dance', 'nu-disco', 'electronic'],
  electronic: ['electronic', 'house', 'indie-dance'],
  electronica: ['electronic', 'house', 'deep-house'],
  house: ['house', 'tech-house', 'deep-house'],
  'tech house': ['tech-house', 'house'],
  'deep house': ['deep-house', 'house', 'melodic-techno'],
  techno: ['techno', 'melodic-techno', 'house'],
  rnb: ['rnb', 'soul', '90s-rnb'],
  'r&b': ['rnb', 'soul', '90s-rnb'],
  soul: ['soul', 'rnb', 'neo-soul'],
  'neo soul': ['neo-soul', 'soul', 'rnb'],
  reggaeton: ['reggaeton', 'urbano', 'latin', 'dembow'],
  latin: ['latin', 'reggaeton', 'salsa'],
  salsa: ['salsa', 'tropical', 'latin'],
  tropical: ['tropical', 'salsa', 'latin'],
  reggae: ['reggae', 'dub', 'roots-reggae'],
  dub: ['dub', 'reggae'],
  country: ['country', 'outlaw-country', 'americana'],
  folk: ['folk', 'americana', 'country'],
  blues: ['blues', 'electric-blues', 'delta-blues'],
  jazz: ['jazz', 'jazz-fusion', 'nu-jazz'],
  'jazz fusion': ['jazz-fusion', 'jazz'],
  classical: ['classical', 'orchestral'],
  soundtrack: ['soundtrack', 'orchestral', 'classical'],
  afrobeats: ['afrobeats', 'afro-pop', 'amapiano'],
  amapiano: ['amapiano', 'afrobeats', 'deep-house'],
  funk: ['funk', 'groove', 'soul'],
  mpb: ['mpb', 'brazilian', 'world', 'groove'],
  brazilian: ['brazilian', 'mpb', 'world', 'reggaeton'],
  funk_br: ['brazilian', 'urbano', 'reggaeton'],
  '80s': ['80s', 'new-wave', 'synthwave', 'soft-rock'],
  'new wave': ['new-wave', '80s', 'post-punk'],
  synthwave: ['synthwave', '80s', 'new-wave'],
  punk: ['punk', 'rock', 'post-punk'],
  grunge: ['grunge', 'rock', 'metal'],
};

function expandGenreTag(rawTag: string): string[] {
  const clean = rawTag.trim().toLowerCase();
  if (!clean) return [];
  const mapped = GENRE_ALIAS_MAP[clean];
  if (mapped) return mapped;
  // Also try hyphen-less / space-normalized lookup
  const spaceClean = clean.replace(/[-_]/g, ' ');
  if (GENRE_ALIAS_MAP[spaceClean]) return GENRE_ALIAS_MAP[spaceClean];
  return [clean];
}

interface IndexedStationTrack {
  title: string;
  artist: string;
  year?: number;
  normalizedTitle: string;
  artistTokens: string[];
}

interface IndexedStation {
  station: RadioStation;
  tracks: IndexedStationTrack[];
  hostTokens: string[];
  allArtistTokens: Set<string>;
}

const INDEXED_STATIONS: IndexedStation[] = GTA6_STATIONS.map((station) => {
  const tracks: IndexedStationTrack[] = station.tracks.map((t) => ({
    ...t,
    normalizedTitle: normalizeText(t.title),
    artistTokens: extractArtistTokens(t.artist),
  }));
  const allArtistTokens = new Set<string>();
  for (const t of tracks) {
    t.artistTokens.forEach((tok) => allArtistTokens.add(tok));
  }
  const hostTokens = extractArtistTokens(station.hosts);
  return {
    station,
    tracks,
    hostTokens,
    allArtistTokens,
  };
});

function pickTalkShow(topStation: RadioStation, explicitVibe?: TalkVibe): TalkShow {
  if (explicitVibe) {
    const candidates = GTA6_TALK_SHOWS.filter((show) => show.vibe === explicitVibe);
    if (candidates.length > 0) {
      // Pick deterministically based on station index so hiphop stations get different podcast flavor
      return candidates[topStation.index % candidates.length];
    }
  }
  return TALK_BY_ID.get(topStation.defaultTalkId) ?? GTA6_TALK_SHOWS[0];
}

function getRankWeight(index: number): number {
  return Math.max(0.35, 1 / Math.sqrt(index + 1));
}

export function matchPeriod(
  period: TimePeriod,
  input: PeriodInput,
  explicitTalkVibe?: TalkVibe
): PeriodMatchResult {
  // Build user genre profile vector from artists + explicit tags, and track genres per artist
  const userGenreWeights = new Map<string, number>();

  const userArtistEntries = input.artists.map((artist, idx) => {
    const rankW = getRankWeight(idx);
    const knownGenres = lookupArtistGenres(artist.name);
    const combinedTags = [...knownGenres, ...(artist.tags ?? [])];
    const expanded = new Set<string>();
    combinedTags.forEach((tag) => expandGenreTag(tag).forEach((g) => expanded.add(g)));

    expanded.forEach((g) => {
      userGenreWeights.set(g, (userGenreWeights.get(g) ?? 0) + rankW);
    });

    return {
      rawName: artist.name,
      playcount: artist.playcount,
      tokens: extractArtistTokens(artist.name),
      expandedGenres: expanded,
      rankW,
    };
  });

  const userTracksList = input.tracks.map((t, idx) => ({
    rawTitle: t.title,
    rawArtist: t.artist,
    playcount: t.playcount,
    normTitle: normalizeText(t.title),
    artistTokens: extractArtistTokens(t.artist),
    rankW: getRankWeight(idx),
  }));

  const rawResults: Array<Omit<StationMatchResult, 'percentage'>> = INDEXED_STATIONS.map(
    ({ station, tracks, hostTokens, allArtistTokens }) => {
      let trackScore = 0;
      let artistScore = 0;
      let genreScore = 0;

      const matchedTracks: MatchedTrackItem[] = [];
      const seenMatchedTrackKeys = new Set<string>();
      const matchedArtistsSet = new Set<string>();
      const matchedGenresSet = new Set<string>();
      const relatedUserArtistsSet = new Set<string>();

      // Layer 1: Exact track matches
      for (const uTrack of userTracksList) {
        if (!uTrack.normTitle) continue;
        for (const sTrack of tracks) {
          const titleMatches =
            sTrack.normalizedTitle === uTrack.normTitle ||
            (uTrack.normTitle.length >= 6 &&
              (sTrack.normalizedTitle.includes(uTrack.normTitle) ||
                uTrack.normTitle.includes(sTrack.normalizedTitle)));

          if (!titleMatches) continue;

          const artistOverlaps = uTrack.artistTokens.some((tok) => sTrack.artistTokens.includes(tok));
          if (!artistOverlaps) continue;

          const dedupKey = `${sTrack.artist}::${sTrack.title}`;
          if (!seenMatchedTrackKeys.has(dedupKey)) {
            seenMatchedTrackKeys.add(dedupKey);
            matchedTracks.push({
              title: sTrack.title,
              artist: sTrack.artist,
              stationId: station.id,
              stationName: station.name,
              userPlaycount: uTrack.playcount,
            });
            trackScore += 28 * uTrack.rankW;
          }
        }
      }

      // Layer 2: Direct artist & host matches, ordered by user's top rank
      const matchedArtistTokenOrder: string[][] = [];
      for (const uArtist of userArtistEntries) {
        const hitsTrackArtist = uArtist.tokens.some((tok) => allArtistTokens.has(tok));
        const hitsHost = uArtist.tokens.some((tok) => hostTokens.includes(tok));

        if (hitsTrackArtist || hitsHost) {
          matchedArtistsSet.add(uArtist.rawName);
          if (hitsTrackArtist) matchedArtistTokenOrder.push(uArtist.tokens);
          artistScore += (hitsTrackArtist ? 14 : 9) * uArtist.rankW;
        }
      }

      // Collect tracks on this station performed by the user's matched artists (prioritizing user's top artists)
      const stationTracksByMatchedArtists: RadioTrack[] = [];
      const seenStationTrackKey = new Set<string>();
      for (const tokens of matchedArtistTokenOrder) {
        for (const sTrack of tracks) {
          if (tokens.some((tok) => sTrack.artistTokens.includes(tok))) {
            const key = `${sTrack.artist}::${sTrack.title}`;
            if (!seenStationTrackKey.has(key)) {
              seenStationTrackKey.add(key);
              stationTracksByMatchedArtists.push({
                title: sTrack.title,
                artist: sTrack.artist,
                year: sTrack.year,
              });
            }
          }
        }
      }

      // Collect non-direct user artists whose genres connect to this station
      for (const uArtist of userArtistEntries) {
        if (matchedArtistsSet.has(uArtist.rawName)) continue;
        let hasGenreOverlap = false;
        uArtist.expandedGenres.forEach((g) => {
          const w = station.genreWeights[g];
          if (w && w > 0) hasGenreOverlap = true;
        });
        if (hasGenreOverlap) {
          relatedUserArtistsSet.add(uArtist.rawName);
          if (relatedUserArtistsSet.size >= 8) break;
        }
      }

      // Layer 3: Genre & vibe overlap
      let totalUserGenreMass = 0;
      userGenreWeights.forEach((w) => {
        totalUserGenreMass += w;
      });

      if (totalUserGenreMass > 0) {
        let overlapSum = 0;
        userGenreWeights.forEach((uWeight, genre) => {
          const stationW = station.genreWeights[genre];
          if (stationW && stationW > 0) {
            overlapSum += uWeight * stationW;
            matchedGenresSet.add(genre);
          }
        });
        // Scale genre component relative to user's total tag mass
        genreScore = (overlapSum / Math.max(totalUserGenreMass, 1)) * 42;
      }

      const rawScore = trackScore + artistScore + genreScore;

      // Closest track playing on this station for the user
      let featuredTrack: FeaturedStationTrack;
      if (matchedTracks.length > 0) {
        featuredTrack = {
          title: matchedTracks[0].title,
          artist: matchedTracks[0].artist,
          matchReason: 'exact',
        };
      } else if (stationTracksByMatchedArtists.length > 0) {
        featuredTrack = {
          title: stationTracksByMatchedArtists[0].title,
          artist: stationTracksByMatchedArtists[0].artist,
          matchReason: 'artist',
        };
      } else {
        featuredTrack = {
          title: station.tracks[0]?.title ?? station.name,
          artist: station.tracks[0]?.artist ?? station.hosts,
          matchReason: 'vibe',
        };
      }

      // Pick 3 discovery tracks not already matched by user
      const discoveryTracks: DiscoveryTrackItem[] = tracks
        .filter((t) => !seenMatchedTrackKeys.has(`${t.artist}::${t.title}`))
        .slice(0, 3)
        .map((t) => ({
          title: t.title,
          artist: t.artist,
          year: t.year,
          ...buildDiscoveryLinks(t.artist, t.title),
        }));

      return {
        station,
        rawScore,
        matchedTracks,
        matchedArtists: Array.from(matchedArtistsSet),
        matchedGenres: Array.from(matchedGenresSet),
        relatedUserArtists: Array.from(relatedUserArtistsSet),
        stationTracksByMatchedArtists,
        featuredTrack,
        discoveryTracks,
      };
    }
  );

  // Sort by rawScore descending, tie-breaking by matchedTracks count -> matchedArtists count -> station index
  rawResults.sort((a, b) => {
    if (Math.abs(b.rawScore - a.rawScore) > 0.01) return b.rawScore - a.rawScore;
    if (b.matchedTracks.length !== a.matchedTracks.length) {
      return b.matchedTracks.length - a.matchedTracks.length;
    }
    if (b.matchedArtists.length !== a.matchedArtists.length) {
      return b.matchedArtists.length - a.matchedArtists.length;
    }
    return a.station.index - b.station.index;
  });

  const maxRaw = rawResults[0]?.rawScore ?? 0;

  // Calibrate display percentages to an expressive 12%-99% range
  const topEvidenceBonus = Math.min(
    18,
    (rawResults[0]?.matchedTracks.length ?? 0) * 5 + (rawResults[0]?.matchedArtists.length ?? 0) * 3
  );
  const topCeiling = maxRaw > 0 ? Math.min(99, Math.round(78 + topEvidenceBonus)) : 65;

  const rankedStations: StationMatchResult[] = rawResults.map((item, idx) => {
    let percentage: number;
    if (maxRaw <= 0) {
      percentage = Math.max(12, 40 - idx * 2);
    } else {
      const ratio = item.rawScore / maxRaw;
      percentage = Math.max(12, Math.min(99, Math.round(12 + ratio * (topCeiling - 12))));
    }
    return {
      ...item,
      percentage,
    };
  });

  // Collect all matched tracks and artists across all stations
  const allMatchedTracks: MatchedTrackItem[] = [];
  const trackDedup = new Set<string>();
  const artistMap = new Map<string, MatchedArtistItem>();

  for (const res of rankedStations) {
    for (const tr of res.matchedTracks) {
      const key = `${tr.artist}::${tr.title}`;
      if (!trackDedup.has(key)) {
        trackDedup.add(key);
        allMatchedTracks.push(tr);
      }
    }
    for (const ar of res.matchedArtists) {
      const existing = artistMap.get(ar);
      const userObj = input.artists.find((u) => u.name === ar);
      if (existing) {
        existing.stationIds.push(res.station.id);
      } else {
        artistMap.set(ar, {
          name: ar,
          stationIds: [res.station.id],
          userPlaycount: userObj?.playcount,
        });
      }
    }
  }

  const topStation = rankedStations[0];
  const talkShow = pickTalkShow(topStation.station, explicitTalkVibe);

  return {
    period,
    rankedStations,
    topStation,
    allMatchedTracks,
    allMatchedArtists: Array.from(artistMap.values()),
    topUserArtists: input.artists.slice(0, 8).map((a) => a.name),
    talkShow,
  };
}

export function analyzeUserProfile(userData: MultiPeriodUserData): FullAnalysisResult {
  const availablePeriods = PERIOD_ORDER.filter((p) => Boolean(userData.periods[p]));
  const resultsByPeriod: Partial<Record<TimePeriod, PeriodMatchResult>> = {};

  for (const p of availablePeriods) {
    const periodInput = userData.periods[p];
    if (periodInput) {
      resultsByPeriod[p] = matchPeriod(p, periodInput, userData.talkVibe);
    }
  }

  const stationsByPeriod: Partial<Record<TimePeriod, RadioStation>> = {};
  for (const p of availablePeriods) {
    const res = resultsByPeriod[p];
    if (res) stationsByPeriod[p] = res.topStation.station;
  }

  const uniqueTopIds = new Set(Object.values(stationsByPeriod).map((s) => s.id));
  const hasMultiplePeriods = availablePeriods.length > 1;
  const changed = hasMultiplePeriods && uniqueTopIds.size > 1;

  let summary = { pt: '', en: '' };
  if (hasMultiplePeriods) {
    const recent = stationsByPeriod['1month'] ?? stationsByPeriod['6month'];
    const older = stationsByPeriod.overall ?? stationsByPeriod['6month'];
    if (changed && recent && older && recent.id !== older.id) {
      summary = {
        pt: `Sua frequência mudou: no histórico geral você sintonizava ${older.name}, mas no último mês virou ouvinte fiel da ${recent.name}.`,
        en: `Your dial shifted: all-time you leaned ${older.name}, while lately you’ve locked into ${recent.name}.`,
      };
    } else if (recent) {
      summary = {
        pt: `Sintonia constante: você se manteve fiel à ${recent.name} em todos os períodos analisados.`,
        en: `Locked frequency: you stayed loyal to ${recent.name} across every time window.`,
      };
    }
  }

  return {
    displayName: userData.displayName,
    source: userData.source,
    availablePeriods,
    resultsByPeriod,
    evolution: {
      hasMultiplePeriods,
      changed,
      stationsByPeriod,
      summary,
    },
  };
}
