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
      className={`p-3 rounded-full border transition-all ${
        isFavorite 
          ? 'bg-red-50 border-red-200 text-red-500 shadow-sm' 
          : 'bg-white border-navy/10 text-navy/40 hover:text-red-400 hover:border-red-200'
      }`}
      title={isFavorite ? 'הסר מהמועדפים' : 'הוסף למועדפים'}
    >
      <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
    </button>
  );
}
