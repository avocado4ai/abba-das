'use client';

import React, { useState } from 'react';
import { Share2, Link as LinkIcon, MessageCircle, Check } from 'lucide-react';

export default function ShareButtons({ title, slug }: { title: string, slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/post/${slug}` : '';

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`תראו איזה סיפור יפה אבא כתב: "${title}"\n\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 mt-12 mb-8">
      <span className="text-sm font-medium text-navy/40 flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        שיתוף:
      </span>
      
      <button
        onClick={shareToWhatsApp}
        className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full text-sm font-medium hover:bg-[#25D366]/90 transition-all shadow-sm"
      >
        <MessageCircle className="w-4 h-4" />
        וואטסאפ
      </button>

      <button
        onClick={copyToClipboard}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-navy/10 text-navy rounded-full text-sm font-medium hover:bg-navy/5 transition-all shadow-sm"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
        {copied ? 'הועתק!' : 'העתקת קישור'}
      </button>
    </div>
  );
}
