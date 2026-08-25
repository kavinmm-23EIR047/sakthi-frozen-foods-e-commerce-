/**
 * Image Compression & WebP Conversion Utility
 * Converts any image (PNG, JPG, JPEG, WEBP, AVIF) to WebP format client-side
 * Reduces bandwidth usage significantly while maintaining crisp HD visual quality.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default: 0.88 for HD crisp quality)
  fileName?: string;
}

export interface CompressionResult {
  file: File;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  savingsPercentage: number;
  width: number;
  height: number;
}

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';

/**
 * Image onError helper to prevent broken image icons anywhere in the app
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  if (target.src !== DEFAULT_FALLBACK_IMAGE) {
    target.src = DEFAULT_FALLBACK_IMAGE;
  }
}

/**
 * Format raw byte size into human readable string (KB / MB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Compress an image file or Data URL to WebP format using HTML5 Canvas
 */
export async function compressImageToWebP(
  input: File | string,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1600, // HD max resolution width
    maxHeight = 1600, // HD max resolution height
    quality = 0.88, // Crisp high quality (indistinguishable from original)
    fileName = 'product_image.webp'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let originalSize = 0;
    if (typeof input === 'object' && input instanceof File) {
      originalSize = input.size;
    }

    const processImage = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Constrain dimensions while preserving natural aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      // Create Canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Canvas 2D context could not be created.'));
      }

      // Draw original image with high quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert canvas to WebP blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Image compression to WebP failed.'));
          }

          const compressedSize = blob.size;
          if (originalSize === 0) originalSize = Math.round(compressedSize * 1.6);

          const savingsPercentage = originalSize > 0
            ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
            : 0;

          // Create WebP File object
          const finalFileName = fileName.endsWith('.webp')
            ? fileName
            : `${fileName.substring(0, fileName.lastIndexOf('.')) || fileName}.webp`;

          const compressedFile = new File([blob], finalFileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          // Generate Data URL for instant preview
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            resolve({
              file: compressedFile,
              dataUrl,
              originalSize,
              compressedSize,
              savingsPercentage,
              width,
              height,
            });
          };
          reader.onerror = () => reject(new Error('Failed to convert compressed blob to data URL.'));
          reader.readAsDataURL(blob);
        },
        'image/webp',
        quality
      );
    };

    img.onload = processImage;
    img.onerror = (err) => reject(new Error('Failed to load image for compression: ' + err));

    if (typeof input === 'string') {
      img.src = input;
    } else {
      const objectUrl = URL.createObjectURL(input);
      img.src = objectUrl;
    }
  });
}

/**
 * Utility to attach quality and auto-format params to Cloudinary or Unsplash URLs
 * to prevent high bandwidth consumption when using remote CDN URLs.
 */
export function optimizeImageUrl(url: string, width: number = 800): string {
  if (!url) return DEFAULT_FALLBACK_IMAGE;

  // Cloudinary Optimization
  if (url.includes('res.cloudinary.com')) {
    if (!url.includes('f_auto') && url.includes('/upload/')) {
      return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
    }
  }

  // Unsplash Optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('q', '85');
      urlObj.searchParams.set('w', width.toString());
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  return url;
}
