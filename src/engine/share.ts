import { GTA6_STATIONS, STATION_BY_INDEX, TALK_BY_INDEX } from '../data/gta6Radios';
import { normalizeArtistKey } from '../data/artistCatalog';
import type {
  ComparisonResult,
  ComparisonRow,
  PeriodMatchResult,
  SharedProfileV1,
} from '../types';

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): Uint8Array {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const base64 = padded + '='.repeat(padLen);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function buildSharedProfilePayload(
  displayName: string,
  periodResult: PeriodMatchResult
): SharedProfileV1 {
  const top5 = periodResult.rankedStations
    .slice(0, 5)
    .map((s) => [s.station.index, s.percentage] as [number, number]);

  const matchedArtistNames = periodResult.allMatchedArtists.map((a) => a.name);
  const artistSet = new Set<string>(matchedArtistNames);
  for (const a of periodResult.topUserArtists) {
    if (artistSet.size >= 8) break;
    artistSet.add(a);
  }

  const tracks = periodResult.allMatchedTracks
    .slice(0, 5)
    .map((t) => `${t.artist} - ${t.title}`);

  return {
    v: 1,
    n: displayName.slice(0, 32),
    r: top5,
    a: Array.from(artistSet).slice(0, 8),
    t: tracks,
    p: periodResult.talkShow.index,
  };
}

export function encodeSharedProfile(payload: SharedProfileV1): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return toBase64Url(bytes);
}

export function decodeSharedProfile(token: string): SharedProfileV1 | null {
  if (!token || token.length > 2048) return null;
  try {
    const bytes = fromBase64Url(token.trim());
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as Partial<SharedProfileV1>;
    if (
      parsed.v !== 1 ||
      typeof parsed.n !== 'string' ||
      !Array.isArray(parsed.r) ||
      parsed.r.length === 0
    ) {
      return null;
    }
    const validStations = parsed.r.filter(
      (entry): entry is [number, number] =>
        Array.isArray(entry) &&
        entry.length === 2 &&
        typeof entry[0] === 'number' &&
        typeof entry[1] === 'number' &&
        STATION_BY_INDEX.has(entry[0])
    );
    if (validStations.length === 0) return null;

    return {
      v: 1,
      n: parsed.n.slice(0, 32) || 'Amigo',
      r: validStations.slice(0, 6),
      a: Array.isArray(parsed.a) ? parsed.a.filter((x): x is string => typeof x === 'string').slice(0, 8) : [],
      t: Array.isArray(parsed.t) ? parsed.t.filter((x): x is string => typeof x === 'string').slice(0, 5) : [],
      p: typeof parsed.p === 'number' && TALK_BY_INDEX.has(parsed.p) ? parsed.p : 0,
    };
  } catch {
    return null;
  }
}

export function buildCompareUrl(payload: SharedProfileV1): string {
  const token = encodeSharedProfile(payload);
  if (typeof window === 'undefined') {
    return `https://leonidafm.app/?compare=${token}`;
  }
  const url = new URL(window.location.href);
  url.searchParams.set('compare', token);
  return url.toString();
}

export function compareProfiles(
  myName: string,
  myResult: PeriodMatchResult,
  friend: SharedProfileV1
): ComparisonResult {
  const myScores = new Map<number, number>();
  myResult.rankedStations.forEach((s) => myScores.set(s.station.index, s.percentage));

  const friendScores = new Map<number, number>();
  friend.r.forEach(([idx, pct]) => friendScores.set(idx, pct));

  // Build vectors over all stations
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const station of GTA6_STATIONS) {
    const a = myScores.get(station.index) ?? 10;
    const b = friendScores.get(station.index) ?? 12;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }

  const cosine = normA > 0 && normB > 0 ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0.4;

  // Shared artists & tracks
  const myArtistsNorm = new Map<string, string>();
  myResult.allMatchedArtists.forEach((a) => myArtistsNorm.set(normalizeArtistKey(a.name), a.name));
  myResult.topUserArtists.forEach((a) => {
    const key = normalizeArtistKey(a);
    if (!myArtistsNorm.has(key)) myArtistsNorm.set(key, a);
  });

  const sharedArtists: string[] = [];
  for (const fa of friend.a) {
    const key = normalizeArtistKey(fa);
    if (myArtistsNorm.has(key)) {
      sharedArtists.push(fa);
    }
  }

  const myTracksNorm = new Set(
    myResult.allMatchedTracks.map((t) => `${normalizeArtistKey(t.artist)}::${t.title.toLowerCase()}`)
  );
  const sharedTracks = friend.t.filter((ft) => {
    const [art, ...rest] = ft.split(' - ');
    const title = rest.join(' - ').trim().toLowerCase();
    return myTracksNorm.has(`${normalizeArtistKey(art)}::${title}`);
  });

  // Top station overlap bonus
  const myTop = myResult.topStation.station;
  const friendTop = STATION_BY_INDEX.get(friend.r[0][0]) ?? GTA6_STATIONS[0];
  const sameTopBonus = myTop.id === friendTop.id ? 14 : 0;
  const overlapBonus = Math.min(18, sharedArtists.length * 4 + sharedTracks.length * 5);

  const rawCompat = Math.round(cosine * 72 + sameTopBonus + overlapBonus);
  const compatibility = Math.max(15, Math.min(99, rawCompat));

  // Roadtrip station: maximizes geometric balance of both users
  let roadtripStation = myTop;
  let bestCombined = -1;
  for (const station of GTA6_STATIONS) {
    const a = myScores.get(station.index) ?? 10;
    const b = friendScores.get(station.index) ?? 10;
    const balanceScore = Math.sqrt(a * b) + (a + b) * 0.2;
    if (balanceScore > bestCombined) {
      bestCombined = balanceScore;
      roadtripStation = station;
    }
  }

  // Side-by-side comparison rows (top union of both users' stations)
  const interestingStationIndices = new Set<number>([
    ...myResult.rankedStations.slice(0, 4).map((s) => s.station.index),
    ...friend.r.slice(0, 4).map(([idx]) => idx),
    roadtripStation.index,
  ]);

  const rows: ComparisonRow[] = Array.from(interestingStationIndices)
    .map((idx) => {
      const station = STATION_BY_INDEX.get(idx)!;
      return {
        station,
        myScore: myScores.get(idx) ?? 12,
        friendScore: friendScores.get(idx) ?? 14,
      };
    })
    .sort((a, b) => b.myScore + b.friendScore - (a.myScore + a.friendScore))
    .slice(0, 5);

  // Verdict tier
  let verdictTitle = { pt: '', en: '' };
  let verdictBody = { pt: '', en: '' };

  if (compatibility >= 80) {
    verdictTitle = {
      pt: 'Dupla Oficial de Vice Beach',
      en: 'Certified Vice Beach Co-Pilots',
    };
    verdictBody = {
      pt: `${myName} e ${friend.n} podem dividir o cabo auxiliar sem briga. Coloquem na ${roadtripStation.name} e deixem a I-97 para trás.`,
      en: `${myName} and ${friend.n} can share the aux cord in peace. Lock into ${roadtripStation.name} and cruise I-97 together.`,
    };
  } else if (compatibility >= 60) {
    verdictTitle = {
      pt: 'Acordo Pacífico no Banco da Frente',
      en: 'Front-Seat Peace Treaty',
    };
    verdictBody = {
      pt: `${myName} puxa para ${myTop.name} e ${friend.n} prefere ${friendTop.name}, mas na ${roadtripStation.name} os dois cantam juntos.`,
      en: `${myName} leans ${myTop.name} while ${friend.n} backs ${friendTop.name}, yet ${roadtripStation.name} keeps everyone happy.`,
    };
  } else if (compatibility >= 38) {
    verdictTitle = {
      pt: 'Disputa Tensa Pelo Rádio',
      en: 'Tug-of-War Over the Dial',
    };
    verdictBody = {
      pt: `Quem estiver dirigindo manda: ${myTop.name} vs ${friendTop.name}. A única saída diplomática é sintonizar ${roadtripStation.name}.`,
      en: `Driver gets final say (${myTop.name} vs ${friendTop.name}). ${roadtripStation.name} is your only diplomatic truce.`,
    };
  } else {
    verdictTitle = {
      pt: 'Dois Carros Separados, Por Favor',
      en: 'Take Separate Cars Across Leonida',
    };
    verdictBody = {
      pt: `De ${myTop.name} para ${friendTop.name} é um abismo sonoro. Em Leonida, alguém vai ter que colocar fones de ouvido no banco do carona.`,
      en: `Going from ${myTop.name} to ${friendTop.name} causes whiplash. Someone’s wearing in-game earbuds in the passenger seat.`,
    };
  }

  return {
    myName,
    friendName: friend.n,
    compatibility,
    roadtripStation,
    myTopStation: myTop,
    friendTopStation: friendTop,
    sharedArtists,
    sharedTracks,
    verdictTitle,
    verdictBody,
    rows,
  };
}
