'use client';

import React from 'react';
import { WordSuggestion } from '@/lib/types';
import { SUPPORTED_LANGUAGES } from '@/lib/dataset';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SpellSuggestionsCardProps {
  query: string;
  suggestions: WordSuggestion[];
  onSelectSuggestion: (word: string) => void;
}

export const SpellSuggestionsCard: React.FC<SpellSuggestionsCardProps> = ({
  query,
  suggestions,
  onSelectSuggestion,
}) => {
  return (
    <div className="rounded-xl p-5 sm:p-6 border border-amber-200 bg-amber-50/70 shadow-xs">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-mono uppercase tracking-wider font-semibold mb-1">
            NLP Spelling Suggester Active
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No exact lexicon match for <span className="text-amber-900 font-mono">&quot;{query}&quot;</span>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Evaluated Damerau-Levenshtein edit-distance & subword n-gram cosine similarity to rank closest candidates:
          </p>
        </div>
      </div>

      {suggestions.length === 0 ? (
        <div className="p-4 text-center rounded-lg bg-white border border-amber-200">
          <p className="text-slate-600 text-xs">
            No close vocabulary matches found. You can add this word using the &quot;Add Word&quot; button.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {suggestions.map((item, index) => {
            const lang = SUPPORTED_LANGUAGES.find(l => l.code === item.entry.language);
            return (
              <div
                key={`${item.entry.id}-${index}`}
                onClick={() => onSelectSuggestion(item.word)}
                className="group flex items-center justify-between p-3 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-xs shrink-0">
                    {lang?.flag || '📖'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-blue-900 transition-colors">
                        {item.word}
                      </span>
                      {item.matchType !== 'english' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                          {item.entry.english}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.entry.target} ({item.entry.transliteration}) • {lang?.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {item.similarity}%
                    </span>
                    <span className="block text-[9px] text-slate-400 font-mono">
                      dist: {item.distance}
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded bg-slate-100 group-hover:bg-blue-900 group-hover:text-white text-slate-500 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
