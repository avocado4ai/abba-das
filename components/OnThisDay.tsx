'use client';

import React, { useMemo } from 'react';
import type { PostData } from '@/lib/posts';
import Link from 'next/link';
import { CalendarDays, ArrowLeft } from 'lucide-react';

export default function OnThisDay({ posts }: { posts: PostData[] }) {
  const matchingPost = useMemo(() => {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    // Find a post from the same month and day, but in a different year
    return posts.find(post => {
      const postDate = new Date(post.date);
      return (
        postDate.getMonth() === todayMonth &&
        postDate.getDate() === todayDay &&
        postDate.getFullYear() < today.getFullYear()
      );
    });
  }, [posts]);

  if (!matchingPost) return null;

  const yearsAgo = new Date().getFullYear() - new Date(matchingPost.date).getFullYear();

  return (
    <div className="mb-10 sm:mb-14 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
      <div className="bg-sage/5 border border-sage/20 rounded-2xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <CalendarDays className="w-16 h-16 text-sage" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block px-3 py-1 bg-sage text-cream text-[10px] font-bold uppercase tracking-widest rounded-full">
              היום לפני {yearsAgo} {yearsAgo === 1 ? 'שנה' : 'שנים'}
            </span>
          </div>
          
          <h3 className="text-2xl font-bold text-navy mb-3">
            {matchingPost.title}
          </h3>
          
          <div className="font-stories text-lg text-foreground/80 leading-relaxed line-clamp-2 mb-6">
            {matchingPost.content}
          </div>
          
          <Link 
            href={`/post/${matchingPost.slug}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-sage hover:text-navy transition-colors"
          >
            קראו את הזיכרון המלא
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
