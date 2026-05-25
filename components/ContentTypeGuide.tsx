'use client';

import { useState } from 'react';
import { MessageCircle, Music, Image, FileText, Share2, Sparkles, Users, Camera, Brain, Star, Eye, Clock, ChevronDown } from 'lucide-react';

export default function ContentTypeGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const contentTypes = [
    {
      icon: FileText,
      title: 'סיפור',
      description: 'סיפור מלא המתעדת זיכרונות, חוויות וחוויות של יום יום',
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      icon: Music,
      title: 'סיפור אודיו',
      description: 'סיפור הנשמע במקום הקריאה, בקול אבא בעצמו',
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      icon: Share2,
      title: 'וואטס יום ו׳',
      description: 'הודעות משפחתיות מיוחדות שאבא שולח בכל יום שישי',
      color: 'bg-green-500/10 text-green-600',
    },
    {
      icon: Image,
      title: 'תמונה',
      description: 'תמונה עם תיאור - רגעים ויזואליים מהחיים',
      color: 'bg-yellow-500/10 text-yellow-600',
    },
    {
      icon: MessageCircle,
      title: 'הודעה',
      description: 'מחשבה קצרה, ציטוט או אומרת חוכמה מאבא',
      color: 'bg-pink-500/10 text-pink-600',
    },
    {
      icon: Sparkles,
      title: 'זיכרון',
      description: 'זכרון יקר או מומנט מיוחד מהעבר',
      color: 'bg-amber-500/10 text-amber-600',
    },
  ];

  const categories = [
    {
      icon: Users,
      title: 'משפחה',
      description: 'תוכנים הנוגעים למשפחה, יחסים וזמן משותף',
    },
    {
      icon: Camera,
      title: 'זכרונות',
      description: 'זכרונות של ילדות, בחורות וימי עבר',
    },
    {
      icon: Brain,
      title: 'מחשבות',
      description: 'הרהורים כלליים על החיים והעולם',
    },
    {
      icon: Star,
      title: 'השראה',
      description: 'ציטוטים והשראה מיום יום',
    },
    {
      icon: Eye,
      title: 'הרהור',
      description: 'הרהורים עמוקים על עברית ותכניו',
    },
    {
      icon: Clock,
      title: 'רגעים',
      description: 'רגעים קטנים ויפים מהחיים',
    },
  ];

  return (
    <section className="rounded-2xl border border-border-theme overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-right hover:bg-white/5 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <span className="text-base font-bold text-foreground">סוגי התוכנים והקטגוריות</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-theme transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-6 pt-2 space-y-6 border-t border-border-theme bg-white/3">
          {/* Content Types */}
          <div>
            <h3 className="text-sm font-bold text-muted-theme uppercase tracking-widest mb-3">סוגי הפרסומים</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div key={type.title} className={`${type.color} p-3 rounded-lg flex items-start gap-3`}>
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-bold text-sm">{type.title}</p>
                      <p className="text-xs opacity-80 mt-0.5 leading-snug">{type.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold text-muted-theme uppercase tracking-widest mb-3">קטגוריות</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.title} className="p-3 bg-white/5 rounded-lg flex items-start gap-3 border border-border-theme">
                    <Icon className="w-4 h-4 mt-0.5 shrink-0 text-muted-theme" aria-hidden="true" />
                    <div>
                      <p className="font-bold text-sm text-foreground">{cat.title}</p>
                      <p className="text-xs text-muted-theme mt-0.5 leading-snug">{cat.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
