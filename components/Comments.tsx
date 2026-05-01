'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { CommentData } from '@/lib/github';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name, message }),
      });

      if (response.ok) {
        const { comment } = await response.json();
        setComments([comment, ...comments]);
        setName('');
        setMessage('');
        setIsExpanded(false);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-20 pt-20 border-t border-border-theme">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-2xl font-bold text-navy">תגובות ({comments.length})</h3>
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sage font-bold text-sm hover:text-navy transition-colors"
          >
            + כיתבו לאבא
          </button>
        )}
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="mb-16 bg-white/5 p-6 rounded-2xl border border-border-theme animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="השם שלכם"
                className="w-full bg-transparent border-b border-border-theme py-2 focus:outline-none focus:border-sage transition-colors text-foreground font-heebo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <textarea
                placeholder="מה תרצו לכתוב?"
                className="w-full bg-transparent border-b border-border-theme py-2 focus:outline-none focus:border-sage transition-colors text-foreground font-stories text-lg min-h-[100px] resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 text-sm text-muted-theme hover:text-navy transition-colors"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-navy text-cream px-6 py-2 rounded-full text-sm font-bold hover:bg-sage transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'שולח...' : 'פרסום תגובה'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-12">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="group">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-navy font-heebo">
                  {comment.name}
                </span>
                <div className="w-1 h-1 rounded-full bg-border-theme" />
                <span className="text-xs text-muted-theme">
                  {format(new Date(comment.date), 'dd/MM/yyyy HH:mm', { locale: he })}
                </span>
              </div>
              <div className="font-stories text-lg text-foreground/90 leading-relaxed">
                {comment.message}
              </div>
              <div className="mt-8 h-px bg-border-theme w-1/4 opacity-20 group-last:hidden" />
            </div>
          ))
        ) : (
          <p className="text-muted-theme italic text-center py-10">
            עדיין אין תגובות. תהיו הראשונים לכתוב?
          </p>
        )}
      </div>
    </section>
  );
}
