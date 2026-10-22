import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReceiptViewerProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptViewer({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ReceiptViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setScale(1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setScale(1);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 animate-in fade-in duration-200"
    >
      {/* Top Header */}
      <div className="w-full flex items-center justify-between text-white z-10 px-2 py-2">
        <span className="text-xs font-mono text-zinc-400">
          Receipt {currentIndex + 1} of {images.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setScale((s) => Math.min(3, s + 0.5))}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ZoomIn size={18} />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setScale((s) => Math.max(1, s - 0.5))}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ZoomOut size={18} />
          </button>
          <button
            type="button"
            aria-label="Close viewer"
            onClick={onClose}
            className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
        {images.length > 1 && currentIndex > 0 && (
          <button
            type="button"
            aria-label="Previous receipt"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <img
          src={currentImage}
          alt={`Receipt ${currentIndex + 1}`}
          style={{ transform: `scale(${scale})` }}
          className="max-h-[80vh] max-w-full object-contain transition-transform duration-200 select-none shadow-2xl rounded-sm"
        />

        {images.length > 1 && currentIndex < images.length - 1 && (
          <button
            type="button"
            aria-label="Next receipt"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 py-3 overflow-x-auto max-w-full">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setScale(1);
              }}
              className={`w-12 h-12 rounded border-2 overflow-hidden shrink-0 transition-all ${
                idx === currentIndex ? 'border-white scale-105' : 'border-zinc-700 opacity-60'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
