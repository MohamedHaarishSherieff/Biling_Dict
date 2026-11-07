'use client';

import React from 'react';
import { X, Cpu, ShieldCheck, Database, Search, Volume2, Sparkles } from 'lucide-react';

interface NLPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NLPModal: React.FC<NLPModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="max-w-3xl w-full rounded-xl p-6 sm:p-7 border border-slate-200 bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-mono">NLP System Architecture & Methodology</h3>
              <p className="text-xs text-slate-500">Technical implementation breakdown for evaluation</p>
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

        <div className="mt-4 space-y-3.5 text-xs sm:text-sm text-slate-700">
          {/* Subtask 1 */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider font-mono">
              <Database className="w-4 h-4" />
              <span>Subtask 1: Bilingual Dataset Collection</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Constructed a structured multilingual corpus across <strong>Tamil, Telugu, Kannada, Malayalam, and Hindi</strong> paired with English. Contains normalized headwords, native script, phonetic transliterations, grammatical part of speech, bilingual definitions, IPA guides, and example sentences.
            </p>
          </div>

          {/* Subtask 2 */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Subtask 2: NLP Word Cleaning & Unicode Normalization</span>
            </div>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
              <li><strong>Unicode NFC Normalization:</strong> Canonical composition of Indic vowel signs (matras).</li>
              <li><strong>Zero-Width Character Stripping:</strong> Removes invisible joiners (<code className="text-blue-950 font-mono font-semibold">\u200B-\u200D</code>).</li>
              <li><strong>Punctuation Sanitization:</strong> Removes punctuation while preserving script characters.</li>
              <li><strong>Case Folding:</strong> Standardizes English and Latin transliterations to lowercase.</li>
            </ul>
          </div>

          {/* Subtask 3 & 4 */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider font-mono">
              <Search className="w-4 h-4" />
              <span>Subtasks 3 & 4: Automatic Script Detection & Bidirectional Retrieval</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Detects script by Unicode blocks: Tamil (U+0B80–0BFF), Telugu (U+0C00–0C7F), Kannada (U+0C80–0CFF), Malayalam (U+0D00–0D7F), Devanagari (U+0900–097F), Latin (U+0041–007A).
            </p>
          </div>

          {/* Subtask 5 */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider font-mono">
              <Volume2 className="w-4 h-4" />
              <span>Subtask 5: Speech Synthesis & Bilingual Context</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Integrates Web Speech API with regional IETF BCP-47 locale tags (<code className="text-blue-950 font-mono font-semibold">ta-IN, te-IN, kn-IN, ml-IN, hi-IN, en-US</code>) to synthesize speech pronunciations.
            </p>
          </div>

          {/* Subtask 6 */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Subtask 6: Damerau-Levenshtein & TF-IDF Cosine Fuzzy Matcher</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Blends 60% Damerau-Levenshtein edit-distance (handling character transpositions/swaps) and 40% Scikit-Learn Character N-Gram TF-IDF cosine similarity for spell ranking.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
