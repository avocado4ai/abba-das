'use client';

import React, { useState, useEffect } from 'react';
import { parseWhatsAppExport, WhatsAppMessage } from '@/lib/whatsapp-parser';
import { Upload, FileText, AlertCircle, Loader2, Save, ArrowRight, ExternalLink, X, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { PostData } from '@/lib/github';

const generateSlug = (dateStr: string) => {
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${dateStr}-${randomSuffix}`;
};

export default function AdminPage() {
  const [sender, setSender] = useState('');
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<PostData[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState<number | null>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPosts = async () => {
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sender) {
      setError(sender ? 'אנא בחר קובץ' : 'אנא הזן שם שולח תחילה');
      return;
    }

    setIsParsing(true);
    setError(null);
    setSuccess(null);

    try {
      const text = await file.text();
      const parsedMessages = parseWhatsAppExport(text, sender);
      setMessages(parsedMessages);
      if (parsedMessages.length === 0) {
        setError('לא נמצאו הודעות עבור שולח זה.');
      } else {
        setSuccess(`נטענו ${parsedMessages.length} הודעות בהצלחה`);
      }
    } catch {
      setError('נכשל בניתוח הקובץ.');
    } finally {
      setIsParsing(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleSavePost = async (index: number, msg: WhatsAppMessage) => {
    setIsSaving(index);
    setError(null);
    setSuccess(null);

    const dateStr = format(msg.date, 'yyyy-MM-dd');
    const firstLine = msg.content.split('\n')[0].trim();
    const title = firstLine.substring(0, 50) || `סיפור מ-${dateStr}`;
    const slug = generateSlug(dateStr);

    try {
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: msg.content,
          date: msg.date.toISOString(),
          slug,
        }),
      });

      if (!res.ok) throw new Error('נכשל בשמירה ל-GitHub');
      
      setMessages(prev => prev.filter((_, i) => i !== index));
      setSuccess('הסיפור פורסם בהצלחה!');
      fetchPosts();
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
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-12 border-b border-border-theme pb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-3 tracking-tight">ניהול הבלוג</h1>
            <p className="text-sage font-medium">ייבוא הודעות וואטסאפ והפיכתן לסיפורים</p>
          </div>
          <div className="flex items-center gap-6 self-start md:self-auto">
            <ThemeSwitcher />
            <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted-theme hover:text-navy transition-all group">
              חזרה לבלוג
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </header>

        {/* Upload Section */}
        <section className="bg-white/5 rounded-3xl shadow-sm p-8 mb-12 border border-border-theme">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-muted-theme">זיהוי השולח (שם כפי שמופיע בוואטסאפ)</label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="למשל: אבא"
                className="w-full p-4 rounded-2xl border border-border-theme bg-white/5 focus:ring-2 focus:ring-sage/50 outline-none transition-all text-lg"
              />
            </div>
            
            <div className="relative">
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={!sender || isParsing}
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center justify-center gap-3 p-4 rounded-2xl cursor-pointer transition-all text-lg font-bold shadow-sm ${
                  !sender ? 'bg-muted-theme/10 text-muted-theme cursor-not-allowed' : 'bg-navy text-cream hover:bg-navy/90 active:scale-[0.98]'
                }`}
              >
                {isParsing ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                <span>טעינת קובץ (txt)</span>
              </label>
            </div>
          </div>

          {(error || success) && (
            <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 font-medium animate-in fade-in slide-in-from-top-2 ${
              error ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-sage/10 text-sage border border-sage/20'
            }`}>
              {error ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              <span>{error || success}</span>
            </div>
          )}
        </section>

        {/* Messages List */}
        <section className="space-y-8">
          <div className="flex justify-between items-center border-b border-border-theme pb-4">
            <h2 className="text-2xl font-bold">הודעות חדשות ({messages.length})</h2>
            {messages.length > 0 && (
              <button 
                onClick={() => setMessages([])}
                className="text-sm font-bold text-red-400 hover:text-red-500 transition-colors"
              >
                נקה הכל
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className="bg-white/5 rounded-3xl shadow-sm border border-border-theme overflow-hidden group hover:border-sage/30 transition-all hover:shadow-md animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-navy/[0.02] px-6 py-3 border-b border-border-theme flex justify-between items-center text-xs font-bold text-muted-theme">
                  <span className="font-mono">{format(msg.date, 'dd/MM/yyyy HH:mm')}</span>
                  <div className="flex items-center gap-4">
                    <span>{msg.sender}</span>
                    <button 
                      onClick={() => dismissMessage(index)}
                      className="p-1 hover:text-red-400 transition-colors"
                      title="הסר"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <p className="whitespace-pre-wrap text-xl leading-relaxed text-foreground/90 mb-8 font-stories">{msg.content}</p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSavePost(index, msg)}
                      disabled={isSaving !== null}
                      className="flex items-center gap-3 bg-sage text-white px-8 py-3 rounded-2xl font-bold hover:bg-sage/90 transition-all disabled:opacity-50 shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                      {isSaving === index ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                      <span>פרסם כסיפור</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {messages.length === 0 && !isParsing && (
              <div className="text-center py-24 bg-white/[0.02] rounded-3xl border-2 border-dashed border-border-theme">
                <FileText className="mx-auto text-muted-theme/20 mb-6" size={64} />
                <p className="text-muted-theme text-lg font-medium">העלה קובץ שיחה כדי לראות הודעות כאן</p>
              </div>
            )}
          </div>
        </section>

        {/* Published Posts List */}
        <section className="mt-32 pt-16 border-t border-border-theme">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold">סיפורים שכבר פורסמו</h2>
            {isLoadingPosts && <Loader2 className="w-5 h-5 animate-spin text-sage" />}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publishedPosts.map((post) => (
              <div key={post.slug} className="bg-white/5 p-5 rounded-2xl border border-border-theme flex justify-between items-center group hover:bg-white/10 hover:shadow-sm transition-all">
                <div className="overflow-hidden">
                  <h4 className="font-bold text-navy truncate mb-1 group-hover:text-sage transition-colors">{post.title}</h4>
                  <p className="text-xs font-bold text-muted-theme">{format(new Date(post.date), 'dd/MM/yyyy')}</p>
                </div>
                <Link 
                  href={`/post/${post.slug}`}
                  target="_blank"
                  className="p-3 text-muted-theme/20 hover:text-navy transition-all bg-white/5 rounded-xl group-hover:bg-sage/10 group-hover:text-sage"
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
