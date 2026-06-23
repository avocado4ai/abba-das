'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertCircle, Loader2, ArrowRight, CheckCircle2, Camera,
  Upload, LayoutGrid, List as ListIcon, Eye, EyeOff,
  Trash2, Plus, RefreshCw, Copy,
} from 'lucide-react';
import Link from 'next/link';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import type { PostData } from '@/lib/posts';

export default function GalleryAdminPage() {
  const [publishedPosts, setPublishedPosts] = useState<PostData[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [galleryOverrides, setGalleryOverrides] = useState<Record<string, boolean>>({});
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [galleryView, setGalleryView] = useState<'grid' | 'list'>('grid');
  const [gallerySort, setGallerySort] = useState<'post' | 'date' | 'shown'>('post');
  const [lastUploadedUrl, setLastUploadedUrl] = useState<string | null>(null);
  const [assignToPostSlug, setAssignToPostSlug] = useState('');
  const [isAssigningImage, setIsAssigningImage] = useState(false);
  const [deletingImageUrl, setDeletingImageUrl] = useState<string | null>(null);
  const [standaloneCaption, setStandaloneCaption] = useState('');
  const [isSavingStandalone, setIsSavingStandalone] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadPosts = async () => {
      setIsLoadingPosts(true);
      try {
        const res = await fetch('/api/posts');
        const data = await res.json();
        if (isMounted && Array.isArray(data)) setPublishedPosts(data);
      } catch {
        console.error('Failed to fetch posts');
      } finally {
        if (isMounted) setIsLoadingPosts(false);
      }
    };
    loadPosts();
    return () => { isMounted = false; };
  }, []);

  // Paste handler — paste image anywhere on this page
  useEffect(() => {
    const handler = async (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files || []).find(f => f.type.startsWith('image/'));
      if (!file) return;
      e.preventDefault();
      const url = await uploadFile(file);
      if (url) {
        setLastUploadedUrl(url);
        setStandaloneCaption('');
        setSuccess('תמונה הועלתה — הזן כיתוב ושמור בגלריה');
      }
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (Array.isArray(data)) setPublishedPosts(data);
    } catch {
      console.error('Failed to fetch posts');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch('/api/upload', { method: 'POST', body: formData, signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed (${res.status})`);
      }
      return (await res.json()).url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'תקלה בהעלאה');
      return null;
    }
  };

  const handleToggleGallery = async (
    slug: string,
    type: 'featured' | 'gallery',
    index: number | undefined,
    currentValue: boolean,
  ) => {
    const key = type === 'featured' ? `${slug}:featured` : `${slug}:gallery:${index}`;
    const newValue = !currentValue;
    setTogglingKey(key);
    setGalleryOverrides(prev => ({ ...prev, [key]: newValue }));
    try {
      const res = await fetch('/api/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type, index, showInGallery: newValue }),
      });
      if (!res.ok) {
        setGalleryOverrides(prev => ({ ...prev, [key]: currentValue }));
        setError('נכשל בעדכון הגלריה');
      }
    } catch {
      setGalleryOverrides(prev => ({ ...prev, [key]: currentValue }));
      setError('אירעה שגיאה בעדכון הגלריה');
    } finally {
      setTogglingKey(null);
    }
  };

  const handleSaveStandaloneImage = async () => {
    if (!lastUploadedUrl) return;
    setIsSavingStandalone(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ src: lastUploadedUrl, caption: standaloneCaption }),
      });
      if (res.ok) {
        setLastUploadedUrl(null);
        setStandaloneCaption('');
        setSuccess('התמונה נשמרה בגלריה');
        await refreshPosts();
      } else {
        setError((await res.json()).error || 'נכשל בשמירת התמונה');
      }
    } catch {
      setError('אירעה שגיאה בשמירת התמונה');
    } finally {
      setIsSavingStandalone(false);
    }
  };

  const handleAssignImageToPost = async () => {
    if (!lastUploadedUrl || !assignToPostSlug) return;
    const post = publishedPosts.find(p => p.slug === assignToPostSlug);
    if (!post) { setError('פוסט לא נמצא'); return; }
    setIsAssigningImage(true);
    try {
      const updatedPost = {
        ...post,
        gallery: [...(post.gallery || []), { src: lastUploadedUrl, alt: '', caption: '' }],
      };
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPost),
      });
      if (res.ok) {
        setLastUploadedUrl(null);
        setAssignToPostSlug('');
        setSuccess('התמונה נוספה לגלריה של הפוסט');
        await refreshPosts();
      } else {
        setError('נכשל בשמירת התמונה לפוסט');
      }
    } catch {
      setError('אירעה שגיאה');
    } finally {
      setIsAssigningImage(false);
    }
  };

  const handleDeleteImage = async (url: string) => {
    if (!window.confirm('למחוק את התמונה ולהסיר אותה מכל הפוסטים?')) return;
    setDeletingImageUrl(url);
    try {
      const res = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        setSuccess('התמונה נמחקה והוסרה מהפוסטים');
        await refreshPosts();
      } else {
        setError((await res.json()).error || 'נכשל במחיקת התמונה');
      }
    } catch {
      setError('אירעה שגיאה במחיקת התמונה');
    } finally {
      setDeletingImageUrl(null);
    }
  };

  const totalImages = publishedPosts.reduce((total, post) => {
    let count = 0;
    if (post.featuredImage?.src) {
      const key = `${post.slug}:featured`;
      const show = key in galleryOverrides
        ? galleryOverrides[key]
        : (post.featuredImage.showInGallery ?? !post.featuredImage.aiGenerated);
      if (show) count++;
    }
    (post.gallery || []).forEach((img, i) => {
      const key = `${post.slug}:gallery:${i}`;
      const show = key in galleryOverrides ? galleryOverrides[key] : (img.showInGallery ?? !img.aiGenerated);
      if (show) count++;
    });
    return total + count;
  }, 0);

  // ─── Gallery entries ────────────────────────────────────────────────────────
  type GalleryEntry = {
    slug: string; postTitle: string; postDate: string;
    type: 'featured' | 'gallery'; index?: number;
    src: string; alt?: string; aiGenerated?: boolean; showInGallery: boolean;
  };

  const entries: GalleryEntry[] = publishedPosts.flatMap(post => {
    const results: GalleryEntry[] = [];
    if (post.gallery?.length) {
      post.gallery.forEach((img, i) => {
        const key = `${post.slug}:gallery:${i}`;
        const show = key in galleryOverrides ? galleryOverrides[key] : (img.showInGallery ?? !img.aiGenerated);
        results.push({ slug: post.slug, postTitle: post.title, postDate: post.date, type: 'gallery', index: i, src: img.src, alt: img.alt, aiGenerated: !!img.aiGenerated, showInGallery: show });
      });
    } else if (post.featuredImage?.src) {
      const key = `${post.slug}:featured`;
      const show = key in galleryOverrides ? galleryOverrides[key] : (post.featuredImage.showInGallery ?? !post.featuredImage.aiGenerated);
      results.push({ slug: post.slug, postTitle: post.title, postDate: post.date, type: 'featured', src: post.featuredImage.src, alt: post.featuredImage.alt, aiGenerated: !!post.featuredImage.aiGenerated, showInGallery: show });
    }
    return results;
  });

  const sorted = [...entries].sort((a, b) => {
    if (gallerySort === 'shown') return Number(b.showInGallery) - Number(a.showInGallery);
    if (gallerySort === 'date') return new Date(b.postDate).getTime() - new Date(a.postDate).getTime();
    return a.postTitle.localeCompare(b.postTitle, 'he');
  });

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-sage/30 transition-colors duration-300" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 md:py-20">

        {/* Header */}
        <header className="mb-6 sm:mb-10 border-b border-border-theme pb-5 sm:pb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 sm:gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 tracking-tight">ניהול גלריה</h1>
            <p className="text-sm sm:text-base text-sage font-medium">{totalImages} תמונות מוצגות בגלריה</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/admin"
              className="flex min-h-10 items-center gap-2 rounded-full border border-border-theme bg-white/5 px-4 text-sm font-bold text-muted-theme hover:text-navy transition-colors duration-250 group"
            >
              פוסטים ותגובות
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-250" />
            </Link>
            <Link
              href="/"
              className="flex min-h-10 items-center gap-2 rounded-full border border-border-theme bg-white/5 px-4 text-sm font-bold text-muted-theme hover:text-navy transition-colors duration-250 group"
            >
              חזרה לבלוג
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-250" />
            </Link>
            <ThemeSwitcher />
          </div>
        </header>

        {/* Alert */}
        {(error || success) && (
          <div
            className={`mb-6 sm:mb-10 p-3 sm:p-4 rounded-2xl flex items-center gap-3 text-sm sm:text-base font-medium animate-in fade-in slide-in-from-top-2 ${
              error
                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                : 'bg-sage/10 text-sage border border-sage/20'
            }`}
            role="alert"
            aria-live="polite"
          >
            {error ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span>{error || success}</span>
          </div>
        )}

        {/* Gallery section */}
        <section className="bg-white/5 rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-8 border border-border-theme">

          {/* Section header */}
          <div className="flex items-center gap-3 mb-5">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-coral/15 shrink-0">
              <Camera className="w-5 h-5 text-coral" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold">תמונות</h2>
              <p className="text-sm text-muted-theme">בחר אילו תמונות יופיעו בדף הגלריה הציבורי.</p>
            </div>
            <div className="flex gap-1 items-center" dir="ltr">
              <select
                value={gallerySort}
                onChange={e => setGallerySort(e.target.value as typeof gallerySort)}
                className="appearance-none rounded-lg border border-border-theme bg-white/5 px-2 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-sage/50 cursor-pointer"
                aria-label="מיון"
              >
                <option value="post">לפי פוסט</option>
                <option value="date">לפי תאריך</option>
                <option value="shown">מוצגות בלבד</option>
              </select>
              <button
                type="button"
                onClick={() => setGalleryView('grid')}
                className={`p-1.5 rounded-lg border transition-colors ${galleryView === 'grid' ? 'bg-sage/10 border-sage/30 text-sage' : 'border-transparent text-muted-theme hover:border-border-theme'}`}
                aria-label="תצוגת רשת"
              >
                <LayoutGrid className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setGalleryView('list')}
                className={`p-1.5 rounded-lg border transition-colors ${galleryView === 'list' ? 'bg-sage/10 border-sage/30 text-sage' : 'border-transparent text-muted-theme hover:border-border-theme'}`}
                aria-label="תצוגת רשימה"
              >
                <ListIcon className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={refreshPosts}
                className="p-1.5 text-muted-theme hover:text-sage"
                aria-label="רענן"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingPosts ? 'animate-spin' : ''}`} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Upload area */}
          <div className="mb-6 rounded-2xl border-2 border-dashed border-border-theme bg-white/5 p-4 transition-colors">
            <label
              className="flex flex-col sm:flex-row items-center justify-center gap-3 cursor-pointer"
              onDragOver={e => {
                e.preventDefault();
                (e.currentTarget.closest('div') as HTMLElement).style.borderColor = 'var(--color-sage, #7a9a7a)';
              }}
              onDragLeave={e => {
                (e.currentTarget.closest('div') as HTMLElement).style.borderColor = '';
              }}
              onDrop={async e => {
                e.preventDefault();
                (e.currentTarget.closest('div') as HTMLElement).style.borderColor = '';
                const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
                if (file) {
                  const url = await uploadFile(file);
                  if (url) { setLastUploadedUrl(url); setStandaloneCaption(''); setAssignToPostSlug(''); }
                }
              }}
            >
              <span className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-navy px-4 text-sm font-bold text-cream hover:bg-navy/90 transition-colors">
                <Upload className="w-4 h-4" aria-hidden="true" />
                העלאת תמונה לגלריה
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await uploadFile(file);
                    if (url) { setLastUploadedUrl(url); setStandaloneCaption(''); setAssignToPostSlug(''); }
                  }
                  e.target.value = '';
                }}
              />
              <p className="text-xs text-muted-theme">גרור תמונה לכאן, הדבק (Ctrl+V), או לחץ לבחירה</p>
            </label>
          </div>

          {/* Uploaded image panel */}
          {lastUploadedUrl && (
            <div className="mb-6 rounded-2xl border border-sage/40 bg-sage/5 p-4 space-y-3">
              <div className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lastUploadedUrl}
                  alt="תמונה שהועלתה"
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border-theme"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 mb-2">
                    <input
                      readOnly
                      value={lastUploadedUrl}
                      className="flex-1 min-w-0 rounded-lg border border-border-theme bg-white/5 px-3 py-1.5 text-xs font-mono text-muted-theme truncate"
                    />
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(lastUploadedUrl); setSuccess('URL הועתק'); }}
                      className="shrink-0 p-1.5 rounded-lg border border-border-theme hover:bg-white/10 text-muted-theme transition-colors"
                      aria-label="העתק URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    value={standaloneCaption}
                    onChange={e => setStandaloneCaption(e.target.value)}
                    placeholder="כיתוב לתמונה (אופציונלי)"
                    className="w-full rounded-lg border border-border-theme bg-white/5 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-sage/50"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  onClick={handleSaveStandaloneImage}
                  disabled={isSavingStandalone}
                  className="flex items-center gap-1.5 rounded-lg bg-coral px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40 hover:bg-coral/80 transition-colors"
                >
                  {isSavingStandalone ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  שמור בגלריה
                </button>
                <span className="text-xs text-muted-theme">או שייך לפוסט:</span>
                <select
                  value={assignToPostSlug}
                  onChange={e => setAssignToPostSlug(e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-border-theme bg-white/5 px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-sage/50"
                >
                  <option value="">בחר פוסט...</option>
                  {publishedPosts
                    .filter(p => p.slug !== 'gallery-uploads')
                    .map(p => <option key={p.slug} value={p.slug}>{p.title}</option>)}
                </select>
                <button
                  type="button"
                  onClick={handleAssignImageToPost}
                  disabled={!assignToPostSlug || isAssigningImage}
                  className="shrink-0 flex items-center gap-1.5 rounded-lg bg-sage px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40 hover:bg-sage/80 transition-colors"
                >
                  {isAssigningImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  הוסף לפוסט
                </button>
                <button
                  type="button"
                  onClick={() => { setLastUploadedUrl(null); setStandaloneCaption(''); }}
                  className="shrink-0 px-2 py-1.5 rounded-lg border border-border-theme text-xs text-muted-theme hover:text-foreground transition-colors"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}

          {/* Gallery grid / list */}
          {isLoadingPosts ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-sage" aria-hidden="true" />
            </div>
          ) : entries.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border-theme p-6 text-center text-sm text-muted-theme">
              אין תמונות. העלה תמונה למעלה או הוסף תמונות לפוסטים.
            </p>
          ) : galleryView === 'list' ? (
            <div className="space-y-2">
              {sorted.map(entry => {
                const key = entry.type === 'featured' ? `${entry.slug}:featured` : `${entry.slug}:gallery:${entry.index}`;
                const isPending = togglingKey === key;
                return (
                  <div key={key} className="flex items-center gap-3 rounded-xl border border-border-theme bg-white/5 p-2.5 transition-colors hover:bg-white/[0.07]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.src}
                      alt={entry.alt || entry.postTitle}
                      className={`w-12 h-12 rounded-lg object-cover shrink-0 ${entry.showInGallery ? 'opacity-100' : 'opacity-40'}`}
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.postTitle}</p>
                      <p className="text-xs text-muted-theme truncate">{entry.src.split('/').pop()}</p>
                      <div className="flex gap-2 mt-0.5">
                        {entry.aiGenerated && <span className="text-[10px] font-bold text-warm-gold">AI</span>}
                        {entry.type === 'featured' && <span className="text-[10px] font-bold text-sage">ראשית</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleGallery(entry.slug, entry.type, entry.index, entry.showInGallery)}
                      disabled={isPending}
                      className={[
                        'shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors duration-200',
                        entry.showInGallery
                          ? 'bg-sage/10 text-sage hover:bg-red-500/10 hover:text-red-500'
                          : 'bg-coral/10 text-coral hover:bg-coral/20',
                        isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer',
                      ].join(' ')}
                      aria-label={entry.showInGallery ? 'הסר מגלריה' : 'הוסף לגלריה'}
                    >
                      {isPending
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                        : entry.showInGallery
                          ? <><Eye className="w-3.5 h-3.5" aria-hidden="true" />מוצגת</>
                          : <><EyeOff className="w-3.5 h-3.5" aria-hidden="true" />מוסתרת</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(entry.src)}
                      disabled={deletingImageUrl === entry.src}
                      className="shrink-0 p-1.5 rounded-lg border border-transparent text-muted-theme hover:border-red-500/30 hover:text-red-500 transition-colors duration-200"
                      aria-label="מחק תמונה"
                    >
                      {deletingImageUrl === entry.src
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {sorted.map(entry => {
                const key = entry.type === 'featured' ? `${entry.slug}:featured` : `${entry.slug}:gallery:${entry.index}`;
                const isPending = togglingKey === key;
                return (
                  <div key={key} className="group relative rounded-xl overflow-hidden border border-border-theme bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.src}
                      alt={entry.alt || entry.postTitle}
                      className={`w-full aspect-square object-cover transition-opacity duration-200 ${entry.showInGallery ? 'opacity-100' : 'opacity-40'}`}
                      loading="lazy"
                    />
                    {entry.aiGenerated && (
                      <span className="absolute top-1.5 right-1.5 rounded-full bg-warm-gold/90 px-1.5 py-0.5 text-[10px] font-bold text-white">AI</span>
                    )}
                    {!entry.showInGallery && (
                      <div className="absolute inset-0 flex items-center justify-center bg-navy/30 pointer-events-none">
                        <EyeOff className="w-6 h-6 text-white/70" aria-hidden="true" />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-xs text-muted-theme truncate mb-1.5">{entry.postTitle}</p>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleGallery(entry.slug, entry.type, entry.index, entry.showInGallery)}
                          disabled={isPending}
                          className={[
                            'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-colors duration-200',
                            entry.showInGallery
                              ? 'bg-sage/10 text-sage hover:bg-red-500/10 hover:text-red-500'
                              : 'bg-coral/10 text-coral hover:bg-coral/20',
                            isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer',
                          ].join(' ')}
                          aria-label={entry.showInGallery ? 'הסר מגלריה' : 'הוסף לגלריה'}
                        >
                          {isPending
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                            : entry.showInGallery
                              ? <><Eye className="w-3.5 h-3.5" aria-hidden="true" />מוצגת</>
                              : <><EyeOff className="w-3.5 h-3.5" aria-hidden="true" />מוסתרת</>}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(entry.src)}
                          disabled={deletingImageUrl === entry.src}
                          className="p-1.5 rounded-lg border border-transparent text-muted-theme hover:border-red-500/30 hover:text-red-500 transition-colors duration-200"
                          aria-label="מחק תמונה"
                        >
                          {deletingImageUrl === entry.src
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
