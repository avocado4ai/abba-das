import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import type { PostData } from '@/lib/posts';

export default function PostNavigation({
  next,
  prev,
}: {
  next: PostData | null;
  prev: PostData | null;
}) {
  return (
    <nav aria-label="ניווט בין סיפורים" className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-border-theme">
      {prev ? (
        <Link
          href={`/post/${prev.slug}`}
          className="group flex flex-col gap-2 p-4 sm:p-5 rounded-2xl bg-white/5 border border-border-theme hover:border-sage/40 hover:bg-sage/5 transition-all duration-250 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-theme">
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            הסיפור הקודם
          </span>
          <span className="text-base sm:text-lg font-bold text-foreground group-hover:text-sage transition-colors duration-250 line-clamp-2 leading-snug">
            {prev.title}
          </span>
          {prev.date && (
            <span className="flex items-center gap-1 text-[10px] text-muted-theme/60 mt-auto">
              <BookOpen className="w-3 h-3" aria-hidden="true" />
              {format(new Date(prev.date), 'dd MMM yyyy', { locale: he })}
            </span>
          )}
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/post/${next.slug}`}
          className="group flex flex-col gap-2 p-4 sm:p-5 rounded-2xl bg-white/5 border border-border-theme hover:border-coral/40 hover:bg-coral/5 transition-all duration-250 hover:-translate-y-0.5 shadow-sm hover:shadow-md md:text-left"
        >
          <span className="flex items-center justify-end gap-1.5 text-xs font-medium text-muted-theme md:justify-start md:flex-row-reverse">
            הסיפור הבא
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <span className="text-base sm:text-lg font-bold text-foreground group-hover:text-coral transition-colors duration-250 line-clamp-2 leading-snug">
            {next.title}
          </span>
          {next.date && (
            <span className="flex items-center justify-end gap-1 text-[10px] text-muted-theme/60 mt-auto md:justify-start">
              <BookOpen className="w-3 h-3" aria-hidden="true" />
              {format(new Date(next.date), 'dd MMM yyyy', { locale: he })}
            </span>
          )}
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
