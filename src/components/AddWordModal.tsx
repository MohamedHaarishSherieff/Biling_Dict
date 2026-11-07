'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { DictionaryEntry, LanguageCode, PartOfSpeech } from '@/lib/types';
import { SUPPORTED_LANGUAGES } from '@/lib/dataset';

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWord: (entry: DictionaryEntry) => void;
}

export const AddWordModal: React.FC<AddWordModalProps> = ({
  isOpen,
  onClose,
  onAddWord,
}) => {
  const [english, setEnglish] = useState('');
  const [target, setTarget] = useState('');
  const [transliteration, setTransliteration] = useState('');
  const [language, setLanguage] = useState<LanguageCode>('ta');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('noun');
  const [englishMeaning, setEnglishMeaning] = useState('');
  const [targetMeaning, setTargetMeaning] = useState('');
  const [category, setCategory] = useState('General');
  const [exampleTarget, setExampleTarget] = useState('');
  const [exampleEnglish, setExampleEnglish] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!english.trim() || !target.trim()) return;

    const newEntry: DictionaryEntry = {
      id: `${language}-${Date.now()}`,
      english: english.trim().toLowerCase(),
      target: target.trim(),
      transliteration: transliteration.trim() || target.trim(),
      language,
      partOfSpeech,
      englishMeaning: englishMeaning.trim() || `Meaning of ${english}`,
      targetMeaning: targetMeaning.trim() || `${target} என்பதன் பொருள்`,
      pronunciationIpa: '',
      examples: exampleTarget.trim()
        ? [
            {
              target: exampleTarget.trim(),
              english: exampleEnglish.trim() || exampleTarget.trim(),
              transliteration: '',
            },
          ]
        : [],
      synonyms: [],
      antonyms: [],
      category: category.trim() || 'General',
    };

    onAddWord(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="max-w-2xl w-full rounded-xl p-6 sm:p-7 border border-slate-200 bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-mono">Add Lexicon Entry</h3>
              <p className="text-xs text-slate-500">Expand the bilingual dataset with new vocabulary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-slate-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
                Target Language *
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as LanguageCode)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-700 text-xs sm:text-sm"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
                Part of Speech
              </label>
              <select
                value={partOfSpeech}
                onChange={e => setPartOfSpeech(e.target.value as PartOfSpeech)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-700 text-xs sm:text-sm"
              >
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="adverb">Adverb</option>
                <option value="greeting">Greeting</option>
                <option value="phrase">Phrase</option>
                <option value="pronoun">Pronoun</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
                English Word *
              </label>
              <input
                type="text"
                required
                value={english}
                onChange={e => setEnglish(e.target.value)}
                placeholder="e.g. happiness"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
                Native Script Word *
              </label>
              <input
                type="text"
                required
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="e.g. ಸಂತೋಷ / மகிழ்ச்சி / ఖుషీ"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
                Transliteration
              </label>
              <input
                type="text"
                value={transliteration}
                onChange={e => setTransliteration(e.target.value)}
                placeholder="e.g. santhosha"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 text-xs sm:text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Emotions, Nature, Daily Life"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
              English Meaning & Definition
            </label>
            <textarea
              rows={2}
              value={englishMeaning}
              onChange={e => setEnglishMeaning(e.target.value)}
              placeholder="Detailed definition in English..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 text-xs sm:text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
              Local Language Meaning
            </label>
            <textarea
              rows={2}
              value={targetMeaning}
              onChange={e => setTargetMeaning(e.target.value)}
              placeholder="Meaning in the local regional language..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 text-xs sm:text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
                Example Sentence (Target Script)
              </label>
              <input
                type="text"
                value={exampleTarget}
                onChange={e => setExampleTarget(e.target.value)}
                placeholder="e.g. அவள் மகிழ்ச்சியாக இருந்தாள்"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
                Example Sentence (English)
              </label>
              <input
                type="text"
                value={exampleEnglish}
                onChange={e => setExampleEnglish(e.target.value)}
                placeholder="e.g. She was very happy"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
            >
              Save Word Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
