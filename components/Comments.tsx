'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { CommentData } from '@/lib/github';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface CommentsProps {
  slug: string;
  initialComments: CommentData[];
}

export default function Comments({ slug, initialComments }: CommentsProps) {
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError('אנא הזן את שמך');
      return;
    }
    if (!message.trim()) {
      setError('אנא הזן הודעה');
      return;
    }
    if (message.length > 1000) {
      setError('ההודעה ארוכה מדי (עד 1000 תווים)');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name: name.trim(), message: message.trim() }),
      });

      if (response.ok) {
        const { comment } = await response.json();
        setComments([comment, ...comments]);
        setName('');
        setMessage('');
        setSuccess('תגובתך פורסמה בהצלחה!');
        setTimeout(() => {
          setIsExpanded(false);
          setSuccess(null);
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'נכשל בשליחת התגובה');
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('אירעה שגיאה בשליחת התגובה. אנא נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-20 pt-20 border-t border-border-theme" aria-label="תגובות">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-2xl font-bold text-navy">תגובות ({comments.length})</h3>
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sage font-bold text-sm hover:text-navy transition-colors focus:outline-none focus:ring-2 focus:ring-sage/50 rounded px-2 py-1"
            aria-label="כתוב תגובה חדשה לאבא"
          >
            + כיתבו לאבא
          </button>
        )}
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="mb-16 bg-white/5 p-6 rounded-2xl border border-border-theme animate-in fade-in slide-in-from-top-4 duration-300">
          {(error || success) && (
            <div
              className={`mb-4 p-4 rounded-xl flex items-center gap-3 font-medium animate-in fade-in ${
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
          <div className="space-y-4">
            <div>
              <label htmlFor="comment-name" className="block text-xs font-bold text-muted-theme mb-2">
                השם שלכם *
              </label>
              <input
                id="comment-name"
                type="text"
                placeholder="השם שלכם"
                className="w-full bg-transparent border-b-2 border-border-theme py-2 focus:outline-none focus:border-sage transition-colors text-foreground font-heebo"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                aria-required="true"
                aria-invalid={!!error && !message}
                maxLength={100}
              />
            </div>
            <div>
              <label htmlFor="comment-message" className="block text-xs font-bold text-muted-theme mb-2">
                ההודעה שלכם ({message.length}/1000) *
              </label>
              <textarea
                id="comment-message"
                placeholder="מה תרצו לכתוב?"
                className="w-full bg-transparent border-b-2 border-border-theme py-2 focus:outline-none focus:border-sage transition-colors text-foreground font-stories text-lg min-h-[100px] resize-none"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value.slice(0, 1000));
                  if (error) setError(null);
                }}
                aria-required="true"
                aria-invalid={!!error && message}
                aria-describedby={error ? 'comment-error' : 'comment-counter'}
                maxLength={1000}
              />
              <div id="comment-counter" className="text-xs text-muted-theme/60 mt-1">
                {message.length === 1000 && '(הגעת לגבול התווים)'}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setError(null);
                  setSuccess(null);
                }}
                className="px-4 py-2 text-sm text-muted-theme hover:text-navy transition-colors focus:outline-none focus:ring-2 focus:ring-sage/50 rounded"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !message.trim()}
                aria-busy={isSubmitting}
                className="bg-navy text-cream px-6 py-2 rounded-full text-sm font-bold hover:bg-sage transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-navy/50"
              >
                {isSubmitting ? 'שולח...' : 'פרסום תגובה'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-12" role="region" aria-label={`${comments.length} תגובות`}>
        {comments.length > 0 ? (
          <ol className="list-none space-y-12">
            {comments.map((comment, index) => (
              <li key={comment.id} className="group">
                <article className="focus-within:ring-2 focus-within:ring-sage/50 rounded px-2 py-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-navy font-heebo">
                      {comment.name}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-border-theme" aria-hidden="true" />
                    <time className="text-xs text-muted-theme" dateTime={new Date(comment.date).toISOString()}>
                      {format(new Date(comment.date), 'dd/MM/yyyy HH:mm', { locale: he })}
                    </time>
                  </div>
                  <div className="font-stories text-lg text-foreground/90 leading-relaxed">
                    {comment.message}
                  </div>
                </article>
                {index < comments.length - 1 && (
                  <div className="mt-8 h-px bg-border-theme w-1/4 opacity-20" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-muted-theme italic text-center py-10" role="status">
            עדיין אין תגובות. תהיו הראשונים לכתוב?
          </p>
        )}
      </div>
    </section>
  );
}
