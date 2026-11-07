'use client';

import React from 'react';
import { BookA, Cpu, Plus } from 'lucide-react';

interface NavbarProps {
  onOpenNLPModal: () => void;
  onOpenAddWordModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNLPModal,
  onOpenAddWordModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-950 flex items-center justify-center text-white shadow-xs">
            <BookA className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 font-mono">
                BiDict
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono font-medium">
                Indic NLP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Bilingual Lexicon & Semantic Retrieval System
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNLPModal}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-blue-700" />
            <span>Architecture</span>
          </button>

          <button
            onClick={onOpenAddWordModal}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Word</span>
          </button>
        </div>
      </div>
    </header>
  );
};
