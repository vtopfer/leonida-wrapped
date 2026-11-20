import { useState } from 'react';
import { Check, Code2, Coffee, Copy, ExternalLink, Heart, X } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { TRANSLATIONS } from '../i18n/translations';
import type { Language } from '../types';

interface FooterProps {
  lang: Language;
}

export function Footer({ lang }: FooterProps) {
  const t = TRANSLATIONS[lang];
  const [supportOpen, setSupportOpen] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  const hasDonationMethod = Boolean(
    APP_CONFIG.livepixUrl || APP_CONFIG.pixKey || APP_CONFIG.kofiUrl
  );

  const handleCopyPix = async () => {
    if (!APP_CONFIG.pixKey) return;
    try {
      await navigator.clipboard.writeText(APP_CONFIG.pixKey);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    } catch {
      window.prompt(t.supportPixLabel, APP_CONFIG.pixKey);
    }
  };

  return (
    <footer className="shrink-0 hairline-t bg-[var(--bg-page)]/95">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-dim)]">
          <span>{t.disclaimer}</span>
          {APP_CONFIG.githubUrl ? (
            <a
              href={APP_CONFIG.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--vice-blue)] hover:underline"
            >
              <Code2 className="h-3 w-3" />
              <span>{t.footerOpenSource}</span>
            </a>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 text-[var(--vice-blue)]">
              <Code2 className="h-3 w-3" />
              <span>{t.footerOpenSource}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {APP_CONFIG.adsEnabled && (
            <span className="hidden md:inline-flex items-center gap-1.5 border border-dashed border-[var(--border-hairline)] px-2 py-0.5 font-mono-dial text-[10px] text-[var(--text-dim)]">
              <span className="text-[var(--vice-peach)]">{t.footerAdLabel}:</span>
              <span>{t.footerAdText}</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setSupportOpen(true)}
            className="inline-flex items-center gap-1.5 border border-[var(--border-hairline)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-main)] transition-colors hover:border-[var(--vice-pink)] hover:text-[var(--vice-pink)] cursor-pointer"
          >
            <Heart className="h-3 w-3 text-[var(--vice-pink)]" />
            <span>{t.supportBtn}</span>
          </button>
        </div>
      </div>

      {supportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md border border-[var(--border-strong)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-[var(--vice-peach)]" />
                <h3 className="font-display text-2xl font-bold uppercase text-[var(--text-main)]">
                  {t.supportTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSupportOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-muted)]">
              {t.supportDesc}
            </p>

            {APP_CONFIG.livepixUrl && (
              <a
                href={APP_CONFIG.livepixUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 bg-[var(--vice-blue)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90"
              >
                <span>{t.supportLivepixBtn}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            {APP_CONFIG.pixKey && (
              <div className="border border-[var(--border-hairline)] bg-[var(--surface-inset)] p-3 space-y-2">
                <p className="font-mono-dial text-[11px] text-[var(--vice-blue)] uppercase">
                  {t.supportPixLabel}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <code className="font-mono-dial text-xs text-[var(--text-main)] truncate">
                    {APP_CONFIG.pixKey}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="shrink-0 inline-flex items-center gap-1 border border-[var(--border-hairline)] px-2.5 py-1 text-xs text-[var(--text-main)] hover:border-[var(--vice-blue)] cursor-pointer"
                  >
                    {copiedPix ? (
                      <Check className="h-3 w-3 text-[var(--vice-blue)]" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>{copiedPix ? t.supportPixCopied : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {APP_CONFIG.kofiUrl && (
              <a
                href={APP_CONFIG.kofiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-[#ff2e93] to-[#ff7b47] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90"
              >
                <span>{t.supportKofiBtn}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            {!hasDonationMethod && (
              <p className="border border-[var(--border-hairline)] bg-[var(--surface-inset)] p-3 font-mono-dial text-[11px] text-[var(--text-muted)]">
                {t.supportPlaceholder}
              </p>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
