import { DictionaryEntry, LanguageCode, WordSuggestion, SearchResult } from './types';

/**
 * Normalizes text for NLP processing:
 * - Unicode Normalization Form C (NFC)
 * - Lowercases Latin characters
 * - Removes non-alphanumeric punctuation while retaining script diacritics
 * - Trims and collapses multiple spaces
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width spaces/joiners
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'<>@+]/g, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detects the script/language family of the given input text based on Unicode blocks.
 */
export function detectScript(text: string): LanguageCode | 'en' | 'unknown' {
  if (!text) return 'unknown';

  for (const char of text) {
    const code = char.codePointAt(0) || 0;

    // Devanagari (Hindi, Marathi, etc.)
    if (code >= 0x0900 && code <= 0x097f) return 'hi';

    // Tamil
    if (code >= 0x0b80 && code <= 0x0bff) return 'ta';

    // Telugu
    if (code >= 0x0c00 && code <= 0x0c7f) return 'te';

    // Kannada
    if (code >= 0x0c80 && code <= 0x0cff) return 'kn';

    // Malayalam
    if (code >= 0x0d00 && code <= 0x0d7f) return 'ml';

    // Basic Latin / English
    if ((code >= 0x0041 && code <= 0x005a) || (code >= 0x0061 && code <= 0x007a)) {
      return 'en';
    }
  }

  return 'unknown';
}

/**
 * Computes Damerau-Levenshtein distance between two strings.
 * Includes insertions, deletions, substitutions, and adjacent transpositions.
 */
export function damerauLevenshteinDistance(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;

  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix: number[][] = [];

  for (let i = 0; i <= al; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      // Transposition check
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }

  return matrix[al][bl];
}

/**
 * Computes N-gram similarity (Sørensen–Dice coefficient) between two strings.
 */
export function ngramSimilarity(a: string, b: string, n = 2): number {
  if (a === b) return 1;
  if (a.length < n || b.length < n) return 0;

  const getNgrams = (s: string) => {
    const ngrams = new Map<string, number>();
    for (let i = 0; i <= s.length - n; i++) {
      const sub = s.substring(i, i + n);
      ngrams.set(sub, (ngrams.get(sub) || 0) + 1);
    }
    return ngrams;
  };

  const aGrams = getNgrams(a);
  const bGrams = getNgrams(b);

  let matches = 0;
  for (const [gram, count] of aGrams.entries()) {
    if (bGrams.has(gram)) {
      matches += Math.min(count, bGrams.get(gram)!);
    }
  }

  return (2 * matches) / (a.length - n + 1 + (b.length - n + 1));
}

/**
 * Calculates a blended similarity score (0 to 100) combining Edit Distance and N-grams.
 */
export function calculateSimilarity(query: string, target: string): number {
  const normQuery = normalizeText(query);
  const normTarget = normalizeText(target);

  if (normQuery === normTarget) return 100;
  if (!normQuery || !normTarget) return 0;

  // Substring boost
  if (normTarget.includes(normQuery) || normQuery.includes(normTarget)) {
    const lenRatio = Math.min(normQuery.length, normTarget.length) / Math.max(normQuery.length, normTarget.length);
    return Math.round(75 + lenRatio * 25);
  }

  const maxLen = Math.max(normQuery.length, normTarget.length);
  const editDist = damerauLevenshteinDistance(normQuery, normTarget);
  const editScore = Math.max(0, 1 - editDist / maxLen);

  const diceScore = ngramSimilarity(normQuery, normTarget, 2);

  // Weighted combo: 60% edit distance, 40% n-gram
  const blended = editScore * 0.6 + diceScore * 0.4;
  return Math.round(blended * 100);
}

/**
 * Finds similar spelling suggestions for misspelled or missing words.
 */
export function findSimilarSuggestions(
  query: string,
  entries: DictionaryEntry[],
  selectedLang?: LanguageCode | 'all',
  limit = 5
): WordSuggestion[] {
  const normQuery = normalizeText(query);
  if (!normQuery) return [];

  const candidates: WordSuggestion[] = [];
  const seenWords = new Set<string>();

  const filteredEntries = selectedLang && selectedLang !== 'all'
    ? entries.filter(e => e.language === selectedLang)
    : entries;

  for (const entry of filteredEntries) {
    // Check English
    const engSim = calculateSimilarity(normQuery, entry.english);
    const engDist = damerauLevenshteinDistance(normQuery, normalizeText(entry.english));
    if (engSim >= 45 && !seenWords.has(entry.english.toLowerCase())) {
      seenWords.add(entry.english.toLowerCase());
      candidates.push({
        word: entry.english,
        entry,
        matchType: 'english',
        distance: engDist,
        similarity: engSim,
      });
    }

    // Check Transliteration
    const transSim = calculateSimilarity(normQuery, entry.transliteration);
    const transDist = damerauLevenshteinDistance(normQuery, normalizeText(entry.transliteration));
    if (transSim >= 45 && !seenWords.has(entry.transliteration.toLowerCase())) {
      seenWords.add(entry.transliteration.toLowerCase());
      candidates.push({
        word: entry.transliteration,
        entry,
        matchType: 'transliteration',
        distance: transDist,
        similarity: transSim,
      });
    }

    // Check Native Target Word
    const targetSim = calculateSimilarity(normQuery, entry.target);
    const targetDist = damerauLevenshteinDistance(normQuery, normalizeText(entry.target));
    if (targetSim >= 45 && !seenWords.has(entry.target)) {
      seenWords.add(entry.target);
      candidates.push({
        word: entry.target,
        entry,
        matchType: 'target',
        distance: targetDist,
        similarity: targetSim,
      });
    }
  }

  // Sort by similarity descending, then distance ascending
  candidates.sort((a, b) => b.similarity - a.similarity || a.distance - b.distance);

  return candidates.slice(0, limit);
}

/**
 * Comprehensive bilingual search function.
 * Supports:
 * - English -> Native word
 * - Native word -> English
 * - Transliteration (phonetic english typing) -> Native & English
 * - Fuzzy fallback suggestions if no direct matches found
 */
export function searchDictionary(
  query: string,
  entries: DictionaryEntry[],
  selectedLang: LanguageCode | 'all' = 'all'
): SearchResult {
  const normQuery = normalizeText(query);
  const detected = detectScript(query);

  if (!normQuery) {
    return {
      matches: [],
      exactMatch: null,
      detectedLanguage: detected,
      normalizedQuery: '',
      suggestions: [],
      searchType: 'none',
    };
  }

  const pool = selectedLang === 'all'
    ? entries
    : entries.filter(e => e.language === selectedLang);

  // Exact Match Check
  const exactMatches = pool.filter(e => {
    return (
      normalizeText(e.english) === normQuery ||
      normalizeText(e.target) === normQuery ||
      normalizeText(e.transliteration) === normQuery
    );
  });

  if (exactMatches.length > 0) {
    // Also include prefix or related matches
    const related = pool.filter(e => {
      if (exactMatches.some(m => m.id === e.id)) return false;
      return (
        normalizeText(e.english).startsWith(normQuery) ||
        normalizeText(e.transliteration).startsWith(normQuery) ||
        normalizeText(e.target).startsWith(normQuery)
      );
    });

    return {
      matches: [...exactMatches, ...related],
      exactMatch: exactMatches[0],
      detectedLanguage: detected,
      normalizedQuery: normQuery,
      suggestions: [],
      searchType: 'exact',
    };
  }

  // Prefix & Substring Match Check
  const prefixMatches = pool.filter(e => {
    return (
      normalizeText(e.english).startsWith(normQuery) ||
      normalizeText(e.target).startsWith(normQuery) ||
      normalizeText(e.transliteration).startsWith(normQuery)
    );
  });

  const substringMatches = pool.filter(e => {
    if (prefixMatches.some(m => m.id === e.id)) return false;
    return (
      normalizeText(e.english).includes(normQuery) ||
      normalizeText(e.target).includes(normQuery) ||
      normalizeText(e.transliteration).includes(normQuery) ||
      normalizeText(e.englishMeaning).includes(normQuery)
    );
  });

  const partialMatches = [...prefixMatches, ...substringMatches];

  if (partialMatches.length > 0) {
    return {
      matches: partialMatches,
      exactMatch: null,
      detectedLanguage: detected,
      normalizedQuery: normQuery,
      suggestions: [],
      searchType: 'partial',
    };
  }

  // If no match found, run Fuzzy Spell Checker & Suggestion Engine
  const suggestions = findSimilarSuggestions(query, pool, selectedLang, 6);

  return {
    matches: [],
    exactMatch: null,
    detectedLanguage: detected,
    normalizedQuery: normQuery,
    suggestions,
    searchType: 'fuzzy',
  };
}
