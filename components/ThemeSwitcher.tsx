'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Scroll, Palette } from 'lucide-react';

type Theme = 'classic' | 'dark' | 'paper';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('classic');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('abba_theme') as Theme;
    if (savedTheme) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('abba_theme', newTheme);
    setIsOpen(false);
  };

  const themes: { id: Theme; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'classic', label: 'קלאסי', icon: <Sun className="w-4 h-4" />, color: 'bg-[#F5F5F1]' },
    { id: 'dark', label: 'כהה', icon: <Moon className="w-4 h-4" />, color: 'bg-[#0A2647]' },
    { id: 'paper', label: 'נייר', icon: <Scroll className="w-4 h-4" />, color: 'bg-[#E8E2D2]' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-coral/10 transition-all duration-250 text-foreground/60 hover:text-coral border border-transparent hover:border-coral/20"
        title="החלף ערכת נושא"
        aria-label={isOpen ? 'סגור בחירת נושא' : 'פתח בחירת נושא'}
        aria-expanded={isOpen}
      >
        <Palette className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-44 bg-background/95 backdrop-blur-md rounded-2xl shadow-lg border border-border-theme/50 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
            <div className="p-2 space-y-1">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => changeTheme(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-250 ${
                    theme === t.id
                      ? 'bg-coral/20 text-coral border border-coral/30'
                      : 'text-foreground/70 hover:bg-warm-gold/10 hover:text-warm-gold border border-transparent'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${t.color} ${theme === t.id ? 'ring-2 ring-coral ring-offset-1' : 'border-border-theme/30'}`}>
                    {t.icon}
                  </div>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
