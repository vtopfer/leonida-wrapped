import { GTA6_STATIONS } from './gta6Radios';

export interface CatalogArtistEntry {
  name: string;
  genres: string[];
}

export interface QuickGenreOption {
  id: string;
  labelPt: string;
  labelEn: string;
  tags: string[];
}

export const QUICK_GENRE_OPTIONS: QuickGenreOption[] = [
  { id: 'pop', labelPt: 'Pop & Hits', labelEn: 'Pop & Charts', tags: ['pop', 'dance-pop', 'electropop'] },
  { id: 'trap', labelPt: 'Trap & Rap Atual', labelEn: 'Modern Rap & Trap', tags: ['modern-rap', 'trap', 'hip-hop'] },
  { id: 'classic-rap', labelPt: 'Rap Clássico', labelEn: 'Classic Hip-Hop', tags: ['southern-hip-hop', 'classic-rap', 'hip-hop'] },
  { id: 'rock', labelPt: 'Rock Clássico', labelEn: 'Classic Rock', tags: ['classic-rock', 'hard-rock', 'rock'] },
  { id: 'metal', labelPt: 'Metal & Pesado', labelEn: 'Heavy Metal', tags: ['metal', 'heavy-metal', 'thrash-metal', 'nu-metal'] },
  { id: '80s', labelPt: 'Anos 80 & Synth', labelEn: '80s & Synthwave', tags: ['80s', 'new-wave', 'synthwave', 'soft-rock'] },
  { id: 'indie', labelPt: 'Indie & Alt', labelEn: 'Indie & Alt', tags: ['indie', 'indie-dance', 'indie-pop', 'alt-pop'] },
  { id: 'electronic', labelPt: 'House & Techno', labelEn: 'House & Techno', tags: ['house', 'tech-house', 'techno', 'deep-house'] },
  { id: 'rnb', labelPt: 'R&B & Soul', labelEn: 'R&B & Soul', tags: ['rnb', 'soul', '90s-rnb'] },
  { id: 'reggaeton', labelPt: 'Reggaeton & Latino', labelEn: 'Reggaeton & Latin', tags: ['reggaeton', 'urbano', 'latin', 'salsa'] },
  { id: 'brazilian', labelPt: 'Brasil / Funk / MPB', labelEn: 'Brazilian / MPB', tags: ['brazilian', 'mpb', 'world', 'latin', 'reggaeton'] },
  { id: 'afrobeats', labelPt: 'Afrobeats & Amapiano', labelEn: 'Afrobeats & Amapiano', tags: ['afrobeats', 'amapiano', 'afro-pop'] },
  { id: 'country', labelPt: 'Country & Folk', labelEn: 'Country & Folk', tags: ['country', 'outlaw-country', 'folk'] },
  { id: 'reggae', labelPt: 'Reggae & Dub', labelEn: 'Reggae & Dub', tags: ['reggae', 'dub', 'roots-reggae'] },
  { id: 'jazz-blues', labelPt: 'Jazz & Blues', labelEn: 'Jazz & Blues', tags: ['jazz', 'jazz-fusion', 'blues'] },
  { id: 'classical', labelPt: 'Clássica / Orquestra', labelEn: 'Classical / Score', tags: ['classical', 'orchestral', 'soundtrack'] },
];

/**
 * Curated global & Brazilian artist taxonomy for rich genre fallback matching
 * even when the user's favorite artists are not directly on GTA VI's confirmed list.
 */
const CURATED_ARTISTS: CatalogArtistEntry[] = [
  // Global Pop & Alt-Pop
  { name: 'Taylor Swift', genres: ['pop', 'indie-pop', 'country'] },
  { name: 'Sabrina Carpenter', genres: ['pop', 'dance-pop'] },
  { name: 'Lady Gaga', genres: ['pop', 'dance-pop', 'electropop'] },
  { name: 'Beyoncé', genres: ['pop', 'rnb', 'dance-pop'] },
  { name: 'Rihanna', genres: ['pop', 'rnb', 'dance-pop'] },
  { name: 'Lana Del Rey', genres: ['alt-pop', 'indie-pop', 'soft-rock', 'country'] },
  { name: 'Harry Styles', genres: ['pop', 'soft-rock'] },
  { name: 'Bruno Mars', genres: ['pop', 'rnb', 'funk'] },
  { name: 'SZA', genres: ['rnb', 'neo-soul', 'pop'] },
  { name: 'Frank Ocean', genres: ['rnb', 'neo-soul', 'indie'] },
  { name: 'Doja Cat', genres: ['pop', 'modern-rap', 'rnb'] },
  { name: 'Lorde', genres: ['indie-pop', 'electropop', 'art-pop'] },
  { name: 'Rosalía', genres: ['latin', 'art-pop', 'reggaeton', 'pop'] },
  { name: 'Karol G', genres: ['reggaeton', 'latin', 'urbano'] },
  { name: 'Shakira', genres: ['latin', 'pop', 'tropical'] },
  { name: 'Peso Pluma', genres: ['latin', 'urbano'] },
  { name: 'Feid', genres: ['reggaeton', 'urbano', 'latin'] },
  { name: 'J Balvin', genres: ['reggaeton', 'urbano', 'latin'] },

  // Hip-Hop & Trap
  { name: 'Kendrick Lamar', genres: ['hip-hop', 'rap', 'modern-rap'] },
  { name: 'Kanye West', genres: ['hip-hop', 'rap', 'modern-rap'] },
  { name: 'Tyler, The Creator', genres: ['hip-hop', 'neo-soul', 'indie'] },
  { name: 'Playboi Carti', genres: ['trap', 'modern-rap', 'hip-hop'] },
  { name: 'A$AP Rocky', genres: ['hip-hop', 'modern-rap', 'trap'] },
  { name: 'J. Cole', genres: ['hip-hop', 'rap'] },
  { name: 'Eminem', genres: ['hip-hop', 'classic-rap', 'rap'] },
  { name: 'Nas', genres: ['classic-rap', 'hip-hop'] },
  { name: 'Wu-Tang Clan', genres: ['classic-rap', 'hip-hop'] },
  { name: '50 Cent', genres: ['classic-rap', 'hip-hop'] },
  { name: 'Snoop Dogg', genres: ['classic-rap', 'hip-hop'] },
  { name: '2Pac', genres: ['classic-rap', 'hip-hop'] },
  { name: 'The Notorious B.I.G.', genres: ['classic-rap', 'hip-hop'] },
  { name: 'Megan Thee Stallion', genres: ['modern-rap', 'hip-hop'] },
  { name: 'Nicki Minaj', genres: ['modern-rap', 'pop', 'hip-hop'] },
  { name: 'Don Toliver', genres: ['trap', 'modern-rap', 'rnb'] },
  { name: 'Metro Boomin', genres: ['trap', 'modern-rap'] },

  // Rock, Indie & Metal
  { name: 'Arctic Monkeys', genres: ['indie', 'indie-rock', 'rock'] },
  { name: 'Tame Impala', genres: ['indie', 'indie-dance', 'electronic'] },
  { name: 'Radiohead', genres: ['indie', 'art-pop', 'rock'] },
  { name: 'The Strokes', genres: ['indie', 'indie-rock', 'rock'] },
  { name: 'Gorillaz', genres: ['indie-pop', 'electronic', 'hip-hop'] },
  { name: 'Fleetwood Mac', genres: ['classic-rock', 'soft-rock'] },
  { name: 'Queen', genres: ['classic-rock', 'arena-rock'] },
  { name: 'Pink Floyd', genres: ['classic-rock', 'rock'] },
  { name: 'Led Zeppelin', genres: ['classic-rock', 'hard-rock'] },
  { name: 'AC/DC', genres: ['hard-rock', 'classic-rock'] },
  { name: 'Guns N\' Roses', genres: ['hard-rock', 'classic-rock'] },
  { name: 'Nirvana', genres: ['grunge', 'rock', 'alt-rock'] },
  { name: 'Pearl Jam', genres: ['grunge', 'rock', 'classic-rock'] },
  { name: 'Foo Fighters', genres: ['rock', 'hard-rock', 'alt-rock'] },
  { name: 'Red Hot Chili Peppers', genres: ['rock', 'funk', 'alt-rock'] },
  { name: 'Green Day', genres: ['punk', 'rock'] },
  { name: 'Blink-182', genres: ['punk', 'rock'] },
  { name: 'Slipknot', genres: ['metal', 'nu-metal', 'heavy-metal'] },
  { name: 'Deftones', genres: ['nu-metal', 'metal', 'alt-rock'] },
  { name: 'Korn', genres: ['nu-metal', 'metal'] },
  { name: 'Avenged Sevenfold', genres: ['heavy-metal', 'metal'] },
  { name: 'Gojira', genres: ['metal', 'heavy-metal'] },
  { name: 'Rammstein', genres: ['metal', 'heavy-metal'] },
  { name: 'The Cure', genres: ['new-wave', 'post-punk', '80s'] },
  { name: 'Depeche Mode', genres: ['synth-pop', 'new-wave', '80s'] },
  { name: 'New Order', genres: ['new-wave', 'synth-pop', '80s'] },
  { name: 'Tears for Fears', genres: ['80s', 'new-wave', 'soft-rock'] },
  { name: 'Duran Duran', genres: ['80s', 'new-wave', 'synth-pop'] },

  // Electronic / House / Techno
  { name: 'Fred again..', genres: ['house', 'indie-dance', 'electronic'] },
  { name: 'Disclosure', genres: ['house', 'electronic', 'dance-pop'] },
  { name: 'Kaytranada', genres: ['house', 'rnb', 'electronic', 'nu-jazz'] },
  { name: 'Jamie xx', genres: ['electronic', 'indie-dance', 'house'] },
  { name: 'Peggy Gou', genres: ['house', 'tech-house', 'electronic'] },
  { name: 'Charlotte de Witte', genres: ['techno', 'melodic-techno', 'electronic'] },
  { name: 'Anyma', genres: ['melodic-techno', 'electronic'] },
  { name: 'Tale Of Us', genres: ['melodic-techno', 'deep-house'] },
  { name: 'Solomun', genres: ['deep-house', 'tech-house', 'house'] },
  { name: 'Keinemusik', genres: ['deep-house', 'house', 'amapiano'] },
  { name: 'Black Coffee', genres: ['deep-house', 'amapiano', 'house'] },
  { name: 'RÜFÜS DU SOL', genres: ['indie-dance', 'deep-house', 'electronic'] },
  { name: 'Aphex Twin', genres: ['experimental', 'electronic', 'minimal'] },
  { name: 'Four Tet', genres: ['electronic', 'deep-house', 'indie-dance'] },

  // Brazil (Strong PT-BR coverage!)
  { name: 'Anitta', genres: ['pop', 'reggaeton', 'brazilian', 'urbano'] },
  { name: 'Matuê', genres: ['trap', 'modern-rap', 'brazilian'] },
  { name: 'Teto', genres: ['trap', 'modern-rap', 'brazilian'] },
  { name: 'Wiu', genres: ['trap', 'modern-rap', 'brazilian'] },
  { name: 'Veigh', genres: ['trap', 'modern-rap', 'rnb'] },
  { name: 'Racionais MC\'s', genres: ['classic-rap', 'hip-hop', 'brazilian'] },
  { name: 'Djonga', genres: ['hip-hop', 'rap', 'brazilian'] },
  { name: 'Emicida', genres: ['hip-hop', 'mpb', 'brazilian'] },
  { name: 'BK\'', genres: ['hip-hop', 'rap', 'brazilian'] },
  { name: 'Baco Exu do Blues', genres: ['hip-hop', 'rnb', 'mpb', 'brazilian'] },
  { name: 'Liniker', genres: ['soul', 'mpb', 'rnb', 'brazilian'] },
  { name: 'Tim Maia', genres: ['soul', 'funk', 'mpb', 'brazilian'] },
  { name: 'Jorge Ben Jor', genres: ['mpb', 'groove', 'world', 'brazilian'] },
  { name: 'Seu Jorge', genres: ['mpb', 'groove', 'soul', 'brazilian'] },
  { name: 'Chico Buarque', genres: ['mpb', 'world', 'brazilian'] },
  { name: 'Caetano Veloso', genres: ['mpb', 'world', 'brazilian'] },
  { name: 'Djavan', genres: ['mpb', 'jazz', 'soul', 'brazilian'] },
  { name: 'Gilsons', genres: ['mpb', 'indie-pop', 'brazilian'] },
  { name: 'Luísa Sonza', genres: ['pop', 'dance-pop', 'brazilian'] },
  { name: 'Pabllo Vittar', genres: ['pop', 'dance-pop', 'brazilian'] },
  { name: 'Ivete Sangalo', genres: ['tropical', 'brazilian', 'pop'] },
  { name: 'Charlie Brown Jr.', genres: ['rock', 'alt-rock', 'brazilian'] },
  { name: 'Legião Urbana', genres: ['rock', 'post-punk', '80s', 'brazilian'] },
  { name: 'Cássia Eller', genres: ['rock', 'mpb', 'brazilian'] },
  { name: 'Alok', genres: ['house', 'electronic', 'dance', 'brazilian'] },
  { name: 'Vintage Culture', genres: ['house', 'tech-house', 'deep-house', 'brazilian'] },
  { name: 'Mochakk', genres: ['tech-house', 'house', 'electronic', 'brazilian'] },
  { name: 'Natiruts', genres: ['reggae', 'roots-reggae', 'brazilian'] },
  { name: 'Armandinho', genres: ['reggae', 'brazilian'] },

  // Afrobeats, Reggae, Country, Jazz, Blues, Classical
  { name: 'Wizkid', genres: ['afrobeats', 'afro-pop', 'rnb'] },
  { name: 'Tems', genres: ['afrobeats', 'rnb', 'neo-soul'] },
  { name: 'Rema', genres: ['afrobeats', 'afro-pop'] },
  { name: 'Tyla', genres: ['amapiano', 'afrobeats', 'pop', 'rnb'] },
  { name: 'Bob Marley & The Wailers', genres: ['reggae', 'roots-reggae', 'dub'] },
  { name: 'Peter Tosh', genres: ['reggae', 'roots-reggae'] },
  { name: 'Damian Marley', genres: ['reggae', 'dub', 'hip-hop'] },
  { name: 'Zach Bryan', genres: ['country', 'outlaw-country', 'americana'] },
  { name: 'Chris Stapleton', genres: ['country', 'outlaw-country', 'blues'] },
  { name: 'Johnny Cash', genres: ['outlaw-country', 'country', 'folk'] },
  { name: 'Willie Nelson', genres: ['outlaw-country', 'country'] },
  { name: 'B.B. King', genres: ['blues', 'electric-blues'] },
  { name: 'Muddy Waters', genres: ['blues', 'electric-blues', 'delta-blues'] },
  { name: 'Stevie Ray Vaughan', genres: ['blues', 'electric-blues', 'classic-rock'] },
  { name: 'Miles Davis', genres: ['jazz', 'jazz-fusion'] },
  { name: 'John Coltrane', genres: ['jazz'] },
  { name: 'Herbie Hancock', genres: ['jazz-fusion', 'jazz', 'funk'] },
  { name: 'Kamasi Washington', genres: ['jazz', 'nu-jazz'] },
  { name: 'Domi & JD Beck', genres: ['jazz-fusion', 'jazz'] },
  { name: 'Hans Zimmer', genres: ['soundtrack', 'orchestral', 'classical'] },
  { name: 'Ludovico Einaudi', genres: ['classical', 'instrumental'] },
  { name: 'Max Richter', genres: ['classical', 'orchestral', 'ambient'] },
  { name: 'Wolfgang Amadeus Mozart', genres: ['classical', 'orchestral'] },
  { name: 'Ludwig van Beethoven', genres: ['classical', 'orchestral'] },
];

export function normalizeArtistKey(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitCollaborators(raw: string): string[] {
  return raw
    .split(/\s*(?:,|&|\bft\.?|\bfeat\.?|\bfeaturing\b|\bwith\b|\bx\b)\s*/i)
    .map((part) => part.trim())
    .filter((part) => part.length > 1);
}

// Build combined index: curated catalog + every artist appearing on GTA VI radio tracks
const artistMap = new Map<string, { displayName: string; genres: Set<string> }>();

for (const entry of CURATED_ARTISTS) {
  const key = normalizeArtistKey(entry.name);
  if (!key) continue;
  const existing = artistMap.get(key) ?? { displayName: entry.name, genres: new Set<string>() };
  entry.genres.forEach((g) => existing.genres.add(g));
  artistMap.set(key, existing);
}

for (const station of GTA6_STATIONS) {
  for (const track of station.tracks) {
    const parts = splitCollaborators(track.artist);
    for (const part of parts) {
      const key = normalizeArtistKey(part);
      if (!key) continue;
      const existing = artistMap.get(key) ?? { displayName: part, genres: new Set<string>() };
      station.genres.slice(0, 3).forEach((g) => existing.genres.add(g));
      artistMap.set(key, existing);
    }
  }
}

export const ARTIST_SEARCH_LIST: CatalogArtistEntry[] = Array.from(artistMap.values())
  .map((v) => ({ name: v.displayName, genres: Array.from(v.genres) }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function lookupArtistGenres(artistName: string): string[] {
  const exact = artistMap.get(normalizeArtistKey(artistName));
  if (exact) return Array.from(exact.genres);
  const parts = splitCollaborators(artistName);
  const combined = new Set<string>();
  for (const part of parts) {
    const found = artistMap.get(normalizeArtistKey(part));
    if (found) found.genres.forEach((g) => combined.add(g));
  }
  return Array.from(combined);
}
