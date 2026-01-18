import React from 'react';

type StickerArchetype = 'Jellyfish' | 'Turtle' | 'Anchor' | 'Spark' | 'Coral' | 'Storm';

interface StickerProps {
  archetype: StickerArchetype;
  className?: string;
  color?: string; // Hex for accent
}

export const Sticker: React.FC<StickerProps> = ({ archetype, className = "w-32 h-32", color = "#2dd4bf" }) => {
  
  const commonProps = {
    className: `${className} animate-float`,
    stroke: "currentColor",
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round" as "round",
    strokeLinejoin: "round" as "round",
    viewBox: "0 0 24 24"
  };

  switch (archetype) {
    case 'Turtle': // The Shell - Protective, withdrawn or slow
      return (
        <svg {...commonProps} style={{ color }}>
          <path d="m19 17-2.54-5.34a2 2 0 0 0-1-1.02l-4-1.74a2 2 0 0 0-2.12.38l-1.06 1.06a2 2 0 0 0-.28 2.26l1.24 2.14a2 2 0 0 1 .28 1.02V20" />
          <path d="M10.5 20.5 9 22l-3-3" />
          <path d="M13.5 20.5 15 22l3-3" />
          <path d="M7 10 5 8" />
          <path d="M17 10l2-2" />
          <circle cx="12" cy="11" r="5" />
          <path d="M12 2a3 3 0 0 1 3 3v2a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
        </svg>
      );
    
    case 'Anchor': // The Anchor - Heavy, dragging, or grounded
      return (
        <svg {...commonProps} style={{ color }}>
          <circle cx="12" cy="5" r="3" />
          <line x1="12" x2="12" y1="22" y2="8" />
          <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
        </svg>
      );

    case 'Spark': // The Spark (Zap) - High energy, anxiety, burnout risk
      return (
        <svg {...commonProps} style={{ color }}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );

    case 'Coral': // The Coral - Steady, resilient, static
      return (
        <svg {...commonProps} style={{ color }}>
          <path d="M12 22v-8" />
          <path d="M5 2c0 2 .5 5 2 8 0 2-2 4-2 6" />
          <path d="M19 2c0 2-.5 5-2 8 0 2 2 4 2 6" />
          <path d="M12 14c-2 0-3-2-3-4s2-4 3-4 3 2 3 4-2 4-3 4" />
        </svg>
      );

    case 'Storm': // The Cloud - Turbulent, moody
      return (
        <svg {...commonProps} style={{ color }}>
          <path d="M17.5 19c0-1.7-1.3-3-3-3h-1.1c-.2-2.3-2.2-4-4.5-4-2.5 0-4.5 2-4.5 4.5v.5h-.4C2 17 2 20 4.5 20h13c1.4 0 2.5-1.1 2.5-2.5Z" />
          <path d="M13 22l-1-2" />
          <path d="M9 22l-1-2" />
          <path d="M17 22l-1-2" />
        </svg>
      );

    case 'Jellyfish': // Default - The Drifter
    default:
      return (
        <svg {...commonProps} style={{ color }}>
            <path d="M12 2c-4 0-7.5 3-7.5 7 0 2.5 1.5 4.5 3.5 6" />
            <path d="M12 2c4 0 7.5 3 7.5 7 0 2.5-1.5 4.5-3.5 6" />
            <path d="M5.5 13a7 7 0 0 1 13 0" />
            <path d="M9 15c-1 2-1 5 0 7" />
            <path d="M15 15c1 2 1 5 0 7" />
            <path d="M12 15c0 2 0 5 0 7" />
            <circle cx="9" cy="8.5" r="0.75" fill="currentColor" stroke="none"/>
            <circle cx="15" cy="8.5" r="0.75" fill="currentColor" stroke="none"/>
            <path d="M10.5 10.5c.5.5 1.5.5 2 0" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
};