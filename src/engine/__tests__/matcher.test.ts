import { describe, expect, it } from 'vitest';
import { DEMO_PROFILES } from '../../data/demoProfiles';
import { GTA6_STATIONS, GTA6_TALK_SHOWS } from '../../data/gta6Radios';
import { parseSpotifyJsonArrays } from '../../services/spotifyExport';
import {
  extractYoutubeArtistAndTitle,
  parseYoutubeInput,
} from '../../services/youtubePublic';
import { parseYoutubeTakeoutArrays } from '../../services/youtubeTakeout';
import { selectCardHighlights } from '../cardRenderer';
import { analyzeUserProfile, matchPeriod } from '../matcher';
import {
  buildSharedProfilePayload,
  compareProfiles,
  decodeSharedProfile,
  encodeSharedProfile,
} from '../share';
import { getStationArtworkSvg } from '../stationSvg';

describe('GTA VI Radio Matching Engine', () => {
  it('matches pop exact tracks and artists to Flash FM', () => {
    const result = matchPeriod('1month', {
      artists: [
        { name: 'Dua Lipa', playcount: 140 },
        { name: 'Charli XCX', playcount: 110 },
        { name: 'Chappell Roan', playcount: 95 },
      ],
      tracks: [
        { title: 'Houdini', artist: 'Dua Lipa', playcount: 35 },
        { title: 'HOT TO GO!', artist: 'Chappell Roan', playcount: 25 },
      ],
    });

    expect(result.topStation.station.id).toBe('flash-fm');
    expect(result.topStation.percentage).toBeGreaterThanOrEqual(85);
    expect(result.allMatchedTracks.length).toBe(2);
    expect(result.topStation.discoveryTracks.length).toBe(3);
    expect(result.topStation.featuredTrack.matchReason).toBe('exact');
    expect(result.topStation.featuredTrack.title).toBe('Houdini');
  });

  it('matches metal tracks and artists to The Chamber 106.6', () => {
    const result = matchPeriod('overall', {
      artists: [
        { name: 'Metallica', playcount: 300 },
        { name: 'Slayer', playcount: 210 },
        { name: 'Iron Maiden', playcount: 180 },
      ],
      tracks: [
        { title: 'Master of Puppets (Remastered)', artist: 'Metallica', playcount: 80 },
        { title: 'Raining Blood', artist: 'Slayer', playcount: 60 },
      ],
    });

    expect(result.topStation.station.id).toBe('the-chamber');
    expect(result.allMatchedTracks.map((t) => t.title)).toContain('Master of Puppets');
  });

  it('matches Latin & reggaeton tastes to Cocoteo FM', () => {
    const result = matchPeriod('1month', {
      artists: [
        { name: 'Bad Bunny', playcount: 220 },
        { name: 'Rauw Alejandro', playcount: 130 },
        { name: 'Young Miko', playcount: 90 },
      ],
      tracks: [{ title: 'EoO', artist: 'Bad Bunny', playcount: 45 }],
    });

    expect(result.topStation.station.id).toBe('cocoteo-fm');
  });

  it('tracks per-station artist hits, genre-related artists, and featuredTrack fallback priority', () => {
    const artistOnlyResult = matchPeriod('overall', {
      artists: [
        { name: 'Outkast', playcount: 200 },
        { name: 'Kendrick Lamar', playcount: 180 },
        { name: 'Kanye West', playcount: 170 },
      ],
      tracks: [],
    });

    const dirtySouth = artistOnlyResult.rankedStations.find(
      (s) => s.station.id === 'dirty-south-classics'
    )!;
    expect(dirtySouth.matchedArtists).toContain('Outkast');
    expect(dirtySouth.stationTracksByMatchedArtists.map((t) => t.title)).toContain("Player's Ball");
    expect(dirtySouth.relatedUserArtists).toContain('Kendrick Lamar');
    expect(dirtySouth.featuredTrack.matchReason).toBe('artist');
    expect(dirtySouth.featuredTrack.artist).toBe('Outkast');

    const countryVibeOnly = matchPeriod('overall', {
      artists: [
        { name: 'Zach Bryan', playcount: 120 },
        { name: 'Chris Stapleton', playcount: 95 },
        { name: 'Johnny Cash', playcount: 80 },
      ],
      tracks: [],
    });

    expect(countryVibeOnly.topStation.station.id).toBe('back-country-radio');
    expect(countryVibeOnly.topStation.featuredTrack.matchReason).toBe('vibe');
    expect(countryVibeOnly.topStation.relatedUserArtists).toContain('Zach Bryan');
    expect(countryVibeOnly.topStation.percentage).toBeGreaterThanOrEqual(60);
  });

  it('selects Top 3 artists and Top 3 unique GTA VI tracks for shareable cards even without exact track hits', () => {
    const res = matchPeriod('1month', {
      artists: [
        { name: 'Daft Punk', playcount: 150 },
        { name: 'Billie Eilish', playcount: 130 },
        { name: 'Akon', playcount: 110 },
        { name: 'Gregory Isaacs', playcount: 90 },
      ],
      tracks: [],
    });

    const highlights = selectCardHighlights(res);
    expect(highlights.topArtists).toHaveLength(3);
    expect(highlights.topArtists.every((a) => a.isInGame)).toBe(true);
    expect(highlights.topArtists[0].name).toBe('Daft Punk');
    expect(highlights.topTracks).toHaveLength(3);
    const trackTitles = highlights.topTracks.map((t) => t.title);
    expect(trackTitles).toContain('Around the World');
    expect(trackTitles).toContain('Lunch');
  });

  it('evaluates Mendes, Lu, and John Easter Egg profiles with expected multi-period shifts', () => {
    const [mendesPreset, luPreset, johnPreset] = DEMO_PROFILES;

    expect(mendesPreset.data.displayName).toBe('Mendes');
    expect(luPreset.data.displayName).toBe('Lu');
    expect(johnPreset.data.displayName).toBe('John');

    const mendes = analyzeUserProfile(mendesPreset.data);
    expect(mendes.resultsByPeriod['1month']?.topStation.station.id).toBe('the-chamber');
    expect(mendes.resultsByPeriod['6month']?.topStation.station.id).toBe('v-rock');
    expect(mendes.evolution.changed).toBe(true);

    const lu = analyzeUserProfile(luPreset.data);
    expect(lu.resultsByPeriod['1month']?.topStation.station.id).toBe('flash-fm');
    expect(lu.resultsByPeriod['6month']?.topStation.station.id).toBe('cocoteo-fm');
    expect(lu.evolution.changed).toBe(true);

    const john = analyzeUserProfile(johnPreset.data);
    expect(john.resultsByPeriod['6month']?.topStation.station.id).toBe('radio-on-u');
    expect(['circoloco-radio', 'the-vault-radio']).toContain(
      john.resultsByPeriod['1month']?.topStation.station.id
    );
    expect(john.evolution.changed).toBe(true);
  });
});

describe('Station SVG Artwork Generator', () => {
  it('generates valid SVG markup for all 21 music stations and 6 talk/podcasts', () => {
    for (const station of GTA6_STATIONS) {
      const svg = getStationArtworkSvg(station.id, 'test');
      expect(svg.startsWith('<svg ')).toBe(true);
      expect(svg.endsWith('</svg>')).toBe(true);
    }
    for (const show of GTA6_TALK_SHOWS) {
      const svg = getStationArtworkSvg(show.id, 'test');
      expect(svg.startsWith('<svg ')).toBe(true);
      expect(svg.endsWith('</svg>')).toBe(true);
    }
  });
});

describe('Spotify Local JSON History Parser', () => {
  it('parses basic & extended formats, filters skips (<30s), and buckets 1m/6m/overall', () => {
    const basicPayload = [
      {
        endTime: '2026-11-18 14:00',
        artistName: 'Dua Lipa',
        trackName: 'Houdini',
        msPlayed: 12_000,
      },
      {
        endTime: '2026-11-18 15:00',
        artistName: 'Dua Lipa',
        trackName: 'Houdini',
        msPlayed: 185_000,
      },
      {
        endTime: '2026-08-15 20:30',
        artistName: 'Tom Petty',
        trackName: 'Love Is a Long Road',
        msPlayed: 210_000,
      },
    ];

    const extendedPayload = [
      {
        ts: '2026-11-10T10:00:00Z',
        master_metadata_track_name: null,
        master_metadata_album_artist_name: null,
        ms_played: 600_000,
      },
      {
        ts: '2025-10-01T18:00:00Z',
        master_metadata_track_name: 'Master of Puppets',
        master_metadata_album_artist_name: 'Metallica',
        ms_played: 320_000,
      },
    ];

    const parsed = parseSpotifyJsonArrays([basicPayload, extendedPayload], 'João');

    expect(parsed.validPlayCount).toBe(3);
    expect(parsed.userData.displayName).toBe('João');
    expect(parsed.userData.periods['1month']?.tracks).toHaveLength(1);
    expect(parsed.userData.periods['1month']?.tracks[0].title).toBe('Houdini');
    expect(parsed.userData.periods['6month']?.tracks).toHaveLength(2);
    expect(parsed.userData.periods.overall?.tracks).toHaveLength(3);
  });
});

describe('YouTube Music Google Takeout Parser', () => {
  it('filters for YouTube Music entries, cleans Topic/Watched prefixes, and buckets periods', () => {
    const takeoutPayload = [
      // Regular YouTube video -> ignored
      {
        header: 'YouTube',
        title: 'Watched GTA 6 Trailer Analysis',
        titleUrl: 'https://www.youtube.com/watch?v=123',
        subtitles: [{ name: 'GameSpot' }],
        time: '2026-11-18T12:00:00Z',
      },
      // Recent YT Music play (EN)
      {
        header: 'YouTube Music',
        title: 'Watched Houdini',
        titleUrl: 'https://music.youtube.com/watch?v=abc',
        subtitles: [{ name: 'Dua Lipa - Topic' }],
        time: '2026-11-18T14:00:00Z',
      },
      // Older YT Music play (PT-BR, ~90 days ago)
      {
        header: 'YouTube Music',
        title: 'Assistiu a Master of Puppets',
        titleUrl: 'https://music.youtube.com/watch?v=def',
        subtitles: [{ name: 'Metallica - Topic' }],
        time: '2026-08-18T18:00:00Z',
      },
    ];

    const parsed = parseYoutubeTakeoutArrays([takeoutPayload], 'Victor');
    expect(parsed.validPlayCount).toBe(2);
    expect(parsed.userData.source).toBe('youtube_json');
    expect(parsed.userData.periods['1month']?.tracks).toHaveLength(1);
    expect(parsed.userData.periods['1month']?.tracks[0].title).toBe('Houdini');
    expect(parsed.userData.periods['1month']?.artists[0].name).toBe('Dua Lipa');
    expect(parsed.userData.periods['6month']?.tracks).toHaveLength(2);
    expect(parsed.userData.periods.overall?.tracks).toHaveLength(2);
  });
});

describe('Stateless Friend Share & Comparison', () => {
  it('encodes and decodes UTF-8 names cleanly and computes roadtrip station', () => {
    const myRes = matchPeriod('1month', {
      artists: [
        { name: 'Dua Lipa', playcount: 100 },
        { name: 'Tame Impala', playcount: 90 },
        { name: 'Charli XCX', playcount: 85 },
      ],
      tracks: [{ title: 'Houdini', artist: 'Dua Lipa', playcount: 25 }],
    });

    const payload = buildSharedProfilePayload('João Paulo', myRes);
    const token = encodeSharedProfile(payload);
    const decoded = decodeSharedProfile(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.n).toBe('João Paulo');
    expect(decoded?.r.length).toBeGreaterThan(0);

    const friendRes = matchPeriod('1month', {
      artists: [
        { name: 'Tame Impala', playcount: 110 },
        { name: 'Justice', playcount: 100 },
        { name: 'Charli XCX', playcount: 80 },
      ],
      tracks: [
        { title: 'One Night / All Night', artist: 'Justice & Tame Impala', playcount: 30 },
        { title: 'Houdini', artist: 'Dua Lipa', playcount: 15 },
      ],
    });
    const friendPayload = buildSharedProfilePayload('Marina Ávila', friendRes);

    const comparison = compareProfiles('João Paulo', myRes, friendPayload);
    expect(comparison.compatibility).toBeGreaterThanOrEqual(60);
    expect(comparison.sharedArtists).toContain('Tame Impala');
    expect(comparison.sharedTracks).toContain('Dua Lipa - Houdini');
    expect(comparison.roadtripStation.name).toBeTruthy();
  });
});

describe('YouTube Public Playlist / Channel Parser', () => {
  it('parses playlist URLs, @handles, and UC channel IDs', () => {
    expect(
      parseYoutubeInput('https://music.youtube.com/playlist?list=PL1234567890_abc')
    ).toEqual({ kind: 'playlist', id: 'PL1234567890_abc' });

    expect(
      parseYoutubeInput('https://www.youtube.com/@seucanal')
    ).toEqual({ kind: 'handle', handle: '@seucanal' });

    expect(
      parseYoutubeInput('@victortopfer')
    ).toEqual({ kind: 'handle', handle: '@victortopfer' });

    expect(
      parseYoutubeInput('https://music.youtube.com/channel/UC1234567890abcdef123456')
    ).toEqual({ kind: 'channel_id', id: 'UC1234567890abcdef123456' });
  });

  it('extracts artist and song title from Topic channels and Official Video titles', () => {
    expect(extractYoutubeArtistAndTitle('Houdini', 'Dua Lipa - Topic')).toEqual({
      artist: 'Dua Lipa',
      title: 'Houdini',
    });

    expect(
      extractYoutubeArtistAndTitle(
        'Metallica - Master of Puppets (Official Music Video)',
        'Metallica'
      )
    ).toEqual({
      artist: 'Metallica',
      title: 'Master of Puppets',
    });
  });
});
