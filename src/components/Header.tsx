import { Image, Moon, Radio, RotateCcw, Sliders, Sun, Users } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import type { Language, UiTheme } from '../types';

export type AppSector = 'entry' | 'profile' | 'card' | 'compare' | 'radios';

interface HeaderProps {
  lang: Language;
  uiTheme: UiTheme;
  activeSector: AppSector;
  hasAnalysis: boolean;
  onSelectSector: (sector: AppSector) => void;
  onToggleLang: (lang: Language) => void;
  onToggleTheme: () => void;
  onReset: () => void;
}

export function Header({
  lang,
  uiTheme,
  activeSector,
  hasAnalysis,
  onSelectSector,
  onToggleLang,
  onToggleTheme,
  onReset,
}: HeaderProps) {
  const t = TRANSLATIONS[lang];

  return (
    <header className="shrink-0 z-30 bg-[var(--bg-page)]/95 backdrop-blur-sm">
      <div className="gta-horizon-bar" />
      <div className="hairline-b px-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 py-2.5">
          <button
            type="button"
            onClick={() => onSelectSector(hasAnalysis ? 'profile' : 'entry')}
            className="flex items-baseline gap-2.5 text-left cursor-pointer"
          >
            <span className="font-display text-2xl sm:text-[26px] font-extrabold tracking-tight text-[var(--text-main)]">
              LEONIDA <span className="gta-title-gradient">WRAPPED</span>
            </span>
            <span className="hidden md:inline-block font-mono-dial text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
              {t.brandSub}
            </span>
          </button>

          {/* Single-Viewport Sector Navigation */}
          <nav className="flex items-center gap-1.5 overflow-x-auto">
            {!hasAnalysis ? (
              <button
                type="button"
                onClick={() => onSelectSector('entry')}
                className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  activeSector === 'entry'
                    ? 'border-[var(--vice-pink)] bg-[var(--vice-pink)]/15 text-[var(--text-main)]'
                    : 'border-[var(--border-hairline)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Sliders className="h-3.5 w-3.5 text-[var(--vice-pink)]" />
                <span>{t.navEntry}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onSelectSector('profile')}
                  className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    activeSector === 'profile'
                      ? 'border-[var(--vice-pink)] bg-[var(--vice-pink)]/15 text-[var(--text-main)]'
                      : 'border-[var(--border-hairline)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5 text-[var(--vice-pink)]" />
                  <span>{t.navMyStation}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectSector('card')}
                  className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    activeSector === 'card'
                      ? 'border-[var(--vice-orange)] bg-[var(--vice-orange)]/15 text-[var(--text-main)]'
                      : 'border-[var(--border-hairline)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <Image className="h-3.5 w-3.5 text-[var(--vice-orange)]" />
                  <span>{t.navCard}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectSector('compare')}
                  className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    activeSector === 'compare'
                      ? 'border-[var(--vice-blue)] bg-[var(--vice-blue)]/15 text-[var(--text-main)]'
                      : 'border-[var(--border-hairline)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <Users className="h-3.5 w-3.5 text-[var(--vice-blue)]" />
                  <span>{t.navCompare}</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => onSelectSector('radios')}
              className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeSector === 'radios'
                  ? 'border-[var(--vice-purple)] bg-[var(--vice-purple)]/20 text-[var(--text-main)]'
                  : 'border-[var(--border-hairline)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--vice-blue)] hover:text-[var(--text-main)]'
              }`}
            >
              <Radio className="h-3.5 w-3.5 text-[var(--vice-blue)]" />
              <span>{t.navRadios}</span>
              <span className="font-mono-dial text-[10px] text-[var(--text-muted)]">23</span>
            </button>
          </nav>

          {/* Right Utilities */}
          <div className="flex items-center gap-1.5">
            {hasAnalysis && (
              <button
                type="button"
                onClick={onReset}
                title={t.navNew}
                className="inline-flex items-center gap-1 border border-[var(--border-hairline)] bg-[var(--surface)] px-2 py-1.5 text-xs text-[var(--text-muted)] hover:border-[var(--vice-pink)] hover:text-[var(--text-main)] cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.navNew}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleTheme}
              title={uiTheme === 'dark' ? 'Miami Pastel (Light)' : 'Vice Synth (Dark)'}
              aria-label="Toggle theme"
              className="inline-flex items-center justify-center border border-[var(--border-hairline)] bg-[var(--surface)] p-1.5 text-[var(--text-muted)] hover:border-[var(--vice-pink)] hover:text-[var(--text-main)] cursor-pointer"
            >
              {uiTheme === 'dark' ? (
                <Sun className="h-3.5 w-3.5 text-[#ffb57a]" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-[#7e22ce]" />
              )}
            </button>

            <div className="flex border border-[var(--border-hairline)] bg-[var(--surface)] p-0.5 font-mono-dial text-[11px]">
              <button
                type="button"
                onClick={() => onToggleLang('pt')}
                className={`px-2 py-0.5 transition-colors cursor-pointer ${
                  lang === 'pt'
                    ? 'bg-[var(--text-main)] text-[var(--bg-page)] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                PT
              </button>
              <button
                type="button"
                onClick={() => onToggleLang('en')}
                className={`px-2 py-0.5 transition-colors cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[var(--text-main)] text-[var(--bg-page)] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
