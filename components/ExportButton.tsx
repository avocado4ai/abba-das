'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import Link from 'next/link';
import type { PostData } from '@/lib/posts';

export default function ExportButton({ posts: _ }: { posts: PostData[] }) {
  return (
    <Link
      href="/print"
      title="הדפסה / שמירה כ-PDF"
      className="flex items-center gap-2 px-4 py-2 border border-border-theme text-foreground rounded-full text-sm font-medium hover:border-coral/50 hover:text-coral transition-all duration-250"
    >
      <Printer className="w-4 h-4" />
      <span className="hidden md:inline">PDF / הדפסה</span>
    </Link>
  );
}
