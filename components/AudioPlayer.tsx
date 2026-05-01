'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

export default function AudioPlayer({ text }: { text: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'he-IL';
    u.onend = () => setIsPlaying(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUtterance(u);

    return () => {
      synth.cancel();
    };
  }, [text]);

  const togglePlay = () => {
    const synth = window.speechSynthesis;
    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
    } else {
      if (synth.paused) {
        synth.resume();
      } else {
        synth.speak(utterance!);
      }
      setIsPlaying(true);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center gap-3 bg-sage/5 border border-sage/10 rounded-full px-4 py-2 mt-6">
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-sage text-cream flex items-center justify-center hover:bg-navy transition-all shadow-sm"
        title={isPlaying ? 'השהה' : 'הקרא סיפור'}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
      </button>
      
      <div className="flex flex-col">
        <span className="text-xs font-bold text-navy uppercase tracking-wider">הקראת סיפור</span>
        <span className="text-[10px] text-muted-theme">מופעל ע&quot;י בינה מלאכותית מקומית</span>
      </div>

      {isPlaying && (
        <button
          onClick={stop}
          className="ml-auto text-muted-theme hover:text-red-500 transition-colors"
          title="עצור"
        >
          <VolumeX className="w-4 h-4" />
        </button>
      )}
      {!isPlaying && <Volume2 className="ml-auto w-4 h-4 text-sage opacity-40" />}
    </div>
  );
}
