import { useEffect, useState } from 'react';
import { Check, Download, Link2, Share2 } from 'lucide-react';
import {
  type CardFormat,
  type CardTheme,
  downloadPngDataUrl,
  renderShareCardPng,
} from '../engine/cardRenderer';
import { TRANSLATIONS } from '../i18n/translations';
import type { ComparisonResult, Language, PeriodMatchResult, UiTheme } from '../types';

interface CardStudioProps {
  lang: Language;
  uiTheme: UiTheme;
  displayName: string;
  periodResult: PeriodMatchResult;
  comparison?: ComparisonResult | null;
  compareUrl: string;
  forceFormat?: CardFormat | null;
}

export function CardStudio({
  lang,
  uiTheme,
  displayName,
  periodResult,
  comparison,
  compareUrl,
  forceFormat,
}: CardStudioProps) {
  const t = TRANSLATIONS[lang];
  const [format, setFormat] = useState<CardFormat>(() => forceFormat ?? 'stories');
  const [theme, setTheme] = useState<CardTheme>(() => (uiTheme === 'light' ? 'paper' : 'dark'));
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync card preview default when global app theme switches
  useEffect(() => {
    setTheme(uiTheme === 'light' ? 'paper' : 'dark');
  }, [uiTheme]);

  useEffect(() => {
    if (forceFormat) {
      setFormat(forceFormat);
    }
  }, [forceFormat]);

  useEffect(() => {
    if (format === 'blend' && !comparison) {
      setFormat('stories');
    }
  }, [format, comparison]);

  useEffect(() => {
    let active = true;
    renderShareCardPng({
      format,
      theme,
      lang,
      displayName,
      periodResult,
      comparison,
    }).then((url) => {
      if (active) setPreviewUrl(url);
    });
    return () => {
      active = false;
    };
  }, [format, theme, lang, displayName, periodResult, comparison]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const slug = periodResult.topStation.station.id;
    downloadPngDataUrl(previewUrl, `leonida-fm-${slug}-${format}.png`);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(compareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      window.prompt(t.copyCompareLink, compareUrl);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      await handleCopyLink();
      return;
    }
    try {
      await navigator.share({
        title: `Leonida FM — ${periodResult.topStation.station.name}`,
        text:
          lang === 'pt'
            ? `Minha rádio oficial no GTA VI é ${periodResult.topStation.station.name}! Compare com a sua:`
            : `My official GTA VI radio station is ${periodResult.topStation.station.name}! Compare yours:`,
        url: compareUrl,
      });
    } catch {
      // Dismissed
    }
  };

  return (
    <main className="mx-auto flex h-full w-full max-w-6xl items-center justify-center px-4 sm:px-6 py-3 min-h-0">
      <section className="grid h-full w-full grid-cols-1 lg:grid-cols-12 gap-5 border border-[var(--border-hairline)] bg-[var(--surface)]/95 p-5 sm:p-6 min-h-0 items-center">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <p className="font-mono-dial text-[11px] tracking-widest text-[var(--vice-pink)] uppercase">
              {t.cardStudioTitle}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-[var(--text-main)] mt-1">
              {periodResult.topStation.station.name}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)]">{t.cardStudioSub}</p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'stories', label: t.formatStories },
                  { id: 'feed', label: t.formatFeed },
                  ...(comparison ? [{ id: 'blend' as CardFormat, label: t.formatBlend }] : []),
                ] as Array<{ id: CardFormat; label: string }>
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormat(opt.id)}
                  className={`border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    format === opt.id
                      ? 'border-[var(--vice-pink)] bg-[var(--vice-pink)]/18 text-[var(--text-main)]'
                      : 'border-[var(--border-hairline)] bg-[var(--surface-inset)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`inline-flex items-center gap-2 border px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                  theme === 'dark'
                    ? 'border-[var(--vice-blue)] bg-[var(--vice-blue)]/15 text-[var(--text-main)]'
                    : 'border-[var(--border-hairline)] bg-[var(--surface-inset)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#0d071a] border border-[#9340ff]" />
                {t.themeDark}
              </button>
              <button
                type="button"
                onClick={() => setTheme('paper')}
                className={`inline-flex items-center gap-2 border px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                  theme === 'paper'
                    ? 'border-[var(--vice-blue)] bg-[var(--vice-blue)]/15 text-[var(--text-main)]'
                    : 'border-[var(--border-hairline)] bg-[var(--surface-inset)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#fdf2f8] border border-[#ff2e93]" />
                {t.themePaper}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!previewUrl}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ff2e93] to-[#ff7b47] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 disabled:opacity-40 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t.downloadPng}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 border border-[var(--vice-blue)] bg-[var(--vice-blue)]/12 px-4 py-2.5 text-xs font-semibold text-[var(--vice-blue)] hover:bg-[var(--vice-blue)]/20 cursor-pointer"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
              <span>{copiedLink ? t.inviteFriendCopied : t.copyCompareLink}</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center gap-2 border border-[var(--border-hairline)] bg-[var(--surface-inset)] px-4 py-2.5 text-xs font-semibold text-[var(--text-main)] hover:border-[var(--vice-peach)] cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5 text-[var(--vice-peach)]" />
              <span>{t.shareNative}</span>
            </button>
          </div>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-6 flex h-full items-center justify-center min-h-0">
          <div className="border border-[var(--border-hairline)] bg-[var(--surface-inset)] p-2 flex items-center justify-center max-h-full">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Leonida FM Shareable Card"
                className="max-h-[58vh] lg:max-h-[calc(100dvh-185px)] w-auto object-contain block"
              />
            ) : (
              <div className="h-64 w-44 flex items-center justify-center font-mono-dial text-xs text-[var(--text-muted)]">
                ...
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
