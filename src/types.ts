export type Language = 'pt' | 'en';

export type UiTheme = 'dark' | 'light';

export type TimePeriod = '1month' | '6month' | 'overall';

export type TalkVibe = 'conspiracy' | 'chaos' | 'hiphop_chat' | 'true_crime';

export type InputSource = 'lastfm' | 'quick' | 'spotify_json' | 'youtube_json' | 'demo';

export interface LocalizedText {
  pt: string;
  en: string;
}

export interface RadioTrack {
  title: string;
  artist: string;
  year?: number;
}

export interface RadioStation {
  id: string;
  index: number;
  name: string;
  frequency: string;
  freqNum: number;
  hosts: string;
  unlockable?: boolean;
  accentColor: string;
  genres: string[];
  genreWeights: Record<string, number>;
  defaultTalkId: string;
  persona: {
    pt: { title: string; tagline: string };
    en: { title: string; tagline: string };
  };
  description: LocalizedText;
  tracks: RadioTrack[];
}

export interface TalkShow {
  id: string;
  index: number;
  name: string;
  kind: 'talk_radio' | 'podcast';
  hosts: string;
  vibe: TalkVibe;
  frequency?: string;
  notableShows?: string[];
  description: LocalizedText;
}

export interface UserArtistInput {
  name: string;
  playcount?: number;
  tags?: string[];
}

export interface UserTrackInput {
  title: string;
  artist: string;
  playcount?: number;
}

export interface PeriodInput {
  artists: UserArtistInput[];
  tracks: UserTrackInput[];
}

export interface MultiPeriodUserData {
  displayName: string;
  source: InputSource;
  talkVibe?: TalkVibe;
  periods: Partial<Record<TimePeriod, PeriodInput>>;
}

export interface MatchedTrackItem {
  title: string;
  artist: string;
  stationId: string;
  stationName: string;
  userPlaycount?: number;
}

export interface MatchedArtistItem {
  name: string;
  stationIds: string[];
  userPlaycount?: number;
}

export interface DiscoveryTrackItem {
  title: string;
  artist: string;
  year?: number;
  spotifyUrl: string;
  youtubeMusicUrl: string;
  appleMusicUrl: string;
}

export interface FeaturedStationTrack {
  title: string;
  artist: string;
  matchReason: 'exact' | 'artist' | 'vibe';
}

export interface StationMatchResult {
  station: RadioStation;
  rawScore: number;
  percentage: number;
  matchedTracks: MatchedTrackItem[];
  matchedArtists: string[];
  matchedGenres: string[];
  relatedUserArtists: string[];
  stationTracksByMatchedArtists: RadioTrack[];
  featuredTrack: FeaturedStationTrack;
  discoveryTracks: DiscoveryTrackItem[];
}

export interface PeriodMatchResult {
  period: TimePeriod;
  rankedStations: StationMatchResult[];
  topStation: StationMatchResult;
  allMatchedTracks: MatchedTrackItem[];
  allMatchedArtists: MatchedArtistItem[];
  topUserArtists: string[];
  talkShow: TalkShow;
}

export interface EvolutionShift {
  hasMultiplePeriods: boolean;
  changed: boolean;
  stationsByPeriod: Partial<Record<TimePeriod, RadioStation>>;
  summary: LocalizedText;
}

export interface FullAnalysisResult {
  displayName: string;
  source: InputSource;
  availablePeriods: TimePeriod[];
  resultsByPeriod: Partial<Record<TimePeriod, PeriodMatchResult>>;
  evolution: EvolutionShift;
}

export interface SharedProfileV1 {
  v: 1;
  n: string;
  r: [number, number][]; // [stationIndex, percentage]
  a: string[];           // top matched or favorite artists
  t: string[];           // matched GTA VI tracks ("Artist - Title")
  p: number;             // talkShow index
}

export interface ComparisonRow {
  station: RadioStation;
  myScore: number;
  friendScore: number;
}

export interface ComparisonResult {
  myName: string;
  friendName: string;
  compatibility: number;
  roadtripStation: RadioStation;
  myTopStation: RadioStation;
  friendTopStation: RadioStation;
  sharedArtists: string[];
  sharedTracks: string[];
  verdictTitle: LocalizedText;
  verdictBody: LocalizedText;
  rows: ComparisonRow[];
}
