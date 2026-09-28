'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TransparentPattyGraphicProps {
  src?: string;
  className?: string;
  alt?: string;
}

export default function TransparentPattyGraphic({
  src = '/assets/sakthi-mock-meat-exact.jpg',
  className = 'w-full h-full object-contain',
  alt = 'Real Taste Plant Power Mock Meat Patties',
}: TransparentPattyGraphicProps) {
  const [processedSrc, setProcessedSrc] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      if (!isMounted) return;

      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 800;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Sample average background color from the 4 corners
      const sampleIndices = [0, (w - 1) * 4, ((h - 1) * w) * 4, ((h - 1) * w + (w - 1)) * 4];
      let bgR = 0, bgG = 0, bgB = 0;
      for (const idx of sampleIndices) {
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
      }
      bgR /= sampleIndices.length;
      bgG /= sampleIndices.length;
      bgB /= sampleIndices.length;

      // Visited tracking & BFS queue
      const visited = new Uint8Array(w * h);
      const queue = new Int32Array(w * h);
      let head = 0;
      let tail = 0;

      const threshold = 42;
      const featherRange = 22;

      function colorDist(r: number, g: number, b: number) {
        const dr = r - bgR;
        const dg = g - bgG;
        const db = b - bgB;
        return Math.sqrt(dr * dr + dg * dg + db * db);
      }

      // Add all outer boundary pixels to queue
      for (let x = 0; x < w; x++) {
        // Top row
        let idx = x;
        let p = idx * 4;
        if (colorDist(data[p], data[p + 1], data[p + 2]) <= threshold + featherRange) {
          visited[idx] = 1;
          queue[tail++] = idx;
        }
        // Bottom row
        idx = (h - 1) * w + x;
        p = idx * 4;
        if (colorDist(data[p], data[p + 1], data[p + 2]) <= threshold + featherRange) {
          visited[idx] = 1;
          queue[tail++] = idx;
        }
      }

      for (let y = 0; y < h; y++) {
        // Left column
        let idx = y * w;
        let p = idx * 4;
        if (!visited[idx] && colorDist(data[p], data[p + 1], data[p + 2]) <= threshold + featherRange) {
          visited[idx] = 1;
          queue[tail++] = idx;
        }
        // Right column
        idx = y * w + (w - 1);
        p = idx * 4;
        if (!visited[idx] && colorDist(data[p], data[p + 1], data[p + 2]) <= threshold + featherRange) {
          visited[idx] = 1;
          queue[tail++] = idx;
        }
      }

      // BFS traversal from borders inward
      while (head < tail) {
        const currIdx = queue[head++];
        const cx = currIdx % w;
        const cy = Math.floor(currIdx / w);
        const p = currIdx * 4;
        const dist = colorDist(data[p], data[p + 1], data[p + 2]);

        if (dist <= threshold) {
          data[p + 3] = 0;
        } else if (dist <= threshold + featherRange) {
          const factor = (dist - threshold) / featherRange;
          data[p + 3] = Math.round(data[p + 3] * factor);
        }

        const neighbors = [
          cx > 0 ? currIdx - 1 : -1,
          cx < w - 1 ? currIdx + 1 : -1,
          cy > 0 ? currIdx - w : -1,
          cy < h - 1 ? currIdx + w : -1,
        ];

        for (const n of neighbors) {
          if (n >= 0 && !visited[n]) {
            const np = n * 4;
            const nDist = colorDist(data[np], data[np + 1], data[np + 2]);
            if (nDist <= threshold + featherRange) {
              visited[n] = 1;
              queue[tail++] = n;
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      if (isMounted) {
        setProcessedSrc(dataUrl);
      }

      // Persist to server API in background so it's statically saved as well
      try {
        fetch('/api/save-transparent-patty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl }),
        }).catch(() => {});
      } catch (e) {}
    };

    return () => {
      isMounted = false;
    };
  }, [src]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* If processed, show true transparent PNG; otherwise graceful fallback with mask */}
      <img
        src={processedSrc || src}
        alt={alt}
        className={`${className} filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.5)] transition-all duration-500`}
        style={!processedSrc ? { maskImage: 'radial-gradient(ellipse at center, black 65%, transparent 95%)' } : undefined}
      />
    </div>
  );
}
