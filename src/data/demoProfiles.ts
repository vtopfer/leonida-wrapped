import type { MultiPeriodUserData, SharedProfileV1 } from '../types';

export interface DemoProfilePreset {
  id: string;
  labelPt: string;
  labelEn: string;
  subtitlePt: string;
  subtitleEn: string;
  data: MultiPeriodUserData;
}

export const DEMO_PROFILES: DemoProfilePreset[] = [
  {
    id: 'mendes',
    labelPt: 'Mendes • Rock, Metal & Eletrônica',
    labelEn: 'Mendes • Rock, Metal & Electronic',
    subtitlePt: 'Clássicos de guitarra, metal pesado e uns drops eletrônicos',
    subtitleEn: 'Classic & modern rock, heavy metal, plus electronic cuts',
    data: {
      displayName: 'Mendes',
      source: 'demo',
      talkVibe: 'true_crime',
      periods: {
        '1month': {
          artists: [
            { name: 'Metallica', playcount: 195, tags: ['metal', 'thrash-metal'] },
            { name: 'System of a Down', playcount: 165, tags: ['metal', 'nu-metal'] },
            { name: 'Linkin Park', playcount: 148, tags: ['nu-metal', 'rock'] },
            { name: 'Tool', playcount: 132, tags: ['metal', 'heavy-metal'] },
            { name: 'Tom Petty', playcount: 112, tags: ['classic-rock', 'rock'] },
            { name: 'Justice', playcount: 90, tags: ['indie-dance', 'electronic'] },
            { name: 'Digitalism', playcount: 72, tags: ['electronic', 'indie-dance'] },
          ],
          tracks: [
            { title: 'Master of Puppets', artist: 'Metallica', playcount: 52 },
            { title: 'In the End', artist: 'Linkin Park', playcount: 44 },
            { title: 'ATWA', artist: 'System of a Down', playcount: 37 },
            { title: 'Love Is a Long Road', artist: 'Tom Petty', playcount: 29 },
            { title: 'One Night / All Night', artist: 'Justice & Tame Impala', playcount: 24 },
          ],
        },
        '6month': {
          artists: [
            { name: 'Tom Petty', playcount: 290, tags: ['classic-rock', 'rock'] },
            { name: 'The Clash', playcount: 240, tags: ['classic-rock', 'punk'] },
            { name: 'Bon Jovi', playcount: 215, tags: ['hard-rock', 'classic-rock'] },
            { name: 'The Rolling Stones', playcount: 190, tags: ['classic-rock', 'rock'] },
            { name: 'Eric Clapton', playcount: 160, tags: ['classic-rock', 'rock'] },
            { name: 'Metallica', playcount: 145, tags: ['metal', 'thrash-metal'] },
            { name: 'Caribou', playcount: 105, tags: ['electronic', 'indie-dance'] },
          ],
          tracks: [
            { title: 'Love Is a Long Road', artist: 'Tom Petty', playcount: 84 },
            { title: 'Rock the Casbah', artist: 'The Clash', playcount: 66 },
            { title: 'Runaway', artist: 'Bon Jovi', playcount: 51 },
          ],
        },
        overall: {
          artists: [
            { name: 'Metallica', playcount: 940, tags: ['metal', 'thrash-metal'] },
            { name: 'Slayer', playcount: 720, tags: ['thrash-metal', 'metal'] },
            { name: 'Iron Maiden', playcount: 680, tags: ['heavy-metal', 'metal'] },
            { name: 'Tom Petty', playcount: 610, tags: ['classic-rock', 'rock'] },
            { name: 'Black Sabbath', playcount: 540, tags: ['heavy-metal', 'metal'] },
            { name: 'Linkin Park', playcount: 480, tags: ['nu-metal', 'rock'] },
            { name: 'Justice', playcount: 340, tags: ['electronic', 'indie-dance'] },
          ],
          tracks: [
            { title: 'Master of Puppets', artist: 'Metallica', playcount: 265 },
            { title: 'The Trooper', artist: 'Iron Maiden', playcount: 198 },
            { title: 'Raining Blood', artist: 'Slayer', playcount: 170 },
          ],
        },
      },
    },
  },
  {
    id: 'lu',
    labelPt: 'Lu • Pop & Vibe Latina',
    labelEn: 'Lu • Pop & Latin Heat',
    subtitlePt: 'Refrões pop no volume máximo e hits latinos de Vice Beach',
    subtitleEn: 'Chart-topping pop hooks mixed with Latin heat',
    data: {
      displayName: 'Lu',
      source: 'demo',
      talkVibe: 'chaos',
      periods: {
        '1month': {
          artists: [
            { name: 'Dua Lipa', playcount: 185, tags: ['pop', 'dance-pop'] },
            { name: 'Charli XCX', playcount: 158, tags: ['pop', 'electropop'] },
            { name: 'Chappell Roan', playcount: 146, tags: ['pop', 'indie-pop'] },
            { name: 'Billie Eilish', playcount: 132, tags: ['pop', 'alt-pop'] },
            { name: 'Ariana Grande', playcount: 118, tags: ['pop', 'dance-pop'] },
            { name: 'Bad Bunny', playcount: 102, tags: ['reggaeton', 'latin'] },
            { name: 'Camila Cabello', playcount: 88, tags: ['pop', 'latin'] },
          ],
          tracks: [
            { title: 'Houdini', artist: 'Dua Lipa', playcount: 54 },
            { title: 'HOT TO GO!', artist: 'Chappell Roan', playcount: 47 },
            { title: 'Good Ones', artist: 'Charli XCX', playcount: 39 },
            { title: 'LUNCH', artist: 'Billie Eilish', playcount: 35 },
            { title: 'EoO', artist: 'Bad Bunny', playcount: 26 },
          ],
        },
        '6month': {
          artists: [
            { name: 'Bad Bunny', playcount: 380, tags: ['reggaeton', 'urbano', 'latin'] },
            { name: 'Rauw Alejandro', playcount: 250, tags: ['reggaeton', 'latin'] },
            { name: 'Young Miko', playcount: 210, tags: ['latin-trap', 'reggaeton'] },
            { name: 'Myke Towers', playcount: 185, tags: ['reggaeton', 'urbano'] },
            { name: 'Tainy', playcount: 165, tags: ['reggaeton', 'latin'] },
            { name: 'Dua Lipa', playcount: 140, tags: ['pop', 'dance-pop'] },
          ],
          tracks: [
            { title: 'Mojabi Ghost', artist: 'Tainy & Bad Bunny', playcount: 95 },
            { title: 'Otra Noche en Miami', artist: 'Bad Bunny', playcount: 78 },
            { title: 'Macacoa 2000', artist: 'Rauw Alejandro', playcount: 62 },
          ],
        },
        overall: {
          artists: [
            { name: 'Dua Lipa', playcount: 690, tags: ['pop', 'dance-pop'] },
            { name: 'Billie Eilish', playcount: 560, tags: ['pop', 'alt-pop'] },
            { name: 'Ariana Grande', playcount: 510, tags: ['pop', 'dance-pop'] },
            { name: 'Bad Bunny', playcount: 440, tags: ['reggaeton', 'latin'] },
            { name: 'Olivia Rodrigo', playcount: 380, tags: ['pop', 'indie-pop'] },
            { name: 'Gloria Estefan', playcount: 240, tags: ['latin', 'tropical'] },
          ],
          tracks: [
            { title: 'Break Free', artist: 'Ariana Grande & Zedd', playcount: 180 },
            { title: 'good 4 u', artist: 'Olivia Rodrigo', playcount: 142 },
            { title: 'Houdini', artist: 'Dua Lipa', playcount: 120 },
          ],
        },
      },
    },
  },
  {
    id: 'john',
    labelPt: 'John • Eletrônica, Reggae & Tudo',
    labelEn: 'John • Electronic, Reggae & Eclectic',
    subtitlePt: 'Escuta de tudo, puxando forte para pista eletrônica e dub/reggae',
    subtitleEn: 'Listens to everything, anchored in club electronics and roots reggae',
    data: {
      displayName: 'John',
      source: 'demo',
      talkVibe: 'conspiracy',
      periods: {
        '1month': {
          artists: [
            { name: 'Skream', playcount: 175, tags: ['house', 'tech-house', 'dub'] },
            { name: 'Michael Bibi', playcount: 152, tags: ['tech-house', 'house'] },
            { name: 'PAWSA', playcount: 138, tags: ['tech-house', 'house'] },
            { name: 'Adrian Sherwood', playcount: 118, tags: ['dub', 'reggae'] },
            { name: 'Horace Andy', playcount: 102, tags: ['reggae', 'roots-reggae'] },
            { name: 'DJ Tennis', playcount: 92, tags: ['house', 'deep-house'] },
            { name: 'Jamiroquai', playcount: 78, tags: ['nu-jazz', 'funk', 'world'] },
          ],
          tracks: [
            { title: 'Floral', artist: 'Skream', playcount: 48 },
            { title: 'Rhythm of the Night', artist: 'Michael Bibi', playcount: 41 },
            { title: 'Collect the Commas', artist: 'PAWSA', playcount: 34 },
            { title: 'Dub Inspector', artist: 'Adrian Sherwood', playcount: 28 },
          ],
        },
        '6month': {
          artists: [
            { name: 'Adrian Sherwood', playcount: 310, tags: ['dub', 'reggae'] },
            { name: 'Horace Andy', playcount: 270, tags: ['reggae', 'roots-reggae'] },
            { name: 'Gregory Isaacs', playcount: 235, tags: ['reggae', 'lovers-rock'] },
            { name: 'Freddie McGregor', playcount: 195, tags: ['reggae', 'roots-reggae'] },
            { name: 'Ken Boothe', playcount: 170, tags: ['reggae', 'dub'] },
            { name: 'Skream', playcount: 155, tags: ['house', 'electronic'] },
            { name: 'Outkast', playcount: 110, tags: ['hip-hop', 'southern-hip-hop'] },
          ],
          tracks: [
            { title: 'Skylarking', artist: 'Horace Andy', playcount: 92 },
            { title: 'Dub Inspector', artist: 'Adrian Sherwood', playcount: 85 },
            { title: 'Big Ship', artist: 'Freddie McGregor', playcount: 64 },
          ],
        },
        overall: {
          artists: [
            { name: 'DJ Koze', playcount: 640, tags: ['deep-house', 'electronic'] },
            { name: 'Âme', playcount: 580, tags: ['deep-house', 'melodic-techno'] },
            { name: 'Bob Moses', playcount: 510, tags: ['deep-house', 'electronic'] },
            { name: 'Skream', playcount: 470, tags: ['house', 'deep-house'] },
            { name: 'Adrian Sherwood', playcount: 420, tags: ['dub', 'reggae'] },
            { name: 'Jamiroquai', playcount: 360, tags: ['nu-jazz', 'world'] },
            { name: 'Dua Lipa', playcount: 290, tags: ['pop'] },
          ],
          tracks: [
            { title: 'XTC', artist: 'DJ Koze', playcount: 190 },
            { title: 'Rej', artist: 'Âme', playcount: 162 },
            { title: 'Skylarking', artist: 'Horace Andy', playcount: 135 },
          ],
        },
      },
    },
  },
];

export const PRESET_DEMO_FRIENDS: SharedProfileV1[] = [
  {
    v: 1,
    n: 'Mendes',
    r: [
      [11, 96], // The Chamber 106.6
      [10, 84], // V-Rock
      [3, 68],  // Stockyard FM
      [17, 54], // CircoLoco
      [1, 46],  // Emotion 98.3
    ],
    a: ['Metallica', 'Tom Petty', 'Linkin Park', 'System of a Down', 'Justice', 'Tool'],
    t: ['Metallica - Master of Puppets', 'Tom Petty - Love Is a Long Road', 'Linkin Park - In the End'],
    p: 4, // Vice City True Stories
  },
  {
    v: 1,
    n: 'Lu',
    r: [
      [0, 97], // Flash FM
      [7, 82], // Cocoteo FM
      [3, 67], // Stockyard FM
      [6, 58], // Honey FM
      [2, 51], // Vice City FM
    ],
    a: ['Dua Lipa', 'Charli XCX', 'Chappell Roan', 'Billie Eilish', 'Bad Bunny', 'Ariana Grande'],
    t: ['Dua Lipa - Houdini', 'Chappell Roan - HOT TO GO!', 'Bad Bunny - EoO'],
    p: 1, // The Wipe
  },
  {
    v: 1,
    n: 'John',
    r: [
      [17, 94], // CircoLoco
      [9, 88],  // Radio On-U
      [20, 81], // The Vault Radio
      [16, 65], // Worldwide FM
      [3, 59],  // Stockyard FM
    ],
    a: ['Skream', 'Adrian Sherwood', 'Horace Andy', 'Michael Bibi', 'DJ Koze', 'Jamiroquai'],
    t: ['Skream - Floral', 'Adrian Sherwood - Dub Inspector', 'DJ Koze - XTC'],
    p: 0, // WKTT
  },
];

export const PRESET_DEMO_FRIEND = PRESET_DEMO_FRIENDS[1];

export function getDemoFriendFor(currentName: string): SharedProfileV1 {
  const clean = currentName.trim().toLowerCase();
  const match = PRESET_DEMO_FRIENDS.find((f) => f.n.toLowerCase() !== clean);
  return match ?? PRESET_DEMO_FRIEND;
}
