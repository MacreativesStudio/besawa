import React, { useState } from 'react';

export interface LogoProps {
  variant?: 'full' | 'mark' | 'horizontal' | 'vertical' | 'light' | 'footer' | 'image-full';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showTagline?: boolean;
  useImage?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showTagline = false,
  useImage = true,
  className = '',
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  // Dimensions based on size
  const iconSizes = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  };

  const isLight = variant === 'light' || variant === 'footer';
  const isVertical = variant === 'vertical' || variant === 'full';

  // Dedicated Vector Artwork of the BeSawa Woman Emblem
  // Features: Serene woman profile in contemplation with closed eye, botanical leaves flowing into hair in deep emerald & warm ochre gold, and delicate right-side golden crescent arc.
  const VectorEmblem = (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconSizes[size]} shrink-0 transition-transform duration-300 group-hover:scale-105 rounded-full overflow-hidden`}
      aria-label="BeSawa Woman & Botanical Leaves Emblem"
    >
      <defs>
        <radialGradient id="haloWarmGlow" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor={isLight ? '#285442' : '#F6F1E8'} stopOpacity="0.95" />
          <stop offset="100%" stopColor={isLight ? '#1B382C' : '#EDE4D4'} stopOpacity="0.8" />
        </radialGradient>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DFC085" />
          <stop offset="50%" stopColor="#C89D57" />
          <stop offset="100%" stopColor="#A87B35" />
        </linearGradient>
        <linearGradient id="emeraldDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isLight ? '#7FB099' : '#2D5E49'} />
          <stop offset="100%" stopColor={isLight ? '#568B73' : '#1C3F32'} />
        </linearGradient>
      </defs>

      {/* Outer base circular background */}
      <circle cx="50" cy="50" r="48" fill="url(#haloWarmGlow)" stroke={isLight ? '#386653' : '#E5DDD0'} strokeWidth="1" />

      {/* Delicate outer golden accent circle border */}
      <circle cx="50" cy="50" r="47" stroke="url(#goldGradient)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

      {/* Right-Side Golden Crescent Arc (Sanctuary boundary) */}
      <path
        d="M 54 13 C 74 19 86 35 86 51 C 86 67 74 83 54 89"
        stroke="url(#goldGradient)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Crown Leaf (Warm Ochre Gold - Rising upward-left) */}
      <path
        d="M 40 27 C 34 16 46 11 53 20 C 48 27 45 28 40 27 Z"
        fill="url(#goldGradient)"
      />
      <path d="M 41 26 L 49 17" stroke="#FAF8F5" strokeWidth="0.75" strokeLinecap="round" opacity="0.8" />

      {/* Secondary Leaf (Deep Emerald Foliage) */}
      <path
        d="M 33 37 C 25 30 33 21 43 26 C 39 33 37 36 33 37 Z"
        fill="url(#emeraldDark)"
      />

      {/* Lower Back Leaf (Forest Green hair curl) */}
      <path
        d="M 28 49 C 19 43 25 34 35 38 C 31 45 30 47 28 49 Z"
        fill="url(#emeraldDark)"
        opacity="0.9"
      />

      {/* Woman's Facial Profile Facing Right (Gentle forehead, elegant nose, calm lips & chin) */}
      <path
        d="M 43 25
           C 49 27 53 31 54 35
           C 56 38 55 41 54 43
           C 57 44 61.5 47.5 62.5 49.5
           C 61 50.5 57 51.5 56 52.5
           C 58 53.5 59 55.5 58 57.5
           C 56 58.5 54 58.5 53 59.5
           C 54 61.5 55 63.5 54 65.5
           C 51 67.5 47 67.5 44 64.5
           C 41 70.5 35 76.5 27 79.5
           C 33 82.5 45 83.5 53 81.5
           C 48 75.5 49 70.5 49 64.5
           C 53 63.5 57 59.5 58 55.5
           C 60 51.5 58 47.5 56 45.5
           C 58 42.5 57 38.5 53 34.5
           C 49 30.5 44.5 27 43 25 Z"
        fill={isLight ? '#FAF8F5' : '#1C3F32'}
      />

      {/* Serene Closed Eyelid & Gentle Lashes (Calm peaceful mindfulness) */}
      <path
        d="M 50.5 42.5 C 52.5 44 54.5 44 55.5 42.5"
        stroke={isLight ? '#1C3F32' : 'url(#goldGradient)'}
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* Neck Base Botanical Leaf - Warm Gold Accent */}
      <path
        d="M 35 71 C 27 74 30 83 39 81 C 39 76 38 73 35 71 Z"
        fill="url(#goldGradient)"
      />
    </svg>
  );

  // High-Resolution Image Emblem
  const ImageEmblem = (
    <div
      className={`${iconSizes[size]} shrink-0 rounded-full overflow-hidden border border-[#C89D57]/30 shadow-xs relative bg-[#FAF8F5] transition-transform duration-300 group-hover:scale-105 group-hover:border-[#C89D57]/70`}
    >
      <img
        src="/besawa-emblem.jpg"
        alt="BeSawa Woman Emblem"
        loading="eager"
        className="w-full h-full object-cover"
        onError={(e) => {
          // Try fallback
          const target = e.currentTarget;
          if (target.src.endsWith('/besawa-emblem.jpg')) {
            target.src = '/images/brand/besawa-emblem.jpg';
          } else {
            setImageError(true);
          }
        }}
      />
    </div>
  );

  // Decided Mark component (photo image emblem if available, with smooth vector fallback)
  const MarkElement = useImage && !imageError ? ImageEmblem : VectorEmblem;

  // Standalone Mark
  if (variant === 'mark') {
    return (
      <div
        className={`inline-flex items-center cursor-pointer ${className}`}
        onClick={onClick}
        title="BeSawa - Mental Wellness & Counselling"
      >
        {MarkElement}
      </div>
    );
  }

  // Full High-Res Brand Image Variant (Used in splash / hero / modal if requested)
  if (variant === 'image-full') {
    return (
      <div
        className={`inline-flex flex-col items-center text-center cursor-pointer group ${className}`}
        onClick={onClick}
      >
        <div className="max-w-[240px] sm:max-w-[280px] rounded-2xl overflow-hidden border border-[#E3DED6] shadow-sm bg-white p-2">
          <img
            src="/besawa-logo.jpg"
            alt="BeSawa Mental Wellness & Counselling"
            loading="eager"
            className="w-full h-auto object-contain rounded-xl"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src.endsWith('/besawa-logo.jpg')) {
                target.src = '/logo.jpg';
              }
            }}
          />
        </div>
      </div>
    );
  }

  // Full / Vertical layout
  if (isVertical) {
    return (
      <div
        className={`inline-flex flex-col items-center text-center group cursor-pointer ${className}`}
        onClick={onClick}
      >
        {MarkElement}
        <div className="mt-3 flex flex-col items-center">
          {/* Brand Wordmark with Golden Leaf flourish on 'a' */}
          <div className="flex items-baseline relative">
            <span
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isLight ? 'text-white' : 'text-[#1C3F32]'
              }`}
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              BeSawa
            </span>
            {/* Elegant botanical leaf accent on the terminal 'a' */}
            <span
              className="inline-block text-[#C89D57] ml-0.5 -translate-y-1 scale-90"
              title="Peace & Growth"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2 10C2 4 7 1 11 1C11 6 7 10 2 10Z" />
              </svg>
            </span>
          </div>

          <span
            className={`text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase mt-1 ${
              isLight ? 'text-[#DFC085]' : 'text-[#54635B]'
            }`}
          >
            Mental Wellness & Counselling
          </span>

          {showTagline && (
            <div className="flex items-center gap-2 mt-2">
              <span className="w-4 h-px bg-[#C89D57]/40" />
              <span
                className="text-xs sm:text-sm text-[#C89D57] font-medium"
                style={{ fontFamily: "'Alex Brush', cursive, serif" }}
              >
                Better Minds. Brighter Futures.
              </span>
              <span className="w-4 h-px bg-[#C89D57]/40" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Horizontal layout (Header & Footer default)
  return (
    <div
      className={`inline-flex items-center gap-3 text-left group cursor-pointer ${className}`}
      onClick={onClick}
    >
      {MarkElement}
      <div className="flex flex-col justify-center select-none">
        {/* Brand name */}
        <div className="flex items-baseline gap-1">
          <span
            className={`text-xl sm:text-2xl font-black tracking-tight leading-none ${
              isLight ? 'text-white' : 'text-[#1C3F32]'
            }`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            BeSawa
          </span>
          {/* Subtle golden botanical accent on the final 'a' */}
          <span className="text-[#C89D57] -translate-y-0.5 scale-75 inline-block">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M1 9C1 3 6 1 9 1C9 5 5 9 1 9Z" />
            </svg>
          </span>
        </div>

        {/* Subtitle */}
        <span
          className={`text-[9px] sm:text-[10.5px] font-bold tracking-[0.16em] uppercase mt-1 leading-none ${
            isLight ? 'text-[#DFC085]' : 'text-[#54635B]'
          }`}
        >
          Mental Wellness & Counselling
        </span>

        {showTagline && (
          <span
            className="text-[12px] text-[#C89D57] mt-1 leading-tight font-medium"
            style={{ fontFamily: "'Alex Brush', cursive, serif" }}
          >
            Better Minds. Brighter Futures.
          </span>
        )}
      </div>
    </div>
  );
};
