'use client';

import { MessageCircle, Music, Image, FileText, Share2, Sparkles } from 'lucide-react';

export default function ContentTypeGuide() {
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
      title: 'וואטס יום ו׳ (WhatsApp Friday)',
      description: 'הודעות משפחתיות מיוחדות שאבא שולח בכל יום שישי - סיפורים קצרים, מחשבות וברכות למשפחה',
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
      emoji: '👨‍👩‍👧‍👦',
      title: 'משפחה',
      description: 'תוכנים הנוגעים למשפחה, יחסים וזמן משותף',
    },
    {
      emoji: '📸',
      title: 'זכרונות',
      description: 'זכרונות של ילדות, בחורות וימי עבר',
    },
    {
      emoji: '💭',
      title: 'מחשבות',
      description: 'הרהורים כלליים על החיים והעולם',
    },
    {
      emoji: '✨',
      title: 'השראה',
      description: 'ציטוטים והשראה מיום יום',
    },
    {
      emoji: '🪞',
      title: 'הרהור',
      description: 'הרהורים עמוקים על עברית ותכניו',
    },
    {
      emoji: '⏰',
      title: 'רגעים',
      description: 'רגעים קטנים ויפים מהחיים',
    },
  ];

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white/3 rounded-2xl border border-border-theme/50">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 text-center">
          סוגי התוכנים
        </h2>
        <p className="text-sm sm:text-base text-muted-theme text-center mb-8 sm:mb-12">
          אבא משתף סוגים שונים של תוכנים - מסיפורים מלאים ועד הודעות קטנות שהן גם הן יקרות
        </p>

        {/* Content Types */}
        <div className="mb-12 sm:mb-16">
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">סוגי הפרסומים</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {contentTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.title} className={`${type.color} p-4 rounded-lg border border-border-theme/30`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Icon className="w-5 h-5 mt-1 flex-shrink-0" />
                    <h4 className="font-bold text-sm sm:text-base">{type.title}</h4>
                  </div>
                  <p className="text-xs sm:text-sm opacity-80">{type.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">קטגוריות</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <div key={cat.title} className="p-4 bg-white/5 rounded-lg border border-border-theme/30">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl">{cat.emoji}</span>
                  <h4 className="font-bold text-sm sm:text-base text-foreground">{cat.title}</h4>
                </div>
                <p className="text-xs sm:text-sm text-muted-theme">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Friday Special Section */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-8 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-xl border-2 border-green-500/30">
          <div className="flex items-start gap-4 mb-4">
            <Share2 className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">וואטס יום שישי</h3>
          </div>
          <p className="text-sm sm:text-base text-foreground/80 leading-relaxed mb-4">
            בכל יום שישי, אבא שולח הודעות משפחתיות מיוחדות דרך ווטסאפ. זו מסורת יפה של קשר משפחתי - סיפורים קצרים, מחשבות שכל יום, ברכות למשבוע הבא.
          </p>
          <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
            הודעות אלו הן חלק מהסיפור המשפחתי שלנו ויש להן מקום מיוחד בקטגוריה <span className="font-bold text-green-600">משפחה 👨‍👩‍👧‍👦</span>
          </p>
        </div>
      </div>
    </section>
  );
}
