'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!optimizedSrc) {
      setIsLoading(false);
      return;
    }
    // If the image is already cached/complete in browser memory, skip shimmer
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
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
    <div className={`relative overflow-hidden bg-[#EAF0E5] ${className || 'h-full w-full'}`}>
      {isLoading && <div className="loading-shimmer absolute inset-0 z-10 pointer-events-none" aria-hidden="true" />}
      {optimizedSrc && !hasError ? (
        <img
          ref={imgRef}
          {...props}
          src={optimizedSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[#8E9D64]" aria-label={alt || 'Image unavailable'}>
          <ImageIcon className="h-8 w-8" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
