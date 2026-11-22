'use client';

import React, { useState } from 'react';
import { Box, ChevronLeft, ChevronRight, Expand } from 'lucide-react';

interface ItemImageGalleryProps {
  title: string;
  images: string[];
}

export default function ItemImageGallery({ title, images = [] }: ItemImageGalleryProps) {
  // Filter out any blank or falsy entries
  const validImages = images.filter((img) => img && img.trim() !== '');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (validImages.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-subtle aspect-square flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-text-muted p-8 text-center">
          <Box className="h-16 w-16 stroke-[1.2]" />
          <span className="mt-2 text-xs font-medium">No Photograph Provided</span>
          <span className="text-[11px] text-text-muted mt-1">
            Public identification relies on description and approximate landmark.
          </span>
        </div>
      </div>
    );
  }

  const currentImage = validImages[selectedIndex] || validImages[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-3">
      {/* Main Image Frame */}
      <div className="relative overflow-hidden rounded-lg border border-border-subtle bg-surface-subtle aspect-square flex items-center justify-center group shadow-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage}
          alt={`${title} - Photo ${selectedIndex + 1}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
        />

        {/* Counter Badge */}
        {validImages.length > 1 && (
          <div className="absolute top-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
            {selectedIndex + 1} / {validImages.length}
          </div>
        )}

        {/* Prev / Next Arrows */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Enlarge Trigger */}
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-3 right-3 rounded-md bg-black/60 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          title="View full image"
        >
          <Expand className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Thumbnails Row (if > 1 image) */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2 pt-1">
          {validImages.map((img, idx) => {
            const isActive = idx === selectedIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative aspect-square overflow-hidden rounded-md border-2 transition-all ${
                  isActive
                    ? 'border-accent ring-2 ring-accent/20 scale-102 shadow-xs'
                    : 'border-border-subtle opacity-75 hover:opacity-100 hover:border-text-secondary'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-[9px] font-medium text-white text-center">
                  #{idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt={title}
              className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute -top-3 -right-3 rounded-full bg-white p-1.5 text-black hover:bg-gray-200 shadow-lg font-bold text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
