'use client';

import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { LanguageCode } from '@/lib/types';
import { SUPPORTED_LANGUAGES } from '@/lib/dataset';

interface AudioPlayerButtonProps {
  text: string;
  language: LanguageCode | 'en';
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({
  text,
  language,
  label,
  className = '',
  size = 'md',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!text || !text.trim()) return;

    // If currently playing, pause/stop
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    const langCode = language === 'en' ? 'en' : language;
    const ttsUrl = `/api/tts?text=${encodeURIComponent(text.trim())}&lang=${encodeURIComponent(langCode)}`;

    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(ttsUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setIsLoading(false);
      };

      audio.onerror = () => {
        fallbackWebSpeech();
      };

      await audio.play();
    } catch {
      fallbackWebSpeech();
    }
  };

  const fallbackWebSpeech = () => {
    setIsLoading(false);
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsPlaying(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      if (language === 'en') {
        utterance.lang = 'en-US';
        utterance.rate = 0.95;
      } else {
        const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === language);
        utterance.lang = langConfig ? langConfig.speechCode : 'hi-IN';
        utterance.rate = 0.9;
      }

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlaying(false);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-xs sm:text-sm',
    lg: 'p-2.5 text-sm',
  };

  return (
    <button
      onClick={speak}
      type="button"
      title={`Listen to pronunciation of "${text}"`}
      className={`inline-flex items-center gap-1.5 rounded-md transition-colors cursor-pointer ${
        isPlaying
          ? 'bg-blue-900 text-white shadow-xs'
          : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200'
      } ${sizeClasses[size]} ${className}`}
    >
      {isLoading ? (
        <Loader2 className={`animate-spin ${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4 h-4' : 'w-4 h-4'}`} />
      ) : isPlaying ? (
        <VolumeX className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4 h-4' : 'w-4 h-4'} />
      ) : (
        <Volume2 className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4 h-4' : 'w-4 h-4'} />
      )}
      {label && <span className="font-medium">{isLoading ? 'Loading...' : isPlaying ? 'Playing' : label}</span>}
    </button>
  );
};
