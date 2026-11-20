import { useEffect, useState } from 'react';
import {
  ChevronDown,
  FileJson,
  HelpCircle,
  KeyRound,
  Radio,
  Sparkles,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  getEffectiveLastfmApiKey,
  hasEnvLastfmKey,
  hasUserCustomLastfmKey,
  saveUserLastfmApiKey,
} from '../config';
import { DEMO_PROFILES } from '../data/demoProfiles';
import { STATION_BY_INDEX } from '../data/gta6Radios';
import { TRANSLATIONS } from '../i18n/translations';
import { LastfmServiceError, fetchLastfmProfile } from '../services/lastfm';
import { parseSpotifyFiles } from '../services/spotifyExport';
import { parseYoutubeTakeoutFiles } from '../services/youtubeTakeout';
import type { Language, MultiPeriodUserData, SharedProfileV1, TalkVibe } from '../types';
import { QuickMatcher } from './QuickMatcher';
import { SpotifyTutorialModal } from './SpotifyTutorialModal';

interface EntryViewProps {
  lang: Language;
  friendChallenge: SharedProfileV1 | null;
  onClearChallenge: () => void;
  onComplete: (data: MultiPeriodUserData) => void;
}

type SourceOption = 'lastfm' | 'quick' | 'spotify' | 'youtube';

const TALK_VIBE_KEYS: TalkVibe[] = ['conspiracy', 'chaos', 'hiphop_chat', 'true_crime'];

export function EntryView({
  lang,
  friendChallenge,
  onClearChallenge,
  onComplete,
}: EntryViewProps) {
  const t = TRANSLATIONS[lang];
  const envHasKey = hasEnvLastfmKey();
  const initialHasKey = Boolean(getEffectiveLastfmApiKey());

  const [source, setSource] = useState<SourceOption>(() =>
    initialHasKey ? 'lastfm' : 'quick'
  );
  const [username, setUsername] = useState('');
  const [talkVibe, setTalkVibe] = useState<TalkVibe | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<keyof typeof TRANSLATIONS.pt.errors | null>(null);

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(initialHasKey);
  const [showDevKeyBox, setShowDevKeyBox] = useState(false);

  useEffect(() => {
    if (envHasKey && hasUserCustomLastfmKey()) {
      saveUserLastfmApiKey('');
    }
  }, [envHasKey]);

  const [importName, setImportName] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [tutorialMode, setTutorialMode] = useState<'spotify' | 'youtube' | null>(null);

  const friendTopStation = friendChallenge
    ? STATION_BY_INDEX.get(friendChallenge.r[0][0])
    : undefined;

  const handleSaveApiKey = () => {
    saveUserLastfmApiKey(apiKeyInput);
    const effective = getEffectiveLastfmApiKey();
    setHasKey(Boolean(effective));
    if (effective) {
      setShowDevKeyBox(false);
      setErrorCode(null);
    }
  };

  const handleClearApiKey = () => {
    saveUserLastfmApiKey('');
    setApiKeyInput('');
    const effective = getEffectiveLastfmApiKey();
    setHasKey(Boolean(effective));
  };

  const handleLastfmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiKey = getEffectiveLastfmApiKey();
    if (!apiKey) {
      setErrorCode('MISSING_KEY');
      return;
    }

    setLoading(true);
    setErrorCode(null);
    try {
      const profile = await fetchLastfmProfile(username, apiKey, talkVibe);
      onComplete(profile);
    } catch (err) {
      if (err instanceof LastfmServiceError) {
        setErrorCode(err.code);
      } else {
        setErrorCode('NETWORK');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = async (fileList: FileList | null, kind: 'spotify' | 'youtube') => {
    if (!fileList || fileList.length === 0) return;
    setImportStatus(t.spotifyProcessing);
    setErrorCode(null);
    try {
      const parsed =
        kind === 'spotify'
          ? await parseSpotifyFiles(Array.from(fileList), importName || 'Spotify', talkVibe)
          : await parseYoutubeTakeoutFiles(
              Array.from(fileList),
              importName || 'YT Music',
              talkVibe
            );
      setImportStatus(`${t.spotifySuccess} ${parsed.validPlayCount} ${t.spotifyTracksSuffix}`);
      onComplete(parsed.userData);
    } catch {
      setImportStatus(null);
      setErrorCode(kind === 'spotify' ? 'SPOTIFY_PARSE' : 'YOUTUBE_PARSE');
    }
  };

  const sourceOptions: Array<{ id: SourceOption; label: string }> = [
    { id: 'lastfm', label: t.tabLastfm },
    { id: 'quick', label: t.tabQuick },
    { id: 'spotify', label: t.tabSpotify },
    { id: 'youtube', label: t.tabYoutube },
  ];

  return (
    <main className="mx-auto flex h-full w-full max-w-6xl flex-col justify-center px-4 sm:px-6 py-3 min-h-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center min-h-0">
        {/* Left Column: GTA VI Hero + Challenge + Friends Easter Eggs */}
        <div className="lg:col-span-5 space-y-4">
          {friendChallenge && (
            <div className="flex items-center justify-between gap-3 border border-[var(--vice-blue)]/60 bg-[var(--vice-blue)]/10 px-3.5 py-2.5">
              <div className="flex items-start gap-2.5 min-w-0">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-[var(--vice-blue)]" />
                <div className="min-w-0">
                  <p className="font-mono-dial text-[10px] tracking-widest text-[var(--vice-blue)] uppercase">
                    {t.compareBannerLabel}
                  </p>
                  <p className="text-xs text-[var(--text-main)] truncate">
                    {t.compareBannerPrefix} <strong>{friendChallenge.n}</strong>
                    {friendTopStation ? ` · ${friendTopStation.name}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClearChallenge}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                aria-label={t.compareBannerClear}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div>
            <p className="font-mono-dial text-[10px] tracking-[0.2em] text-[var(--vice-peach)] uppercase mb-1.5">
              {t.heroKicker}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold uppercase leading-[0.92]">
              <span className="gta-title-gradient">{t.heroTitle}</span>
            </h1>
            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[var(--text-muted)]">
              {t.heroLead}
            </p>
          </div>

          {/* Mendes, Lu & John Easter Egg Profiles */}
          <div className="border border-[var(--border-hairline)] bg-[var(--surface)]/90 p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[var(--vice-blue)]" />
              <span className="font-mono-dial text-[10px] tracking-wider text-[var(--vice-peach)] uppercase">
                {t.demoSectionTitle}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
              {DEMO_PROFILES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    onComplete({
                      ...preset.data,
                      talkVibe: talkVibe ?? preset.data.talkVibe,
                    })
                  }
                  className="group border border-[var(--border-hairline)] bg-[var(--surface-inset)]/85 px-3 py-2 text-left transition-colors hover:border-[var(--vice-pink)] cursor-pointer"
                >
                  <p className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--vice-pink)]">
                    {lang === 'pt' ? preset.labelPt : preset.labelEn}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)] leading-snug">
                    {lang === 'pt' ? preset.subtitlePt : preset.subtitleEn}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Unified Single-Box Source Switcher */}
        <section className="lg:col-span-7 border border-[var(--border-hairline)] bg-[var(--surface)]/95 flex flex-col">
          {/* Unified Source Bar (1 clean selector row) */}
          <div className="hairline-b bg-[var(--surface-elevated)]/70 px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="font-mono-dial text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              {t.sourceSelectLabel}
            </span>

            <div className="relative">
              <select
                aria-label={t.sourceSelectLabel}
                value={source}
                onChange={(e) => {
                  setSource(e.target.value as SourceOption);
                  setErrorCode(null);
                  setImportStatus(null);
                }}
                className="w-full sm:w-auto appearance-none border border-[var(--vice-pink)] bg-[var(--surface-inset)] pl-3.5 pr-9 py-2 text-xs sm:text-sm font-bold text-[var(--text-main)] outline-none focus:border-[var(--vice-blue)] cursor-pointer"
              >
                {sourceOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--vice-pink)]" />
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Compact Optional Talk Vibe Strip */}
            <div className="flex flex-wrap items-center gap-1.5 border border-[var(--border-hairline)] bg-[var(--surface-inset)]/70 px-3 py-2">
              <span className="text-[11px] font-medium text-[var(--text-muted)] mr-1">
                {t.talkVibeLabel}
              </span>
              {TALK_VIBE_KEYS.map((vk) => {
                const active = talkVibe === vk;
                return (
                  <button
                    key={vk}
                    type="button"
                    onClick={() => setTalkVibe(active ? undefined : vk)}
                    className={`border px-2 py-0.5 text-[11px] transition-colors cursor-pointer ${
                      active
                        ? 'border-[var(--vice-orange)] bg-[var(--vice-orange)]/18 text-[var(--vice-peach)] font-semibold'
                        : 'border-[var(--border-hairline)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {t.talkVibes[vk]}
                  </button>
                );
              })}
            </div>

            {errorCode && (
              <div className="border border-[var(--vice-pink)]/70 bg-[var(--vice-pink)]/12 px-3 py-2 text-xs text-[var(--text-main)]">
                {t.errors[errorCode]}
              </div>
            )}

            {source === 'quick' && (
              <QuickMatcher
                lang={lang}
                talkVibe={talkVibe}
                onSubmit={onComplete}
              />
            )}

            {source === 'lastfm' && (
              <div className="space-y-4 py-2">
                <form onSubmit={handleLastfmSubmit} autoComplete="off" className="space-y-2.5">
                  <label
                    htmlFor="lastfm-user"
                    className="block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]"
                  >
                    {t.lastfmLabel}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id="lastfm-user"
                      name="lastfm_handle"
                      type="text"
                      autoComplete="off"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t.lastfmPlaceholder}
                      className="flex-1 border border-[var(--border-hairline)] bg-[var(--surface-inset)] px-3.5 py-2.5 text-sm text-[var(--text-main)] placeholder-[var(--placeholder-ink)] outline-none focus:border-[var(--vice-purple)]"
                    />
                    <button
                      type="submit"
                      disabled={loading || !username.trim()}
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#9340ff] to-[#ff2e93] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    >
                      <Radio className="h-3.5 w-3.5" />
                      <span>{loading ? t.lastfmLoading : t.lastfmSubmit}</span>
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{t.lastfmHelp}</p>
                </form>

                {!envHasKey && !hasKey && (
                  <div className="border border-[var(--border-hairline)] bg-[var(--surface-inset)]/80 p-3 space-y-2">
                    <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                      {t.lastfmOwnerNotice}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowDevKeyBox((v) => !v)}
                      className="inline-flex items-center gap-1 font-mono-dial text-[10px] text-[var(--vice-blue)] hover:underline cursor-pointer"
                    >
                      <KeyRound className="h-3 w-3" />
                      <span>{t.lastfmDevToggle}</span>
                    </button>
                  </div>
                )}

                {!envHasKey && (showDevKeyBox || (hasKey && hasUserCustomLastfmKey())) && (
                  <div className="border border-[var(--border-hairline)] bg-[var(--surface-inset)] p-3 space-y-2">
                    <p className="text-[11px] font-semibold text-[var(--vice-peach)]">
                      {t.lastfmNeedsKeyTitle}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">{t.lastfmNeedsKeyDesc}</p>
                    <div className="flex gap-2">
                      <input
                        name="lastfm_dev_key"
                        type="text"
                        autoComplete="off"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder={t.lastfmKeyPlaceholder}
                        className="flex-1 border border-[var(--border-hairline)] bg-[var(--surface)] px-2.5 py-1.5 font-mono-dial text-xs text-[var(--text-main)] outline-none focus:border-[var(--vice-blue)]"
                      />
                      <button
                        type="button"
                        onClick={handleSaveApiKey}
                        disabled={!apiKeyInput.trim()}
                        className="border border-[var(--vice-blue)] bg-[var(--vice-blue)]/15 px-3 py-1.5 text-xs font-semibold text-[var(--vice-blue)] disabled:opacity-40 cursor-pointer"
                      >
                        {t.lastfmSaveKey}
                      </button>
                      {hasUserCustomLastfmKey() && (
                        <button
                          type="button"
                          onClick={handleClearApiKey}
                          className="border border-[var(--border-hairline)] px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                        >
                          {t.lastfmClearKey}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(source === 'spotify' || source === 'youtube') && (
              <div className="space-y-3 py-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--vice-blue)]">
                    <FileJson className="h-4 w-4" />
                    <span>
                      {source === 'spotify'
                        ? 'Spotify StreamingHistory (.json)'
                        : 'YouTube Music — Google Takeout (.json)'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setTutorialMode(source)}
                    className="inline-flex items-center gap-1 border border-[var(--vice-blue)]/50 bg-[var(--vice-blue)]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--vice-blue)] hover:bg-[var(--vice-blue)]/20 cursor-pointer"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>
                      {source === 'spotify' ? t.spotifyTutorialBtn : t.ytTutorialBtn}
                    </span>
                  </button>
                </div>

                <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                  {source === 'spotify' ? t.spotifyDesc : t.ytDesc}
                </p>

                <input
                  type="text"
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  maxLength={28}
                  placeholder={t.quickNamePlaceholder}
                  className="w-full border border-[var(--border-hairline)] bg-[var(--surface-inset)] px-3 py-2 text-xs text-[var(--text-main)] placeholder-[var(--placeholder-ink)] outline-none focus:border-[var(--vice-blue)]"
                />

                <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-[var(--border-strong)] bg-[var(--surface-inset)]/75 px-4 py-6 text-center transition-colors hover:border-[var(--vice-blue)] cursor-pointer">
                  <Upload className="h-4 w-4 text-[var(--vice-blue)]" />
                  <span className="text-xs font-semibold text-[var(--text-main)]">
                    {source === 'spotify' ? t.spotifyDropLabel : t.ytDropLabel}
                  </span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    multiple
                    onChange={(e) => handleFileImport(e.target.files, source)}
                    className="hidden"
                  />
                </label>

                {importStatus && (
                  <p className="font-mono-dial text-[11px] text-[var(--vice-blue)]">
                    {importStatus}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <SpotifyTutorialModal
        lang={lang}
        mode={tutorialMode ?? 'spotify'}
        isOpen={tutorialMode !== null}
        onClose={() => setTutorialMode(null)}
      />
    </main>
  );
}
