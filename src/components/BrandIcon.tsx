'use client';

import React from 'react';

// Import the main simple-icons object
import * as simpleIcons from 'simple-icons';

interface BrandIconProps {
  iconId: string;
  fallbackEmoji: string;
  className?: string;
  size?: number;
}

// Map of our service IDs to their simple-icons slugs
const iconSlugs: Record<string, string> = {
  // Streaming Services
  'netflix': 'siNetflix',
  'hulu': 'siHulu',
  'youtube': 'siYoutube',
  'amazon-video': 'siAmazonprime',
  'peacock': 'siPeacock',
  'disney-plus': 'siDisneyplus',
  'twitch': 'siTwitch',
  'crunchyroll': 'siCrunchyroll',
  'max': 'siHbo',
  'plex': 'siPlex',
  'starz': 'siStarz',
  'apple-tv-plus': 'siAppletv',
  
  // Work & Productivity
  'gmail': 'siGmail',
  'calendar': 'siGooglecalendar',
  'drive': 'siGoogledrive',
  'notion': 'siNotion',
  
  // Development
  'github': 'siGithub',
  'vercel': 'siVercel',
  'stackoverflow': 'siStackoverflow',
  'npm': 'siNpm',
  
  // Social
  'twitter': 'siX',
  'linkedin': 'siLinkedin',
  'discord': 'siDiscord',
  'reddit': 'siReddit',
  
  // Tools
  'chatgpt': 'siOpenai',
  'figma': 'siFigma',
  'canva': 'siCanva',
};

export default function BrandIcon({ iconId, fallbackEmoji, className = '', size = 24 }: BrandIconProps) {
  const iconSlug = iconSlugs[iconId];
  const icon = iconSlug ? (simpleIcons as any)[iconSlug] : null;
  
  if (icon) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        role="img"
        aria-label={icon.title}
      >
        <path d={icon.path} />
      </svg>
    );
  }
  
  // Fallback to emoji if no icon found
  return (
    <span className={className} style={{ fontSize: `${size}px` }}>
      {fallbackEmoji}
    </span>
  );
} 