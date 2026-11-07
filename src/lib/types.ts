export type LanguageCode = 'hi' | 'ta' | 'te' | 'kn' | 'ml';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  scriptName: string;
  scriptCode: string;
  speechCode: string;
  flag: string;
  fontFamily?: string;
  description: string;
}

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'greeting'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'interjection'
  | 'phrase';

export interface ExampleSentence {
  english: string;
  target: string;
  transliteration?: string;
}

export interface DictionaryEntry {
  id: string;
  english: string;
  target: string;
  transliteration: string;
  language: LanguageCode;
  partOfSpeech: PartOfSpeech;
  englishMeaning: string;
  targetMeaning: string;
  pronunciationIpa?: string;
  examples: ExampleSentence[];
  synonyms: string[];
  antonyms: string[];
  category: string;
  rootWord?: string;
}

export interface SearchResult {
  matches: DictionaryEntry[];
  exactMatch: DictionaryEntry | null;
  detectedLanguage?: LanguageCode | 'en' | 'unknown';
  normalizedQuery: string;
  suggestions: WordSuggestion[];
  searchType: 'exact' | 'partial' | 'fuzzy' | 'none';
}

export interface WordSuggestion {
  word: string;
  entry: DictionaryEntry;
  matchType: 'english' | 'target' | 'transliteration';
  distance: number;
  similarity: number; // 0 to 100 percentage
}
