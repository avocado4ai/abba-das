'use client';

import { MessageCircle, Music, Image, FileText, Share2, Sparkles } from 'lucide-react';

interface ContentTypeBadgeProps {
  contentType?: string;
  category?: string;
  size?: 'sm' | 'md';
}

export default function ContentTypeBadge({ contentType = 'story', category = 'memories', size = 'md' }: ContentTypeBadgeProps) {
  const contentTypeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    story: {
      icon: <FileText className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
      label: 'סיפור',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    },
    'audio-story': {
      icon: <Music className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
      label: 'סיפור אודיו',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
    },
    'whatsapp-friday': {
      icon: <Share2 className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
      label: 'וואטס יום ו׳',
      color: 'bg-green-500/10 text-green-600 border-green-200',
    },
    photo: {
      icon: <Image className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
      label: 'תמונה',
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    },
    message: {
      icon: <MessageCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
      label: 'הודעה',
      color: 'bg-pink-500/10 text-pink-600 border-pink-200',
    },
    memory: {
      icon: <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
      label: 'זיכרון',
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
    },
  };

  const categoryConfig: Record<string, { emoji: string; label: string }> = {
    family: { emoji: '👨‍👩‍👧‍👦', label: 'משפחה' },
    memories: { emoji: '📸', label: 'זכרונות' },
    thoughts: { emoji: '💭', label: 'מחשבות' },
    inspiration: { emoji: '✨', label: 'השראה' },
    reflection: { emoji: '🪞', label: 'הרהור' },
    moments: { emoji: '⏰', label: 'רגעים' },
  };

  const typeConfig = contentTypeConfig[contentType] || contentTypeConfig.story;
  const catConfig = categoryConfig[category] || categoryConfig.memories;

  const paddingClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const gapClass = size === 'sm' ? 'gap-1' : 'gap-2';

  return (
    <div className={`flex items-center ${gapClass}`}>
      <div className={`flex items-center ${gapClass} ${paddingClass} rounded-full border ${typeConfig.color} font-medium`}>
        {typeConfig.icon}
        {size !== 'sm' && <span>{typeConfig.label}</span>}
      </div>
      <div className={`${paddingClass} rounded-full bg-white/5 border border-border-theme text-foreground/70 font-medium`}>
        <span className="mr-1">{catConfig.emoji}</span>
        {size !== 'sm' && <span>{catConfig.label}</span>}
      </div>
    </div>
  );
}
