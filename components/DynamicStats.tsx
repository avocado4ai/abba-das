'use client';

import React, { useMemo } from 'react';
import { PostData } from '@/lib/github';

export default function DynamicStats({ posts }: { posts: PostData[] }) {
  const stats = useMemo(() => {
    const count = posts.length;
    const totalWords = posts.reduce((acc, post) => acc + post.content.trim().split(/\s+/).length, 0);
    const readingTime = Math.ceil(totalWords / 200);

    return {
      count,
      readingTime,
    };
  }, [posts]);

  return (
    <div className="w-full max-w-md bg-gradient-to-br from-white/5 to-white/10 border border-border-theme rounded-3xl p-8 relative overflow-hidden group hover:border-coral/30 transition-all duration-500 shadow-sm hover:shadow-md">
      {/* Background decoration with new colors */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-coral/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-coral/10 transition-colors" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-warm-gold/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl group-hover:bg-warm-gold/10 transition-colors" />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-teal/5 rounded-full blur-2xl group-hover:bg-teal/10 transition-colors" />

      <div className="grid grid-cols-2 gap-8 relative z-10">
        <div className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-coral to-warm-gold bg-clip-text text-transparent mb-1">{stats.count}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-theme">סיפורים</div>
        </div>

        <div className="flex items-center justify-center">
          <div className="h-12 w-px bg-gradient-to-b from-coral/30 via-warm-gold/30 to-teal/30" />
        </div>

        <div className="text-center absolute left-1/2 -translate-x-1/2 w-full flex justify-between px-8">
           {/* Re-centering for symmetry */}
        </div>

        <div className="text-center col-start-2">
          <div className="text-4xl font-bold bg-gradient-to-r from-teal to-sage bg-clip-text text-transparent mb-1">{stats.readingTime}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-theme">דקות קריאה</div>
        </div>
      </div>
    </div>
  );
}
