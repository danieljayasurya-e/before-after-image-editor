"use client";

import { useEffect, useRef, useState } from "react";
import type { EditorState } from "@/lib/types";
import { DEFAULT_EDITOR_STATE } from "@/lib/types";
import EditorCanvas from "@/components/EditorCanvas";
import ImageUploader from "@/components/ImageUploader";
import ThemeSelector from "@/components/ThemeSelector";
import { CUSTOM_THEME_ID } from "@/lib/themes";
import TextEditor from "@/components/TextEditor";
import { exportElementAsImage } from "@/lib/export";
import type { ExportFormat } from "@/lib/export";

function cloneAny<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

type PanelTab = "labels" | "theme";

export default function EditorPage() {
  const [present, setPresent] = useState<EditorState>(() =>
    cloneAny(DEFAULT_EDITOR_STATE)
  );
  const [past, setPast] = useState<EditorState[]>([]);
  const [future, setFuture] = useState<EditorState[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PanelTab>("labels");

  const presentRef = useRef(present);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const transformInteractionBaseRef = useRef<EditorState | null>(null);

  useEffect(() => { presentRef.current = present; }, [present]);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 3500);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const commit = (updater: (prev: EditorState) => EditorState) => {
    const base = presentRef.current;
    const next = updater(base);
    setPast((p) => [...p, cloneAny(base)].slice(-50));
    setPresent(cloneAny(next));
    setFuture([]);
  };

  const undo = () => {
    transformInteractionBaseRef.current = null;
    setPast((p) => {
      if (p.length === 0) return p;
      const previous = p[p.length - 1];
      const nextPast = p.slice(0, -1);
      setFuture((f) => [cloneAny(presentRef.current), ...f].slice(0, 50));
      setPresent(cloneAny(previous));
      return nextPast;
    });
  };

  const redo = () => {
    transformInteractionBaseRef.current = null;
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      const nextFuture = f.slice(1);
      setPast((p) => [...p, cloneAny(presentRef.current)].slice(-50));
      setPresent(cloneAny(next));
      return nextFuture;
    });
  };

  const handleExport = async (format: ExportFormat) => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      const blob = await exportElementAsImage(canvasRef.current, {
        format,
        jpegQuality: 0.92,
        width: 1080,
        height: 1350,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `before-after.${format === "png" ? "png" : "jpg"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setToastMessage(`Exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      setToastMessage(`Export failed. ${message}`);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        if (canUndo) { e.preventDefault(); undo(); }
        return;
      }
      if (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey)) {
        if (canRedo) { e.preventDefault(); redo(); }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canUndo, canRedo]);

  return (
    <div className="h-screen bg-[#0d0d0f] text-zinc-50 flex flex-col overflow-hidden">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="rounded-full border border-white/10 bg-black/80 backdrop-blur-xl px-5 py-2.5 text-sm text-zinc-100 shadow-2xl">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Top Toolbar */}
      <header className="flex-shrink-0 h-14 border-b border-white/[0.06] bg-[#0d0d0f]/95 backdrop-blur-xl flex items-center px-4 gap-3 z-10">
        {/* Brand */}
        <div className="flex items-center gap-2 mr-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-[10px] font-bold select-none">
            B/A
          </div>
          <span className="font-semibold text-sm tracking-tight hidden sm:block text-zinc-100">Before / After</span>
        </div>

        <div className="w-px h-5 bg-white/10 flex-shrink-0" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/8 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 6.5C2 4.015 4.015 2 6.5 2a4.5 4.5 0 013.5 1.684L11.5 2v3.5H8l1.3-1.3A3 3 0 106.5 9.5c1.1 0 2.06-.6 2.574-1.486l1.226.56A4.5 4.5 0 116.5 11C4.015 11 2 8.985 2 6.5z" fill="currentColor"/></svg>
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/8 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 6.5C12 4.015 9.985 2 7.5 2A4.5 4.5 0 004 3.684L2.5 2v3.5H6l-1.3-1.3A3 3 0 117.5 9.5a3 3 0 01-2.574-1.486l-1.226.56A4.5 4.5 0 107.5 11C9.985 11 12 8.985 12 6.5z" fill="currentColor"/></svg>
          </button>
        </div>

        <div className="w-px h-5 bg-white/10 flex-shrink-0" />

        {/* Swap */}
        <button
          type="button"
          onClick={() => {
            commit((prev) => ({
              ...prev,
              before: cloneAny(prev.after),
              after: cloneAny(prev.before),
              labels: {
                before: cloneAny(prev.labels.after),
                after: cloneAny(prev.labels.before),
              },
            }));
          }}
          className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/8 transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 3.5h8M7 1l2.5 2.5L7 6M12 9.5H4m2.5 2.5L4 9.5 6.5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Swap
        </button>

        <div className="flex-1" />

        {/* Export */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExport("png")}
            disabled={isExporting}
            className="h-8 px-3 rounded-lg text-xs font-medium border border-white/10 bg-white/5 text-zinc-300 hover:text-zinc-100 hover:bg-white/10 disabled:opacity-40 transition-all"
          >
            {isExporting ? "…" : "PNG"}
          </button>
          <button
            type="button"
            onClick={() => handleExport("jpeg")}
            disabled={isExporting}
            className="h-8 px-4 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white disabled:opacity-40 transition-all shadow-lg shadow-violet-900/40"
          >
            {isExporting ? "Exporting…" : "Export JPEG"}
          </button>
        </div>
      </header>

      {/* Main 3-column layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* LEFT PANEL — Images & Zoom */}
        <aside className="w-[268px] flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-hidden bg-[#111113]">
          <div className="flex-shrink-0 px-4 pt-4 pb-2 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Images</span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
            <ImageUploader
              slotId="before"
              imageDataUrl={present.before.imageDataUrl}
              onImageSelected={(dataUrl) => {
                commit((prev) => ({
                  ...prev,
                  before: {
                    ...prev.before,
                    imageDataUrl: dataUrl,
                    transform: { ...prev.before.transform, objectFit: "cover", zoom: 1, offsetX: 0, offsetY: 0 },
                  },
                }));
              }}
            />
            <ImageUploader
              slotId="after"
              imageDataUrl={present.after.imageDataUrl}
              onImageSelected={(dataUrl) => {
                commit((prev) => ({
                  ...prev,
                  after: {
                    ...prev.after,
                    imageDataUrl: dataUrl,
                    transform: { ...prev.after.transform, objectFit: "cover", zoom: 1, offsetX: 0, offsetY: 0 },
                  },
                }));
              }}
            />

            {/* Zoom controls */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Zoom & Position</div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-violet-400 inline-block flex-shrink-0" />
                    Before
                  </span>
                  <span className="text-xs text-zinc-200 font-mono tabular-nums">{present.before.transform.zoom.toFixed(2)}×</span>
                </div>
                <input type="range" min={1} max={2.8} step={0.01}
                  value={present.before.transform.zoom}
                  onChange={(e) => {
                    const zoom = Number(e.target.value);
                    commit((prev) => ({ ...prev, before: { ...prev.before, transform: { ...prev.before.transform, zoom } } }));
                  }}
                  className="w-full accent-violet-400 h-1"
                />
                <button type="button"
                  onClick={() => commit((prev) => ({ ...prev, before: { ...prev.before, transform: { ...prev.before.transform, zoom: 1, offsetX: 0, offsetY: 0 } } }))}
                  className="mt-1 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  Reset position
                </button>
              </div>

              <div className="h-px bg-white/[0.05]" />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-pink-400 inline-block flex-shrink-0" />
                    After
                  </span>
                  <span className="text-xs text-zinc-200 font-mono tabular-nums">{present.after.transform.zoom.toFixed(2)}×</span>
                </div>
                <input type="range" min={1} max={2.8} step={0.01}
                  value={present.after.transform.zoom}
                  onChange={(e) => {
                    const zoom = Number(e.target.value);
                    commit((prev) => ({ ...prev, after: { ...prev.after, transform: { ...prev.after.transform, zoom } } }));
                  }}
                  className="w-full accent-pink-400 h-1"
                />
                <button type="button"
                  onClick={() => commit((prev) => ({ ...prev, after: { ...prev.after, transform: { ...prev.after.transform, zoom: 1, offsetX: 0, offsetY: 0 } } }))}
                  className="mt-1 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  Reset position
                </button>
              </div>

              <p className="text-[11px] text-zinc-600 pt-1">Drag on canvas to reposition</p>
            </div>
          </div>
        </aside>

        {/* CENTER — Canvas */}
        <main className="flex-1 flex items-center justify-center overflow-hidden bg-[#0d0d0f] relative">
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="relative z-10 w-full h-full flex items-center justify-center p-6">
            <EditorCanvas
              editor={present}
              exportRootRef={canvasRef}
              onObjectFitComputed={(slotId, fit) => {
                setPresent((prev) => ({
                  ...prev,
                  [slotId]: { ...prev[slotId], transform: { ...prev[slotId].transform, objectFit: fit } },
                }));
              }}
              onLabelTextCommitted={(slotId, nextText) => {
                commit((prev) => ({
                  ...prev,
                  labels: {
                    ...prev.labels,
                    ...(slotId === "before"
                      ? { before: { ...prev.labels.before, text: nextText } }
                      : { after: { ...prev.labels.after, text: nextText } }),
                  },
                }));
              }}
              onTransformInteractionStart={() => {
                if (!transformInteractionBaseRef.current) {
                  transformInteractionBaseRef.current = cloneAny(presentRef.current);
                }
              }}
              onTransformInteractionEnd={() => {
                const base = transformInteractionBaseRef.current;
                if (!base) return;
                transformInteractionBaseRef.current = null;
                setPast((p) => [...p, base].slice(-50));
                setFuture([]);
              }}
              onTransformChange={(slotId, nextTransform) => {
                setPresent((prev) => ({
                  ...prev,
                  [slotId]: { ...prev[slotId], transform: nextTransform },
                }));
              }}
            />
          </div>
        </main>

        {/* RIGHT PANEL — Labels & Theme */}
        <aside className="w-[268px] flex-shrink-0 border-l border-white/[0.06] flex flex-col overflow-hidden bg-[#111113]">
          {/* Tabs */}
          <div className="flex-shrink-0 flex border-b border-white/[0.06]">
            {([
              { id: "labels" as PanelTab, label: "Labels", icon: (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 9.5l5-5 2 2-5 5H1.5v-2zm6-6l1.5-1.5a1 1 0 011.5 1.5L9 5l-1.5-1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
              )},
              { id: "theme" as PanelTab, label: "Theme", icon: (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6.5 1.5C6.5 1.5 4 4 4 6.5s2.5 5 2.5 5" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 6.5h10" stroke="currentColor" strokeWidth="1.2"/></svg>
              )},
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "flex-1 py-3.5 text-xs font-medium transition-all flex items-center justify-center gap-1.5 border-b-2",
                  activeTab === tab.id
                    ? "text-zinc-100 border-violet-500 bg-violet-500/5"
                    : "text-zinc-500 hover:text-zinc-300 border-transparent hover:bg-white/[0.03]",
                ].join(" ")}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
            {activeTab === "labels" && (
              <>
                <TextEditor
                  labelId="before"
                  defaultText="Before"
                  labelStyle={present.labels.before}
                  onChangeStyle={(nextStyle) =>
                    commit((prev) => ({ ...prev, labels: { ...prev.labels, before: nextStyle } }))
                  }
                />
                <TextEditor
                  labelId="after"
                  defaultText="After"
                  labelStyle={present.labels.after}
                  onChangeStyle={(nextStyle) =>
                    commit((prev) => ({ ...prev, labels: { ...prev.labels, after: nextStyle } }))
                  }
                />
              </>
            )}

            {activeTab === "theme" && (
              <ThemeSelector
                selectedThemeId={present.theme.selectedThemeId}
                customBackgroundDataUrl={present.theme.customBackgroundDataUrl}
                onSelectTheme={(themeId) => {
                  commit((prev) => ({
                    ...prev,
                    theme: {
                      selectedThemeId: themeId,
                      customBackgroundDataUrl:
                        themeId === CUSTOM_THEME_ID ? prev.theme.customBackgroundDataUrl : undefined,
                    },
                  }));
                }}
                onUploadCustomBackground={(dataUrl) => {
                  commit((prev) => ({
                    ...prev,
                    theme: { selectedThemeId: CUSTOM_THEME_ID, customBackgroundDataUrl: dataUrl },
                  }));
                }}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
