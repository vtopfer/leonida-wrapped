import { useEffect, useMemo, useState } from 'react';
import { CardStudio } from './components/CardStudio';
import { ComparisonPanel } from './components/ComparisonPanel';
import { EntryView } from './components/EntryView';
import { Footer } from './components/Footer';
import { type AppSector, Header } from './components/Header';
import { RadiosView } from './components/RadiosView';
import { ResultsDashboard } from './components/ResultsDashboard';
import type { CardFormat } from './engine/cardRenderer';
import { analyzeUserProfile } from './engine/matcher';
import {
  buildCompareUrl,
  buildSharedProfilePayload,
  compareProfiles,
  decodeSharedProfile,
} from './engine/share';
import { detectInitialLanguage, saveLanguagePreference } from './i18n/translations';
import type {
  FullAnalysisResult,
  Language,
  MultiPeriodUserData,
  SharedProfileV1,
  TimePeriod,
  UiTheme,
} from './types';

function readCompareFromUrl(): SharedProfileV1 | null {
  if (typeof window === 'undefined') return null;
  const token = new URLSearchParams(window.location.search).get('compare');
  if (!token) return null;
  return decodeSharedProfile(token);
}

function detectInitialTheme(): UiTheme {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem('leonida_fm_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  }
  return 'dark';
}

export function App() {
  const [lang, setLang] = useState<Language>(() => detectInitialLanguage());
  const [uiTheme, setUiTheme] = useState<UiTheme>(() => detectInitialTheme());
  const [analysis, setAnalysis] = useState<FullAnalysisResult | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('overall');
  const [friendChallenge, setFriendChallenge] = useState<SharedProfileV1 | null>(() =>
    readCompareFromUrl()
  );
  const [activeSector, setActiveSector] = useState<AppSector>('entry');
  const [hudStationId, setHudStationId] = useState<string | undefined>(undefined);
  const [forcedCardFormat, setForcedCardFormat] = useState<CardFormat | null>(null);

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = uiTheme;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('leonida_fm_theme', uiTheme);
    }
  }, [uiTheme]);

  const handleToggleLang = (next: Language) => {
    setLang(next);
    saveLanguagePreference(next);
  };

  const handleCompleteInput = (userData: MultiPeriodUserData) => {
    const result = analyzeUserProfile(userData);
    setAnalysis(result);
    setSelectedPeriod(result.availablePeriods[0] ?? 'overall');
    setForcedCardFormat(null);
    setActiveSector(friendChallenge ? 'compare' : 'profile');
  };

  const handleReset = () => {
    setAnalysis(null);
    setForcedCardFormat(null);
    setActiveSector('entry');
  };

  const handleClearChallenge = () => {
    setFriendChallenge(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('compare');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const activePeriodResult = useMemo(() => {
    if (!analysis) return null;
    return (
      analysis.resultsByPeriod[selectedPeriod] ??
      analysis.resultsByPeriod[analysis.availablePeriods[0]] ??
      null
    );
  }, [analysis, selectedPeriod]);

  const compareUrl = useMemo(() => {
    if (!analysis || !activePeriodResult) return '';
    return buildCompareUrl(
      buildSharedProfilePayload(analysis.displayName, activePeriodResult)
    );
  }, [analysis, activePeriodResult]);

  const comparison = useMemo(() => {
    if (!analysis || !activePeriodResult || !friendChallenge) return null;
    return compareProfiles(analysis.displayName, activePeriodResult, friendChallenge);
  }, [analysis, activePeriodResult, friendChallenge]);

  return (
    <div className="min-h-dvh lg:h-dvh lg:overflow-hidden flex flex-col text-[var(--text-main)]">
      <Header
        lang={lang}
        uiTheme={uiTheme}
        activeSector={activeSector}
        hasAnalysis={Boolean(analysis)}
        onSelectSector={(sector) => {
          if (sector !== 'card') setForcedCardFormat(null);
          setActiveSector(sector);
        }}
        onToggleLang={handleToggleLang}
        onToggleTheme={() => setUiTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onReset={handleReset}
      />

      <div className="flex-1 min-h-0 flex flex-col">
        {activeSector === 'radios' ? (
          <RadiosView
            lang={lang}
            initialStationId={
              hudStationId ?? activePeriodResult?.topStation.station.id
            }
          />
        ) : activeSector === 'card' && analysis && activePeriodResult ? (
          <CardStudio
            lang={lang}
            uiTheme={uiTheme}
            displayName={analysis.displayName}
            periodResult={activePeriodResult}
            comparison={comparison}
            compareUrl={compareUrl}
            forceFormat={forcedCardFormat}
          />
        ) : activeSector === 'compare' && analysis && activePeriodResult ? (
          <ComparisonPanel
            lang={lang}
            comparison={comparison}
            compareUrl={compareUrl}
            onSelectFriend={(friend) => setFriendChallenge(friend)}
            onOpenBlendCard={() => {
              setForcedCardFormat('blend');
              setActiveSector('card');
            }}
          />
        ) : activeSector === 'profile' && analysis && activePeriodResult ? (
          <ResultsDashboard
            lang={lang}
            analysis={analysis}
            selectedPeriod={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
            periodResult={activePeriodResult}
            compareUrl={compareUrl}
            onGoToCard={() => {
              setForcedCardFormat('stories');
              setActiveSector('card');
            }}
            onInspectStationInHud={(stationId) => {
              setHudStationId(stationId);
              setActiveSector('radios');
            }}
          />
        ) : (
          <EntryView
            lang={lang}
            friendChallenge={friendChallenge}
            onClearChallenge={handleClearChallenge}
            onComplete={handleCompleteInput}
          />
        )}
      </div>

      <Footer lang={lang} />
    </div>
  );
}

export default App;
