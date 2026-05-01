'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { PostData } from '@/lib/github';

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
    <button
      onClick={exportToJson}
      className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-full text-sm font-medium hover:bg-navy/90 transition-all shadow-sm"
    >
      <Download className="w-4 h-4" />
      ייצוא כל הסיפורים (JSON)
    </button>
  );
}
