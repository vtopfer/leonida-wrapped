import { useMemo, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import {
  ARTIST_SEARCH_LIST,
  QUICK_GENRE_OPTIONS,
  normalizeArtistKey,
} from '../data/artistCatalog';
import { TRANSLATIONS } from '../i18n/translations';
import type { Language, MultiPeriodUserData, TalkVibe, UserArtistInput } from '../types';

interface QuickMatcherProps {
  lang: Language;
  talkVibe?: TalkVibe;
  onSubmit: (data: MultiPeriodUserData) => void;
}

export function QuickMatcher({ lang, talkVibe, onSubmit }: QuickMatcherProps) {
  const t = TRANSLATIONS[lang];
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const suggestions = useMemo(() => {
    const normQuery = normalizeArtistKey(query);
    if (!normQuery) {
      return ARTIST_SEARCH_LIST.filter((a) =>
        [
          'Dua Lipa',
          'Travis Scott',
          'Bad Bunny',
          'Metallica',
          'Tame Impala',
          'Tom Petty',
          'Anitta',
          'Phil Collins',
        ].includes(a.name)
      ).filter((a) => !selectedArtists.includes(a.name));
    }
    return ARTIST_SEARCH_LIST.filter(
      (a) =>
        !selectedArtists.includes(a.name) &&
        normalizeArtistKey(a.name).includes(normQuery)
    ).slice(0, 7);
  }, [query, selectedArtists]);

  const addArtist = (artistName: string) => {
    const clean = artistName.trim();
    if (!clean || selectedArtists.length >= 12) return;
    if (!selectedArtists.some((a) => normalizeArtistKey(a) === normalizeArtistKey(clean))) {
      setSelectedArtists((prev) => [...prev, clean]);
    }
    setQuery('');
  };

  const removeArtist = (artistName: string) => {
    setSelectedArtists((prev) => prev.filter((a) => a !== artistName));
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((g) => g !== genreId) : [...prev, genreId]
    );
  };

  const totalPicks = selectedArtists.length + selectedGenres.length;
  const canSubmit = totalPicks >= 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const genreTagsFromPills = selectedGenres.flatMap((gid) => {
      const opt = QUICK_GENRE_OPTIONS.find((g) => g.id === gid);
      return opt ? opt.tags : [];
    });

    const artists: UserArtistInput[] = selectedArtists.map((aName, idx) => ({
      name: aName,
      playcount: 100 - idx * 6,
      tags: idx === 0 ? genreTagsFromPills : undefined,
    }));

    if (genreTagsFromPills.length > 0 && artists.length < 3) {
      selectedGenres.forEach((gid, idx) => {
        const opt = QUICK_GENRE_OPTIONS.find((g) => g.id === gid);
        if (opt) {
          artists.push({
            name: lang === 'pt' ? opt.labelPt : opt.labelEn,
            playcount: 85 - idx * 5,
            tags: opt.tags,
          });
        }
      });
    }

    onSubmit({
      displayName: name.trim() || (lang === 'pt' ? 'Ouvinte' : 'Listener'),
      source: 'quick',
      talkVibe,
      periods: {
        overall: {
          artists,
          tracks: [],
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">
            {t.quickNameLabel}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={28}
            placeholder={t.quickNamePlaceholder}
            className="w-full border border-[var(--border-hairline)] bg-[var(--surface-inset)] px-3 py-2 text-xs text-[var(--text-main)] placeholder-[var(--placeholder-ink)] outline-none focus:border-[var(--vice-blue)]"
          />
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              {t.quickArtistLabel}
            </label>
            <span className="font-mono-dial text-[10px] text-[var(--vice-blue)]">
              {selectedArtists.length}/12
            </span>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  e.preventDefault();
                  if (
                    suggestions.length > 0 &&
                    normalizeArtistKey(suggestions[0].name) === normalizeArtistKey(query)
                  ) {
                    addArtist(suggestions[0].name);
                  } else {
                    addArtist(query);
                  }
                }
              }}
              placeholder={t.quickArtistPlaceholder}
              className="w-full border border-[var(--border-hairline)] bg-[var(--surface-inset)] pl-8 pr-14 py-2 text-xs text-[var(--text-main)] placeholder-[var(--placeholder-ink)] outline-none focus:border-[var(--vice-pink)]"
            />
            {query.trim() && (
              <button
                type="button"
                onClick={() => addArtist(query)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 border border-[var(--border-hairline)] bg-[var(--surface-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-main)] hover:border-[var(--vice-pink)] cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Selected chips */}
      {selectedArtists.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedArtists.map((artist) => (
            <span
              key={artist}
              className="inline-flex items-center gap-1 border border-[var(--vice-pink)]/70 bg-[var(--vice-pink)]/12 px-2 py-0.5 text-[11px] font-medium text-[var(--text-main)]"
            >
              {artist}
              <button
                type="button"
                onClick={() => removeArtist(artist)}
                className="text-[var(--vice-pink)] hover:text-[var(--text-main)] cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Quick suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {suggestions.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => addArtist(s.name)}
              className="inline-flex items-center gap-1 border border-[var(--border-hairline)] bg-[var(--surface-inset)]/80 px-2 py-1 text-[11px] text-[var(--text-muted)] hover:border-[var(--vice-blue)] hover:text-[var(--text-main)] cursor-pointer"
            >
              <Plus className="h-2.5 w-2.5 text-[var(--vice-blue)]" />
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Genres */}
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
          {t.quickGenresLabel}
        </label>
        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
          {QUICK_GENRE_OPTIONS.map((g) => {
            const active = selectedGenres.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGenre(g.id)}
                className={`border px-2 py-1 text-[11px] transition-colors cursor-pointer ${
                  active
                    ? 'border-[var(--vice-blue)] bg-[var(--vice-blue)]/15 text-[var(--vice-blue)] font-semibold'
                    : 'border-[var(--border-hairline)] bg-[var(--surface-inset)]/70 text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-main)]'
                }`}
              >
                {lang === 'pt' ? g.labelPt : g.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="font-mono-dial text-[11px] text-[var(--text-muted)]">
          {!canSubmit ? `${t.quickMinNotice} (${totalPicks}/3)` : `${totalPicks} ✓`}
        </span>
        <button
          type="submit"
          disabled={!canSubmit}
          className="bg-gradient-to-r from-[#ff2e93] to-[#ff7b47] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          {t.quickSubmit}
        </button>
      </div>
    </form>
  );
}
