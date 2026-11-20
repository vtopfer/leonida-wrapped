import { useState } from 'react';
import { Check, Disc3, Link2, Sparkles, Users } from 'lucide-react';
import { PRESET_DEMO_FRIENDS } from '../data/demoProfiles';
import { TRANSLATIONS } from '../i18n/translations';
import type { ComparisonResult, Language, SharedProfileV1 } from '../types';
import { StationArtwork } from './StationArtwork';

interface ComparisonPanelProps {
  lang: Language;
  comparison: ComparisonResult | null;
  compareUrl: string;
  onSelectFriend: (friend: SharedProfileV1) => void;
  onOpenBlendCard: () => void;
}

export function ComparisonPanel({
  lang,
  comparison,
  compareUrl,
  onSelectFriend,
  onOpenBlendCard,
}: ComparisonPanelProps) {
  const t = TRANSLATIONS[lang];
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!compareUrl) return;
    try {
      await navigator.clipboard.writeText(compareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt(t.copyCompareLink, compareUrl);
    }
  };

  if (!comparison) {
    return (
      <main className="mx-auto flex h-full w-full max-w-4xl items-center justify-center px-4 sm:px-6 py-4">
        <section className="w-full border border-[var(--border-hairline)] bg-[var(--surface)]/95 p-6 sm:p-8 text-center space-y-5">
          <Users className="mx-auto h-8 w-8 text-[var(--vice-blue)]" />
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-[var(--text-main)]">
              {t.compareEmptyTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm text-[var(--text-muted)]">
              {t.compareEmptyDesc}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 bg-[var(--vice-blue)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            <span>{copied ? t.inviteFriendCopied : t.copyCompareLink}</span>
          </button>

          <div className="hairline-t pt-5 space-y-2.5">
            <p className="font-mono-dial text-[11px] text-[var(--vice-peach)] uppercase">
              {t.compareSimulateWith}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {PRESET_DEMO_FRIENDS.map((friend) => (
                <button
                  key={friend.n}
                  type="button"
                  onClick={() => onSelectFriend(friend)}
                  className="border border-[var(--border-hairline)] bg-[var(--surface-inset)] px-4 py-2 text-xs font-semibold text-[var(--text-main)] hover:border-[var(--vice-pink)] hover:text-[var(--vice-pink)] cursor-pointer"
                >
                  {friend.n}
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 sm:px-6 py-3 gap-3 min-h-0">
      {/* Top Compatibility Hero */}
      <section className="shrink-0 border border-[var(--border-hairline)] bg-[var(--surface)]/95 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="text-center border-r border-[var(--border-hairline)] pr-4 shrink-0">
              <span className="font-display text-5xl sm:text-6xl font-extrabold text-[var(--vice-pink)] leading-none block">
                {comparison.compatibility}%
              </span>
              <span className="font-mono-dial text-[9px] text-[var(--text-muted)] uppercase">
                {t.compareCompat}
              </span>
            </div>

            <div className="min-w-0">
              <p className="font-mono-dial text-[10px] tracking-widest text-[var(--vice-blue)] uppercase">
                {comparison.myName} × {comparison.friendName} • {t.compareTitle}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-[var(--text-main)] truncate">
                {comparison.verdictTitle[lang]}
              </h2>
              <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                {comparison.verdictBody[lang]}
              </p>
            </div>
          </div>

          {/* Friend Quick Switcher + Blend Card Button */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex border border-[var(--border-hairline)] bg-[var(--surface-inset)] p-0.5">
              {PRESET_DEMO_FRIENDS.map((f) => (
                <button
                  key={f.n}
                  type="button"
                  onClick={() => onSelectFriend(f)}
                  className={`px-2 py-1 text-[11px] font-medium cursor-pointer ${
                    comparison.friendName === f.n
                      ? 'bg-[var(--vice-purple)] text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {f.n}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onOpenBlendCard}
              className="inline-flex items-center gap-1.5 bg-[var(--vice-blue)] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t.compareDownloadBlend}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Bottom 2-Column Single-Viewport Grid */}
      <div className="grid flex-1 min-h-0 grid-cols-1 md:grid-cols-12 gap-4">
        <section className="md:col-span-6 flex flex-col border border-[var(--border-hairline)] bg-[var(--surface)]/95 p-4 gap-3 overflow-y-auto min-h-0">
          <div className="flex items-center gap-3.5 border border-[var(--border-hairline)] bg-[var(--surface-inset)] p-3 shrink-0">
            <div className="h-16 w-16 shrink-0 border border-[var(--text-main)]/70 overflow-hidden">
              <StationArtwork stationId={comparison.roadtripStation.id} />
            </div>
            <div className="min-w-0">
              <p className="font-mono-dial text-[10px] text-[var(--vice-peach)] uppercase">
                {t.compareRoadtripLabel}
              </p>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-[var(--text-main)] truncate">
                {comparison.roadtripStation.name}
              </h3>
              <p className="font-mono-dial text-[11px] text-[var(--text-muted)] truncate">
                {comparison.roadtripStation.frequency} · {comparison.roadtripStation.hosts}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Users className="h-3.5 w-3.5 text-[var(--vice-blue)]" />
              <h4 className="font-mono-dial text-[11px] text-[var(--text-muted)] uppercase">
                {t.compareSharedArtists}
              </h4>
            </div>
            {comparison.sharedArtists.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {comparison.sharedArtists.map((artist) => (
                  <span
                    key={artist}
                    className="border border-[var(--vice-blue)]/50 bg-[var(--vice-blue)]/10 px-2.5 py-1 text-xs font-medium text-[var(--text-main)]"
                  >
                    {artist}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">{t.compareNoShared}</p>
            )}
          </div>

          <div className="hairline-t pt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Disc3 className="h-3.5 w-3.5 text-[var(--vice-pink)]" />
              <h4 className="font-mono-dial text-[11px] text-[var(--text-muted)] uppercase">
                {t.compareSharedTracks}
              </h4>
            </div>
            {comparison.sharedTracks.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-[var(--text-main)]">
                {comparison.sharedTracks.map((tr) => (
                  <li key={tr} className="border-l-2 border-[var(--vice-pink)] pl-2.5">
                    {tr}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">—</p>
            )}
          </div>
        </section>

        {/* Dial Breakdown */}
        <section className="md:col-span-6 flex flex-col border border-[var(--border-hairline)] bg-[var(--surface)]/95 p-4 overflow-y-auto min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-mono-dial text-[11px] tracking-wider text-[var(--text-muted)] uppercase">
              {t.compareSideBySide}
            </h4>
            <div className="flex items-center gap-3 font-mono-dial text-[10px]">
              <span className="text-[var(--vice-pink)]">■ {comparison.myName}</span>
              <span className="text-[var(--vice-blue)]">■ {comparison.friendName}</span>
            </div>
          </div>

          <div className="space-y-3">
            {comparison.rows.map((row) => (
              <div
                key={row.station.id}
                className="border border-[var(--border-hairline)] bg-[var(--surface-inset)]/75 p-2.5"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[var(--text-main)]">{row.station.name}</span>
                  <span className="font-mono-dial text-[11px] text-[var(--text-muted)]">
                    {row.myScore}% / {row.friendScore}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="h-1.5 bg-[var(--surface)] overflow-hidden flex justify-end">
                    <div
                      style={{ width: `${row.myScore}%` }}
                      className="h-full bg-[var(--vice-pink)]"
                    />
                  </div>
                  <div className="h-1.5 bg-[var(--surface)] overflow-hidden">
                    <div
                      style={{ width: `${row.friendScore}%` }}
                      className="h-full bg-[var(--vice-blue)]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
