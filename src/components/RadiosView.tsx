import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  Mic,
  Search,
} from 'lucide-react';
import { GTA6_STATIONS, GTA6_TALK_SHOWS } from '../data/gta6Radios';
import { TRANSLATIONS } from '../i18n/translations';
import type { Language } from '../types';
import { StationArtwork } from './StationArtwork';

interface RadiosViewProps {
  lang: Language;
  initialStationId?: string;
}

export function RadiosView({ lang, initialStationId }: RadiosViewProps) {
  const t = TRANSLATIONS[lang];
  const [mode, setMode] = useState<'music' | 'talk'>('music');
  const [query, setQuery] = useState('');
  const [showTracklist, setShowTracklist] = useState(false);

  const musicItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GTA6_STATIONS;
    return GTA6_STATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.hosts.toLowerCase().includes(q) ||
        s.tracks.some(
          (tr) =>
            tr.title.toLowerCase().includes(q) || tr.artist.toLowerCase().includes(q)
        )
    );
  }, [query]);

  const talkItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GTA6_TALK_SHOWS;
    return GTA6_TALK_SHOWS.filter(
      (show) =>
        show.name.toLowerCase().includes(q) ||
        show.hosts.toLowerCase().includes(q) ||
        show.description[lang].toLowerCase().includes(q)
    );
  }, [query, lang]);

  const activeList = mode === 'music' ? musicItems : talkItems;

  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    if (!initialStationId) return 1;
    const found = GTA6_STATIONS.findIndex((s) => s.id === initialStationId);
    return found >= 0 ? found : 1;
  });
  const [previewTrackIdx, setPreviewTrackIdx] = useState(0);

  const safeIndex = activeList.length > 0 ? selectedIndex % activeList.length : 0;
  const activeItem = activeList[safeIndex];

  useEffect(() => {
    setPreviewTrackIdx(0);
  }, [safeIndex, mode]);

  const stepCarousel = (delta: number) => {
    if (activeList.length === 0) return;
    setSelectedIndex((prev) => (prev + delta + activeList.length) % activeList.length);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepCarousel(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepCarousel(1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const visibleSlots = useMemo(() => {
    if (activeList.length === 0) return [];
    const offsets = activeList.length >= 5 ? [-2, -1, 0, 1, 2] : [-1, 0, 1];
    return offsets.map((offset) => {
      const idx = (safeIndex + offset + activeList.length * 4) % activeList.length;
      return {
        offset,
        idx,
        item: activeList[idx],
      };
    });
  }, [activeList, safeIndex]);

  const activeMusicStation =
    mode === 'music' && activeItem && 'tracks' in activeItem ? activeItem : null;
  const activeTalkShow =
    mode === 'talk' && activeItem && !('tracks' in activeItem) ? activeItem : null;

  const previewTrack =
    activeMusicStation && activeMusicStation.tracks.length > 0
      ? activeMusicStation.tracks[previewTrackIdx % activeMusicStation.tracks.length]
      : null;

  return (
    <section className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 sm:px-6 py-3 gap-3 min-h-0">
      {/* Top Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('music');
              setSelectedIndex(0);
            }}
            className={`border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              mode === 'music'
                ? 'border-[var(--vice-pink)] bg-[var(--vice-pink)]/18 text-[var(--text-main)]'
                : 'border-[var(--border-hairline)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {t.radioMusicTab}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('talk');
              setSelectedIndex(0);
            }}
            className={`border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              mode === 'talk'
                ? 'border-[var(--vice-blue)] bg-[var(--vice-blue)]/18 text-[var(--text-main)]'
                : 'border-[var(--border-hairline)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {t.radioTalkTab}
          </button>
          <span className="hidden md:inline-block font-mono-dial text-[11px] text-[var(--text-muted)] ml-2">
            {t.radioKeyboardHint}
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={t.radioSearchPlaceholder}
            className="w-full border border-[var(--border-hairline)] bg-[var(--surface)] pl-8 pr-3 py-1.5 text-xs text-[var(--text-main)] placeholder-[var(--placeholder-ink)] outline-none focus:border-[var(--vice-blue)]"
          />
        </div>
      </div>

      {/* GTA VI In-Game Radio HUD Carousel (cinema dark so game artwork borders pop) */}
      <div
        className={`relative overflow-hidden border border-[var(--border-hairline)] bg-[#0b0616] px-3 sm:px-6 text-white ${
          mode === 'music' && !showTracklist
            ? 'flex-1 flex flex-col justify-center py-6 sm:py-8'
            : 'shrink-0 py-5 sm:py-6'
        }`}
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 45% at 50% 105%, rgba(0, 212, 255, 0.24), transparent 70%), radial-gradient(ellipse 50% 35% at 50% 0%, rgba(147, 64, 255, 0.20), transparent 70%)',
        }}
      >
        <p className="text-center font-mono-dial text-[10px] tracking-[0.22em] text-[#bfaed4]/75 uppercase mb-4">
          {t.radioHudKicker}
        </p>

        {activeList.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#bfaed4]">—</div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => stepCarousel(-1)}
                aria-label="Previous station"
                className="shrink-0 p-1.5 text-[#bfaed4] hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>

              <div className="flex items-center justify-center gap-2.5 sm:gap-4">
                {visibleSlots.map(({ offset, idx, item }) => {
                  const isCenter = offset === 0;
                  const hideOnMobile = Math.abs(offset) === 2;
                  return (
                    <button
                      key={`${item.id}-${offset}`}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={`relative shrink-0 transition-all duration-200 cursor-pointer overflow-hidden ${
                        hideOnMobile ? 'hidden md:block' : 'block'
                      } ${
                        isCenter
                          ? 'w-28 h-28 sm:w-36 sm:h-36 scale-105 border-[3px] border-white shadow-[0_0_24px_rgba(255,46,147,0.35)] z-10'
                          : 'w-20 h-20 sm:w-28 sm:h-28 border border-[#38255c] opacity-75 hover:opacity-100'
                      }`}
                      title={item.name}
                    >
                      <StationArtwork stationId={item.id} />
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => stepCarousel(1)}
                aria-label="Next station"
                className="shrink-0 p-1.5 text-[#bfaed4] hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            </div>

            {/* [LB] ------ [RB] */}
            <div className="mx-auto mt-4 flex max-w-md items-center gap-3">
              <button
                type="button"
                onClick={() => stepCarousel(-1)}
                className="rounded-sm border border-[#543988] bg-[#170e2b] px-2 py-0.5 font-mono-dial text-[10px] font-bold text-white hover:border-[#00d4ff] cursor-pointer"
              >
                LB
              </button>

              <div className="flex flex-1 items-center gap-0.5 py-2">
                {activeList.map((st, idx) => {
                  const active = idx === safeIndex;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      title={st.name}
                      className={`h-1.5 flex-1 transition-all cursor-pointer ${
                        active ? 'bg-white scale-y-150' : 'bg-[#38255c] hover:bg-[#543988]'
                      }`}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => stepCarousel(1)}
                className="rounded-sm border border-[#543988] bg-[#170e2b] px-2 py-0.5 font-mono-dial text-[10px] font-bold text-white hover:border-[#00d4ff] cursor-pointer"
              >
                RB
              </button>
            </div>

            {activeMusicStation && (
              <div className="mt-3 text-center space-y-0.5">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-wide text-white leading-none">
                    {activeMusicStation.name}
                  </h2>
                  {activeMusicStation.unlockable && (
                    <span className="inline-flex items-center gap-1 border border-[#00d4ff]/50 bg-[#00d4ff]/15 px-1.5 py-0.5 font-mono-dial text-[10px] text-[#00d4ff]">
                      <Lock className="h-2.5 w-2.5" />
                      UNLOCK
                    </span>
                  )}
                </div>

                {previewTrack && (
                  <div className="pt-0.5">
                    <p className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#fff5fa] leading-tight">
                      {previewTrack.title}
                    </p>
                    <p className="font-display text-base sm:text-lg font-semibold uppercase tracking-widest text-[#bfaed4]">
                      {previewTrack.artist}
                    </p>
                  </div>
                )}

                <p className="pt-1 font-mono-dial text-[11px] text-[#ffb57a]">
                  {activeMusicStation.frequency} • {t.heroHostPrefix} {activeMusicStation.hosts}
                </p>

                {!showTracklist && (
                  <p className="mx-auto max-w-xl pt-1.5 text-xs text-[#bfaed4]/85">
                    {activeMusicStation.description[lang]}
                  </p>
                )}
              </div>
            )}

            {activeTalkShow && (
              <div className="mt-3 text-center space-y-1">
                <div className="inline-flex items-center gap-2">
                  <Mic className="h-4 w-4 text-[#00d4ff]" />
                  <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-wide text-white leading-none">
                    {activeTalkShow.name}
                  </h2>
                </div>
                <p className="font-display text-lg font-semibold uppercase tracking-wider text-[#ffb57a]">
                  {activeTalkShow.hosts}
                </p>
                <p className="mx-auto max-w-xl text-xs text-[#bfaed4]">
                  {activeTalkShow.description[lang]}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Spoiler-Safe Tracklist Toggle / Drawer */}
      {activeMusicStation && !showTracklist && (
        <button
          type="button"
          onClick={() => setShowTracklist(true)}
          className="shrink-0 flex items-center justify-between gap-3 border border-[var(--border-hairline)] bg-[var(--surface)]/95 px-4 py-3 text-left transition-colors hover:border-[var(--vice-pink)] cursor-pointer"
        >
          <span className="inline-flex items-center gap-2 font-mono-dial text-[11px] tracking-wider text-[var(--text-muted)] uppercase">
            <Eye className="h-3.5 w-3.5 text-[var(--vice-pink)]" />
            <span>{t.radioSpoilerShow}</span>
          </span>
          <span className="inline-flex items-center gap-2 font-mono-dial text-[11px] text-[var(--vice-blue)] shrink-0">
            <span>
              {activeMusicStation.tracks.length} {t.radioTracksCount}
            </span>
            <ChevronUp className="h-4 w-4" />
          </span>
        </button>
      )}

      {activeMusicStation && showTracklist && (
        <div className="flex-1 min-h-0 flex flex-col border border-[var(--border-hairline)] bg-[var(--surface)]/95 p-3.5">
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[var(--border-hairline)] shrink-0">
            <span className="font-mono-dial text-[11px] tracking-wider text-[var(--text-muted)] uppercase">
              {t.radioTracklistTitle}
            </span>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-mono-dial text-[11px] text-[var(--vice-blue)]">
                {activeMusicStation.tracks.length} {t.radioTracksCount}
              </span>
              <button
                type="button"
                onClick={() => setShowTracklist(false)}
                className="inline-flex items-center gap-1 border border-[var(--border-hairline)] bg-[var(--surface-inset)] px-2.5 py-1 font-mono-dial text-[10px] text-[var(--text-muted)] hover:border-[var(--vice-pink)] hover:text-[var(--text-main)] cursor-pointer"
              >
                <EyeOff className="h-3 w-3" />
                <span>{t.radioSpoilerHide}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 pr-1">
            {activeMusicStation.tracks.map((tr, idx) => {
              const isSelected = idx === previewTrackIdx % activeMusicStation.tracks.length;
              const q = encodeURIComponent(`${tr.artist} ${tr.title}`);
              return (
                <div
                  key={`${activeMusicStation.id}-${tr.artist}-${tr.title}`}
                  onClick={() => setPreviewTrackIdx(idx)}
                  className={`flex items-center justify-between gap-2 border px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[var(--vice-pink)] bg-[var(--vice-pink)]/15 text-[var(--text-main)]'
                      : 'border-[var(--border-hairline)] bg-[var(--surface-inset)]/75 text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--text-main)] truncate">{tr.title}</p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">{tr.artist}</p>
                  </div>
                  <a
                    href={`https://open.spotify.com/search/${q}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 p-1 text-[var(--text-muted)] hover:text-[var(--vice-blue)]"
                    title="Spotify"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTalkShow && (
        <div className="flex-1 min-h-0 border border-[var(--border-hairline)] bg-[var(--surface)]/95 p-4 flex flex-col justify-center items-center text-center gap-2">
          <span className="border border-[var(--vice-blue)]/40 bg-[var(--vice-blue)]/10 px-2.5 py-1 font-mono-dial text-[11px] text-[var(--vice-blue)] uppercase">
            {activeTalkShow.kind === 'talk_radio' ? t.talkKindRadio : t.talkKindPodcast}
            {activeTalkShow.frequency ? ` • ${activeTalkShow.frequency}` : ''}
          </span>
          <p className="max-w-lg text-sm text-[var(--text-main)]">
            {activeTalkShow.description[lang]}
          </p>
          {activeTalkShow.notableShows && (
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {activeTalkShow.notableShows.map((seg) => (
                <span
                  key={seg}
                  className="border border-[var(--border-hairline)] bg-[var(--surface-inset)] px-2.5 py-1 font-mono-dial text-[11px] text-[var(--vice-peach)]"
                >
                  {seg}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
