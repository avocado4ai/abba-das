import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { PostData } from '@/lib/github';

export default function PostNavigation({ 
  next, 
  prev 
}: { 
  next: PostData | null, 
  prev: PostData | null 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16 pt-8 border-t border-border-theme">
      {prev ? (
        <Link 
          href={`/post/${prev.slug}`}
          className="flex flex-col items-start p-6 rounded-2xl bg-white/5 border border-border-theme hover:border-sage transition-all group"
        >
          <span className="flex items-center gap-2 text-sm text-muted-theme mb-2">
            <ArrowRight className="w-4 h-4" />
            הסיפור הקודם
          </span>
          <span className="text-lg font-bold text-navy group-hover:text-sage transition-colors line-clamp-1">
            {prev.title}
          </span>
        </Link>
      ) : <div />}

      {next ? (
        <Link 
          href={`/post/${next.slug}`}
          className="flex flex-col items-end p-6 rounded-2xl bg-white/5 border border-border-theme hover:border-sage transition-all group text-left"
        >
          <span className="flex items-center gap-2 text-sm text-muted-theme mb-2">
            הסיפור הבא
            <ArrowLeft className="w-4 h-4" />
          </span>
          <span className="text-lg font-bold text-navy group-hover:text-sage transition-colors line-clamp-1">
            {next.title}
          </span>
        </Link>
      ) : <div />}
    </div>
  );
}
