'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Camera, Loader2, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface MultiImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  requiredFirst?: boolean;
  label?: string;
  helperText?: string;
  error?: string | null;
}

const SLOT_LABELS = [
  { title: 'Photo 1 (Mandatory *)', hint: 'Front / Main Angle', required: true },
  { title: 'Photo 2 (Optional)', hint: 'Back View', required: false },
  { title: 'Photo 3 (Optional)', hint: 'Side Profile', required: false },
  { title: 'Photo 4 (Optional)', hint: 'Close-up / Details', required: false },
  { title: 'Photo 5 (Optional)', hint: 'Case / Accessories', required: false },
];

export default function MultiImageUpload({
  images = [],
  onChange,
  maxImages = 5,
  requiredFirst = true,
  label = 'Photographs of Found Item',
  helperText = 'Upload up to 5 photos. Photo 1 is mandatory so the legitimate owner can identify the item. Photos 2–5 are optional.',
  error,
}: MultiImageUploadProps) {
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [internalError, setInternalError] = useState<string | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const batchInputRef = useRef<HTMLInputElement | null>(null);
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

  const processFileToUrl = async (file: File): Promise<string> => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type.toLowerCase())) {
      throw new Error(`"${file.name}" is not a supported JPG, PNG, or WebP image.`);
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`"${file.name}" exceeds the 5MB size limit.`);
    }

    const compressedBlob = await compressImage(file);

    const base64DataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Failed to convert image to Data URL'));
      };
      reader.onerror = reject;
      reader.readAsDataURL(compressedBlob);
    });

    // Upload to cloud bucket if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isCloud = supabaseUrl && !supabaseUrl.includes('placeholder') && !supabaseUrl.includes('localhost');

    if (isCloud) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
      const filePath = `items/${fileName}`;
      const { data, error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(filePath, compressedBlob, { contentType: 'image/webp', upsert: true });

      if (!uploadError && data) {
        const { data: { publicUrl } } = supabase.storage.from('item-images').getPublicUrl(filePath);
        return publicUrl;
      }
    }

    return base64DataUrl;
  };

  // Handle single slot file selection
  const handleSlotFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInternalError(null);
    setUploadingSlot(index);

    try {
      const url = await processFileToUrl(file);
      const nextImages = [...images];
      // Ensure array length covers up to this index
      while (nextImages.length <= index) {
        nextImages.push('');
      }
      nextImages[index] = url;
      onChange(nextImages);
    } catch (err: any) {
      setInternalError(err?.message || 'Failed to upload photo.');
    } finally {
      setUploadingSlot(null);
      if (e.target) e.target.value = '';
    }
  };

  // Handle batch selection (user selects multiple photos at once)
  const handleBatchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, maxImages);
    if (files.length === 0) return;

    setInternalError(null);
    setUploadingSlot(0);

    try {
      const urls: string[] = [];
      for (const file of files) {
        const url = await processFileToUrl(file);
        urls.push(url);
      }

      // Merge with existing images, prioritizing newly selected in empty slots
      const merged = [...images];
      let uIdx = 0;
      for (let i = 0; i < maxImages && uIdx < urls.length; i++) {
        if (!merged[i]) {
          merged[i] = urls[uIdx++];
        }
      }
      // If any left over, append
      while (uIdx < urls.length && merged.length < maxImages) {
        merged.push(urls[uIdx++]);
      }

      onChange(merged);
    } catch (err: any) {
      setInternalError(err?.message || 'Failed to process photos.');
    } finally {
      setUploadingSlot(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveSlot = (index: number) => {
    const nextImages = [...images];
    nextImages[index] = '';
    onChange(nextImages);
  };

  const activeCount = images.filter((img) => img && img.trim() !== '').length;
  const isPrimaryReady = Boolean(images[0] && images[0].trim() !== '');

  return (
    <div className="space-y-4">
      {/* Header with counter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-border-subtle pb-2">
        <div>
          <label className="block text-sm font-semibold text-text-primary">
            {label} {requiredFirst && <span className="text-status-lost font-bold">*</span>}
          </label>
          <p className="text-xs text-text-secondary mt-0.5">{helperText}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${isPrimaryReady || !requiredFirst ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
            {isPrimaryReady || !requiredFirst ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                {activeCount} of 5 Photos Added
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                Photo 1 Required
              </>
            )}
          </span>
          <button
            type="button"
            onClick={() => batchInputRef.current?.click()}
            className="hidden sm:inline-flex items-center gap-1 rounded border border-border-subtle bg-surface px-2.5 py-1 text-xs font-medium text-text-primary hover:bg-surface-subtle transition-colors shadow-xs"
          >
            <Plus className="h-3 w-3" />
            Upload Multiple at Once
          </button>
        </div>
      </div>

      {/* Hidden batch file input */}
      <input
        ref={batchInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleBatchChange}
        className="hidden"
      />

      {/* Primary Photo (Slot 1 - Mandatory for Found items) */}
      <div className="rounded-lg border-2 border-dashed border-border-subtle bg-surface-subtle/30 p-4 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
              1
            </span>
            <span className="text-xs font-bold text-text-primary">
              Primary Photograph {requiredFirst ? (
                <span className="text-status-lost font-extrabold">* (Mandatory)</span>
              ) : (
                <span className="text-text-muted font-normal">(Optional)</span>
              )}
            </span>
          </div>
          <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${requiredFirst ? 'bg-red-100 text-red-800' : 'bg-surface-subtle text-text-secondary border border-border-subtle'
            }`}>
            {requiredFirst ? 'Required' : 'Optional'}
          </span>
        </div>

        {images[0] ? (
          <div className="relative inline-block overflow-hidden rounded-lg border border-border-subtle bg-surface shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[0]}
              alt="Primary item preview"
              className="h-52 w-full sm:w-80 object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex items-center justify-between">
              <span className="text-xs font-medium text-white flex items-center gap-1.5 drop-shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Primary Photo Ready
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[0]?.click()}
                  className="rounded bg-white/20 px-2 py-1 text-[11px] font-medium text-white hover:bg-white/30 backdrop-blur-xs transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(0)}
                  className="rounded-full bg-black/60 p-1.5 text-white hover:bg-red-600 transition-colors"
                  title="Remove Primary Photo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRefs.current[0]?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 text-center transition-colors hover:border-accent hover:bg-accent/5 ${requiredFirst ? 'border-red-300 bg-red-50/20' : 'border-border-subtle bg-surface'
              }`}
          >
            {uploadingSlot === 0 ? (
              <Loader2 className="h-9 w-9 animate-spin text-accent" />
            ) : (
              <UploadCloud className={`h-9 w-9 stroke-[1.8] ${requiredFirst ? 'text-status-lost' : 'text-accent'}`} />
            )}
            <span className="mt-2 text-xs font-bold text-text-primary">
              {uploadingSlot === 0
                ? 'Processing Primary Photo...'
                : (requiredFirst ? 'Click to Upload Primary Photo * (Required)' : 'Click to Upload Primary Photo (Optional)')}
            </span>
            <span className="mt-1 text-[11px] text-text-secondary">
              Main front angle of the item · Max 5MB (JPG, PNG, WebP)
            </span>
          </div>
        )}

        <input
          ref={(el) => { fileInputRefs.current[0] = el; }}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={(e) => handleSlotFileChange(0, e)}
          className="hidden"
        />
      </div>

      {/* Additional Photos (Slots 2-5 - Optional) */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Additional Angles & Details (Optional · Up to 4 More Photos)
          </span>
          <span className="text-[11px] text-text-muted">
            Photos 2, 3, 4, 5
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((slotIdx) => {
            const slotInfo = SLOT_LABELS[slotIdx];
            const imgUrl = images[slotIdx];
            const isUploading = uploadingSlot === slotIdx;

            return (
              <div
                key={slotIdx}
                className="relative flex flex-col justify-between rounded-lg border border-border-subtle bg-surface p-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-text-primary">
                    Photo {slotIdx + 1}
                  </span>
                  <span className="text-[9px] font-medium text-text-muted uppercase">
                    Optional
                  </span>
                </div>

                {imgUrl ? (
                  <div className="relative aspect-square w-full overflow-hidden rounded border border-border-subtle bg-surface-subtle">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`Angle ${slotIdx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[slotIdx]?.click()}
                        className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-text-primary shadow-xs"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(slotIdx)}
                        className="rounded-full bg-red-600 p-1 text-white shadow-xs hover:bg-red-700"
                        title="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRefs.current[slotIdx]?.click()}
                    className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded border border-dashed border-[#D1D5DB] bg-surface-subtle/40 text-center transition-colors hover:border-accent hover:bg-accent/5 p-2"
                  >
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-accent" />
                    ) : (
                      <Camera className="h-5 w-5 text-text-muted stroke-[1.5]" />
                    )}
                    <span className="mt-1 text-[11px] font-medium text-text-secondary">
                      + Add Photo {slotIdx + 1}
                    </span>
                    <span className="text-[9px] text-text-muted">{slotInfo.hint}</span>
                  </div>
                )}

                <input
                  ref={(el) => { fileInputRefs.current[slotIdx] = el; }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={(e) => handleSlotFileChange(slotIdx, e)}
                  className="hidden"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Errors display */}
      {(error || internalError) && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error || internalError}</span>
        </div>
      )}
    </div>
  );
}
