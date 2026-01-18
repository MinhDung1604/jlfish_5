
import React from 'react';

type StickerArchetype = 'Jellyfish' | 'Octopus' | 'Turtle' | 'Seahorse' | 'Dolphin' | 'Starfish' | 'Crab';

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
        <BodyWrapper>
          <path d="M20 60 C20 30 80 30 80 60 C80 75 20 75 20 60" fill={`url(#sticker-grad-${archetype})`} />
          <circle cx="30" cy="70" r="5" fill={color} opacity="0.4" />
          <circle cx="70" cy="70" r="5" fill={color} opacity="0.4" />
          <path d="M40 30 C40 20 60 20 60 30" stroke={color} strokeWidth="2" fill="none" />
        </BodyWrapper>
      );
    
    case 'Octopus':
      return (
        <BodyWrapper>
          <circle cx="50" cy="35" r="18" fill={`url(#sticker-grad-${archetype})`} />
          <path d="M30 55 Q25 70 30 85" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M42 55 Q40 70 42 85" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M50 55 Q50 70 50 85" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M58 55 Q60 70 58 85" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M70 55 Q75 70 70 85" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
        </BodyWrapper>
      );

    case 'Seahorse':
      return (
        <BodyWrapper>
          <path d="M50 30 C45 35 45 50 50 60 C55 50 55 35 50 30" fill={`url(#sticker-grad-${archetype})`} />
          <circle cx="50" cy="25" r="6" fill={color} />
          <path d="M48 40 Q30 45 25 50" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M50 65 Q40 75 35 85 Q45 80 50 85" fill={color} opacity="0.5" />
        </BodyWrapper>
      );

    case 'Dolphin':
      return (
        <BodyWrapper>
          <path d="M25 50 C25 40 75 40 75 50 C75 60 50 65 25 50" fill={`url(#sticker-grad-${archetype})`} />
          <path d="M55 40 L60 20 L65 40" fill={color} opacity="0.6" />
          <circle cx="75" cy="48" r="3" fill="white" opacity="0.8" />
          <path d="M20 55 Q15 65 20 75" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
        </BodyWrapper>
      );

    case 'Starfish':
      return (
        <BodyWrapper>
          <path d="M50 20 L60 40 L80 40 L65 55 L75 75 L50 60 L25 75 L35 55 L20 40 L40 40 Z" fill={`url(#sticker-grad-${archetype})`} />
          <circle cx="50" cy="48" r="4" fill="white" opacity="0.6" />
        </BodyWrapper>
      );

    case 'Crab':
      return (
        <BodyWrapper>
          <ellipse cx="50" cy="55" rx="20" ry="18" fill={`url(#sticker-grad-${archetype})`} />
          <path d="M30 50 L10 45 M30 55 L10 55 M70 50 L90 45 M70 55 L90 55" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <circle cx="45" cy="50" r="2" fill="white" opacity="0.8" />
          <circle cx="55" cy="50" r="2" fill="white" opacity="0.8" />
          <path d="M50 73 L48 88 M50 73 L52 88" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </BodyWrapper>
      );

    case 'Jellyfish':
    default:
      return (
        <BodyWrapper>
          <path d="M25 50 C25 20 75 20 75 50 C75 60 25 60 25 50 Z" fill={`url(#sticker-grad-${archetype})`} />
          <path d="M40 65 Q35 80 40 95 M50 67 Q50 85 50 98 M60 65 Q65 80 60 95" stroke={color} strokeWidth="2" fill="none" opacity="0.6" />
        </BodyWrapper>
      );
  }
};