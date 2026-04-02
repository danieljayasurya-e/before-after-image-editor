"use client";

import type { LabelStyle, SlotId } from "@/lib/types";

type TextEditorProps = {
  labelId: SlotId;
  labelStyle: LabelStyle;
  defaultText: string;
  onChangeStyle: (nextStyle: LabelStyle) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function TextEditor({
  labelId,
  labelStyle,
  onChangeStyle,
}: TextEditorProps) {
  const title = labelId === "before" ? "Before Label" : "After Label";
  const accentColor = labelId === "before" ? "#a78bfa" : "#f472b6";
  const colorValue = labelStyle.color.startsWith("#") ? labelStyle.color : "#FFFFFF";

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{title}</div>
      </div>

      {/* Font size */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-zinc-400">Font size</span>
          <span className="text-xs text-zinc-200 font-mono tabular-nums">{labelStyle.fontSizePx}px</span>
        </div>
        <input
          type="range"
          min={20}
          max={80}
          step={1}
          value={clamp(labelStyle.fontSizePx, 20, 80)}
          onChange={(e) => {
            const fontSizePx = Number(e.target.value);
            onChangeStyle({ ...labelStyle, fontSizePx });
          }}
          className="w-full h-1"
          style={{ accentColor }}
        />
      </div>

      {/* Color + Alignment in a row */}
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="text-xs text-zinc-400 mb-1.5">Color</div>
          <input
            type="color"
            value={colorValue}
            onChange={(e) => onChangeStyle({ ...labelStyle, color: e.target.value })}
            className="w-full h-9 rounded-lg bg-transparent border border-white/10 cursor-pointer"
            title={colorValue.toUpperCase()}
          />
        </div>
        <div className="flex-1">
          <div className="text-xs text-zinc-400 mb-1.5">Align</div>
          <div className="flex rounded-lg border border-white/10 overflow-hidden">
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => onChangeStyle({ ...labelStyle, align })}
                className={[
                  "flex-1 py-2 text-xs transition-all",
                  labelStyle.align === align
                    ? "bg-white/15 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5",
                ].join(" ")}
                title={align}
              >
                {align === "left" ? "L" : align === "center" ? "C" : "R"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
