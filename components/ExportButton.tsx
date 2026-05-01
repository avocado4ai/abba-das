'use client';

import React from 'react';
import { Download, Printer } from 'lucide-react';
import { PostData } from '@/lib/github';
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
        className="flex items-center gap-2 px-4 py-2 bg-white border border-navy/10 text-navy rounded-full text-sm font-medium hover:bg-navy/5 transition-all shadow-sm"
      >
        <Download className="w-4 h-4" />
        <span className="hidden md:inline">JSON</span>
      </button>
      
      <Link
        href="/print"
        title="הדפסה / שמירה כ-PDF"
        className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-full text-sm font-medium hover:bg-navy/90 transition-all shadow-sm"
      >
        <Printer className="w-4 h-4" />
        <span className="hidden md:inline">PDF / הדפסה</span>
      </Link>
    </div>
  );
}
