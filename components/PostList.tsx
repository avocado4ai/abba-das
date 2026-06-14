'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Sun, Cloud, CloudRain, Wind, Search, Heart, BookmarkX, SearchX, SlidersHorizontal, Clock, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { PostData } from '@/lib/posts';
import ContentTypeBadge from './ContentTypeBadge';
import StoryImage from './StoryImage';

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

const getReadingTime = (content: string) => {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
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
    <div className="space-y-6 sm:space-y-10" role="region" aria-label="סיפורים">
      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3 mb-3 sm:mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">כל הסיפורים</h2>
          <p className="text-sm sm:text-base text-muted-theme">
            {filteredPosts.length === initialPosts.length
              ? `${initialPosts.length} סיפורים זמינים`
              : `${filteredPosts.length} מתוך ${initialPosts.length} סיפורים`}
          </p>
        </div>
        <SlidersHorizontal className="w-5 h-5 text-muted-theme" aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-2.5 sm:gap-4 items-stretch sm:items-center sm:flex-row mb-4 sm:mb-8" role="search">
        <div className="relative flex-grow w-full">
          <label htmlFor="search-posts" className="sr-only">חיפוש סיפורים</label>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 pointer-events-none">
            <Search className="w-4 sm:w-5 h-4 sm:h-5 text-muted-theme" aria-hidden="true" />
          </div>
          <input
            id="search-posts"
            type="text"
            placeholder="חיפוש סיפורים..."
            className="w-full min-h-11 py-2.5 sm:py-3 pr-10 sm:pr-12 pl-3 sm:pl-4 bg-white/5 border border-border-theme rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-sage/50 transition-all duration-250 text-foreground text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="חיפוש סיפורים לפי כותרת או תוכן"
          />
        </div>

        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`flex min-h-11 items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border transition-all duration-250 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-sage/50 text-sm sm:text-base ${
            showFavorites
              ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-sm'
              : 'bg-white/5 border-border-theme text-muted-theme hover:text-red-400 hover:border-red-500/20'
          }`}
          aria-pressed={showFavorites}
          aria-label={showFavorites ? 'הצג את כל הסיפורים' : 'הצג רק סיפורים מועדפים'}
        >
          <Heart className={`w-4 sm:w-5 h-4 sm:h-5 ${showFavorites ? 'fill-current' : ''}`} aria-hidden="true" />
          <span className="font-medium">{showFavorites ? 'כל הסיפורים' : 'מועדפים'}</span>
        </button>
      </div>

      {/* Tags Cloud — horizontal scroll on mobile */}
      {allTags.length > 0 && (
        <div
          className="flex gap-1.5 sm:gap-2 mb-5 sm:mb-12 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-none"
          role="group"
          aria-label="סנן לפי תגיות"
          style={{ scrollbarWidth: 'none' }}
        >
          <button
            onClick={() => setSelectedTag(null)}
            className={`min-h-9 px-3 py-1 rounded-full text-xs font-bold transition-all duration-250 border whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-sage/50 ${
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
              className={`min-h-9 px-3 py-1 rounded-full text-xs font-bold transition-all duration-250 border whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-sage/50 ${
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
        <div className="space-y-6 sm:space-y-10 lg:space-y-12">
          {filteredPosts.map((post, index) => (
            <Link href={`/post/${post.slug}`} key={post.slug}>
              <article
                className="group cursor-pointer overflow-hidden rounded-2xl bg-white/10 dark:bg-white/5 border border-border-theme shadow-sm transition-all duration-300 hover:bg-white/15 dark:hover:bg-white/10 hover:border-sage/30 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] animate-cardEnter"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* Story Image Thumbnail */}
                <div className="h-32 sm:h-48 lg:h-52 overflow-hidden">
                  <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
                    <StoryImage
                      slug={post.slug}
                      title=""
                      src={post.featuredImage?.src}
                      alt={post.featuredImage?.alt || post.title}
                      className="h-full w-full"
                    />
                  </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col gap-2 sm:gap-3 mb-2 sm:mb-4">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-sm sm:text-base font-medium text-muted-theme">
                        {post.date
                          ? format(new Date(post.date), 'dd MMMM yyyy', { locale: he })
                          : 'תאריך לא ידוע'}
                      </span>
                      <div className="hidden sm:block w-1 h-1 rounded-full bg-border-theme" />
                      <WeatherIcon weather={post.weather} />
                      <div className="hidden sm:block w-1 h-1 rounded-full bg-border-theme" />
                      <div className="flex items-center gap-1 text-sm text-muted-theme">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        <span>{getReadingTime(post.content)} דק&apos;</span>
                      </div>
                      {favorites.includes(post.slug) && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-border-theme" />
                          <Heart className="w-3 sm:w-4 h-3 sm:h-4 text-coral fill-current" />
                        </>
                      )}
                    </div>
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs font-bold text-sage opacity-80 bg-sage/10 px-2 sm:px-2.5 py-0.5 rounded-full">#{tag}</span>
                        ))}
                      </div>
                    )}
                    <ContentTypeBadge contentType={post.contentType} category={post.category} size="sm" />
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 sm:mb-3 leading-snug group-hover:text-coral transition-colors duration-250">
                    {post.title}
                  </h3>

                  <p className="font-stories text-base sm:text-lg text-foreground/85 leading-7 sm:leading-relaxed line-clamp-3 mb-4 sm:mb-5">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
                    <div className="w-5 h-5 rounded-full bg-sage/20 flex items-center justify-center">
                      <User className="w-3 h-3 text-sage" aria-hidden="true" />
                    </div>
                    <span className="text-sm text-muted-theme">רוני נאמן</span>
                  </div>
                  <div className="inline-flex items-center text-sm sm:text-base font-bold text-coral group-hover:text-warm-gold transition-colors duration-250 gap-2">
                    קרא עוד
                    <span className="transition-transform duration-250 group-hover:-translate-x-1" aria-hidden="true">←</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-20 bg-white/5 rounded-2xl sm:rounded-3xl border-2 border-dashed border-border-theme animate-fadeInUp" role="status" aria-label="אין סיפורים">
          <div className="flex justify-center mb-4">
            {showFavorites ? (
              <BookmarkX className="w-12 h-12 text-muted-theme/40" aria-hidden="true" />
            ) : search ? (
              <SearchX className="w-12 h-12 text-muted-theme/40" aria-hidden="true" />
            ) : (
              <Image
                src="/images/ui/empty-stories.webp"
                alt="פנקס פתוח ריק על שולחן עץ חם — עוד אין סיפורים כאן"
                width={200}
                height={150}
                className="rounded-xl opacity-70 mx-auto object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>
          <p className="text-muted-theme italic text-base sm:text-lg" aria-live="polite">
            {showFavorites ? 'אין עדיין סיפורים במועדפים' : 'לא נמצאו סיפורים התואמים לחיפוש'}
          </p>
          {showFavorites && (
            <p className="text-muted-theme/60 text-sm sm:text-base mt-2 sm:mt-3">
              לחץ על הלב בסיפור כדי להוסיפו למועדפים
            </p>
          )}
          {!showFavorites && search && (
            <p className="text-muted-theme/60 text-sm sm:text-base mt-2 sm:mt-3">
              נסה לחפש בטקסט שונה או בחר תגית שונה
            </p>
          )}
        </div>
      )}
    </div>
  );
}
