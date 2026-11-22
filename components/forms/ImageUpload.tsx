'use client';

import { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  helperText?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Item Photograph',
  helperText = 'Clear photos significantly speed up ownership verification. Max 5MB.',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas compression failed'));
            },
            'image/webp',
            0.82
          );
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate MIME
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type.toLowerCase())) {
      setError('Please upload a valid JPG, PNG, or WebP image.');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB in size.');
      return;
    }

    setUploading(true);

    try {
      // 1. Client-side WebP compression (max 1200px, 82% quality)
      const compressedBlob = await compressImage(file);

      // 2. Generate Base64 Data URL for guaranteed immediate display
      const base64DataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') resolve(reader.result);
          else reject(new Error('Failed to read image as Data URL'));
        };
        reader.onerror = reject;
        reader.readAsDataURL(compressedBlob);
      });

      // Set immediate local preview
      onChange(base64DataUrl);

      // 3. If cloud Supabase Storage is configured, also upload to bucket
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isCloud = supabaseUrl && !supabaseUrl.includes('placeholder') && !supabaseUrl.includes('localhost');

      if (isCloud) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
        const filePath = `items/${fileName}`;

        const { data, error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(filePath, compressedBlob, {
            contentType: 'image/webp',
            upsert: true,
          });

        if (!uploadError && data) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('item-images').getPublicUrl(filePath);
          onChange(publicUrl);
        }
      }
    } catch (err: any) {
      console.warn('Compression fallback used:', err);
      // Fallback: read raw file as data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-text-primary">{label}</label>

      {value ? (
        <div className="relative inline-block overflow-hidden rounded-lg border border-border-subtle bg-surface shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Item preview"
            className="h-48 w-72 object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2.5 flex items-center justify-between">
            <span className="text-[11px] font-medium text-white flex items-center gap-1.5 drop-shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Photo ready
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-full bg-black/70 p-1 text-white hover:bg-red-600 transition-colors shadow-sm"
              title="Remove Photo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#D1D5DB] bg-surface-subtle/50 px-6 py-6 text-center transition-colors hover:border-accent hover:bg-accent/5"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          ) : (
            <UploadCloud className="h-8 w-8 text-text-muted" />
          )}
          <span className="mt-2 text-xs font-medium text-text-primary">
            {uploading ? 'Processing & preparing preview...' : 'Click or drop photo here'}
          </span>
          <span className="mt-0.5 text-[11px] text-text-muted">JPG, PNG, or WebP up to 5MB</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {error && <p className="text-xs text-status-lost">{error}</p>}
      <p className="text-[11px] text-text-muted">{helperText}</p>
    </div>
  );
}
