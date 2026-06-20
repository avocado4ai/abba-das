'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Download, BarChart3, BookOpen, Printer, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PostData } from '@/lib/posts';

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
        className="p-2 rounded-full hover:bg-coral/10 transition-colors duration-250 text-foreground cursor-pointer"
        aria-label={isOpen ? 'סגור תפריט' : 'פתח תפריט'}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6 text-coral" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ opacity: 0, rotate: 90, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.7 }}
              transition={{ duration: 0.15 }}
            >
              <Menu className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              role="menu"
              className="fixed inset-x-4 top-14 bg-background/98 backdrop-blur-md border border-border-theme rounded-2xl shadow-xl p-2 space-y-0.5 z-50 origin-top-right"
              initial={{ opacity: 0, scale: 0.92, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href="/guestbook"
                role="menuitem"
                className="flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-coral/10 transition-colors duration-200 text-base font-medium text-foreground cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <BookOpen className="w-4 h-4 text-coral shrink-0" aria-hidden="true" />
                ספר אורחים
              </Link>

              <Link
                href="/gallery"
                role="menuitem"
                className="flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-coral/10 transition-colors duration-200 text-base font-medium text-foreground cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <Camera className="w-4 h-4 text-coral shrink-0" aria-hidden="true" />
                גלריה
              </Link>

              <button
                onClick={handleExport}
                role="menuitem"
                className="w-full flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-warm-gold/10 transition-colors duration-200 text-base font-medium text-foreground text-right cursor-pointer"
              >
                <Download className="w-4 h-4 text-warm-gold shrink-0" aria-hidden="true" />
                ייצא JSON
              </button>

              <Link
                href="/print"
                role="menuitem"
                className="flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-teal/10 transition-colors duration-200 text-base font-medium text-foreground cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <Printer className="w-4 h-4 text-teal shrink-0" aria-hidden="true" />
                הדפסה / PDF
              </Link>

              <div className="border-t border-border-theme my-1" />

              <Link
                href="/admin"
                role="menuitem"
                className="flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 transition-colors duration-200 text-base font-medium text-foreground cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <BarChart3 className="w-4 h-4 shrink-0" aria-hidden="true" />
                ניהול
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
