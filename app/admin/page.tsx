'use client';

import React, { useState, useEffect } from 'react';
import { parseWhatsAppExport, WhatsAppMessage } from '@/lib/whatsapp-parser';
import { Upload, FileText, AlertCircle, Loader2, Save, ArrowRight, ExternalLink, X, CheckCircle2, Inbox, BookOpen, Image as ImageIcon, WandSparkles, Copy, Plus, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import ThemeSwitcher from "@/components/ThemeSwitcher";
import type { PostData } from '@/lib/posts';

const generateSlug = (dateStr: string) => {
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${dateStr}-${randomSuffix}`;
};

type PostDraft = {
  title: string;
  slug: string;
  date: string;
  content: string;
  tagsText: string;
  weather: string;
  contentType: string;
  category: string;
  imageSrc: string;
  imageAlt: string;
  imageCaption: string;
};

const createEmptyDraft = (): PostDraft => ({
  title: '',
  slug: generateSlug(format(new Date(), 'yyyy-MM-dd')),
  date: new Date().toISOString().slice(0, 10),
  content: '',
  tagsText: '',
  weather: 'sunny',
  contentType: 'story',
  category: 'memories',
  imageSrc: '',
  imageAlt: '',
  imageCaption: '',
});

const postToDraft = (post: PostData): PostDraft => ({
  title: post.title,
  slug: post.slug,
  date: post.date ? new Date(post.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
  content: post.content,
  tagsText: (post.tags || []).join(', '),
  weather: post.weather || 'sunny',
  contentType: post.contentType || 'story',
  category: post.category || 'memories',
  imageSrc: post.featuredImage?.src || '',
  imageAlt: post.featuredImage?.alt || post.title,
  imageCaption: post.featuredImage?.caption || '',
});

const splitTags = (tagsText: string) =>
  tagsText
    .split(',')
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter(Boolean);

export default function AdminPage() {
  const [sender, setSender] = useState('');
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<PostData[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState<number | null>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [senderError, setSenderError] = useState<string | null>(null);
  const [messageMetadata, setMessageMetadata] = useState<Record<number, {contentType: string; category: string; weather: string}>>({});
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [postDraft, setPostDraft] = useState<PostDraft>(() => createEmptyDraft());
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isUploadingDraftImage, setIsUploadingDraftImage] = useState(false);
  const [geminiPrompt, setGeminiPrompt] = useState('');


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

    loadPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      setError('אנא בחר קבצים');
      return;
    }
    if (!sender.trim()) {
      setSenderError('אנא הזן שם שולח תחילה');
      return;
    }

    setIsParsing(true);
    setError(null);
    setSenderError(null);
    setSuccess(null);

    try {
      const txtFile = files.find(f => f.name.endsWith('.txt'));
      const otherFiles = files.filter(f => !f.name.endsWith('.txt'));

      if (otherFiles.length > 0) {
        setAttachedFiles(prev => [...prev, ...otherFiles]);
      }

      if (txtFile) {
        const text = await txtFile.text();
        const parsedMessages = parseWhatsAppExport(text, sender);
        setMessages(parsedMessages);
        if (parsedMessages.length === 0) {
          setError('לא נמצאו הודעות עבור שולח זה.');
        } else {
          setSuccess(`נטענו ${parsedMessages.length} הודעות, ו-${otherFiles.length} קבצים מצורפים`);
        }
      } else {
        setSuccess(`נוספו ${otherFiles.length} קבצים מצורפים`);
      }
    } catch {
      setError('נכשל בניתוח הקבצים.');
    } finally {
      setIsParsing(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.url;
    } catch (e) {
      console.error(e);
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

  const updateDraft = (changes: Partial<PostDraft>) => {
    setPostDraft((current) => ({ ...current, ...changes }));
  };

  const startEditingPost = (post: PostData) => {
    setEditingSlug(post.slug);
    setPostDraft(postToDraft(post));
    setGeminiPrompt('');
    setError(null);
    setSuccess(null);
  };

  const startNewPost = () => {
    setEditingSlug(null);
    setPostDraft(createEmptyDraft());
    setGeminiPrompt('');
    setError(null);
    setSuccess(null);
  };

  const buildPostFromDraft = (): PostData => ({
    title: postDraft.title.trim(),
    slug: postDraft.slug.trim(),
    content: postDraft.content.trim(),
    date: new Date(postDraft.date).toISOString(),
    tags: splitTags(postDraft.tagsText),
    weather: postDraft.weather,
    contentType: postDraft.contentType as PostData['contentType'],
    category: postDraft.category as PostData['category'],
    featuredImage: postDraft.imageSrc.trim()
      ? {
          src: postDraft.imageSrc.trim(),
          alt: postDraft.imageAlt.trim() || postDraft.title.trim(),
          caption: postDraft.imageCaption.trim(),
        }
      : undefined,
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

  const buildGeminiPrompt = async () => {
    const prompt = `צור תמונה ראשית לפוסט זיכרון משפחתי בעברית.

כותרת הפוסט: ${postDraft.title || 'ללא כותרת'}
תקציר התוכן: ${postDraft.content.slice(0, 700)}

סגנון: איור/צילום רך, מכבד ואינטימי, צבעים תואמים לאתר אבא-דס: ירוק מרווה, קורל עדין, זהב חם, רקע בהיר ונקי. בלי טקסט בתוך התמונה. קומפוזיציה שמתאימה לכרטיס בלוג אופקי ולמסך מובייל.

החזר גם:
1. תיאור ALT קצר בעברית
2. קפשן קצר לתמונה`;

    setGeminiPrompt(prompt);
    try {
      await navigator.clipboard.writeText(prompt);
      setSuccess('הפרומפט הועתק. אפשר לפתוח את Gemini ולהדביק אותו שם.');
    } catch {
      setSuccess('הפרומפט מוכן להעתקה ידנית.');
    }
  };

  const handleSavePost = async (index: number, msg: WhatsAppMessage) => {
    setIsSaving(index);
    setError(null);
    setSuccess(null);

    let finalContent = msg.content;

    // Process attachments
    if (msg.attachments && msg.attachments.length > 0) {
      for (const attachmentName of msg.attachments) {
        const fileToUpload = attachedFiles.find(f => f.name === attachmentName);
        if (fileToUpload) {
          const url = await uploadFile(fileToUpload);
          if (url) {
            // Replace the attachment placeholder with markdown
            const isVideo = fileToUpload.type.startsWith('video/');
            const markdownMedia = isVideo ? `\n\n<video controls src="${url}"></video>\n\n` : `\n\n![${attachmentName}](${url})\n\n`;
            
            // Regex to replace either "filename.jpg (file attached)" or "<attached: filename.jpg>"
            const regex = new RegExp(`${attachmentName}\\s*\\(file attached\\)|<attached:\\s*${attachmentName}>`, 'gi');
            finalContent = finalContent.replace(regex, markdownMedia);
          }
        }
      }
    }

    const dateStr = format(msg.date, 'yyyy-MM-dd');
    const firstLine = finalContent.split('\n')[0].trim();
    // remove markdown image syntax from title if present
    const cleanFirstLine = firstLine.replace(/!\[.*?\]\(.*?\)/g, '').trim();
    const title = cleanFirstLine.substring(0, 50) || `סיפור מ-${dateStr}`;
    const slug = generateSlug(dateStr);

    try {
      const metadata = messageMetadata[index] || { contentType: 'story', category: 'memories', weather: 'sunny' };

      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: finalContent,
          date: msg.date.toISOString(),
          slug,
          tags: msg.tags || [],
          contentType: metadata.contentType,
          category: metadata.category,
          weather: metadata.weather,
        }),
      });

      if (!res.ok) throw new Error('נכשל בשמירת הסיפור');

      setMessages(prev => prev.filter((_, i) => i !== index));
      setSuccess('הסיפור נשמר בהצלחה!');

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'אירעה שגיאה לא ידועה');
    } finally {
      setIsSaving(null);
    }
  };

  const dismissMessage = (index: number) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-sage/30 transition-colors duration-300 dir-rtl" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 md:py-20">
        <header className="mb-6 sm:mb-10 border-b border-border-theme pb-5 sm:pb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4 sm:gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 tracking-tight">ניהול הבלוג</h1>
            <p className="text-sm sm:text-base text-sage font-medium">ייבוא הודעות וואטסאפ והפיכתן לסיפורים</p>
          </div>
          <div className="flex items-center justify-between gap-3 self-stretch md:self-auto">
            <Link href="/" className="flex min-h-10 items-center gap-2 rounded-full border border-border-theme bg-white/5 px-4 text-sm font-bold text-muted-theme hover:text-navy transition-colors duration-250 group">
              חזרה לבלוג
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-250" />
            </Link>
            <ThemeSwitcher />
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-10">
          <div className="rounded-2xl border border-border-theme bg-white/5 p-4">
            <div className="flex items-center gap-2 text-muted-theme text-xs font-bold mb-1">
              <Inbox className="w-4 h-4" aria-hidden="true" />
              ממתינות
            </div>
            <div className="text-2xl font-bold text-foreground">{messages.length}</div>
          </div>
          <div className="rounded-2xl border border-border-theme bg-white/5 p-4">
            <div className="flex items-center gap-2 text-muted-theme text-xs font-bold mb-1">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              פורסמו
            </div>
            <div className="text-2xl font-bold text-foreground">{publishedPosts.length}</div>
          </div>
        </div>

        {/* Upload Section */}
        <section className="bg-white/5 rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-8 mb-8 sm:mb-12 border border-border-theme">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 items-end">
            <div className="space-y-2 sm:space-y-3">
              <label htmlFor="sender-input" className="block text-sm font-bold text-muted-theme">זיהוי השולח (שם כפי שמופיע בוואטסאפ)</label>
              <input
                id="sender-input"
                type="text"
                value={sender}
                onChange={(e) => {
                  setSender(e.target.value);
                  if (senderError) setSenderError(null);
                }}
                onBlur={() => {
                  if (!sender.trim() && sender) {
                    setSenderError('שם השולח לא יכול להיות ריק');
                  }
                }}
                placeholder="למשל: אבא"
                aria-required="true"
                aria-invalid={!!senderError}
                aria-describedby={senderError ? "sender-error" : undefined}
                className={`w-full min-h-12 p-3 sm:p-4 rounded-2xl border-2 bg-white/5 outline-none transition-all text-base sm:text-lg focus:ring-2 focus:ring-sage/50 ${
                  senderError
                    ? 'border-red-500/50 focus:ring-red-500/30'
                    : 'border-border-theme'
                }`}
              />
              {senderError && (
                <p id="sender-error" className="text-sm text-red-500 font-medium animate-in fade-in">
                  ⚠️ {senderError}
                </p>
              )}
            </div>
            
            <div className="relative">
              <input
                type="file"
                accept=".txt,.jpg,.jpeg,.png,.gif,.mp4,.webp"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={!sender || isParsing}
              />
              <label
                htmlFor="file-upload"
                className={`flex min-h-14 flex-col items-center justify-center gap-1.5 sm:gap-2 p-4 rounded-2xl cursor-pointer text-base sm:text-lg font-bold ${
                  !sender ? 'bg-muted-theme/10 text-muted-theme cursor-not-allowed' : 'bg-navy text-cream hover:bg-navy/90'
                } transition-all duration-250`}
              >
                <div className="flex items-center gap-3">
                  {isParsing ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                  <span>טעינת קובץ (txt + תמונות)</span>
                </div>
                {attachedFiles.length > 0 && (
                  <span className="text-sm font-normal text-cream/70">
                    {attachedFiles.length} קבצים ממתינים לפרסום
                  </span>
                )}
              </label>
            </div>
          </div>

          {(error || success) && (
            <div
              className={`mt-5 sm:mt-6 p-3 sm:p-4 rounded-2xl flex items-center gap-3 text-sm sm:text-base font-medium animate-in fade-in slide-in-from-top-2 ${
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
        </section>

        {/* Post Editor */}
        <section className="bg-white/5 rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-8 mb-8 sm:mb-12 border border-border-theme">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">עריכת פוסטים</h2>
              <p className="text-sm text-muted-theme">פוסטים, תמונות ראשיות ותוכן הבלוג מנוהלים מכאן</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-5">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="post-title" className="block text-xs font-bold text-muted-theme mb-2">כותרת</label>
                  <input
                    id="post-title"
                    value={postDraft.title}
                    onChange={(e) => updateDraft({ title: e.target.value })}
                    className="w-full min-h-11 rounded-xl border border-border-theme bg-white/5 px-3 text-base outline-none focus:ring-2 focus:ring-sage/50"
                  />
                </div>
                <div>
                  <label htmlFor="post-slug" className="block text-xs font-bold text-muted-theme mb-2">מזהה URL</label>
                  <input
                    id="post-slug"
                    value={postDraft.slug}
                    onChange={(e) => updateDraft({ slug: e.target.value.trim() })}
                    className="w-full min-h-11 rounded-xl border border-border-theme bg-white/5 px-3 text-sm font-mono outline-none focus:ring-2 focus:ring-sage/50"
                  />
                </div>
                <div>
                  <label htmlFor="post-date" className="block text-xs font-bold text-muted-theme mb-2">תאריך</label>
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

              <div className="rounded-2xl border border-border-theme bg-navy/[0.02] p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-4 h-4 text-sage" aria-hidden="true" />
                  <h3 className="text-sm font-bold">תמונה ראשית ותמונות בתוכן</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    value={postDraft.imageSrc}
                    onChange={(e) => updateDraft({ imageSrc: e.target.value })}
                    placeholder="URL לתמונה ראשית"
                    className="min-h-11 rounded-xl border border-border-theme bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-sage/50"
                    aria-label="כתובת תמונה ראשית"
                  />
                  <input
                    value={postDraft.imageAlt}
                    onChange={(e) => updateDraft({ imageAlt: e.target.value })}
                    placeholder="ALT לתמונה"
                    className="min-h-11 rounded-xl border border-border-theme bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-sage/50"
                    aria-label="תיאור אלטרנטיבי לתמונה"
                  />
                  <input
                    value={postDraft.imageCaption}
                    onChange={(e) => updateDraft({ imageCaption: e.target.value })}
                    placeholder="קפשן קצר"
                    className="sm:col-span-2 min-h-11 rounded-xl border border-border-theme bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-sage/50"
                    aria-label="קפשן לתמונה"
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-theme bg-white/5 px-3 text-sm font-bold hover:border-sage/40">
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    העלה כתמונה ראשית
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingDraftImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleDraftImageUpload(file, 'featured');
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-theme bg-white/5 px-3 text-sm font-bold hover:border-sage/40">
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    הוסף תמונה לתוכן
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingDraftImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleDraftImageUpload(file, 'content');
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-border-theme bg-warm-gold/10 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold">
                      <WandSparkles className="w-4 h-4 text-warm-gold" aria-hidden="true" />
                      עזרת Gemini לתמונה
                    </h3>
                    <p className="text-xs text-muted-theme">יצירת פרומפט מותאם לצבעים ולסגנון האתר</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={buildGeminiPrompt}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-navy px-3 text-xs font-bold text-cream"
                    >
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      העתק פרומפט
                    </button>
                    <a
                      href="https://gemini.google.com/app"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border-theme bg-white/5 px-3 text-xs font-bold"
                    >
                      Gemini
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
                {geminiPrompt && (
                  <textarea
                    readOnly
                    value={geminiPrompt}
                    rows={5}
                    className="mt-3 w-full rounded-xl border border-border-theme bg-white/5 p-3 text-xs leading-6 outline-none"
                    aria-label="פרומפט Gemini"
                  />
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl bg-sage px-6 text-base font-bold text-white hover:bg-sage/90 disabled:opacity-60"
              >
                {isSavingDraft ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Save className="w-5 h-5" aria-hidden="true" />}
                {editingSlug ? 'עדכן פוסט' : 'שמור פוסט חדש'}
              </button>
            </div>

            <aside className="space-y-3">
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
              <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {publishedPosts.map((post) => (
                  <button
                    key={post.slug}
                    type="button"
                    onClick={() => startEditingPost(post)}
                    className={`w-full rounded-xl border p-3 text-right transition-colors ${
                      postDraft.slug === post.slug
                        ? 'border-sage bg-sage/10'
                        : 'border-border-theme bg-white/5 hover:border-sage/40'
                    }`}
                  >
                    <span className="block truncate text-sm font-bold">{post.title}</span>
                    <span className="mt-1 block text-xs text-muted-theme">
                      {post.date ? format(new Date(post.date), 'dd/MM/yyyy') : 'ללא תאריך'}
                    </span>
                  </button>
                ))}
                {publishedPosts.length === 0 && !isLoadingPosts && (
                  <p className="rounded-xl border border-dashed border-border-theme p-4 text-sm text-muted-theme">אין פוסטים להצגה.</p>
                )}
              </div>
            </aside>
          </div>
        </section>

        {/* Messages List */}
        <section className="space-y-5 sm:space-y-8">
          <div className="flex justify-between items-center border-b border-border-theme pb-3 sm:pb-4">
            <h2 className="text-xl sm:text-2xl font-bold">הודעות חדשות ({messages.length})</h2>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-sm font-bold text-red-400 hover:text-red-500 transition-colors duration-250"
              >
                נקה הכל
              </button>
            )}
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className="bg-white/5 rounded-2xl sm:rounded-3xl shadow-sm border border-border-theme overflow-hidden group hover:border-sage/30 transition-all hover:shadow-md animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-navy/[0.02] px-4 sm:px-6 py-3 border-b border-border-theme flex justify-between items-center text-xs font-bold text-muted-theme">
                  <span className="font-mono">{format(msg.date, 'dd/MM/yyyy HH:mm')}</span>
                  <div className="flex items-center gap-4">
                    <span>{msg.sender}</span>
                    <button
                      onClick={() => dismissMessage(index)}
                      className="p-1 hover:text-red-400 transition-colors duration-250"
                      title="הסר"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4 sm:p-8">
                  <p className="whitespace-pre-wrap text-base sm:text-xl leading-relaxed text-foreground/90 mb-5 sm:mb-6 font-stories">{msg.content}</p>
                  
                  {/* Tags Editor */}
                  <div className="flex flex-wrap gap-2 mb-5 sm:mb-8 items-center bg-navy/[0.02] p-3 sm:p-4 rounded-2xl border border-border-theme">
                    <span className="text-xs font-bold text-muted-theme ml-2">תגיות:</span>
                    {msg.tags?.map((tag, tIndex) => (
                      <span key={tIndex} className="bg-sage/10 text-sage text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 group/tag">
                        #{tag}
                        <button
                          onClick={() => {
                            const newTags = msg.tags?.filter((_, i) => i !== tIndex);
                            const newMessages = [...messages];
                            newMessages[index] = { ...msg, tags: newTags };
                            setMessages(newMessages);
                          }}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="הוסף תגית (ואנטר)..."
                      className="bg-transparent text-xs font-medium outline-none text-navy placeholder:text-muted-theme/40 min-w-[120px] focus:ring-1 focus:ring-sage/50 rounded px-1"
                      aria-label="הוסף תגית חדשה"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.currentTarget.value.trim().replace(/^#/, '');
                          if (val) {
                            const newTags = [...(msg.tags || []), val];
                            const newMessages = [...messages];
                            newMessages[index] = { ...msg, tags: newTags };
                            setMessages(newMessages);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>

                  {/* Content Metadata Editor */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-8 bg-navy/[0.02] p-3 sm:p-4 rounded-2xl border border-border-theme">
                    <div>
                      <label htmlFor={`type-${index}`} className="block text-xs font-bold text-muted-theme mb-2">סוג תוכן</label>
                      <select
                        id={`type-${index}`}
                        value={messageMetadata[index]?.contentType || 'story'}
                        onChange={(e) => {
                          setMessageMetadata(prev => ({
                            ...prev,
                            [index]: { ...prev[index], contentType: e.target.value }
                          }));
                        }}
                        className="w-full min-h-11 p-2 rounded-xl border border-border-theme bg-white/5 text-sm font-medium outline-none focus:ring-1 focus:ring-sage/50 text-navy"
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
                      <label htmlFor={`cat-${index}`} className="block text-xs font-bold text-muted-theme mb-2">קטגוריה</label>
                      <select
                        id={`cat-${index}`}
                        value={messageMetadata[index]?.category || 'memories'}
                        onChange={(e) => {
                          setMessageMetadata(prev => ({
                            ...prev,
                            [index]: { ...prev[index], category: e.target.value }
                          }));
                        }}
                        className="w-full min-h-11 p-2 rounded-xl border border-border-theme bg-white/5 text-sm font-medium outline-none focus:ring-1 focus:ring-sage/50 text-navy"
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
                      <label htmlFor={`weather-${index}`} className="block text-xs font-bold text-muted-theme mb-2">מזג אוויר</label>
                      <select
                        id={`weather-${index}`}
                        value={messageMetadata[index]?.weather || 'sunny'}
                        onChange={(e) => {
                          setMessageMetadata(prev => ({
                            ...prev,
                            [index]: { ...prev[index], weather: e.target.value }
                          }));
                        }}
                        className="w-full min-h-11 p-2 rounded-xl border border-border-theme bg-white/5 text-sm font-medium outline-none focus:ring-1 focus:ring-sage/50 text-navy"
                      >
                        <option value="sunny">שמש</option>
                        <option value="cloudy">עננים</option>
                        <option value="rainy">גשום</option>
                        <option value="windy">רוחות</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSavePost(index, msg)}
                      disabled={isSaving !== null}
                      aria-busy={isSaving === index}
                      aria-label={isSaving === index ? 'ממתין לשמירת הסיפור' : 'שמור סיפור זה'}
                      className="flex min-h-12 w-full sm:w-auto items-center justify-center gap-3 bg-sage text-white px-6 sm:px-8 py-3 rounded-2xl font-bold hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-sage/50 focus:ring-offset-2"
                    >
                      {isSaving === index ? <Loader2 className="animate-spin" size={20} aria-hidden="true" /> : <Save size={20} aria-hidden="true" />}
                      <span>{isSaving === index ? 'שומר...' : 'שמור כסיפור'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {messages.length === 0 && !isParsing && (
              <div className="text-center py-14 sm:py-24 bg-white/[0.02] rounded-2xl sm:rounded-3xl border-2 border-dashed border-border-theme">
                <FileText className="mx-auto text-muted-theme/20 mb-4 sm:mb-6" size={56} />
                <p className="text-muted-theme text-base sm:text-lg font-medium">העלה קובץ שיחה כדי לראות הודעות כאן</p>
              </div>
            )}
          </div>
        </section>

        {/* Published Posts List */}
        <section className="mt-16 sm:mt-32 pt-8 sm:pt-16 border-t border-border-theme">
          <div className="flex items-center gap-4 mb-5 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">סיפורים שכבר פורסמו</h2>
            {isLoadingPosts && <Loader2 className="w-5 h-5 animate-spin text-sage" />}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publishedPosts.map((post) => (
              <div key={post.slug} className="bg-white/5 p-4 sm:p-5 rounded-2xl border border-border-theme flex justify-between items-center group hover:bg-white/10 hover:shadow-sm transition-all">
                <div className="overflow-hidden">
                  <h4 className="font-bold text-navy truncate mb-1 group-hover:text-sage transition-colors">{post.title}</h4>
                  <p className="text-xs font-bold text-muted-theme">{format(new Date(post.date), 'dd/MM/yyyy')}</p>
                </div>
                <Link
                  href={`/post/${post.slug}`}
                  target="_blank"
                  className="p-3 text-muted-theme/20 hover:text-navy bg-white/5 rounded-xl group-hover:bg-sage/10 group-hover:text-sage transition-all duration-250"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
            ))}
            {publishedPosts.length === 0 && !isLoadingPosts && (
              <p className="text-muted-theme italic font-medium">עדיין לא פורסמו סיפורים.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
