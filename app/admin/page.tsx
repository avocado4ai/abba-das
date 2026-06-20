'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Loader2, Save, ArrowRight, ExternalLink, CheckCircle2, BookOpen, Image as ImageIcon, Plus, RefreshCw, MessageCircle, Trash2, Eye, EyeOff, Camera, Archive, Search, Upload, LayoutGrid, List as ListIcon, WandSparkles, Copy } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import ThemeSwitcher from "@/components/ThemeSwitcher";
import type { PostData } from '@/lib/posts';
import type { CommentData } from '@/lib/github';

const generateSlug = (dateStr: string) => {
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${dateStr}-${randomSuffix}`;
};

type GalleryDraftImage = {
  src: string;
  alt?: string;
  caption?: string;
};

type PostDraft = {
  author: string;
  title: string;
  slug: string;
  date: string;
  content: string;
  tagsText: string;
  weather: string;
  contentType: string;
  category: string;
  archived: boolean;
  imageSrc: string;
  imageAlt: string;
  imageCaption: string;
  imageAiGenerated?: boolean;
  gallery: GalleryDraftImage[];
};

type AdminCommentGroup = {
  slug: string;
  title: string;
  comments: CommentData[];
};

const createEmptyDraft = (): PostDraft => ({
  author: '',
  title: '',
  slug: generateSlug(format(new Date(), 'yyyy-MM-dd')),
  date: new Date().toISOString().slice(0, 10),
  content: '',
  tagsText: '',
  weather: 'sunny',
  contentType: 'story',
  category: 'memories',
  archived: false,
  imageSrc: '',
  imageAlt: '',
  imageCaption: '',
  gallery: [],
});

const postToDraft = (post: PostData): PostDraft => ({
  author: post.author || '',
  title: post.title,
  slug: post.slug,
  date: post.date ? new Date(post.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
  content: post.content,
  tagsText: (post.tags || []).join(', '),
  weather: post.weather || 'sunny',
  contentType: post.contentType || 'story',
  category: post.category || 'memories',
  archived: post.archived === true,
  imageSrc: post.featuredImage?.src || '',
  imageAlt: post.featuredImage?.alt || post.title,
  imageCaption: post.featuredImage?.caption || '',
  gallery: (post.gallery || []).map(g => ({ src: g.src, alt: g.alt, caption: g.caption })),
});

const splitTags = (tagsText: string) =>
  tagsText
    .split(',')
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter(Boolean);

export default function AdminPage() {
  const [publishedPosts, setPublishedPosts] = useState<PostData[]>([]);
  const [commentGroups, setCommentGroups] = useState<AdminCommentGroup[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [postDraft, setPostDraft] = useState<PostDraft>(() => createEmptyDraft());
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isUploadingDraftImage, setIsUploadingDraftImage] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [postSearch, setPostSearch] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  // galleryOverrides: key = "slug:featured" or "slug:gallery:N" → showInGallery boolean
  const [galleryOverrides, setGalleryOverrides] = useState<Record<string, boolean>>({});
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [galleryView, setGalleryView] = useState<'grid' | 'list'>('grid');
  const [gallerySort, setGallerySort] = useState<'post' | 'date' | 'ai'>('post');
  const [hideAiImages, setHideAiImages] = useState(false);
  const [lastUploadedUrl, setLastUploadedUrl] = useState<string | null>(null);
  const [assignToPostSlug, setAssignToPostSlug] = useState('');
  const [isAssigningImage, setIsAssigningImage] = useState(false);


  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      if (!isMounted) return;
      setIsLoadingPosts(true);
      try {
        const res = await fetch('/api/posts');
        const data = await res.json();
        if (isMounted && Array.isArray(data)) {
          setPublishedPosts(data);
        }
      } catch {
        console.error('Failed to fetch published posts');
      } finally {
        if (isMounted) {
          setIsLoadingPosts(false);
        }
      }
    };

    const loadComments = async () => {
      if (!isMounted) return;
      setIsLoadingComments(true);
      try {
        const res = await fetch('/api/admin/comments');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && Array.isArray(data)) {
          setCommentGroups(data);
        }
      } catch {
        console.error('Failed to fetch comments');
      } finally {
        if (isMounted) {
          setIsLoadingComments(false);
        }
      }
    };

    loadPosts();
    loadComments();
    return () => {
      isMounted = false;
    };
  }, []);

  // Paste handler for images
  useEffect(() => {
    if (!isEditorOpen) return;
    const handler = async (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files || []).find(f => f.type.startsWith('image/'));
      if (file) {
        e.preventDefault();
        const url = await uploadFile(file);
        if (url) {
          setPostDraft((current) => ({
            ...current,
            gallery: [...current.gallery, { src: url, alt: file.name, caption: '' }],
          }));
          setSuccess('תמונה הודבקה ונוספה לגלריה');
        }
      }
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [isEditorOpen]);

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Upload failed (${res.status})`);
      }
      const data = await res.json();
      return data.url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'תקלה בהעלאה';
      setError(msg);
      console.error('Upload error:', e);
      return null;
    }
  };

  const refreshPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPublishedPosts(data);
      }
    } catch {
      console.error('Failed to fetch published posts');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const refreshComments = async () => {
    setIsLoadingComments(true);
    try {
      const res = await fetch('/api/admin/comments');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setCommentGroups(data);
      }
    } catch {
      console.error('Failed to fetch comments');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const updateDraft = (changes: Partial<PostDraft>) => {
    setPostDraft((current) => ({ ...current, ...changes }));
  };

  const startEditingPost = (post: PostData) => {
    setEditingSlug(post.slug);
    setPostDraft(postToDraft(post));
    setError(null);
    setSuccess(null);
    setIsEditorOpen(true);
  };

  const startNewPost = () => {
    setEditingSlug(null);
    setPostDraft(createEmptyDraft());
    setError(null);
    setSuccess(null);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingSlug(null);
  };

  const buildPostFromDraft = (): PostData => ({
    title: postDraft.title.trim(),
    slug: postDraft.slug.trim(),
    content: postDraft.content.trim(),
    date: new Date(postDraft.date).toISOString(),
    author: postDraft.author.trim() || undefined,
    archived: postDraft.archived || undefined,
    tags: splitTags(postDraft.tagsText),
    weather: postDraft.weather,
    contentType: postDraft.contentType as PostData['contentType'],
    category: postDraft.category as PostData['category'],
        featuredImage: postDraft.imageSrc.trim()
          ? {
              src: postDraft.imageSrc.trim(),
              alt: postDraft.imageAlt.trim() || postDraft.title.trim(),
              caption: postDraft.imageCaption.trim(),
              aiGenerated: postDraft.imageAiGenerated || undefined,
              showInGallery: postDraft.imageAiGenerated ? false : undefined,
            }
          : undefined,
      gallery: postDraft.gallery.length > 0 ? postDraft.gallery.map(g => ({
        src: g.src,
        alt: g.alt || undefined,
        caption: g.caption || undefined,
      })) : undefined,
    });

  const handleSaveDraft = async () => {
    if (!postDraft.title.trim() || !postDraft.slug.trim() || !postDraft.content.trim()) {
      setError('כותרת, מזהה ותוכן הם שדות חובה');
      return;
    }

    setIsSavingDraft(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPostFromDraft()),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'נכשל בשמירת הפוסט');

      setSuccess(editingSlug ? 'הפוסט עודכן בהצלחה' : 'הפוסט החדש נשמר בהצלחה');
      setEditingSlug(postDraft.slug);
      await refreshPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'אירעה שגיאה לא ידועה');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleDraftImageUpload = async (file: File, mode: 'featured' | 'content') => {
    setIsUploadingDraftImage(true);
    setError(null);
    setSuccess(null);

    try {
      const url = await uploadFile(file);
      if (!url) throw new Error('העלאת התמונה נכשלה');

      if (mode === 'featured') {
        updateDraft({
          imageSrc: url,
          imageAlt: postDraft.imageAlt || postDraft.title || file.name,
          imageCaption: postDraft.imageCaption,
        });
      } else {
        const alt = postDraft.imageAlt || postDraft.title || file.name;
        updateDraft({
          content: `${postDraft.content.trim()}\n\n![${alt}](${url})\n`,
        });
      }

      setSuccess('התמונה הועלתה בהצלחה');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'אירעה שגיאה בהעלאת התמונה');
    } finally {
      setIsUploadingDraftImage(false);
    }
  };

  const handleToggleGallery = async (
    slug: string,
    type: 'featured' | 'gallery',
    index: number | undefined,
    currentValue: boolean
  ) => {
    const key = type === 'featured' ? `${slug}:featured` : `${slug}:gallery:${index}`;
    const newValue = !currentValue;
    setTogglingKey(key);
    setGalleryOverrides((prev) => ({ ...prev, [key]: newValue }));
    try {
      const res = await fetch('/api/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type, index, showInGallery: newValue }),
      });
      if (!res.ok) {
        // revert on error
        setGalleryOverrides((prev) => ({ ...prev, [key]: currentValue }));
        setError('נכשל בעדכון הגלריה');
      }
    } catch {
      setGalleryOverrides((prev) => ({ ...prev, [key]: currentValue }));
      setError('אירעה שגיאה בעדכון הגלריה');
    } finally {
      setTogglingKey(null);
    }
  };

  const handleDeleteComment = async (slug: string, commentId: string) => {
    if (!window.confirm('למחוק את התגובה?')) return;
    try {
      const response = await fetch(`/api/comments?slug=${slug}&id=${commentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await refreshComments();
        setSuccess('התגובה נמחקה בהצלחה');
      } else {
        const data = await response.json();
        setError(data.error || 'נכשל במחיקת התגובה');
      }
    } catch {
      setError('אירעה שגיאה במחיקת התגובה');
    }
  };

  const handleDeletePost = async (slug: string) => {
    setShowDeleteConfirm(slug);
    setDeletePassword('');
  };

  const confirmDeletePost = async () => {
    const slug = showDeleteConfirm;
    if (!slug) return;
    try {
      const response = await fetch(`/api/posts?slug=${slug}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': deletePassword },
      });
      if (response.ok) {
        setShowDeleteConfirm(null);
        setDeletePassword('');
        await refreshPosts();
        setSuccess('הפוסט נמחק בהצלחה');
        closeEditor();
      } else {
        const data = await response.json();
        setError(data.error || 'סיסמה שגויה או נכשל במחיקת הפוסט');
      }
    } catch {
      setError('אירעה שגיאה במחיקת הפוסט');
    }
  };

  const cancelDeletePost = () => {
    setShowDeleteConfirm(null);
    setDeletePassword('');
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

  const totalComments = commentGroups.reduce((total, group) => total + group.comments.length, 0);
  const totalImages = publishedPosts.reduce((total, post) => {
    let count = 0;
    if (post.featuredImage?.src) {
      const key = `${post.slug}:featured`;
      const aiGen = !!post.featuredImage.aiGenerated;
      const defaultShow = !aiGen;
      const show = key in galleryOverrides ? galleryOverrides[key] : (post.featuredImage.showInGallery ?? defaultShow);
      if (show) count++;
    }
    if (post.gallery?.length) {
      post.gallery.forEach((img, i) => {
        const key = `${post.slug}:gallery:${i}`;
        const aiGen = !!img.aiGenerated;
        const defaultShow = !aiGen;
        const show = key in galleryOverrides ? galleryOverrides[key] : (img.showInGallery ?? defaultShow);
        if (show) count++;
      });
    }
    return total + count;
  }, 0);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-sage/30 transition-colors duration-300 dir-rtl" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 md:py-20">
        <header className="mb-6 sm:mb-10 border-b border-border-theme pb-5 sm:pb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 sm:gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 tracking-tight">ניהול הבלוג</h1>
            <p className="text-sm sm:text-base text-sage font-medium">ניהול פוסטים, תגובות וגלריה</p>
          </div>
          <div className="flex items-center justify-between gap-3 self-stretch md:self-auto">
            <Link href="/" className="flex min-h-10 items-center gap-2 rounded-full border border-border-theme bg-white/5 px-4 text-sm font-bold text-muted-theme hover:text-navy transition-colors duration-250 group">
              חזרה לבלוג
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-250" />
            </Link>
            <ThemeSwitcher />
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-10">
          <button
            type="button"
            onClick={() => document.getElementById('posts-editor')?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-2xl border border-border-theme bg-white/5 p-4 text-right hover:border-sage/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-muted-theme text-xs font-bold mb-1">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              פוסטים שפורסמו
            </div>
            <div className="text-2xl font-bold text-foreground">{publishedPosts.length}</div>
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('gallery-management')?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-2xl border border-border-theme bg-white/5 p-4 text-right hover:border-sage/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-muted-theme text-xs font-bold mb-1">
              <Camera className="w-4 h-4" aria-hidden="true" />
              תמונות
            </div>
            <div className="text-2xl font-bold text-foreground">{totalImages}</div>
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('comments-overview')?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-2xl border border-border-theme bg-white/5 p-4 text-right hover:border-sage/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-muted-theme text-xs font-bold mb-1">
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              תגובות
            </div>
            <div className="text-2xl font-bold text-foreground">{totalComments}</div>
          </button>
        </div>

        {(error || success) && (
          <div
            className={`mb-6 sm:mb-10 p-3 sm:p-4 rounded-2xl flex items-center gap-3 text-sm sm:text-base font-medium animate-in fade-in slide-in-from-top-2 ${
              error ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-sage/10 text-sage border border-sage/20'
            }`}
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            {error ? <AlertCircle size={20} aria-hidden="true" /> : <CheckCircle2 size={20} aria-hidden="true" />}
            <span>{error || success}</span>
          </div>
        )}

        {/* Post Editor */}
        <section id="posts-editor" className="bg-white/5 rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-8 mb-8 sm:mb-12 border border-border-theme">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">עריכת פוסטים</h2>
              <p className="text-sm text-muted-theme">ניהול ותוכן הבלוג</p>
            </div>
            <button
              type="button"
              onClick={startNewPost}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sage px-4 text-sm font-bold text-white hover:bg-sage/90"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              פוסט חדש
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5">
            {/* Left — Posts List */}
            <aside className="space-y-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-theme" aria-hidden="true" />
                <input
                  type="text"
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  placeholder="חיפוש פוסטים..."
                  className="w-full min-h-10 rounded-xl border border-border-theme bg-white/5 pr-9 pl-3 text-sm outline-none focus:ring-2 focus:ring-sage/50"
                />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-muted-theme">פוסטים קיימים</h3>
                <button
                  type="button"
                  onClick={refreshPosts}
                  className="p-2 text-muted-theme hover:text-sage"
                  aria-label="רענן פוסטים"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingPosts ? 'animate-spin' : ''}`} aria-hidden="true" />
                </button>
              </div>
              <div className="max-h-[600px] space-y-2 overflow-y-auto pr-1">
                {publishedPosts
                  .filter((p) => p.title.toLowerCase().includes(postSearch.toLowerCase()))
                  .map((post) => (
                    <div
                      key={post.slug}
                      className={`group flex items-center gap-1 rounded-xl border transition-colors ${
                        postDraft.slug === post.slug && isEditorOpen
                          ? 'border-sage bg-sage/10'
                          : 'border-border-theme bg-white/5 hover:border-sage/40'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => startEditingPost(post)}
                        className="min-w-0 flex-1 p-3 text-right"
                      >
                        <span className="block truncate text-sm font-bold">{post.title}</span>
                        <span className="mt-1 block text-xs text-muted-theme">
                          {post.date ? format(new Date(post.date), 'dd/MM/yyyy') : 'ללא תאריך'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.slug)}
                        className="shrink-0 p-2 ml-1 text-muted-theme/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="מחק פוסט"
                        aria-label={`מחק את הפוסט "${post.title}"`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                {publishedPosts.filter((p) => p.title.toLowerCase().includes(postSearch.toLowerCase())).length === 0 && !isLoadingPosts && (
                  <p className="rounded-xl border border-dashed border-border-theme p-4 text-sm text-muted-theme">אין פוסטים להצגה.</p>
                )}
              </div>
            </aside>

            {/* Right — Editor Panel */}
            {isEditorOpen ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {/* Author */}
                <div>
                  <label htmlFor="post-author" className="block text-xs font-bold text-muted-theme mb-2">מחבר</label>
                  <input
                    id="post-author"
                    value={postDraft.author}
                    onChange={(e) => updateDraft({ author: e.target.value })}
                    placeholder="שם המחבר"
                    className="w-full min-h-11 rounded-xl border border-border-theme bg-white/5 px-3 text-base outline-none focus:ring-2 focus:ring-sage/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="post-title" className="block text-xs font-bold text-muted-theme mb-2">כותרת</label>
                    <input
                      id="post-title"
                      value={postDraft.title}
                      onChange={(e) => updateDraft({ title: e.target.value })}
                      className="w-full min-h-11 rounded-xl border border-border-theme bg-white/5 px-3 text-base outline-none focus:ring-2 focus:ring-sage/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="post-date" className="block text-xs font-bold text-muted-theme mb-2">תאריך פרסום</label>
                    <input
                      id="post-date"
                      type="date"
                      value={postDraft.date}
                      onChange={(e) => updateDraft({ date: e.target.value })}
                      className="w-full min-h-11 rounded-xl border border-border-theme bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-sage/50"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="post-content" className="block text-xs font-bold text-muted-theme mb-2">תוכן הפוסט</label>
                  <textarea
                    id="post-content"
                    value={postDraft.content}
                    onChange={(e) => updateDraft({ content: e.target.value })}
                    rows={10}
                    className="w-full rounded-xl border border-border-theme bg-white/5 p-3 text-base leading-8 outline-none focus:ring-2 focus:ring-sage/50"
                  />
                </div>

                {/* Images */}
                <div className="rounded-2xl border border-border-theme bg-navy/[0.02] p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ImageIcon className="w-4 h-4 text-sage" aria-hidden="true" />
                    <h3 className="text-sm font-bold">תמונה ראשית וגלריה</h3>
                  </div>

                  {/* Gallery image list */}
                  <div className="space-y-2 mb-3">
                    {postDraft.gallery.map((img, i) => (
                      <div key={i} className={`flex items-center gap-2 rounded-xl border p-2 transition-all ${
                        postDraft.imageSrc === img.src ? 'border-sage bg-sage/5' : 'border-border-theme bg-white/5'
                      }`}>
                        <div className="relative shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.src} alt={img.alt || ''} className="w-12 h-12 rounded-lg object-cover" />
                          {postDraft.imageSrc === img.src && (
                            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-warm-gold text-white text-[10px] font-bold shadow">★</span>
                          )}
                          <span className="absolute -bottom-1.5 -right-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-sage text-white text-[9px]">📌</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <input
                            value={img.alt || ''}
                            onChange={(e) => {
                              const newGallery = [...postDraft.gallery];
                              newGallery[i] = { ...newGallery[i], alt: e.target.value };
                              updateDraft({ gallery: newGallery });
                            }}
                            placeholder="ALT"
                            className="w-full mb-1 rounded-lg border border-border-theme bg-white/5 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-sage/50"
                          />
                          <input
                            value={img.caption || ''}
                            onChange={(e) => {
                              const newGallery = [...postDraft.gallery];
                              newGallery[i] = { ...newGallery[i], caption: e.target.value };
                              updateDraft({ gallery: newGallery });
                            }}
                            placeholder="קפשן"
                            className="w-full rounded-lg border border-border-theme bg-white/5 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-sage/50"
                          />
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newGallery = [...postDraft.gallery];
                                [newGallery[i - 1], newGallery[i]] = [newGallery[i], newGallery[i - 1]];
                                updateDraft({ gallery: newGallery });
                              }}
                              className="p-1 text-muted-theme hover:text-sage"
                              title="הזז למעלה"
                            >
                              ↑
                            </button>
                          )}
                          {i < postDraft.gallery.length - 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newGallery = [...postDraft.gallery];
                                [newGallery[i], newGallery[i + 1]] = [newGallery[i + 1], newGallery[i]];
                                updateDraft({ gallery: newGallery });
                              }}
                              className="p-1 text-muted-theme hover:text-sage"
                              title="הזז למטה"
                            >
                              ↓
                            </button>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateDraft({ imageSrc: img.src, imageAlt: img.alt || postDraft.title, imageCaption: img.caption || '' })}
                            className={`p-1 rounded ${postDraft.imageSrc === img.src ? 'text-warm-gold' : 'text-muted-theme hover:text-sage'}`}
                            title="קבע כתמונה ראשית"
                          >
                            ★
                          </button>
                          <button
                            type="button"
                            onClick={() => updateDraft({ gallery: postDraft.gallery.filter((_, j) => j !== i) })}
                            className="p-1 text-muted-theme hover:text-red-500"
                            title="הסר מהגלריה"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add to gallery — drag & drop + paste */}
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-theme bg-white/5 px-3 text-xs font-bold hover:border-sage/40 hover:bg-sage/5 transition-all cursor-pointer"
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-sage, #7a9a7a)'; }}
                      onDragLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '';
                        const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
                        if (file) {
                          setIsUploadingDraftImage(true);
                          const url = await uploadFile(file);
                          if (url) {
                            setPostDraft((current) => ({ ...current, gallery: [...current.gallery, { src: url, alt: file.name, caption: '' }] }));
                            setSuccess('תמונה נוספה לגלריה');
                          } else {
                            setError('העלאת התמונה נכשלה');
                          }
                          setIsUploadingDraftImage(false);
                        }
                      }}
                    >
                      <Upload className="w-4 h-4" aria-hidden="true" />
                      {isUploadingDraftImage ? 'מעלה...' : 'גרור או לחץ להוספת תמונה'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingDraftImage}
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (files) {
                            setIsUploadingDraftImage(true);
                            for (const file of Array.from(files)) {
                              const url = await uploadFile(file);
                              if (url) {
                                setPostDraft((current) => ({ ...current, gallery: [...current.gallery, { src: url, alt: file.name, caption: '' }] }));
                              }
                            }
                            setSuccess('תמונות נוספו לגלריה');
                            setIsUploadingDraftImage(false);
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>

                    {/* Gallery Image Picker */}
                    {publishedPosts.some(p => p.featuredImage?.src || p.gallery?.length) && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-xs text-muted-theme ml-1">מגלריה:</span>
                        {(() => {
                          const allImgs = publishedPosts.flatMap(p => {
                            const imgs: { src: string; alt?: string }[] = [];
                            if (p.featuredImage?.src) imgs.push({ src: p.featuredImage.src, alt: p.featuredImage.alt });
                            if (p.gallery?.length) p.gallery.forEach(g => imgs.push({ src: g.src, alt: g.alt }));
                            return imgs;
                          });
                          return [...new Map(allImgs.map(i => [i.src, i])).values()].map((img) => {
                            const isPinned = postDraft.gallery.some(g => g.src === img.src);
                            return (
                              <button
                                key={img.src}
                                type="button"
                                onClick={() => {
                                  if (isPinned) {
                                    updateDraft({ gallery: postDraft.gallery.filter(g => g.src !== img.src) });
                                  } else {
                                    updateDraft({ gallery: [...postDraft.gallery, { src: img.src, alt: img.alt || '', caption: '' }] });
                                  }
                                }}
                                className={`relative shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all hover:border-sage/60 ${
                                  isPinned ? 'border-sage' : 'border-border-theme'
                                }`}
                                title={isPinned ? 'לחץ להסרה מהגלריה' : (img.alt || 'הוסף לגלריה')}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.src} alt={img.alt || ''} className={`w-full h-full object-cover ${isPinned ? 'opacity-60' : ''}`} loading="lazy" />
                                {isPinned && (
                                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-sage text-white text-[7px]">📌</span>
                                )}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Featured image preview */}
                  {postDraft.imageSrc && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-sage/30 bg-white/5">
                      <div className="flex items-center gap-2 px-3 pt-2">
                        <span className="text-xs font-bold text-sage">★ תמונה ראשית</span>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={postDraft.imageSrc}
                        alt={postDraft.imageAlt || postDraft.title}
                        className="h-44 w-full object-cover"
                      />
                      <div className="p-3 text-xs text-muted-theme">
                        {postDraft.imageCaption || postDraft.imageAlt || 'תמונה ראשית לפוסט'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="edit-content-type" className="block text-xs font-bold text-muted-theme mb-2">סוג תוכן</label>
                    <select
                      id="edit-content-type"
                      value={postDraft.contentType}
                      onChange={(e) => updateDraft({ contentType: e.target.value })}
                      className="w-full min-h-11 rounded-xl border border-border-theme bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-sage/50"
                    >
                      <option value="story">סיפור</option>
                      <option value="audio-story">סיפור אודיו</option>
                      <option value="whatsapp-friday">וואטס יום ו׳</option>
                      <option value="photo">תמונה</option>
                      <option value="message">הודעה</option>
                      <option value="memory">זיכרון</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-category" className="block text-xs font-bold text-muted-theme mb-2">קטגוריה</label>
                    <select
                      id="edit-category"
                      value={postDraft.category}
                      onChange={(e) => updateDraft({ category: e.target.value })}
                      className="w-full min-h-11 rounded-xl border border-border-theme bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-sage/50"
                    >
                      <option value="family">משפחה</option>
                      <option value="memories">זכרונות</option>
                      <option value="thoughts">מחשבות</option>
                      <option value="inspiration">השראה</option>
                      <option value="reflection">הרהור</option>
                      <option value="moments">רגעים</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-weather" className="block text-xs font-bold text-muted-theme mb-2">מזג אוויר</label>
                    <select
                      id="edit-weather"
                      value={postDraft.weather}
                      onChange={(e) => updateDraft({ weather: e.target.value })}
                      className="w-full min-h-11 rounded-xl border border-border-theme bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-sage/50"
                    >
                      <option value="sunny">שמש</option>
                      <option value="cloudy">עננים</option>
                      <option value="rainy">גשום</option>
                      <option value="windy">רוחות</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="post-tags" className="block text-xs font-bold text-muted-theme mb-2">תגיות</label>
                  <input
                    id="post-tags"
                    value={postDraft.tagsText}
                    onChange={(e) => updateDraft({ tagsText: e.target.value })}
                    placeholder="משפחה, זכרונות, חוף"
                    className="w-full min-h-11 rounded-xl border border-border-theme bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-sage/50"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft}
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-3 rounded-2xl bg-sage px-6 text-base font-bold text-white hover:bg-sage/90 disabled:opacity-60"
                  >
                    {isSavingDraft ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Save className="w-5 h-5" aria-hidden="true" />}
                    {editingSlug ? 'עדכן פוסט' : 'פרסם פוסט'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDraft({ archived: !postDraft.archived })}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-6 text-sm font-bold transition-all ${
                      postDraft.archived
                        ? 'bg-warm-gold/10 text-warm-gold border-warm-gold/30'
                        : 'border-border-theme text-muted-theme hover:border-warm-gold/40'
                    }`}
                  >
                    <Archive className="w-4 h-4" aria-hidden="true" />
                    {postDraft.archived ? 'ביטול ארכוב' : 'ארכב פוסט'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="w-12 h-12 text-muted-theme/20 mb-4" aria-hidden="true" />
                <p className="text-muted-theme font-medium">בחר פוסט מהרשימה או צור פוסט חדש</p>
              </div>
            )}
          </div>
        </section>

        {/* Delete Password Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm mx-4 border border-border-theme" dir="rtl">
              <h3 className="text-lg font-bold mb-2">אישור מחיקה</h3>
              <p className="text-sm text-muted-theme mb-4">יש להזין סיסמת מנהל כדי למחוק את הפוסט</p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="סיסמת מנהל"
                className="w-full min-h-11 rounded-xl border border-border-theme bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-sage/50 mb-4"
                onKeyDown={(e) => { if (e.key === 'Enter') confirmDeletePost(); }}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelDeletePost}
                  className="flex-1 min-h-11 rounded-xl border border-border-theme bg-white/5 text-sm font-bold"
                >
                  ביטול
                </button>
                <button
                  type="button"
                  onClick={confirmDeletePost}
                  className="flex-1 min-h-11 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600"
                >
                  מחק פוסט
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Management */}
        <section id="gallery-management" className="bg-white/5 rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-8 mb-8 sm:mb-12 border border-border-theme">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-coral/15 shrink-0">
              <Camera className="w-5 h-5 text-coral" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold">ניהול גלריה</h2>
              <p className="text-sm text-muted-theme">בחר אילו תמונות יופיעו בדף הגלריה. תמונות AI לא מוצגות כברירת מחדל.</p>
            </div>
            <div className="flex gap-1 items-center" dir="ltr">
              {/* Hide AI toggle */}
              <button
                type="button"
                onClick={() => setHideAiImages(v => !v)}
                className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${hideAiImages ? 'bg-warm-gold/10 border-warm-gold/40 text-warm-gold' : 'border-border-theme text-muted-theme hover:border-border-theme/70'}`}
                aria-pressed={hideAiImages}
                title="הסתר תמונות AI"
              >
                <WandSparkles className="w-3.5 h-3.5" aria-hidden="true" />
                הסתר AI
              </button>
              {/* Sort */}
              <select
                value={gallerySort}
                onChange={(e) => setGallerySort(e.target.value as typeof gallerySort)}
                className="appearance-none rounded-lg border border-border-theme bg-white/5 px-2 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-sage/50 cursor-pointer"
                aria-label="מיון"
              >
                <option value="post">לפי פוסט</option>
                <option value="date">לפי תאריך</option>
                <option value="ai">AI אחרונים</option>
              </select>
              {/* View toggle */}
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
            </div>
          </div>

          {/* Upload new image to gallery — drag & drop + paste */}
          <div className="mb-6 rounded-2xl border-2 border-dashed border-border-theme bg-white/5 p-4 transition-colors">
            <label className="flex flex-col sm:flex-row items-center justify-center gap-3 cursor-pointer"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.closest('div')!.style.borderColor = 'var(--color-sage, #7a9a7a)'; }}
              onDragLeave={(e) => { (e.currentTarget.closest('div') as HTMLElement).style.borderColor = ''; }}
              onDrop={async (e) => {
                e.preventDefault();
                const div = e.currentTarget.closest('div') as HTMLElement;
                if (div) div.style.borderColor = '';
                const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
                if (file) {
                  const url = await uploadFile(file);
                  if (url) { setLastUploadedUrl(url); setAssignToPostSlug(''); }
                  else setError('העלאת התמונה נכשלה');
                }
              }}
            >
              <span className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-navy px-4 text-sm font-bold text-cream hover:bg-navy/90 transition-colors">
                <Upload className="w-4 h-4" aria-hidden="true" />
                העלאת תמונה חדשה לגלריה
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await uploadFile(file);
                    if (url) { setLastUploadedUrl(url); setAssignToPostSlug(''); }
                    else setError('העלאת התמונה נכשלה');
                  }
                  e.target.value = '';
                }}
              />
              <p className="text-xs text-muted-theme">גרור תמונה לכאן, הדבק (Ctrl+V), או לחץ לבחירה</p>
            </label>
          </div>

          {/* Uploaded image — assign to post */}
          {lastUploadedUrl && (
            <div className="mb-6 rounded-2xl border border-sage/40 bg-sage/5 p-4">
              <p className="text-sm font-bold text-sage mb-3">התמונה הועלתה — שייך אותה לפוסט:</p>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lastUploadedUrl} alt="תמונה שהועלתה" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border-theme" />
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
                  <div className="flex gap-2">
                    <select
                      value={assignToPostSlug}
                      onChange={e => setAssignToPostSlug(e.target.value)}
                      className="flex-1 min-w-0 rounded-lg border border-border-theme bg-white/5 px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-sage/50"
                    >
                      <option value="">בחר פוסט...</option>
                      {publishedPosts.map(p => (
                        <option key={p.slug} value={p.slug}>{p.title}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAssignImageToPost}
                      disabled={!assignToPostSlug || isAssigningImage}
                      className="shrink-0 flex items-center gap-1.5 rounded-lg bg-sage px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40 hover:bg-sage/80 transition-colors"
                    >
                      {isAssigningImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      הוסף
                    </button>
                    <button
                      type="button"
                      onClick={() => setLastUploadedUrl(null)}
                      className="shrink-0 px-2 py-1.5 rounded-lg border border-border-theme text-xs text-muted-theme hover:text-foreground transition-colors"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoadingPosts ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-sage" aria-hidden="true" />
            </div>
          ) : (() => {
            // Collect all images from all posts
            type GalleryEntry = {
              slug: string;
              postTitle: string;
              postDate: string;
              type: 'featured' | 'gallery';
              index?: number;
              src: string;
              alt?: string;
              aiGenerated?: boolean;
              showInGallery: boolean;
            };
            const entries: GalleryEntry[] = publishedPosts.flatMap((post) => {
              const results: GalleryEntry[] = [];
              if (post.gallery?.length) {
                post.gallery.forEach((img, i) => {
                  const key = `${post.slug}:gallery:${i}`;
                  const aiGen = !!img.aiGenerated;
                  const defaultShow = !aiGen;
                  const show = key in galleryOverrides ? galleryOverrides[key] : (img.showInGallery ?? defaultShow);
                  results.push({ slug: post.slug, postTitle: post.title, postDate: post.date, type: 'gallery', index: i, src: img.src, alt: img.alt, aiGenerated: aiGen, showInGallery: show });
                });
              } else if (post.featuredImage?.src) {
                const key = `${post.slug}:featured`;
                const aiGen = !!post.featuredImage.aiGenerated;
                const defaultShow = !aiGen;
                const show = key in galleryOverrides ? galleryOverrides[key] : (post.featuredImage.showInGallery ?? defaultShow);
                results.push({ slug: post.slug, postTitle: post.title, postDate: post.date, type: 'featured', src: post.featuredImage.src, alt: post.featuredImage.alt, aiGenerated: aiGen, showInGallery: show });
              }
              return results;
            });

            const visibleEntries = hideAiImages ? entries.filter(e => !e.aiGenerated) : entries;

            if (visibleEntries.length === 0) {
              return (
                <p className="rounded-xl border border-dashed border-border-theme p-6 text-center text-sm text-muted-theme">
                  {hideAiImages && entries.length > 0 ? 'כל התמונות הן AI. בטל את הסינון כדי לראות אותן.' : 'אין תמונות. הוסף שדה '}
                  {!hideAiImages && <code className="font-mono text-xs">gallery</code>}
                  {!hideAiImages && ' לפרונטמטר של פוסט כדי לנהל תמונות כאן.'}
                </p>
              );
            }

            const sorted = [...visibleEntries].sort((a, b) => {
              if (gallerySort === 'ai') return Number(a.aiGenerated) - Number(b.aiGenerated);
              if (gallerySort === 'date') return new Date(b.postDate).getTime() - new Date(a.postDate).getTime();
              return a.postTitle.localeCompare(b.postTitle, 'he');
            });

            if (galleryView === 'list') {
              return (
                <div className="space-y-2">
                  {sorted.map((entry) => {
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
                          {isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                          ) : entry.showInGallery ? (
                            <><Eye className="w-3.5 h-3.5" aria-hidden="true" />מוצגת</>
                          ) : (
                            <><EyeOff className="w-3.5 h-3.5" aria-hidden="true" />מוסתרת</>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            }

            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {sorted.map((entry) => {
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
                      {/* AI badge */}
                      {entry.aiGenerated && (
                        <span className="absolute top-1.5 right-1.5 rounded-full bg-warm-gold/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          AI
                        </span>
                      )}
                      {/* Hidden overlay */}
                      {!entry.showInGallery && (
                        <div className="absolute inset-0 flex items-center justify-center bg-navy/30 pointer-events-none">
                          <EyeOff className="w-6 h-6 text-white/70" aria-hidden="true" />
                        </div>
                      )}
                      {/* Info + toggle */}
                      <div className="p-2">
                        <p className="text-xs text-muted-theme truncate mb-1.5">{entry.postTitle}</p>
                        <button
                          type="button"
                          onClick={() => handleToggleGallery(entry.slug, entry.type, entry.index, entry.showInGallery)}
                          disabled={isPending}
                          className={[
                            'w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-colors duration-200',
                            entry.showInGallery
                              ? 'bg-sage/10 text-sage hover:bg-red-500/10 hover:text-red-500'
                              : 'bg-coral/10 text-coral hover:bg-coral/20',
                            isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer',
                          ].join(' ')}
                          aria-label={entry.showInGallery ? 'הסר מגלריה' : 'הוסף לגלריה'}
                        >
                          {isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                          ) : entry.showInGallery ? (
                            <><Eye className="w-3.5 h-3.5" aria-hidden="true" />מוצגת</>
                          ) : (
                            <><EyeOff className="w-3.5 h-3.5" aria-hidden="true" />מוסתרת</>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </section>

        {/* Comments Overview */}
        <section id="comments-overview" className="bg-white/5 rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-8 mb-8 sm:mb-12 border border-border-theme">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">תגובות אחרונות</h2>
              <p className="text-sm text-muted-theme">תגובות לפי פוסט וספר אורחים</p>
            </div>
            <button
              type="button"
              onClick={refreshComments}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border-theme bg-white/5 px-3 text-xs font-bold hover:border-sage/40"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingComments ? 'animate-spin' : ''}`} aria-hidden="true" />
              רענן
            </button>
          </div>

          {commentGroups.length > 0 ? (
            <div className="space-y-3">
              {commentGroups.map((group) => (
                <details key={group.slug} className="rounded-2xl border border-border-theme bg-navy/[0.02] p-3 sm:p-4">
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm sm:text-base font-bold text-navy">{group.title}</h3>
                        <p className="text-xs text-muted-theme">{group.comments.length} תגובות</p>
                      </div>
                      <MessageCircle className="w-5 h-5 shrink-0 text-sage" aria-hidden="true" />
                    </div>
                  </summary>
                  <div className="mt-4 space-y-3">
                    {group.comments.slice(0, 5).map((comment) => (
                      <article key={comment.id} className="rounded-xl border border-border-theme bg-white/5 p-3">
                        <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-theme">
                          <span className="font-bold text-foreground">{comment.name}</span>
                          <span aria-hidden="true">•</span>
                          <time dateTime={new Date(comment.date).toISOString()}>
                            {format(new Date(comment.date), 'dd/MM/yyyy HH:mm')}
                          </time>
                          <button
                            onClick={() => handleDeleteComment(group.slug, comment.id)}
                            className="mr-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-theme hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200"
                            title="מחק תגובה"
                            aria-label="מחק תגובה"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            מחק
                          </button>
                        </div>
                        <p className="text-sm leading-7 text-foreground/90">{comment.message}</p>
                      </article>
                    ))}
                    {group.comments.length > 5 && (
                      <p className="text-xs font-medium text-muted-theme">מוצגות 5 התגובות האחרונות מתוך {group.comments.length}</p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-border-theme py-10 text-center">
              {isLoadingComments ? (
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-sage" aria-hidden="true" />
              ) : (
                <>
                  <MessageCircle className="mx-auto mb-3 h-9 w-9 text-muted-theme/30" aria-hidden="true" />
                  <p className="text-sm font-medium text-muted-theme">עדיין אין תגובות להצגה.</p>
                </>
              )}
            </div>
          )}
        </section>

        {/* Published Posts List - hidden, posts managed via editor sidebar */}
      </div>
    </div>
  );
}
