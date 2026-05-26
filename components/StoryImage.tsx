'use client';

import React from 'react';

interface StoryImageProps {
  slug: string;
  title: string;
  className?: string;
  src?: string;
  alt?: string;
  caption?: string;
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

export default function StoryImage({ slug, title, className = '', src, alt, caption }: StoryImageProps) {
  const imageConfig = storyImages[slug as keyof typeof storyImages] || storyImages['the-long-path'];

  const [imgError, setImgError] = React.useState(false);

  if (src && !imgError) {
    return (
      <figure className={`relative w-full overflow-hidden bg-navy/10 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || title}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        {(title || caption) && (
          <figcaption className="absolute inset-x-0 bottom-0 z-20 bg-black/30 backdrop-blur-md border-t border-white/10 p-5 sm:p-8 text-white">
            {title && (
              <h2 className="text-2xl md:text-4xl font-bold drop-shadow-md tracking-tight mb-1">
                {title}
              </h2>
            )}
            {caption && (
              <p className="text-sm sm:text-base text-white/90 font-medium italic opacity-85">
                {caption}
              </p>
            )}
          </figcaption>
        )}
      </figure>
    );
  }

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
            {/* Sun with Glow */}
            <defs>
              <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="200" cy="80" r="100" fill="url(#sunGlow)" />
            <circle cx="200" cy="80" r="50" fill="#FFD700" />
            
            {/* Distant Mountains */}
            <path d="M0,280 L150,150 L350,250 L550,120 L800,280 L1200,280 L1200,400 L0,400 Z" fill="#7E9983" opacity="0.4" />
            
            {/* Main Mountains */}
            <path d="M-100,400 L250,120 L500,250 L850,80 L1100,300 L1300,400 Z" fill="#8B7355" opacity="0.8" />
            
            {/* Winding Path */}
            <path d="M 600 400 Q 550 320, 450 300 T 350 200 T 200 120" stroke="#F5F5F1" strokeWidth="25" fill="none" opacity="0.6" strokeLinecap="round" />
            <path d="M 600 400 Q 550 320, 450 300 T 350 200 T 200 120" stroke="#D2B48C" strokeWidth="20" fill="none" opacity="0.8" strokeLinecap="round" />
            
            {/* Trees */}
            <g transform="translate(150, 220)">
              <rect x="-5" y="0" width="10" height="30" fill="#5D4037" />
              <path d="M-25,5 L0,-40 L25,5 Z" fill="#2E7D32" />
            </g>
            <g transform="translate(950, 180)">
              <rect x="-5" y="0" width="10" height="30" fill="#5D4037" />
              <path d="M-30,5 L0,-50 L30,5 Z" fill="#1B5E20" />
            </g>
          </>
        )}

        {slug === 'stories-with-grandchildren' && (
          <>
            {/* Cozy Room Background */}
            <rect width="1200" height="400" fill="#FFF9C4" opacity="0.2" />
            
            {/* Large Wooden Table */}
            <path d="M200,350 L1000,350 L950,220 L250,220 Z" fill="#8D6E63" />
            <rect x="250" y="210" width="700" height="20" rx="10" fill="#A1887F" />
            
            {/* Family Members (Stylized Heads) */}
            <circle cx="450" cy="180" r="45" fill="#FAD7B5" /> {/* Abba */}
            <circle cx="450" cy="180" r="48" fill="none" stroke="#E0E0E0" strokeWidth="8" strokeDasharray="60,200" strokeLinecap="round" />
            
            <circle cx="350" cy="200" r="30" fill="#FFE0B2" /> {/* Grandchild 1 */}
            <circle cx="550" cy="200" r="30" fill="#FFE0B2" /> {/* Grandchild 2 */}
            <circle cx="650" cy="190" r="35" fill="#FFE0B2" /> {/* Grandchild 3 */}
            
            {/* Candle with Flame */}
            <g transform="translate(800, 150)">
              <rect x="-8" y="0" width="16" height="60" fill="#F5F5F5" />
              <path d="M0,-5 Q-8,-15 0,-30 Q8,-15 0,-5 Z" fill="#FFD700" opacity="0.9" />
              <path d="M0,-8 Q-4,-12 0,-20 Q4,-12 0,-8 Z" fill="#FF9800" opacity="0.9" />
            </g>
            
            {/* Books on Table */}
            <rect x="300" y="280" width="80" height="20" fill="#42A5F5" rx="2" />
            <rect x="310" y="260" width="80" height="20" fill="#EF5350" rx="2" />
          </>
        )}

        {slug === 'my-birthday' && (
          <>
            {/* Party Background */}
            <rect width="1200" height="400" fill="#FCE4EC" opacity="0.3" />
            
            {/* Layered Cake */}
            <g transform="translate(600, 320)">
              <rect x="-100" y="-80" width="200" height="80" rx="10" fill="#8D6E63" />
              <rect x="-90" y="-120" width="180" height="40" rx="8" fill="#D81B60" opacity="0.8" />
              {/* Candles */}
              <rect x="-60" y="-140" width="6" height="20" fill="#FFF176" />
              <rect x="-20" y="-140" width="6" height="20" fill="#FFF176" />
              <rect x="20" y="-140" width="6" height="20" fill="#FFF176" />
              <rect x="60" y="-140" width="6" height="20" fill="#FFF176" />
            </g>
            
            {/* Floating Balloons */}
            <g opacity="0.9">
              <circle cx="200" cy="150" r="40" fill="#FF4081" />
              <path d="M200,190 Q190,250 210,300" stroke="#F48FB1" strokeWidth="2" fill="none" />
              
              <circle cx="300" cy="100" r="45" fill="#7C4DFF" />
              <path d="M300,145 Q310,200 290,280" stroke="#B39DDB" strokeWidth="2" fill="none" />
              
              <circle cx="900" cy="120" r="50" fill="#00E676" />
              <path d="M900,170 Q890,220 910,320" stroke="#A5D6A7" strokeWidth="2" fill="none" />
            </g>
            
            {/* Confetti */}
            <circle cx="100" cy="100" r="5" fill="#FFD700" />
            <rect x="1050" y="80" width="10" height="10" fill="#2979FF" transform="rotate(45, 1055, 85)" />
            <circle cx="500" cy="50" r="4" fill="#F50057" />
          </>
        )}

        {slug === 'morning-in-garden' && (
          <>
            {/* Morning Sky Gradient Effect */}
            <rect width="1200" height="400" fill="#E3F2FD" opacity="0.5" />
            
            {/* Soft Sun */}
            <circle cx="1050" cy="80" r="80" fill="#FFF59D" opacity="0.6" />
            <circle cx="1050" cy="80" r="40" fill="#FFF176" opacity="0.9" />
            
            {/* Garden Layers */}
            <path d="M0,320 Q300,280 600,320 T1200,320 L1200,400 L0,400 Z" fill="#43A047" />
            <path d="M-100,400 Q200,350 500,400 T1100,380 L1300,400 Z" fill="#2E7D32" opacity="0.7" />
            
            {/* Diverse Flowers */}
            <g transform="translate(200, 310)">
              <circle r="15" fill="#E91E63" />
              <circle r="5" fill="#FFEB3B" />
            </g>
            <g transform="translate(400, 330)">
              <circle r="12" fill="#9C27B0" />
              <circle r="4" fill="#FFEB3B" />
            </g>
            <g transform="translate(700, 305)">
              <circle r="18" fill="#FF9800" />
              <circle r="6" fill="#FFF" />
            </g>
            
            {/* Butterfly */}
            <g transform="translate(550, 150) rotate(-15)">
              <ellipse cx="-15" cy="0" rx="20" ry="12" fill="#F06292" />
              <ellipse cx="15" cy="0" rx="20" ry="12" fill="#F06292" />
              <rect x="-2" y="-15" width="4" height="30" rx="2" fill="#333" />
            </g>
          </>
        )}

        {slug === 'car-trip-memories' && (
          <>
            {/* Distant Hills */}
            <path d="M0,250 Q300,150 600,250 T1200,250 L1200,400 L0,400 Z" fill="#81C784" opacity="0.5" />
            
            {/* Road with Perspective */}
            <path d="M500,200 L700,200 L1200,400 L0,400 Z" fill="#455A64" />
            <path d="M600,200 L600,400" stroke="#FFD700" strokeWidth="4" strokeDasharray="30,30" />
            
            {/* Modern Stylized Car */}
            <g transform="translate(400, 260)">
              <rect x="0" y="30" width="200" height="60" rx="20" fill="#EF5350" />
              <path d="M30,30 L60,0 L140,0 L170,30 Z" fill="#CFD8DC" opacity="0.8" />
              <rect x="40" y="35" width="40" height="25" rx="5" fill="#81D4FA" opacity="0.6" />
              {/* Wheels */}
              <circle cx="50" cy="90" r="25" fill="#263238" />
              <circle cx="50" cy="90" r="10" fill="#90A4AE" />
              <circle cx="150" cy="90" r="25" fill="#263238" />
              <circle cx="150" cy="90" r="10" fill="#90A4AE" />
            </g>
            
            {/* Clouds */}
            <circle cx="200" cy="100" r="30" fill="#FFF" opacity="0.8" />
            <circle cx="240" cy="100" r="40" fill="#FFF" opacity="0.8" />
            <circle cx="280" cy="100" r="30" fill="#FFF" opacity="0.8" />
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
