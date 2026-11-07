import { DictionaryEntry, LanguageCode, SearchResult, WordSuggestion } from './types';

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface RawBackendEntry {
  id: string;
  english: string;
  target: string;
  transliteration?: string;
  language: LanguageCode;
  part_of_speech?: string;
  partOfSpeech?: string;
  english_meaning?: string;
  englishMeaning?: string;
  target_meaning?: string;
  targetMeaning?: string;
  pronunciation_ipa?: string;
  pronunciationIpa?: string;
  examples?: Array<{ english: string; target: string; transliteration?: string }>;
  synonyms?: string[];
  antonyms?: string[];
  category?: string;
}

export interface RawBackendSuggestion {
  word: string;
  entry: RawBackendEntry;
  match_type?: 'english' | 'target' | 'transliteration';
  matchType?: 'english' | 'target' | 'transliteration';
  distance: number;
  similarity: number;
}

export interface PythonHealth {
  status: string;
  engine: string;
  students: Array<{ id: string; name: string }>;
  is_model_trained: boolean;
  total_entries: number;
  supported_languages: string[];
}

/**
 * Checks connection to the Python NLP FastAPI backend.
 */
export async function checkPythonBackend(): Promise<PythonHealth | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Sends a search query to the Python IndicNLPModel.
 */
export async function searchPythonNLP(
  query: string,
  selectedLanguage: LanguageCode | 'all' = 'all'
): Promise<SearchResult | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        selected_language: selectedLanguage,
      }),
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) return null;
    const data = await res.json();

    // Map snake_case response to camelCase TypeScript structures
    const mapEntry = (e: RawBackendEntry): DictionaryEntry => ({
      id: e.id,
      english: e.english,
      target: e.target,
      transliteration: e.transliteration || '',
      language: e.language,
      partOfSpeech: (e.part_of_speech || e.partOfSpeech || 'noun') as DictionaryEntry['partOfSpeech'],
      englishMeaning: e.english_meaning || e.englishMeaning || '',
      targetMeaning: e.target_meaning || e.targetMeaning || '',
      pronunciationIpa: e.pronunciation_ipa || e.pronunciationIpa || '',
      examples: (e.examples || []).map(ex => ({
        english: ex.english,
        target: ex.target,
        transliteration: ex.transliteration || '',
      })),
      synonyms: e.synonyms || [],
      antonyms: e.antonyms || [],
      category: e.category || 'General',
    });

    const suggestions: WordSuggestion[] = (data.suggestions || []).map((s: RawBackendSuggestion) => ({
      word: s.word,
      entry: mapEntry(s.entry),
      matchType: s.match_type || s.matchType || 'english',
      distance: s.distance,
      similarity: s.similarity,
    }));

    return {
      matches: (data.matches || []).map(mapEntry),
      exactMatch: data.exact_match ? mapEntry(data.exact_match) : null,
      detectedLanguage: data.detected_language,
      normalizedQuery: data.normalized_query,
      suggestions,
      searchType: data.search_type,
    };
  } catch {
    return null;
  }
}

/**
 * Triggers retraining of the Python NLP model.
 */
export async function trainPythonModel(): Promise<Record<string, unknown>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (err) {
    return { error: String(err) };
  }
}

/**
 * Adds a new word directly to the Python backend model.
 */
export async function addWordToPythonBackend(entry: DictionaryEntry): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/add-word`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        english: entry.english,
        target: entry.target,
        transliteration: entry.transliteration,
        language: entry.language,
        part_of_speech: entry.partOfSpeech,
        english_meaning: entry.englishMeaning,
        target_meaning: entry.targetMeaning,
        pronunciation_ipa: entry.pronunciationIpa || '',
        category: entry.category,
        examples: entry.examples || [],
        synonyms: entry.synonyms || [],
        antonyms: entry.antonyms || [],
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
