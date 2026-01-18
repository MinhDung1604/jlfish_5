
import React from 'react';

type StickerArchetype = 'Jellyfish' | 'Turtle' | 'Anchor' | 'Spark' | 'Coral' | 'Storm';

interface StickerProps {
  archetype: StickerArchetype;
  className?: string;
  color?: string;
}

export const Sticker: React.FC<StickerProps> = ({ archetype, className = "w-32 h-32", color = "#2dd4bf" }) => {
  
  const commonProps = {
    className: `${className} animate-float`,
    viewBox: "0 0 100 100",
    style: { filter: 'url(#jelly-glow)' }
  };

  const BodyWrapper = ({ children }: { children: React.ReactNode }) => (
    <svg {...commonProps}>
      <defs>
        <radialGradient id={`sticker-grad-${archetype}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </radialGradient>
      </defs>
      {children}
      {/* Cute face for all stickers to maintain cohesion */}
      <g opacity="0.8">
        <circle cx="45" cy="45" r="1.5" fill="white" />
        <circle cx="55" cy="45" r="1.5" fill="white" />
        <path d="M47 50 Q50 52 53 50" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );

  switch (archetype) {
    case 'Turtle':
      return (
        /* Fix: Wrapped content in BodyWrapper tags instead of self-closing */
        <BodyWrapper>
          <path d="M20 60 C20 30 80 30 80 60 C80 75 20 75 20 60" fill={`url(#sticker-grad-${archetype})`} />
          <circle cx="30" cy="70" r="5" fill={color} opacity="0.4" />
          <circle cx="70" cy="70" r="5" fill={color} opacity="0.4" />
          <path d="M40 30 C40 20 60 20 60 30" stroke={color} strokeWidth="2" fill="none" />
        </BodyWrapper>
      );
    
    case 'Anchor':
      return (
        /* Fix: Wrapped content in BodyWrapper tags instead of self-closing */
        <BodyWrapper>
          <circle cx="50" cy="30" r="10" fill={`url(#sticker-grad-${archetype})`} />
          <path d="M50 40 L50 80 M30 65 Q50 85 70 65" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" />
          <rect x="40" y="55" width="20" height="4" rx="2" fill={color} />
        </BodyWrapper>
      );

    case 'Spark':
      return (
        /* Fix: Wrapped content in BodyWrapper tags instead of self-closing */
        <BodyWrapper>
          <path d="M50 10 L30 55 L55 55 L40 90 L75 40 L50 40 Z" fill={`url(#sticker-grad-${archetype})`} />
          <circle cx="50" cy="50" r="20" fill={color} opacity="0.1" />
        </BodyWrapper>
      );

    case 'Coral':
      return (
        /* Fix: Wrapped content in BodyWrapper tags instead of self-closing */
        <BodyWrapper>
          <path d="M50 90 V50 M30 80 Q40 60 40 40 M70 80 Q60 60 60 40" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" />
          <circle cx="50" cy="50" r="15" fill={`url(#sticker-grad-${archetype})`} />
        </BodyWrapper>
      );

    case 'Storm':
      return (
        /* Fix: Wrapped content in BodyWrapper tags instead of self-closing */
        <BodyWrapper>
          <path d="M25 65 C15 65 15 45 30 45 C30 25 70 25 70 45 C85 45 85 65 75 65 Z" fill={`url(#sticker-grad-${archetype})`} />
          <path d="M40 75 L35 85 M50 75 L50 90 M60 75 L65 85" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </BodyWrapper>
      );

    case 'Jellyfish':
    default:
      return (
        /* Fix: Wrapped content in BodyWrapper tags instead of self-closing */
        <BodyWrapper>
          <path d="M25 50 C25 20 75 20 75 50 C75 60 25 60 25 50 Z" fill={`url(#sticker-grad-${archetype})`} />
          <path d="M40 65 Q35 80 40 95 M50 67 Q50 85 50 98 M60 65 Q65 80 60 95" stroke={color} strokeWidth="2" fill="none" opacity="0.6" />
        </BodyWrapper>
      );
  }
};