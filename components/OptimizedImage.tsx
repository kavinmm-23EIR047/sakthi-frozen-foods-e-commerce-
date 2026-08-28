'use client';

import React, { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { optimizeImageUrl } from '@/lib/imageCompressor';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number;
  priority?: boolean;
}

export default function OptimizedImage({
  src,
  alt = '',
  width = 800,
  priority = false,
  className = '',
  onError,
  onLoad,
  ...props
}: OptimizedImageProps) {
  const normalizedSrc = src && src !== 'none' ? src : '';
  const optimizedSrc = normalizedSrc ? optimizeImageUrl(normalizedSrc, width) : '';
  const [isLoading, setIsLoading] = useState(Boolean(optimizedSrc));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(Boolean(optimizedSrc));
    setHasError(false);
  }, [optimizedSrc]);

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    onLoad?.(event);
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(event);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#EAF0E5]">
      {isLoading && <div className="loading-shimmer absolute inset-0 z-10" aria-hidden="true" />}
      {optimizedSrc && !hasError ? (
        <img
          {...props}
          src={optimizedSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[#8E9D64]" aria-label={alt || 'Image unavailable'}>
          <ImageIcon className="h-8 w-8" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
