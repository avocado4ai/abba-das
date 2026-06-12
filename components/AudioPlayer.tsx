'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

const SPEEDS = [1, 1.25, 1.5, 0.75];

export default function AudioPlayer({ text }: { text: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const rate = SPEEDS[speedIndex];

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'he-IL';
    u.rate = rate;
    u.onend = () => setIsPlaying(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUtterance(u);

    return () => {
      synth.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, rate]);

  const togglePlay = () => {
    const synth = window.speechSynthesis;
    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
    } else {
      if (synth.paused) {
        synth.resume();
      } else {
        if (utterance) synth.speak(utterance);
      }
      setIsPlaying(true);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const cycleSpeed = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setSpeedIndex((i) => (i + 1) % SPEEDS.length);
  };

  return (
    <div
      className="inline-flex items-center gap-2 sm:gap-3 bg-sage/8 border border-sage/15 rounded-full px-3 sm:px-4 py-2 mt-4 sm:mt-6 shadow-sm"
      role="toolbar"
      aria-label="נגן הקראה"
    >
      <button
        onClick={togglePlay}
        className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-sage text-cream flex items-center justify-center hover:bg-coral transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-sage/50"
        aria-label={isPlaying ? 'השהה הקראה' : 'הקרא סיפור'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-0.5" />
        )}
      </button>

      <div className="flex flex-col leading-none">
        <span className="text-[10px] sm:text-xs font-bold text-foreground tracking-wider">הקראת סיפור</span>
        <span className="text-[9px] sm:text-[10px] text-muted-theme">בינה מלאכותית • עברית</span>
      </div>

      <button
        onClick={cycleSpeed}
        className="text-[10px] sm:text-xs font-bold text-sage bg-sage/10 hover:bg-sage/20 px-2 py-1 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage/50 tabular-nums"
        aria-label={`מהירות נוכחית: ${rate}x — לחץ לשינוי`}
        title="שנה מהירות"
      >
        {rate}×
      </button>

      {isPlaying ? (
        <button
          onClick={stop}
          className="text-muted-theme hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/50 rounded-full p-1"
          aria-label="עצור הקראה"
        >
          <VolumeX className="w-4 h-4" />
        </button>
      ) : (
        <Volume2 className="w-4 h-4 text-sage/40" aria-hidden="true" />
      )}
    </div>
  );
}
