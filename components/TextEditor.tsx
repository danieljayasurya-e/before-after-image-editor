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
  const title = labelId === "before" ? "Before label" : "After label";
  const colorValue = labelStyle.color.startsWith("#") ? labelStyle.color : "#FFFFFF";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs uppercase tracking-wider text-zinc-300 mb-2">
        {title}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Font size</span>
            <span className="text-zinc-200">{labelStyle.fontSizePx}px</span>
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
            className="w-full accent-white"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Color</span>
            <span className="text-zinc-200">{colorValue.toUpperCase()}</span>
          </div>
          <input
            type="color"
            value={colorValue}
            onChange={(e) => onChangeStyle({ ...labelStyle, color: e.target.value })}
            className="w-full h-10 rounded-xl bg-transparent border border-white/10"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Alignment</span>
          </div>
          <select
            value={labelStyle.align}
            onChange={(e) => {
              const align = e.target.value as LabelStyle["align"];
              onChangeStyle({ ...labelStyle, align });
            }}
            className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    </div>
  );
}

