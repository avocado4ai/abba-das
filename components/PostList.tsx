'use client';

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Sun, Cloud, CloudRain, Wind, Search } from 'lucide-react';
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

  const filteredPosts = useMemo(() => {
    if (!search) return initialPosts;
    const s = search.toLowerCase();
    return initialPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(s) ||
        post.content.toLowerCase().includes(s)
    );
  }, [initialPosts, search]);

  return (
    <div className="space-y-12">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto mb-12">
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <Search className="w-5 h-5 text-navy/30" />
        </div>
        <input
          type="text"
          placeholder="חיפוש סיפורים..."
          className="w-full py-3 pr-12 pl-4 bg-white/50 border border-navy/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sage/50 transition-all text-navy"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => (
          <article key={post.slug} className="group">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-medium text-navy/40">
                {post.date
                  ? format(new Date(post.date), 'dd MMMM yyyy', { locale: he })
                  : 'תאריך לא ידוע'}
              </span>
              <div className="w-1 h-1 rounded-full bg-navy/20" />
              <WeatherIcon weather={post.weather} />
            </div>

            <Link href={`/post/${post.slug}`}>
              <h3 className="text-2xl font-bold text-navy mb-4 group-hover:text-sage transition-colors cursor-pointer">
                {post.title}
              </h3>
            </Link>

            <div className="font-stories text-lg text-navy/80 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>

            <div className="mt-8 h-px bg-navy/10 w-24 group-last:hidden" />
          </article>
        ))
      ) : (
        <div className="text-center py-20">
          <p className="text-navy/50 italic">לא נמצאו סיפורים התואמים לחיפוש...</p>
        </div>
      )}
    </div>
  );
}
