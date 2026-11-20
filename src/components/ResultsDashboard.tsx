import { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Image,
  Link2,
  Lock,
  Mic,
  Music2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import type {
  FullAnalysisResult,
  Language,
  PeriodMatchResult,
  TimePeriod,
} from '../types';
import { FmDial } from './FmDial';
import { StationArtwork } from './StationArtwork';

interface ResultsDashboardProps {
  lang: Language;
  analysis: FullAnalysisResult;
  selectedPeriod: TimePeriod;
  onSelectPeriod: (p: TimePeriod) => void;
  periodResult: PeriodMatchResult;
  compareUrl: string;
  onGoToCard: () => void;
  onInspectStationInHud: (stationId: string) => void;
}

export function ResultsDashboard({
  lang,
  analysis,
  selectedPeriod,
  onSelectPeriod,
  periodResult,
  compareUrl,
  onGoToCard,
  onInspectStationInHud,
}: ResultsDashboardProps) {
  const t = TRANSLATIONS[lang];
  const [rightTab, setRightTab] = useState<'ranks' | 'matches' | 'discover'>('ranks');
  const [showAllStations, setShowAllStations] = useState(false);
  const [expandedStationId, setExpandedStationId] = useState<string | null>(
    () => periodResult.topStation.station.id
  );
  const [copiedInvite, setCopiedInvite] = useState(false);

  const top = periodResult.topStation;

  const handleCopyInvite = async () => {
    if (!compareUrl) return;
    try {
      await navigator.clipboard.writeText(compareUrl);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2500);
    } catch {
      window.prompt(t.copyCompareLink, compareUrl);
    }
  };

  const handleShareOnX = () => {
    if (!compareUrl) return;
    const text =
      lang === 'pt'
        ? `Minha rádio oficial em Leonida (GTA VI) é ${top.station.name} (${top.station.frequency}) — Leonida Wrapped\n\n#wrapped #gtavi #gta6 #leonidawrapped`
        : `My official GTA VI radio station in Leonida is ${top.station.name} (${top.station.frequency}) — Leonida Wrapped\n\n#wrapped #gtavi #gta6 #leonidawrapped`;
    const intent = new URL('https://twitter.com/intent/tweet');
    intent.searchParams.set('text', text);
    intent.searchParams.set('url', compareUrl);
    window.open(intent.toString(), '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 sm:px-6 py-3 gap-3 min-h-0">
      {/* Top Bar: Periods + Evolution + Shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 border-b border-[var(--border-hairline)] pb-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {analysis.availablePeriods.length > 1 && (
            <div className="flex border border-[var(--border-hairline)] bg-[var(--surface)] p-0.5">
              {analysis.availablePeriods.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onSelectPeriod(p)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    selectedPeriod === p
                      ? 'bg-[var(--vice-pink)] text-white font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {t.periods[p]}
                </button>
              ))}
            </div>
          )}

          {analysis.evolution.hasMultiplePeriods && (
            <div className="hidden md:flex items-center gap-1.5 border border-[var(--border-hairline)] bg-[var(--surface)]/90 px-2.5 py-1 text-[11px] text-[var(--text-muted)]">
              <TrendingUp
                className={`h-3.5 w-3.5 shrink-0 ${
                  analysis.evolution.changed ? 'text-[var(--vice-orange)]' : 'text-[var(--vice-blue)]'
                }`}
              />
              <span className="truncate max-w-md">{analysis.evolution.summary[lang]}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGoToCard}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#ff2e93] to-[#ff7b47] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 cursor-pointer"
          >
            <Image className="h-3.5 w-3.5" />
            <span>{t.goToCardBtn}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyInvite}
            className="inline-flex items-center gap-1.5 border border-[var(--vice-blue)] bg-[var(--vice-blue)]/12 px-3 py-1.5 text-xs font-semibold text-[var(--vice-blue)] hover:bg-[var(--vice-blue)]/20 cursor-pointer"
          >
            {copiedInvite ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            <span>{copiedInvite ? t.inviteFriendCopied : t.inviteFriendBtn}</span>
          </button>

          <button
            type="button"
            onClick={handleShareOnX}
            className="inline-flex items-center gap-1.5 border border-[var(--vice-pink)]/70 bg-[var(--vice-pink)]/12 px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--vice-pink)]/20 cursor-pointer"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[var(--vice-pink)]" />
            <span>{t.shareOnX}</span>
          </button>
        </div>
      </div>

      {/* Main 12-Column Single-Viewport Grid */}
      <div className="grid flex-1 min-h-0 grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Spotlight: #1 Station + Artwork + Dial */}
        <section className="lg:col-span-5 flex flex-col justify-between border border-[var(--border-hairline)] bg-[var(--surface)]/95 p-4 sm:p-5 gap-3 min-h-0">
          <div className="space-y-3">
            <div className="flex items-start gap-3.5">
              <button
                type="button"
                onClick={() => onInspectStationInHud(top.station.id)}
                title={t.stationOpenHud}
                className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 border-2 border-[var(--text-main)]/80 overflow-hidden shadow-[0_0_20px_rgba(255,46,147,0.25)] hover:scale-105 transition-transform cursor-pointer"
              >
                <StationArtwork stationId={top.station.id} />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="font-mono-dial text-[10px] tracking-widest text-[var(--vice-peach)] uppercase">
                    {analysis.displayName} • {t.heroMatchBadge}
                  </span>
                  <span className="border border-[var(--border-hairline)] bg-[var(--surface-inset)] px-1.5 py-0.5 font-mono-dial text-[10px] text-[var(--vice-blue)]">
                    {top.station.frequency}
                  </span>
                </div>

                <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase leading-[0.92] text-[var(--text-main)]">
                  {top.station.name}
                </h1>

                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                  <span className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--vice-pink)] leading-none">
                    {top.percentage}%
                  </span>
                  <span className="text-xs font-semibold text-[var(--vice-blue)]">
                    {top.station.persona[lang].title}
                  </span>
                </div>
              </div>
            </div>

            {top.station.unlockable && (
              <span className="inline-flex items-center gap-1 border border-[var(--vice-blue)]/40 bg-[var(--vice-blue)]/10 px-2 py-0.5 font-mono-dial text-[10px] text-[var(--vice-blue)]">
                <Lock className="h-2.5 w-2.5" />
                {t.heroUnlockable}
              </span>
            )}

            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              {top.station.persona[lang].tagline}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 border-y border-[var(--border-hairline)] py-2 font-mono-dial text-[11px] text-[var(--text-muted)]">
              <span className="truncate">
                {t.heroHostPrefix}{' '}
                <strong className="text-[var(--text-main)]">{top.station.hosts}</strong>
              </span>
              <span className="shrink-0 text-[var(--vice-peach)]">
                {periodResult.allMatchedTracks.length} {t.heroTracksMatched} ·{' '}
                {periodResult.allMatchedArtists.length} {t.heroArtistsMatched}
              </span>
            </div>
          </div>

          <FmDial
            topStations={periodResult.rankedStations}
            selectedStationId={top.station.id}
            onSelectStation={onInspectStationInHud}
          />
        </section>

        {/* Right Sector Panel with Subtabs (internal scroll only) */}
        <section className="lg:col-span-7 flex flex-col border border-[var(--border-hairline)] bg-[var(--surface)]/95 min-h-0">
          {/* Subtabs */}
          <div className="grid grid-cols-3 hairline-b shrink-0">
            <button
              type="button"
              onClick={() => setRightTab('ranks')}
              className={`px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                rightTab === 'ranks'
                  ? 'bg-[var(--surface-elevated)] text-[var(--text-main)] border-b-2 border-[var(--vice-pink)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {t.subtabRanks}
            </button>
            <button
              type="button"
              onClick={() => setRightTab('matches')}
              className={`px-3 py-2.5 text-xs font-semibold border-l border-[var(--border-hairline)] transition-colors cursor-pointer ${
                rightTab === 'matches'
                  ? 'bg-[var(--surface-elevated)] text-[var(--text-main)] border-b-2 border-[var(--vice-orange)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {t.subtabMatches} ({periodResult.allMatchedTracks.length + periodResult.allMatchedArtists.length})
            </button>
            <button
              type="button"
              onClick={() => setRightTab('discover')}
              className={`px-3 py-2.5 text-xs font-semibold border-l border-[var(--border-hairline)] transition-colors cursor-pointer ${
                rightTab === 'discover'
                  ? 'bg-[var(--surface-elevated)] text-[var(--text-main)] border-b-2 border-[var(--vice-blue)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {t.subtabDiscover}
            </button>
          </div>

          {/* Subtab Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {rightTab === 'ranks' && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono-dial text-[10px] text-[var(--text-muted)]">
                    {t.stationTapHint}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAllStations((v) => !v)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--vice-blue)] hover:underline cursor-pointer shrink-0"
                  >
                    <span>{showAllStations ? t.hideAllStations : t.showAllStations}</span>
                    {showAllStations ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  {(showAllStations
                    ? periodResult.rankedStations
                    : periodResult.rankedStations.slice(0, 5)
                  ).map((item, idx) => {
                    const isExpanded = expandedStationId === item.station.id;
                    const directArtistsCount = item.matchedArtists.length;
                    const directTracksCount = item.matchedTracks.length;
                    const vibeCount = item.relatedUserArtists.length;

                    return (
                      <div
                        key={item.station.id}
                        className={`border transition-colors ${
                          isExpanded
                            ? 'border-[var(--vice-pink)] bg-[var(--surface-inset)]'
                            : 'border-[var(--border-hairline)] bg-[var(--surface-inset)]/75 hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedStationId(isExpanded ? null : item.station.id)
                          }
                          className="flex w-full items-center gap-3 p-2.5 text-left cursor-pointer"
                        >
                          <div className="h-10 w-10 shrink-0 border border-[var(--border-hairline)] overflow-hidden">
                            <StationArtwork stationId={item.station.id} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-baseline gap-2 min-w-0">
                                <span
                                  className={`font-mono-dial text-[11px] font-bold ${
                                    idx === 0
                                      ? 'text-[var(--vice-pink)]'
                                      : idx === 1
                                        ? 'text-[var(--vice-orange)]'
                                        : idx === 2
                                          ? 'text-[var(--vice-blue)]'
                                          : 'text-[var(--text-dim)]'
                                  }`}
                                >
                                  {String(idx + 1).padStart(2, '0')}
                                </span>
                                <span className="font-display text-lg font-bold uppercase text-[var(--text-main)] truncate">
                                  {item.station.name}
                                </span>
                                <span className="hidden sm:inline font-mono-dial text-[10px] text-[var(--text-dim)]">
                                  {item.station.frequency}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {(directTracksCount > 0 || directArtistsCount > 0 || vibeCount > 0) && (
                                  <span className="hidden md:inline-block border border-[var(--border-hairline)] bg-[var(--surface)] px-1.5 py-0.5 font-mono-dial text-[10px] text-[var(--text-muted)]">
                                    {directArtistsCount > 0
                                      ? `${directArtistsCount} ${lang === 'pt' ? 'artistas' : 'artists'}`
                                      : `${vibeCount} ${lang === 'pt' ? 'vibe' : 'vibe'}`}
                                  </span>
                                )}
                                <span className="font-mono-dial text-xs font-bold text-[var(--text-main)]">
                                  {item.percentage}%
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="h-3.5 w-3.5 text-[var(--vice-pink)]" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                                )}
                              </div>
                            </div>

                            <div className="h-1.5 w-full bg-[var(--surface)] overflow-hidden">
                              <div
                                style={{
                                  width: `${item.percentage}%`,
                                  backgroundColor:
                                    idx === 0
                                      ? 'var(--vice-pink)'
                                      : idx === 1
                                        ? 'var(--vice-orange)'
                                        : idx === 2
                                          ? 'var(--vice-blue)'
                                          : 'var(--text-dim)',
                                }}
                                className="h-full"
                              />
                            </div>
                          </div>
                        </button>

                        {/* Expanded Per-Station Connection Details */}
                        {isExpanded && (
                          <div className="border-t border-[var(--border-hairline)] bg-[var(--surface)]/70 px-3.5 py-3 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-mono-dial text-[10px] uppercase tracking-wider text-[var(--vice-peach)]">
                                {t.stationWhyTitle}
                              </span>
                              <button
                                type="button"
                                onClick={() => onInspectStationInHud(item.station.id)}
                                className="font-mono-dial text-[10px] font-semibold text-[var(--vice-blue)] hover:underline cursor-pointer"
                              >
                                {t.stationOpenHud}
                              </button>
                            </div>

                            {item.matchedTracks.length > 0 && (
                              <div>
                                <p className="text-[11px] font-semibold text-[var(--vice-pink)] mb-1">
                                  {t.stationExactSongs}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {item.matchedTracks.map((tr) => (
                                    <span
                                      key={`${tr.artist}-${tr.title}`}
                                      className="border border-[var(--vice-pink)]/50 bg-[var(--vice-pink)]/10 px-2 py-0.5 text-[11px] text-[var(--text-main)]"
                                    >
                                      ♪ {tr.artist} — {tr.title}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {item.matchedArtists.length > 0 && (
                              <div>
                                <p className="text-[11px] font-semibold text-[var(--vice-blue)] mb-1">
                                  {t.stationMatchedArtists}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {item.matchedArtists.map((a) => (
                                    <span
                                      key={a}
                                      className="border border-[var(--vice-blue)]/45 bg-[var(--vice-blue)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--text-main)]"
                                    >
                                      {a}
                                    </span>
                                  ))}
                                </div>
                                {item.stationTracksByMatchedArtists.length > 0 && (
                                  <p className="mt-1.5 font-mono-dial text-[10px] text-[var(--text-muted)]">
                                    {item.stationTracksByMatchedArtists
                                      .slice(0, 4)
                                      .map((st) => `${st.artist} — ${st.title}`)
                                      .join('  •  ')}
                                  </p>
                                )}
                              </div>
                            )}

                            {item.relatedUserArtists.length > 0 && (
                              <div>
                                <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                                  {t.stationRelatedVibe}
                                  {item.matchedGenres.length > 0
                                    ? ` (${item.matchedGenres.slice(0, 3).join(', ')})`
                                    : ''}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {item.relatedUserArtists.map((a) => (
                                    <span
                                      key={a}
                                      className="border border-[var(--border-hairline)] bg-[var(--surface-inset)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]"
                                    >
                                      {a}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {item.matchedTracks.length === 0 &&
                              item.matchedArtists.length === 0 &&
                              item.relatedUserArtists.length === 0 && (
                                <p className="text-[11px] text-[var(--text-muted)]">
                                  {t.stationNoDirect}
                                </p>
                              )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {rightTab === 'matches' && (
              <div className="space-y-4">
                {periodResult.allMatchedTracks.length === 0 &&
                periodResult.allMatchedArtists.length === 0 ? (
                  <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-muted)]">
                    {t.matchesEmpty}
                  </p>
                ) : (
                  <>
                    {periodResult.allMatchedTracks.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Music2 className="h-3.5 w-3.5 text-[var(--vice-pink)]" />
                          <p className="text-xs font-semibold text-[var(--vice-peach)]">
                            {t.exactTracksLabel}
                          </p>
                        </div>
                        <ul className="space-y-1.5">
                          {periodResult.allMatchedTracks.map((tr) => (
                            <li
                              key={`${tr.stationId}-${tr.artist}-${tr.title}`}
                              className="flex items-center justify-between gap-2 border-l-2 border-[var(--vice-pink)] bg-[var(--surface-inset)]/80 px-3 py-1.5 text-xs"
                            >
                              <span className="text-[var(--text-main)] truncate">
                                <strong>{tr.artist}</strong> — {tr.title}
                              </span>
                              <span className="shrink-0 font-mono-dial text-[10px] text-[var(--vice-blue)]">
                                {tr.stationName}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {periodResult.allMatchedArtists.length > 0 && (
                      <div className="hairline-t pt-3">
                        <p className="text-xs font-semibold text-[var(--vice-blue)] mb-2">
                          {t.matchedArtistsLabel}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {periodResult.allMatchedArtists.map((ar) => (
                            <span
                              key={ar.name}
                              className="border border-[var(--border-hairline)] bg-[var(--surface-inset)] px-2.5 py-1 text-xs text-[var(--text-main)]"
                            >
                              {ar.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {rightTab === 'discover' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--vice-blue)]" />
                    <h3 className="font-mono-dial text-[11px] tracking-wider text-[var(--text-muted)] uppercase">
                      {t.discoveriesTitle}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {top.discoveryTracks.map((tr) => (
                      <div
                        key={`${tr.artist}-${tr.title}`}
                        className="border border-[var(--border-hairline)] bg-[var(--surface-inset)]/80 p-2.5 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-[var(--text-main)] truncate">
                            {tr.title}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">
                            {tr.artist}
                            {tr.year ? ` • ${tr.year}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 font-mono-dial text-[10px]">
                          <a
                            href={tr.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 border border-[var(--border-hairline)] px-2 py-1 text-[var(--text-muted)] hover:border-[var(--vice-blue)] hover:text-[var(--vice-blue)]"
                          >
                            Spotify <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                          <a
                            href={tr.youtubeMusicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 border border-[var(--border-hairline)] px-2 py-1 text-[var(--text-muted)] hover:border-[var(--vice-pink)] hover:text-[var(--vice-pink)]"
                          >
                            YT Music <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Talk / Podcast Pick */}
                <div className="border border-[var(--border-hairline)] bg-[var(--surface-inset)]/90 p-3 flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 border border-[var(--border-hairline)] overflow-hidden">
                    <StationArtwork stationId={periodResult.talkShow.id} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Mic className="h-3 w-3 text-[var(--vice-orange)]" />
                      <span className="font-mono-dial text-[10px] text-[var(--vice-peach)] uppercase">
                        {t.talkPickLabel}
                      </span>
                    </div>
                    <h4 className="font-display text-xl font-bold uppercase text-[var(--text-main)] truncate">
                      {periodResult.talkShow.name}
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">
                      {periodResult.talkShow.hosts} — {periodResult.talkShow.description[lang]}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
