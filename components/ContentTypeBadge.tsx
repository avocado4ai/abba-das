'use client';

import { MessageCircle, Music, ImageIcon, FileText, Share2, Sparkles, Users, Camera, Lightbulb, Eye, Clock } from 'lucide-react';

interface ContentTypeBadgeProps {
  contentType?: string;
  category?: string;
  size?: 'sm' | 'md';
}

export default function ContentTypeBadge({ contentType = 'story', category = 'memories', size = 'md' }: ContentTypeBadgeProps) {
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  const contentTypeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    story: {
      icon: <FileText className={iconSize} aria-hidden="true" />,
      label: 'סיפור',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    },
    'audio-story': {
      icon: <Music className={iconSize} aria-hidden="true" />,
      label: 'סיפור אודיו',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
    },
    'whatsapp-friday': {
      icon: <Share2 className={iconSize} aria-hidden="true" />,
      label: 'וואטס יום ו׳',
      color: 'bg-green-500/10 text-green-600 border-green-200',
    },
    photo: {
      icon: <ImageIcon className={iconSize} aria-hidden="true" />,
      label: 'תמונה',
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    },
    message: {
      icon: <MessageCircle className={iconSize} aria-hidden="true" />,
      label: 'הודעה',
      color: 'bg-pink-500/10 text-pink-600 border-pink-200',
    },
    memory: {
      icon: <Sparkles className={iconSize} aria-hidden="true" />,
      label: 'זיכרון',
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
    },
  };

  const categoryConfig: Record<string, { icon: React.ReactNode; label: string }> = {
    family:      { icon: <Users      className={iconSize} aria-hidden="true" />, label: 'משפחה' },
    memories:    { icon: <Camera     className={iconSize} aria-hidden="true" />, label: 'זכרונות' },
    thoughts:    { icon: <MessageCircle className={iconSize} aria-hidden="true" />, label: 'מחשבות' },
    inspiration: { icon: <Lightbulb  className={iconSize} aria-hidden="true" />, label: 'השראה' },
    reflection:  { icon: <Eye        className={iconSize} aria-hidden="true" />, label: 'הרהור' },
    moments:     { icon: <Clock      className={iconSize} aria-hidden="true" />, label: 'רגעים' },
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
      <div className={`flex items-center ${gapClass} ${paddingClass} rounded-full bg-white/5 border border-border-theme text-foreground/60 font-medium`}>
        {catConfig.icon}
        {size !== 'sm' && <span>{catConfig.label}</span>}
      </div>
    </div>
  );
}
