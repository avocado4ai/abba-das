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
    <div className="w-full max-w-md bg-white/5 border border-border-theme rounded-3xl p-8 relative overflow-hidden group hover:border-sage/30 transition-all duration-500">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-sage/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-sage/10 transition-colors" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-navy/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl group-hover:bg-navy/10 transition-colors" />

      <div className="grid grid-cols-2 gap-8 relative z-10">
        <div className="text-center">
          <div className="text-4xl font-bold text-navy mb-1">{stats.count}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-theme">סיפורים</div>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="h-12 w-px bg-border-theme opacity-30" />
        </div>

        <div className="text-center absolute left-1/2 -translate-x-1/2 w-full flex justify-between px-8">
           {/* Re-centering for symmetry */}
        </div>

        <div className="text-center col-start-2">
          <div className="text-4xl font-bold text-sage mb-1">{stats.readingTime}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-theme">דקות קריאה</div>
        </div>
      </div>
    </div>
  );
}
