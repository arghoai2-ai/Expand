import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { APP_CONSTANTS } from '../../core/constants.ts';

interface ReceiptAttachmentFieldProps {
  receipts: string[];
  onChange: (newReceipts: string[]) => void;
  maxCount?: number;
}

export function ReceiptAttachmentField({
  receipts,
  onChange,
  maxCount = APP_CONSTANTS.maxReceiptsPerOrder,
}: ReceiptAttachmentFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxCount - receipts.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange([...receipts, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (index: number) => {
    onChange(receipts.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
        <span className="font-medium">Bill / Cash-Memo Photos</span>
        <span className="text-[11px] font-mono">
          {receipts.length}/{maxCount}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {receipts.map((img, idx) => (
          <div
            key={idx}
            className="relative w-16 h-16 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden group bg-zinc-100 dark:bg-zinc-800 shrink-0"
          >
            <img src={img} alt={`Receipt ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              aria-label={`Remove photo ${idx + 1}`}
              onClick={() => handleRemove(idx)}
              className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {receipts.length < maxCount && (
          <label className="w-16 h-16 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer bg-zinc-50/50 dark:bg-zinc-800/40 transition-colors shrink-0">
            <Camera size={18} />
            <span className="text-[10px] mt-1 font-medium">Add</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
          </label>
        )}
      </div>
    </div>
  );
}
