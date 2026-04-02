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
      setError("Please upload a PNG or JPG background image.");
      return;
    }
    try {
      const dataUrl = await readAsDataUrl(file);
      onSelectTheme(CUSTOM_THEME_ID);
      onUploadCustomBackground(dataUrl);
    } catch {
      setError("Could not read that background image. Please try again.");
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs uppercase tracking-wider text-zinc-300 mb-2">
        Background Theme
      </div>

      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept={acceptAttr}
        onChange={(e) => onChooseCustom(e.target.files)}
      />

      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl border border-white/10 overflow-hidden flex-shrink-0" style={currentStyle} />

        <div className="flex-1 min-w-0">
          <div className="text-xs text-zinc-400 leading-relaxed">
            Select a preset or upload a custom background image.
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 w-full rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 text-sm font-medium transition-colors"
          >
            Upload custom image
          </button>

          {error ? <div className="mt-2 text-xs text-red-300">{error}</div> : null}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
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
                    } as ThemeBackground)) // placeholder when no custom uploaded
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
                "w-full aspect-square rounded-xl border transition-all",
                isSelected ? "border-white/70 ring-2 ring-white/20" : "border-white/10 hover:border-white/30",
              ].join(" ")}
              style={style}
            />
          );
        })}
      </div>
    </div>
  );
}

