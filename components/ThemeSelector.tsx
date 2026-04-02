"use client";

import { useMemo, useRef, useState } from "react";
import { BUILTIN_THEMES, CUSTOM_THEME_ID, getThemeBackgroundStyle } from "@/lib/themes";
import type { ThemeBackground } from "@/lib/themes";

type ThemeSelectorProps = {
  selectedThemeId: string;
  customBackgroundDataUrl?: string;
  onSelectTheme: (themeId: string) => void;
  onUploadCustomBackground: (dataUrl: string) => void;
};

function isValidBackgroundFile(file: File) {
  const nameOk = /\.(png|jpe?g)$/i.test(file.name);
  const typeOk =
    file.type === "image/png" ||
    file.type === "image/jpeg" ||
    file.type === "image/jpg";
  return nameOk || typeOk;
}

export default function ThemeSelector({
  selectedThemeId,
  customBackgroundDataUrl,
  onSelectTheme,
  onUploadCustomBackground,
}: ThemeSelectorProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const acceptAttr = useMemo(() => "image/png,image/jpeg", []);

  const currentStyle = useMemo(() => {
    return getThemeBackgroundStyle(selectedThemeId, customBackgroundDataUrl) as ThemeBackground;
  }, [selectedThemeId, customBackgroundDataUrl]);

  const readAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });

  const onChooseCustom = async (files: FileList | null) => {
    setError(null);
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!isValidBackgroundFile(file)) {
      setError("Please upload a PNG or JPG image.");
      return;
    }
    try {
      const dataUrl = await readAsDataUrl(file);
      onSelectTheme(CUSTOM_THEME_ID);
      onUploadCustomBackground(dataUrl);
    } catch {
      setError("Could not read that image. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-1">Background</div>

      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept={acceptAttr}
        onChange={(e) => onChooseCustom(e.target.files)}
      />

      {/* Current theme preview + upload */}
      <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
        <div
          className="w-12 h-12 rounded-lg border border-white/10 overflow-hidden flex-shrink-0"
          style={currentStyle}
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-zinc-400 mb-2">Custom background</div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full h-8 rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 text-xs font-medium text-zinc-300 hover:text-zinc-100 transition-all"
          >
            Upload image
          </button>
          {error && <div className="mt-1.5 text-[11px] text-red-400">{error}</div>}
        </div>
      </div>

      {/* Preset grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { id: CUSTOM_THEME_ID, name: "Custom" as const },
          ...BUILTIN_THEMES,
        ].map((t) => {
          const isSelected = selectedThemeId === t.id;
          const style =
            t.id === CUSTOM_THEME_ID
              ? (customBackgroundDataUrl
                  ? ({
                      backgroundImage: `url(${customBackgroundDataUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    } as ThemeBackground)
                  : ({
                      backgroundImage:
                        "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02))",
                    } as ThemeBackground))
              : (BUILTIN_THEMES.find((theme) => theme.id === t.id)?.background ??
                  ({
                    backgroundImage:
                      "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01))",
                  } as ThemeBackground));

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTheme(t.id)}
              aria-pressed={isSelected}
              title={t.name}
              className={[
                "w-full aspect-square rounded-xl border-2 transition-all",
                isSelected
                  ? "border-violet-400 ring-2 ring-violet-400/20 scale-105"
                  : "border-white/[0.07] hover:border-white/25 hover:scale-102",
              ].join(" ")}
              style={style}
            />
          );
        })}
      </div>
    </div>
  );
}
