'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

export default function FavoriteButton({ slug }: { slug: string }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('abba_favorites') || '[]');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFavorite(favorites.includes(slug));
  }, [slug]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('abba_favorites') || '[]');
    let newFavorites;
    if (favorites.includes(slug)) {
      newFavorites = favorites.filter((s: string) => s !== slug);
      setIsFavorite(false);
    } else {
      newFavorites = [...favorites, slug];
      setIsFavorite(true);
    }
    localStorage.setItem('abba_favorites', JSON.stringify(newFavorites));
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`min-h-11 min-w-11 p-2.5 sm:p-3 rounded-full border transition-all ${
        isFavorite 
          ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-sm' 
          : 'bg-white/5 border-border-theme text-muted-theme hover:text-red-400 hover:border-red-500/20'
      }`}
      title={isFavorite ? 'הסר מהמועדפים' : 'הוסף למועדפים'}
      aria-label={isFavorite ? 'הסר מהמועדפים' : 'הוסף למועדפים'}
    >
      <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${isFavorite ? 'fill-current' : ''}`} />
    </button>
  );
}
