'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Sun, Cloud, CloudRain, Wind, Search, Heart } from 'lucide-react';
import Link from 'next/link';
import { PostData } from '@/lib/github';

const WeatherIcon = ({ weather }: { weather?: string }) => {
  switch (weather?.toLowerCase()) {
    case 'sunny':
      return <Sun className="w-5 h-5 text-yellow-500" />;
    case 'cloudy':
      return <Cloud className="w-5 h-5 text-gray-400" />;
    case 'rainy':
      return <CloudRain className="w-5 h-5 text-blue-400" />;
    case 'windy':
      return <Wind className="w-5 h-5 text-teal-400" />;
    default:
      return <Sun className="w-5 h-5 text-yellow-500" />;
  }
};

export default function PostList({ initialPosts }: { initialPosts: PostData[] }) {
  const [search, setSearch] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('abba_favorites') || '[]');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(stored);
  }, []);

  const filteredPosts = useMemo(() => {
    let posts = initialPosts;
    
    if (showFavorites) {
      posts = posts.filter(post => favorites.includes(post.slug));
    }

    if (!search) return posts;
    
    const s = search.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(s) ||
        post.content.toLowerCase().includes(s)
    );
  }, [initialPosts, search, showFavorites, favorites]);

  return (
    <div className="space-y-12">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-12">
        <div className="relative flex-grow w-full">
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <Search className="w-5 h-5 text-muted-theme" />
          </div>
          <input
            type="text"
            placeholder="חיפוש סיפורים..."
            className="w-full py-3 pr-12 pl-4 bg-white/5 border border-border-theme rounded-2xl focus:outline-none focus:ring-2 focus:ring-sage/50 transition-all text-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all whitespace-nowrap ${
            showFavorites 
              ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-sm' 
              : 'bg-white/5 border-border-theme text-muted-theme hover:text-red-400 hover:border-red-500/20'
          }`}
        >
          <Heart className={`w-5 h-5 ${showFavorites ? 'fill-current' : ''}`} />
          <span className="font-medium">{showFavorites ? 'כל הסיפורים' : 'מועדפים'}</span>
        </button>
      </div>

      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => (
          <article key={post.slug} className="group">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-medium text-muted-theme">
                {post.date
                  ? format(new Date(post.date), 'dd MMMM yyyy', { locale: he })
                  : 'תאריך לא ידוע'}
              </span>
              <div className="w-1 h-1 rounded-full bg-border-theme" />
              <WeatherIcon weather={post.weather} />
              {favorites.includes(post.slug) && (
                <>
                  <div className="w-1 h-1 rounded-full bg-border-theme" />
                  <Heart className="w-4 h-4 text-red-400 fill-current" />
                </>
              )}
            </div>

            <Link href={`/post/${post.slug}`}>
              <h3 className="text-2xl font-bold text-navy mb-4 group-hover:text-sage transition-colors cursor-pointer">
                {post.title}
              </h3>
            </Link>

            <div className="font-stories text-lg text-foreground/80 leading-relaxed whitespace-pre-wrap line-clamp-4">
              {post.content}
            </div>
            
            <Link 
              href={`/post/${post.slug}`}
              className="inline-block mt-4 text-sm font-bold text-sage hover:text-navy transition-colors"
            >
              קרא עוד ←
            </Link>

            <div className="mt-12 h-px bg-border-theme w-full opacity-30 group-last:hidden" />
          </article>
        ))
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-border-theme">
          <p className="text-muted-theme italic">
            {showFavorites ? 'אין עדיין סיפורים במועדפים...' : 'לא נמצאו סיפורים התואמים לחיפוש...'}
          </p>
        </div>
      )}
    </div>
  );
}
