import React, { useState, useEffect, useMemo } from 'react';
import { User, Image as ImageIcon } from 'lucide-react';

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSources?: string[];
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'wide' | 'auto';
  fallbackType?: 'person' | 'sanctuary' | 'document';
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

// Map known filenames to user-provided direct simple filenames
const KNOWN_SIMPLE_NAMES: Record<string, string[]> = {
  magdalene: ['/images/therapists/magdalene.jpg', '/magdalene.jpg'],
  chuot: ['/images/therapists/chuot.jpg', '/chuot.jpg'],
  bawoso: ['/images/therapists/bawoso.jpg', '/bawoso.jpg'],
  ikwa: ['/images/therapists/bawoso.jpg', '/bawoso.jpg', '/images/therapists/ikwa-bawoso-levi.jpg'],
  caroline: ['/images/therapists/caroline.jpg', '/caroline.jpg'],
  jeremiah: ['/images/therapists/jeremiah.jpg', '/jeremiah.jpg'],
  joyce: ['/images/therapists/joice.jpg', '/joice.jpg'],
  joice: ['/images/therapists/joice.jpg', '/joice.jpg'],
  patrick: ['/images/therapists/patrick.jpg', '/patrick.jpg'],
  muthoni: ['/images/therapists/muthoni.jpg', '/images/founder/muthoni.jpg', '/muthoni.jpg'],
  besawapost: ['/images/resources/besawapost.jpg', '/besawapost.jpg'],
  logo: ['/besawa-logo.jpg', '/images/brand/besawa-logo.jpg', '/logo.jpg', '/logos.png'],
  emblem: ['/besawa-emblem.jpg', '/images/brand/besawa-emblem.jpg'],
};

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  fallbackSources = [],
  aspectRatio = 'auto',
  fallbackType = 'person',
  className = '',
  imageClassName = '',
  priority = true, // Default to eager loading so images appear immediately in iframes
  ...props
}) => {
  // Build ordered list of candidate URLs to attempt
  const candidates = useMemo(() => {
    if (!src) return [];
    const list: string[] = [src];

    // Add explicit user fallbackSources
    if (fallbackSources.length > 0) {
      list.push(...fallbackSources);
    }

    const lower = src.toLowerCase();

    // 1. If webp, add jpeg variant
    if (src.endsWith('.webp')) {
      list.push(src.replace(/\.webp$/, '.jpg'));
    }

    // 2. Add known simple user-provided names
    for (const [key, aliases] of Object.entries(KNOWN_SIMPLE_NAMES)) {
      if (lower.includes(key)) {
        list.push(...aliases);
      }
    }

    // 3. Fallback to base filename at root
    const parts = src.split('/');
    const filename = parts[parts.length - 1];
    if (filename) {
      list.push(`/${filename}`);
      if (filename.endsWith('.webp')) {
        list.push(`/${filename.replace(/\.webp$/, '.jpg')}`);
      }
    }

    // Remove duplicates while preserving order
    return Array.from(new Set(list.filter(Boolean)));
  }, [src, fallbackSources]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasExhaustedAll, setHasExhaustedAll] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset when primary src changes
  useEffect(() => {
    setCurrentIndex(0);
    setHasExhaustedAll(false);
    setIsLoaded(false);
  }, [src]);

  const handleImageError = () => {
    if (currentIndex + 1 < candidates.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setHasExhaustedAll(true);
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'portrait':
        return 'aspect-[4/5]';
      case 'landscape':
        return 'aspect-[3/2]';
      case 'wide':
        return 'aspect-[16/9]';
      default:
        return '';
    }
  };

  // Extract initials if person name
  const initials = alt
    ? alt
        .split(' ')
        .filter((w) => !w.toLowerCase().includes('portrait') && !w.toLowerCase().includes('of'))
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join('')
    : 'BS';

  if (hasExhaustedAll || candidates.length === 0) {
    return (
      <div
        className={`bg-[#EDE9E1] text-[#54635B] flex flex-col items-center justify-center overflow-hidden border border-[#E3DED6] ${getAspectRatioClass()} ${className}`}
        role="img"
        aria-label={alt}
      >
        {fallbackType === 'person' ? (
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <div className="w-11 h-11 rounded-full bg-[#DFD9CE] border border-[#C89D57]/30 flex items-center justify-center text-[#2D5A46] font-bold text-sm mb-1 shadow-xs">
              {initials || <User className="w-5 h-5 text-[#54635B]" />}
            </div>
            <span className="text-[11px] font-bold text-[#1C2420] truncate max-w-[120px]">
              {alt.split(',')[0]}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <ImageIcon className="w-6 h-6 text-[#78867E] mb-1" />
            <span className="text-[10px] font-medium text-[#78867E]">Be Sawa Sanctuary</span>
          </div>
        )}
      </div>
    );
  }

  const activeSrc = candidates[currentIndex] || src;

  return (
    <div
      className={`relative overflow-hidden bg-[#F4EFEA] ${getAspectRatioClass()} ${className}`}
    >
      <img
        key={activeSrc}
        src={activeSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="auto"
        onLoad={() => setIsLoaded(true)}
        onError={handleImageError}
        className={`w-full h-full object-cover ${imageClassName}`}
        {...props}
      />
    </div>
  );
};
