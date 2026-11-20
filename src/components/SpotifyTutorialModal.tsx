import { ExternalLink, FileJson, ShieldCheck, X } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import type { Language } from '../types';

interface SpotifyTutorialModalProps {
  lang: Language;
  mode: 'spotify' | 'youtube';
  isOpen: boolean;
  onClose: () => void;
}

export function SpotifyTutorialModal({
  lang,
  mode,
  isOpen,
  onClose,
}: SpotifyTutorialModalProps) {
  const t = TRANSLATIONS[lang];

  if (!isOpen) return null;

  const isSpotify = mode === 'spotify';
  const title = isSpotify ? t.spotifyTutorialTitle : t.ytTutorialTitle;
  const subtitle = isSpotify ? t.spotifyTutorialSubtitle : t.ytTutorialSubtitle;
  const steps = isSpotify ? t.spotifyTutorialSteps : t.ytTutorialSteps;
  const openBtnLabel = isSpotify ? t.spotifyTutorialOpenBtn : t.ytTutorialOpenBtn;
  const openUrl = isSpotify
    ? 'https://www.spotify.com/account/privacy/'
    : 'https://takeout.google.com/';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg border border-[var(--border-strong)] bg-[var(--surface)] p-5 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FileJson className="h-5 w-5 text-[var(--vice-blue)]" />
            <h3 className="font-display text-2xl font-extrabold uppercase text-[var(--text-main)]">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-[var(--border-hairline)] p-1 text-[var(--text-muted)] hover:border-[var(--vice-pink)] hover:text-[var(--text-main)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-muted)]">{subtitle}</p>

        <ol className="space-y-2.5">
          {steps.map((step) => (
            <li
              key={step.title}
              className="border border-[var(--border-hairline)] bg-[var(--surface-inset)] px-3.5 py-2.5"
            >
              <p className="text-xs font-bold text-[var(--vice-peach)]">{step.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--vice-blue)]">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>{t.spotifyTutorialPrivacyNote}</span>
          </span>

          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 bg-[var(--vice-blue)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 shrink-0"
          >
            <span>{openBtnLabel}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
