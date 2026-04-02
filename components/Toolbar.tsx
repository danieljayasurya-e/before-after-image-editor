"use client";

import type { ExportFormat } from "@/lib/export";

type ToolbarProps = {
  onSwap: () => void;
  onExport: (format: ExportFormat) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isExporting?: boolean;
};

export default function Toolbar({
  onSwap,
  onExport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isExporting,
}: ToolbarProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs uppercase tracking-wider text-zinc-300 mb-2">
        Actions
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!onUndo || !canUndo}
          className="rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 border border-white/10 px-3 py-2 text-sm font-medium transition-colors"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!onRedo || !canRedo}
          className="rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 border border-white/10 px-3 py-2 text-sm font-medium transition-colors"
        >
          Redo
        </button>
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={onSwap}
          className="w-full rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 text-sm font-medium transition-colors"
        >
          Swap Before / After
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onExport("png")}
          disabled={isExporting}
          className="rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 border border-white/10 px-3 py-2 text-sm font-medium transition-colors"
        >
          {isExporting ? "Exporting..." : "Export PNG"}
        </button>
        <button
          type="button"
          onClick={() => onExport("jpeg")}
          disabled={isExporting}
          className="rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 border border-white/10 px-3 py-2 text-sm font-medium transition-colors"
        >
          {isExporting ? "Exporting..." : "Export JPEG"}
        </button>
      </div>
    </div>
  );
}

