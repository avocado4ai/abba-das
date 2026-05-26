'use client';

import React from 'react';
import { Download, Printer } from 'lucide-react';
import type { PostData } from '@/lib/posts';
import Link from 'next/link';

export default function ExportButton({ posts }: { posts: PostData[] }) {
  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(posts, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `abba-das-stories-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportToJson}
        title="ייצוא ל-JSON"
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-warm-gold/10 to-coral/10 border border-warm-gold/30 text-warm-gold rounded-full text-sm font-medium hover:from-warm-gold/20 hover:to-coral/20 hover:border-warm-gold/50 transition-all duration-250 shadow-sm hover:shadow-md"
      >
        <Download className="w-4 h-4" />
        <span className="hidden md:inline">JSON</span>
      </button>

      <Link
        href="/print"
        title="הדפסה / שמירה כ-PDF"
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-navy to-navy/80 text-cream rounded-full text-sm font-medium hover:from-navy/90 hover:to-navy/70 transition-all duration-250 shadow-sm hover:shadow-md"
      >
        <Printer className="w-4 h-4" />
        <span className="hidden md:inline">PDF / הדפסה</span>
      </Link>
    </div>
  );
}
