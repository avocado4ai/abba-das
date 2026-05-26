'use client';

import React from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface WhatsAppMessage {
  date: Date;
  sender: string;
  content: string;
}

interface WhatsAppDisplayProps {
  content: string;
  date?: string;
}

export default function WhatsAppDisplay({ content, date }: WhatsAppDisplayProps) {
  // Simple parser for the editorial display
  const messages = content.split('\n\n').filter(p => p.trim().length > 0).map((p, i) => {
    return {
      id: i,
      content: p.trim()
    };
  });

  return (
    <div className="whatsapp-newspaper-view py-8 px-0 sm:px-4">
      <div className="max-w-4xl mx-auto bg-[#FDFCF8] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#E5E0D0] p-6 sm:p-16 relative overflow-hidden rounded-sm">
        {/* Newspaper Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
        
        {/* Side margins/lines often found in old papers */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-navy/5 hidden sm:block" />
        <div className="absolute right-4 top-0 bottom-0 w-px bg-navy/5 hidden sm:block" />
        
        {/* Masthead/Header Area */}
        <div className="text-center border-b-4 border-double border-navy/30 pb-10 mb-12 relative z-10">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-sage mb-6 flex justify-between items-center border-b border-navy/10 pb-3">
            <span className="opacity-80">מהדורה מיוחדת</span>
            <span className="text-navy">{date ? format(new Date(date), "dd MMMM yyyy", { locale: he }) : "מיוחד לבלוג"}</span>
            <span className="opacity-80">גיליון מס' 42</span>
          </div>
          <h2 className="text-5xl sm:text-7xl font-serif font-black text-navy mb-4 tracking-tighter leading-none">
            וואטס יום ו׳
          </h2>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px grow bg-navy/20" />
            <p className="text-base italic text-muted-theme font-serif">
              יומן שבועי של מילים ורגשות
            </p>
            <div className="h-px grow bg-navy/20" />
          </div>
        </div>

        {/* Newspaper Column Layout */}
        <div className="columns-1 md:columns-2 gap-12 space-y-10 relative z-10 text-justify">
          {messages.map((msg, idx) => (
            <div key={msg.id} className="break-inside-avoid-column mb-10 group">
              {idx === 0 ? (
                <div className="mb-6">
                  <p className="font-stories text-2xl leading-[1.6] text-navy font-bold mb-4 border-b border-sage/30 pb-4 italic">
                    טור המערכת:
                  </p>
                  <p className="font-stories text-xl leading-[1.8] text-foreground first-letter:text-7xl first-letter:font-serif first-letter:font-bold first-letter:text-navy first-letter:float-right first-letter:ml-4 first-letter:mt-3 first-letter:leading-[0.8]">
                    {msg.content}
                  </p>
                </div>
              ) : (
                <div className="relative pt-6 border-t border-navy/10">
                  <div className="absolute -top-3 right-0 bg-[#FDFCF8] px-3 text-[10px] font-bold text-coral uppercase tracking-widest">
                    עדכון #{idx}
                  </div>
                  <p className="font-stories text-lg leading-[1.8] text-foreground/90">
                    {msg.content}
                  </p>
                  <div className="mt-6 flex justify-center">
                    <div className="w-8 h-px bg-sage/30" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer/Editorial Note */}
        <div className="mt-16 pt-8 border-t-4 border-double border-navy/20 text-center italic text-xs text-muted-theme/70 relative z-10">
          נערך והופק באהבה עבור משפחתנו • {new Date().getFullYear()}
        </div>
      </div>

      <style jsx>{`
        .font-serif {
          font-family: 'Playfair Display', 'Heebo', serif;
        }
        .font-stories {
          font-family: 'Assistant', sans-serif;
        }
      `}</style>
    </div>
  );
}
