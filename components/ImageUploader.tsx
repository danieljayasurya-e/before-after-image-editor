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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs uppercase tracking-wider text-zinc-300 mb-2">
        {title} Image
      </div>

      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept={acceptAttr}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        className={[
          "rounded-xl border-2 border-dashed p-3",
          "transition-colors",
          isDragActive ? "border-white/50 bg-white/10" : "border-white/15",
        ].join(" ")}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-black/20 flex-shrink-0">
            {imageDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageDataUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                {title}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-zinc-50">
              {imageDataUrl ? "Replace image" : "Drag & drop to upload"}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              PNG, JPG (JPEG)
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-3 w-full rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 text-sm font-medium transition-colors"
            >
              Choose file
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-2 text-xs text-red-300">{error}</div>
      ) : null}
    </div>
  );
}
