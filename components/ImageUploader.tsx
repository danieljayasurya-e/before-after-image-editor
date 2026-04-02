"use client";

import { useMemo, useRef, useState } from "react";
import type { SlotId } from "@/lib/types";

type ImageUploaderProps = {
  slotId: SlotId;
  imageDataUrl?: string;
  onImageSelected: (dataUrl: string) => void;
};

function isValidImageFile(file: File) {
  const nameOk = /\.(png|jpe?g)$/i.test(file.name);
  const typeOk =
    file.type === "image/png" ||
    file.type === "image/jpeg" ||
    file.type === "image/jpg";
  return nameOk || typeOk;
}

export default function ImageUploader({
  slotId,
  imageDataUrl,
  onImageSelected,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = slotId === "before" ? "Before" : "After";
  const accentColor = slotId === "before" ? "#a78bfa" : "#f472b6";
  const acceptAttr = useMemo(() => "image/png,image/jpeg", []);

  const readAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setError(null);
    if (!isValidImageFile(file)) {
      setError("Please upload a PNG or JPG image.");
      return;
    }
    try {
      const dataUrl = await readAsDataUrl(file);
      onImageSelected(dataUrl);
    } catch {
      setError("Could not read that image. Please try again.");
    }
  };

  return (
    <div
      className={[
        "rounded-xl border-2 border-dashed transition-all cursor-pointer",
        isDragActive
          ? "border-violet-400/60 bg-violet-400/5"
          : "border-white/[0.07] hover:border-white/20 bg-white/[0.02]",
      ].join(" ")}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(true); }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(true); }}
      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept={acceptAttr}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex items-center gap-3 p-3">
        <div
          className="w-14 h-14 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 relative"
          style={{ background: imageDataUrl ? "transparent" : `linear-gradient(135deg, ${accentColor}22, ${accentColor}08)` }}
        >
          {imageDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageDataUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: accentColor, opacity: 0.5 }}>
                <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="7" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 13l4-3 3 2.5 3-3.5 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
            <span className="text-xs font-semibold text-zinc-200">{title}</span>
          </div>
          <div className="text-[11px] text-zinc-500">
            {imageDataUrl ? "Click to replace" : "Drop or click to upload"}
          </div>
          <div className="text-[10px] text-zinc-600 mt-0.5">PNG, JPG</div>
        </div>

        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-zinc-400">
              <path d="M6.5 2v9M2 6.5l4.5-4.5 4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-3 pb-2 text-[11px] text-red-400">{error}</div>
      )}
    </div>
  );
}
