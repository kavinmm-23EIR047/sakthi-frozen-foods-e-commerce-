'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, Sparkles, CheckCircle2, RefreshCw, X, FileImage, ShieldCheck } from 'lucide-react';
import { compressImageToWebP, formatBytes, CompressionResult, optimizeImageUrl, handleImageError } from '@/lib/imageCompressor';
import OptimizedImage from '@/components/OptimizedImage';

interface ImageUploaderProps {
  value: string;
  onChange: (imageUrl: string, compressedFile: File | null) => void;
  label?: string;
  required?: boolean;
}

export default function ImageUploader({ value, onChange, label = 'Product Image', required = false }: ImageUploaderProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null);
  const [urlInput, setUrlInput] = useState(value && !value.startsWith('data:') ? value : '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP, AVIF).');
      return;
    }

    try {
      setIsCompressing(true);
      const result = await compressImageToWebP(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.88,
        fileName: file.name,
      });

      setCompressionStats(result);
      onChange(result.dataUrl, result.file);
    } catch (err: any) {
      console.error('Image compression error:', err);
      alert('Failed to process image: ' + err.message);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    const optimized = optimizeImageUrl(urlInput.trim());
    setCompressionStats(null);
    onChange(optimized, null);
  };

  const handleClear = () => {
    setCompressionStats(null);
    setUrlInput('');
    onChange('', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <label className="block font-extrabold text-sm text-[#1E201D]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {/* Toggle Mode */}
        <div className="flex items-center bg-[#E8EEE0] p-1 rounded-xl border border-[#4F534C]/15 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              mode === 'upload'
                ? 'bg-[#4D583F] text-white shadow-sm'
                : 'text-[#61665D] hover:text-[#1E201D]'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload & Compress</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              mode === 'url'
                ? 'bg-[#4D583F] text-white shadow-sm'
                : 'text-[#61665D] hover:text-[#1E201D]'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div className="space-y-3">
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-[#4D583F] bg-[#EAF0E5]/60 scale-[1.01]'
                : 'border-[#4F534C]/20 bg-[#FAFAF5] hover:border-[#4D583F]/50 hover:bg-[#E8EEE0]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp, image/avif"
              onChange={handleFileChange}
              className="hidden"
            />

            {isCompressing ? (
              <div className="py-4 flex flex-col items-center gap-2">
                <RefreshCw className="w-8 h-8 text-[#4D583F] animate-spin" />
                <p className="text-sm font-extrabold text-[#1E201D]">Compressing & Converting to WebP...</p>
                <p className="text-xs text-[#61665D]">Reducing file size while keeping HD quality</p>
              </div>
            ) : value ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full text-left" onClick={(e) => e.stopPropagation()}>
                {/* Preview Thumbnail */}
                <div className="w-24 h-24 rounded-xl bg-white border border-[#4F534C]/20 overflow-hidden shrink-0 shadow-md flex items-center justify-center relative group">
                  <OptimizedImage src={value} alt="Preview" width={240} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-lg bg-white/90 text-[#1E201D] hover:bg-white text-xs font-bold"
                      title="Change Image"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EAF0E5] text-[#4D583F] font-black text-[11px] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> WebP Compressed
                    </span>
                    {compressionStats?.savingsPercentage ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                        🔥 {compressionStats.savingsPercentage}% Saved
                      </span>
                    ) : null}
                  </div>

                  {compressionStats ? (
                    <div className="text-xs text-[#61665D] space-y-0.5">
                      <p>
                        Original: <span className="line-through text-red-500 font-semibold">{formatBytes(compressionStats.originalSize)}</span>
                        {' ➔ '}
                        WebP: <span className="font-extrabold text-emerald-700">{formatBytes(compressionStats.compressedSize)}</span>
                      </p>
                      <p className="text-[11px] text-[#4F534C]">
                        Resolution: {compressionStats.width} × {compressionStats.height}px
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#61665D]">Image loaded & optimized for fast speed.</p>
                  )}

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold text-[#4D583F] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Replace File
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-[#EAF0E5] text-[#4D583F] flex items-center justify-center shadow-sm">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#1E201D]">
                    Click to upload or drag & drop image
                  </p>
                  <p className="text-xs text-[#61665D] mt-0.5">
                    PNG, JPG, JPEG, WEBP or AVIF (Auto-converts to WebP, Low KB)
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EAF0E5] text-[#4D583F] text-[10px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> Auto-Compression Enabled
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Image URL Mode */
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onBlur={handleUrlSubmit}
              placeholder="https://res.cloudinary.com/..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAFAF5] border border-[#4F534C]/20 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F]"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-4 py-2.5 bg-[#4D583F] text-white font-bold text-xs rounded-xl hover:bg-[#414b35] transition-colors shadow-sm shrink-0"
            >
              Apply URL
            </button>
          </div>

          {value && (
            <div className="flex items-center gap-3 p-3 bg-[#FAFAF5] rounded-xl border border-[#4F534C]/15">
              <div className="w-14 h-14 rounded-lg bg-white overflow-hidden border border-[#4F534C]/20 shrink-0">
                <OptimizedImage src={value} alt="Preview" width={180} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#1E201D] truncate">{value}</p>
                <span className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> CDN Auto-Format Ready
                </span>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-[#61665D] hover:text-red-600 transition-colors"
                title="Clear image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
