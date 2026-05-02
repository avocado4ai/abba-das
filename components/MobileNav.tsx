'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Download, BarChart3 } from 'lucide-react';
import { PostData } from '@/lib/github';

export default function MobileNav({ posts }: { posts: PostData[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = () => {
    const data = JSON.stringify(posts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abba-stories-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-coral/10 transition-colors duration-250 text-foreground"
        aria-label={isOpen ? 'סגור תפריט' : 'פתח תפריט'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-coral" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-48 bg-background/95 backdrop-blur-md border border-border-theme rounded-2xl shadow-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            href="/guestbook"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-coral/10 transition-colors duration-250 text-sm font-medium text-foreground"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-coral">📖</span>
            ספר אורחים
          </Link>

          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-warm-gold/10 transition-colors duration-250 text-sm font-medium text-foreground text-right"
          >
            <Download className="w-4 h-4 text-warm-gold" />
            JSON
          </button>

          <Link
            href="/print"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal/10 transition-colors duration-250 text-sm font-medium text-foreground"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-teal">🖨️</span>
            הדפסה / PDF
          </Link>

          <hr className="border-border-theme my-2" />

          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-navy/10 transition-colors duration-250 text-sm font-medium text-foreground"
            onClick={() => setIsOpen(false)}
          >
            <BarChart3 className="w-4 h-4" />
            ניהול
          </Link>
        </div>
      )}
    </div>
  );
}
