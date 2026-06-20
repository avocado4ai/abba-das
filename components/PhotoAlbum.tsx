'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Camera } from 'lucide-react';

interface GalleryImage {
  src: string;
  alt?: string;
  caption?: string;
}

interface PhotoAlbumProps {
  images: GalleryImage[];
  title?: string;
  showHeader?: boolean;
}

export default function PhotoAlbum({ images, title = 'אלבום תמונות', showHeader = true }: PhotoAlbumProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setImgLoading(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    setImgLoading(false);
  }, []);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);

  const navigate = useCallback((direction: 'next' | 'prev') => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      const delta = direction === 'next' ? 1 : -1;
      return (prev + delta + images.length) % images.length;
    });
    setImgLoading(true);
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      // RTL: ArrowLeft = forward (next), ArrowRight = backward (prev)
      if (e.key === 'ArrowLeft') navigate('next');
      if (e.key === 'ArrowRight') navigate('prev');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, closeLightbox, navigate]);

  // Focus the close button when lightbox opens
  const isOpen = lightboxIndex !== null;
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => closeButtonRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only swipe if horizontal movement is dominant and exceeds 50px threshold
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      // RTL: swipe right-to-left (dx<0) = forward (next)
      navigate(dx < 0 ? 'next' : 'prev');
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!images || images.length === 0) return null;

  const currentImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <section
      className="my-10 sm:my-14"
      dir="rtl"
      aria-label="אלבום תמונות"
    >
      {/* Section header */}
      {showHeader && (
        <div className="flex items-center gap-2.5 mb-5">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-coral/15">
            <Camera className="w-4 h-4 text-coral" aria-hidden="true" />
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">{title}</h2>
          <span className="text-sm text-muted-theme">({images.length})</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
        {images.map((image, i) => {
          // First image is wide on desktop when there are 4+ images
          const isHero = i === 0 && images.length >= 4;
          return (
            <button
              key={i}
              onClick={() => openLightbox(i)}
              className={[
                'group relative overflow-hidden rounded-xl bg-navy/5 cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2',
                'touch-manipulation',
                isHero ? 'col-span-2 aspect-[16/9]' : 'aspect-square',
              ].join(' ')}
              aria-label={image.alt || `תמונה ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt || `תמונה ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04] group-active:scale-100"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div
                className="absolute inset-0 bg-navy/0 group-hover:bg-navy/20 transition-colors duration-250 pointer-events-none"
                aria-hidden="true"
              />
              {/* Caption peek on hover */}
              {image.caption && (
                <div
                  className="absolute inset-x-0 bottom-0 p-2 sm:p-3 bg-gradient-to-t from-navy/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-250 pointer-events-none"
                  aria-hidden="true"
                >
                  <p className="text-white text-xs sm:text-sm font-medium line-clamp-2 text-right">
                    {image.caption}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && currentImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={currentImage.alt || 'תצוגת תמונה'}
          dir="rtl"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" aria-hidden="true" />

          {/* Close button — top-right in RTL = logical start */}
          <button
            ref={closeButtonRef}
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 transition-colors duration-200 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div
            className="absolute top-4 left-4 z-20 text-white/60 text-sm font-medium tabular-nums"
            aria-live="polite"
            aria-atomic="true"
          >
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Image + caption */}
          <div
            className="relative z-10 flex flex-col items-center max-w-[90vw] max-h-[90dvh] px-12 sm:px-20"
            onClick={(e) => e.stopPropagation()}
          >
            {imgLoading && (
              <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage.src}
              alt={currentImage.alt || `תמונה ${lightboxIndex + 1}`}
              className="max-w-full max-h-[75dvh] object-contain rounded-lg shadow-2xl"
              style={{ opacity: imgLoading ? 0.3 : 1, transition: 'opacity 0.2s' }}
              onLoad={() => setImgLoading(false)}
              draggable={false}
            />
            {currentImage.caption && (
              <p className="mt-3 text-center text-white/80 text-sm sm:text-base font-medium max-w-lg px-2">
                {currentImage.caption}
              </p>
            )}
          </div>

          {/* Navigation — RTL: "next" button on the left, "prev" on the right */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('next'); }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:bg-white/35 transition-colors duration-200 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white touch-manipulation"
                aria-label="תמונה הבאה"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('prev'); }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:bg-white/35 transition-colors duration-200 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white touch-manipulation"
                aria-label="תמונה הקודמת"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {images.length > 1 && images.length <= 12 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5" aria-hidden="true">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); setImgLoading(true); }}
                  className={[
                    'w-2 h-2 rounded-full transition-all duration-200 touch-manipulation',
                    i === lightboxIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70',
                  ].join(' ')}
                  aria-label={`תמונה ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
