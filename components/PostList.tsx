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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('abba_favorites') || '[]');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(stored);
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    initialPosts.forEach(post => {
      post.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [initialPosts]);

  const filteredPosts = useMemo(() => {
    let posts = initialPosts;
    
    if (showFavorites) {
      posts = posts.filter(post => favorites.includes(post.slug));
    }

    if (selectedTag) {
      posts = posts.filter(post => post.tags?.includes(selectedTag));
    }

    if (!search) return posts;
    
    const s = search.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(s) ||
        post.content.toLowerCase().includes(s)
    );
  }, [initialPosts, search, showFavorites, favorites, selectedTag]);

  return (
    <div className="space-y-12" role="region" aria-label="סיפורים">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-8" role="search">
        <div className="relative flex-grow w-full">
          <label htmlFor="search-posts" className="sr-only">חיפוש סיפורים</label>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <Search className="w-5 h-5 text-muted-theme" aria-hidden="true" />
          </div>
          <input
            id="search-posts"
            type="text"
            placeholder="חיפוש סיפורים..."
            className="w-full py-3 pr-12 pl-4 bg-white/5 border border-border-theme rounded-2xl focus:outline-none focus:ring-2 focus:ring-sage/50 transition-all text-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="חיפוש סיפורים לפי כותרת או תוכן"
          />
        </div>
        
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-sage/50 ${
            showFavorites
              ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-sm'
              : 'bg-white/5 border-border-theme text-muted-theme hover:text-red-400 hover:border-red-500/20'
          }`}
          aria-pressed={showFavorites}
          aria-label={showFavorites ? 'הצג את כל הסיפורים' : 'הצג רק סיפורים מועדפים'}
        >
          <Heart className={`w-5 h-5 ${showFavorites ? 'fill-current' : ''}`} aria-hidden="true" />
          <span className="font-medium">{showFavorites ? 'כל הסיפורים' : 'מועדפים'}</span>
        </button>
      </div>

      {/* Tags Cloud */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-12" role="group" aria-label="סנן לפי תגיות">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all border focus:outline-none focus:ring-2 focus:ring-sage/50 ${
              !selectedTag
                ? 'bg-sage text-cream border-sage'
                : 'bg-white/5 text-muted-theme border-border-theme hover:border-sage/30'
            }`}
            aria-pressed={!selectedTag}
            aria-label="הצג את כל התגיות"
          >
            הכל
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border focus:outline-none focus:ring-2 focus:ring-sage/50 ${
                tag === selectedTag
                  ? 'bg-sage text-cream border-sage shadow-sm'
                  : 'bg-white/5 text-muted-theme border-border-theme hover:border-sage/30 hover:text-sage'
              }`}
              aria-pressed={tag === selectedTag}
              aria-label={`${tag === selectedTag ? 'הסר' : 'סנן'} לפי תגית ${tag}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => (
          <Link href={`/post/${post.slug}`} key={post.slug}>
            <article className="group cursor-pointer p-8 rounded-2xl bg-white/5 border border-border-theme transition-all duration-300 hover:bg-white/10 hover:border-sage/30 hover:shadow-lg hover:-translate-y-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-xs md:text-sm font-medium text-muted-theme">
                  {post.date
                    ? format(new Date(post.date), 'dd MMMM yyyy', { locale: he })
                    : 'תאריך לא ידוע'}
                </span>
                <div className="w-1 h-1 rounded-full bg-border-theme" />
                <WeatherIcon weather={post.weather} />
                {post.tags?.map(tag => (
                  <span key={tag} className="text-[10px] font-bold text-sage opacity-70 bg-sage/10 px-2 py-1 rounded-full">#{tag}</span>
                ))}
                {favorites.includes(post.slug) && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-border-theme" />
                    <Heart className="w-4 h-4 text-red-400 fill-current" />
                  </>
                )}
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-sage transition-colors">
                {post.title}
              </h3>

              <p className="font-stories text-base md:text-lg text-foreground/75 leading-relaxed line-clamp-3 mb-5">
                {post.content}
              </p>

              <div className="inline-flex items-center text-sm font-bold text-sage group-hover:text-navy transition-colors gap-2">
                קרא עוד
                <span className="transition-transform group-hover:translate-x-1">←</span>
              </div>
            </article>
          </Link>
        ))
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-border-theme" role="status" aria-label="אין סיפורים">
          <p className="text-muted-theme italic text-lg" aria-live="polite">
            {showFavorites ? '🤍 אין עדיין סיפורים במועדפים...' : '🔍 לא נמצאו סיפורים התואמים לחיפוש...'}
          </p>
          {showFavorites && (
            <p className="text-muted-theme/60 text-sm mt-3">
              בחר על סיפורים כדי להוסיף אותם למועדפים
            </p>
          )}
          {!showFavorites && search && (
            <p className="text-muted-theme/60 text-sm mt-3">
              נסה לחפש בטקסט שונה או בחר תגית שונה
            </p>
          )}
        </div>
      )}
    </div>
  );
}
