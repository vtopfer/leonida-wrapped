const LOCAL_KEY_STORAGE = 'leonida_fm_lastfm_key';

export const APP_CONFIG = {
  siteName: 'LEONIDA WRAPPED',
  siteUrl: 'leonidawrapped.com',
  defaultLastfmApiKey: (import.meta.env.VITE_LASTFM_API_KEY as string | undefined)?.trim() ?? '',
  livepixUrl: (import.meta.env.VITE_LIVEPIX_URL as string | undefined)?.trim() ?? '',
  kofiUrl: (import.meta.env.VITE_KOFI_URL as string | undefined)?.trim() ?? '',
  pixKey: (import.meta.env.VITE_PIX_KEY as string | undefined)?.trim() ?? '',
  githubUrl: (import.meta.env.VITE_GITHUB_URL as string | undefined)?.trim() ?? '',
  adsEnabled: (import.meta.env.VITE_ADS_ENABLED as string | undefined) !== 'false',
};

export function hasEnvLastfmKey(): boolean {
  return Boolean(APP_CONFIG.defaultLastfmApiKey);
}

export function getEffectiveLastfmApiKey(): string {
  // Always prioritize the site owner's .env key over any stale localStorage override
  if (APP_CONFIG.defaultLastfmApiKey) {
    return APP_CONFIG.defaultLastfmApiKey;
  }
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(LOCAL_KEY_STORAGE)?.trim();
    if (saved) return saved;
  }
  return '';
}

export function saveUserLastfmApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = key.trim();
  if (trimmed) {
    window.localStorage.setItem(LOCAL_KEY_STORAGE, trimmed);
  } else {
    window.localStorage.removeItem(LOCAL_KEY_STORAGE);
  }
}

export function hasUserCustomLastfmKey(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.localStorage.getItem(LOCAL_KEY_STORAGE)?.trim());
}
