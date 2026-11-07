'use client';

import React, { useState } from 'react';
import { DictionaryEntry } from '@/lib/types';
import { SUPPORTED_LANGUAGES } from '@/lib/dataset';
import { AudioPlayerButton } from './AudioPlayerButton';
import {
  Copy,
  Check,
  Bookmark,
  Share2,
  BookOpen,
  Quote,
  Tag,
  Layers,
} from 'lucide-react';

interface WordDetailCardProps {
  entry: DictionaryEntry;
  onTagClick?: (tag: string) => void;
}

export const WordDetailCard: React.FC<WordDetailCardProps> = ({
  entry,
  onTagClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === entry.language);

  const handleCopy = () => {
    const textToCopy = `${entry.target} (${entry.transliteration}) - ${entry.english}\nMeaning: ${entry.englishMeaning}\nLocal: ${entry.targetMeaning}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${entry.english} - Bilingual Dictionary`,
        text: `${entry.target} (${entry.transliteration}): ${entry.englishMeaning}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Top Accent Strip in Navy */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-900" />

      {/* Header: Language info, Part of speech, Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-800">
            <span>{langInfo?.flag}</span>
            <span>{langInfo?.name}</span>
            <span className="text-blue-900 font-mono font-semibold">
              ({langInfo?.nativeName})
            </span>
          </div>

          <span className="capitalize px-2 py-1 rounded-md bg-blue-50 text-blue-900 text-xs font-mono font-medium flex items-center gap-1 border border-blue-100">
            <Layers className="w-3 h-3" />
            {entry.partOfSpeech}
          </span>

          <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {entry.category}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            type="button"
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this word'}
            className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
              isBookmarked
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            type="button"
            title="Copy definition"
            className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleShare}
            type="button"
            title="Share"
            className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Word Section */}
      <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Native Target Language Word */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-blue-900 font-bold font-mono">
            Native Expression
          </span>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
              {entry.target}
            </h2>
            <AudioPlayerButton
              text={entry.target}
              language={entry.language}
              label="Listen"
              size="sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base text-blue-800 font-mono font-medium">
              /{entry.transliteration}/
            </span>
            {entry.pronunciationIpa && (
              <span className="text-xs text-slate-500 font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                IPA: {entry.pronunciationIpa}
              </span>
            )}
          </div>
        </div>

        {/* English Translation */}
        <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 pt-5 md:pt-0">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold font-mono flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            English Translation
          </span>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 capitalize">
              {entry.english}
            </h2>
            <AudioPlayerButton
              text={entry.english}
              language="en"
              label="Listen"
              size="sm"
            />
          </div>
          <p className="text-xs text-slate-500">
            Bidirectional semantic cross-reference verified
          </p>
        </div>
      </div>

      {/* Definitions */}
      <div className="space-y-3 pt-5 border-t border-slate-100">
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-1.5">
            English Definition & Meaning
          </h4>
          <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            {entry.englishMeaning}
          </p>
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-1.5">
            Local Language Meaning ({langInfo?.nativeName})
          </h4>
          <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            {entry.targetMeaning}
          </p>
        </div>
      </div>

      {/* Example Sentences */}
      {entry.examples && entry.examples.length > 0 && (
        <div className="pt-5 border-t border-slate-100 mt-5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Quote className="w-3.5 h-3.5 text-blue-900" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Contextual Example Sentences
            </h4>
          </div>
          <div className="space-y-2">
            {entry.examples.map((ex, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium text-slate-900">
                    {ex.target}
                  </span>
                  <AudioPlayerButton
                    text={ex.target}
                    language={entry.language}
                    size="sm"
                  />
                </div>
                {ex.transliteration && (
                  <div className="text-xs text-blue-800 font-mono">
                    {ex.transliteration}
                  </div>
                )}
                <div className="text-xs text-slate-600 flex items-start justify-between gap-3 pt-1 border-t border-slate-200/60">
                  <span>{ex.english}</span>
                  <AudioPlayerButton text={ex.english} language="en" size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synonyms & Antonyms */}
      {((entry.synonyms && entry.synonyms.length > 0) || (entry.antonyms && entry.antonyms.length > 0)) && (
        <div className="pt-5 border-t border-slate-100 mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {entry.synonyms && entry.synonyms.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono block mb-1.5">
                Synonyms
              </span>
              <div className="flex flex-wrap gap-1.5">
                {entry.synonyms.map((syn, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onTagClick?.(syn)}
                    className="text-xs px-2.5 py-0.5 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200 transition-colors cursor-pointer"
                  >
                    {syn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {entry.antonyms && entry.antonyms.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono block mb-1.5">
                Antonyms
              </span>
              <div className="flex flex-wrap gap-1.5">
                {entry.antonyms.map((ant, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onTagClick?.(ant)}
                    className="text-xs px-2.5 py-0.5 rounded bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-800 border border-slate-200 transition-colors cursor-pointer"
                  >
                    {ant}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
