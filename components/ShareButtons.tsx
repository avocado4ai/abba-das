'use client';

import React from 'react';
import { Share2, MessageCircle } from 'lucide-react';

export default function ShareButtons({ title, slug }: { title: string, slug: string }) {
  const url = typeof window !== 'undefined' ? `${window.location.origin}/post/${slug}` : '';

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`תראו איזה סיפור יפה אבא כתב: "${title}"\n\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="flex sm:flex-row sm:items-center gap-2.5 sm:gap-3 mt-10 sm:mt-12 mb-8">
      <span className="text-sm font-medium text-navy/50 flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        שיתוף:
      </span>
      
      <button
        onClick={shareToWhatsApp}
        className="flex min-h-11 items-center justify-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full text-sm font-medium hover:bg-[#25D366]/90 transition-all shadow-sm"
      >
        <MessageCircle className="w-4 h-4" />
        וואטסאפ
      </button>
    </div>
  );
}
