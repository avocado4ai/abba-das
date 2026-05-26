'use client';

interface StoryImageProps {
  slug: string;
  title: string;
  className?: string;
}

const storyImages = {
  'the-long-path': {
    gradient: 'from-sky-400 to-blue-100',
    description: 'הדרך הארוכה'
  },
  'stories-with-grandchildren': {
    gradient: 'from-orange-200 to-yellow-100',
    description: 'סיפורים עם הנכדים'
  },
  'my-birthday': {
    gradient: 'from-pink-300 to-pink-100',
    description: 'ביום ההולדת'
  },
  'morning-in-garden': {
    gradient: 'from-sky-400 to-cyan-100',
    description: 'בוקר בגן'
  },
  'car-trip-memories': {
    gradient: 'from-sky-400 to-orange-100',
    description: 'נסיעה במכונה'
  }
};

export default function StoryImage({ slug, title, className = '' }: StoryImageProps) {
  const imageConfig = storyImages[slug as keyof typeof storyImages] || storyImages['the-long-path'];

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${imageConfig.gradient}`} />

      {/* SVG Illustrations */}
      <svg
        viewBox="0 0 1200 400"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
      >
        {slug === 'the-long-path' && (
          <>
            {/* Sun */}
            <circle cx="200" cy="80" r="60" fill="#FFD700" opacity="0.9" />
            {/* Mountains */}
            <polygon points="0,250 250,100 500,220 750,80 1000,250 1200,250 1200,400 0,400" fill="#8B7355" opacity="0.7" />
            {/* Path */}
            <path d="M 600 350 Q 500 300, 400 250 T 200 100" stroke="#D2B48C" strokeWidth="40" fill="none" opacity="0.7" />
            {/* Trees */}
            <rect x="130" y="180" width="25" height="50" fill="#8B4513" />
            <circle cx="142" cy="160" r="40" fill="#228B22" />
            <rect x="980" y="120" width="25" height="50" fill="#8B4513" />
            <circle cx="992" cy="100" r="40" fill="#228B22" />
          </>
        )}

        {slug === 'stories-with-grandchildren' && (
          <>
            {/* Table */}
            <rect x="350" y="200" width="300" height="150" rx="15" fill="#CD853F" opacity="0.7" />
            {/* Chairs */}
            <circle cx="250" cy="280" r="40" fill="#A0522D" opacity="0.8" />
            <circle cx="850" cy="280" r="40" fill="#A0522D" opacity="0.8" />
            <circle cx="500" cy="140" r="40" fill="#A0522D" opacity="0.8" />
            {/* Candles */}
            <rect x="475" y="180" width="20" height="60" fill="#FFA500" opacity="0.8" />
            <polygon points="485,180 470,160 500,160" fill="#FFD700" />
            {/* Lamp */}
            <circle cx="1000" cy="100" r="30" fill="#FFD700" opacity="0.7" />
          </>
        )}

        {slug === 'my-birthday' && (
          <>
            {/* Balloons */}
            <circle cx="150" cy="120" r="25" fill="#FF6B6B" />
            <circle cx="250" cy="90" r="25" fill="#FFD93D" />
            <circle cx="350" cy="110" r="25" fill="#6BCB77" />
            <circle cx="450" cy="80" r="25" fill="#4D96FF" />
            <circle cx="850" cy="150" r="25" fill="#FF006E" />
            {/* Strings */}
            <line x1="150" y1="145" x2="150" y2="250" stroke="#FFB6C1" strokeWidth="2" />
            <line x1="250" y1="115" x2="250" y2="250" stroke="#FFD93D" strokeWidth="2" />
            {/* Cake */}
            <rect x="450" y="280" width="150" height="100" rx="8" fill="#8B4513" opacity="0.8" />
            <circle cx="525" cy="280" r="20" fill="#FFD700" />
            {/* Confetti */}
            <circle cx="100" cy="250" r="4" fill="#FF006E" />
            <circle cx="700" cy="200" r="4" fill="#FFD93D" />
            <circle cx="850" cy="300" r="4" fill="#6BCB77" />
          </>
        )}

        {slug === 'morning-in-garden' && (
          <>
            {/* Sun */}
            <circle cx="1000" cy="60" r="50" fill="#FFD700" opacity="0.95" />
            {/* Grass */}
            <rect x="0" y="280" width="1200" height="120" fill="#228B22" opacity="0.75" />
            {/* Flowers */}
            <circle cx="150" cy="280" r="15" fill="#FF69B4" />
            <circle cx="250" cy="265" r="15" fill="#FFB6C1" />
            <circle cx="400" cy="275" r="15" fill="#DDA0DD" />
            <circle cx="800" cy="290" r="15" fill="#FF69B4" />
            {/* Stems */}
            <line x1="150" y1="295" x2="150" y2="340" stroke="#228B22" strokeWidth="2" />
            <line x1="250" y1="280" x2="250" y2="340" stroke="#228B22" strokeWidth="2" />
            {/* Butterfly */}
            <ellipse cx="550" cy="180" rx="20" ry="28" fill="#FF1493" />
            <ellipse cx="510" cy="160" rx="15" ry="20" fill="#FF69B4" />
            <ellipse cx="590" cy="160" rx="15" ry="20" fill="#FF69B4" />
          </>
        )}

        {slug === 'car-trip-memories' && (
          <>
            {/* Road */}
            <rect x="0" y="280" width="1200" height="100" fill="#444444" />
            {/* Road lines */}
            <line x1="0" y1="330" x2="1200" y2="330" stroke="#FFD700" strokeWidth="3" strokeDasharray="40,40" />
            {/* Car */}
            <rect x="450" y="240" width="160" height="70" rx="15" fill="#DC143C" />
            <circle cx="490" cy="330" r="25" fill="#333333" />
            <circle cx="570" cy="330" r="25" fill="#333333" />
            <rect x="470" y="250" width="50" height="30" fill="#87CEEB" opacity="0.7" />
            {/* Sun */}
            <circle cx="150" cy="80" r="55" fill="#FFD700" opacity="0.9" />
            {/* Hills */}
            <path d="M 0 220 Q 300 100, 600 220 T 1200 220" fill="#8FBC8F" opacity="0.7" />
          </>
        )}
      </svg>

      {title && (
        <div className="absolute inset-0 flex items-end justify-start p-6 bg-gradient-to-t from-black/40 to-transparent z-20">
          <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{title}</h2>
        </div>
      )}
    </div>
  );
}
