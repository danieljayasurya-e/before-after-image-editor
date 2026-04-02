"use client";

import { useEffect, useRef, useState } from "react";
import type { EditorState } from "@/lib/types";
import { DEFAULT_EDITOR_STATE } from "@/lib/types";
import EditorCanvas from "@/components/EditorCanvas";
import ImageUploader from "@/components/ImageUploader";
import ThemeSelector from "@/components/ThemeSelector";
import { CUSTOM_THEME_ID } from "@/lib/themes";
import TextEditor from "@/components/TextEditor";
import Toolbar from "@/components/Toolbar";
import { exportElementAsImage } from "@/lib/export";
import type { ExportFormat } from "@/lib/export";

function cloneAny<T>(value: T): T {
  // structuredClone is available in modern browsers; fall back for safety.
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

export default function EditorPage() {
  const [present, setPresent] = useState<EditorState>(() =>
    cloneAny(DEFAULT_EDITOR_STATE)
  );
  const [past, setPast] = useState<EditorState[]>([]);
  const [future, setFuture] = useState<EditorState[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const presentRef = useRef(present);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const transformInteractionBaseRef = useRef<EditorState | null>(null);
  useEffect(() => {
    presentRef.current = present;
  }, [present]);

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;

      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        if (canUndo) {
          e.preventDefault();
          undo();
        }
        return;
      }
      if (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey)) {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canUndo, canRedo]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
      {toastMessage ? (
        <div className="fixed top-4 right-4 z-50">
          <div className="rounded-2xl border border-white/10 bg-black/70 backdrop-blur px-4 py-3 text-sm text-zinc-100 shadow-lg animate-in fade-in duration-200">
            {toastMessage}
          </div>
        </div>
      ) : null}
      <header className="px-4 py-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-xl font-semibold tracking-tight">
            Before-After Image Editor
          </h1>
          <p className="text-sm text-zinc-300 mt-1">
            Upload two images, edit labels, and export as PNG/JPEG (4:5).
          </p>
        </div>
      </header>

      <main className="flex-1 px-4 pb-10">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8 items-start">
          <section className="flex flex-col items-center">
            <div ref={canvasRef}>
              <EditorCanvas
                editor={present}
                onObjectFitComputed={(slotId, fit) => {
                  setPresent((prev) => {
                    if (slotId === "before") {
                      return {
                        ...prev,
                        before: {
                          ...prev.before,
                          transform: {
                            ...prev.before.transform,
                            objectFit: fit,
                          },
                        },
                      };
                    }
                    return {
                      ...prev,
                      after: {
                        ...prev.after,
                        transform: {
                          ...prev.after.transform,
                          objectFit: fit,
                        },
                      },
                    };
                  });
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
                    [slotId]: {
                      ...prev[slotId],
                      transform: nextTransform,
                    },
                  }));
                }}
              />
            </div>
          </section>

          <aside className="bg-white/5 border border-white/10 rounded-3xl p-4 w-full lg:w-auto lg:sticky lg:top-6">
            <div className="text-sm text-zinc-300">
              Upload images (PNG/JPG) and edit labels later.
            </div>

            <div className="mt-4">
              <Toolbar
                onSwap={() => {
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
                onUndo={undo}
                onRedo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                isExporting={isExporting}
                onExport={async (format: ExportFormat) => {
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
                    a.download = `before-after-${format === "png" ? "png" : "jpg"}`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  } catch {
                    setToastMessage("Export failed. Please try again.");
                  } finally {
                    setIsExporting(false);
                  }
                }}
              />
            </div>

            <div className="mt-4 space-y-3">
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
                    theme: {
                      selectedThemeId: CUSTOM_THEME_ID,
                      customBackgroundDataUrl: dataUrl,
                    },
                  }));
                }}
              />

              <ImageUploader
                slotId="before"
                imageDataUrl={present.before.imageDataUrl}
                onImageSelected={(dataUrl) => {
                  commit((prev) => ({
                    ...prev,
                    before: {
                      ...prev.before,
                      imageDataUrl: dataUrl,
                      transform: {
                        ...prev.before.transform,
                        objectFit: "cover",
                        zoom: 1,
                        offsetX: 0,
                        offsetY: 0,
                      },
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
                      transform: {
                        ...prev.after.transform,
                        objectFit: "cover",
                        zoom: 1,
                        offsetX: 0,
                        offsetY: 0,
                      },
                    },
                  }));
                }}
              />

              <TextEditor
                labelId="before"
                defaultText="Before"
                labelStyle={present.labels.before}
                onChangeStyle={(nextStyle) =>
                  commit((prev) => ({
                    ...prev,
                    labels: {
                      ...prev.labels,
                      before: nextStyle,
                    },
                  }))
                }
              />

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs uppercase tracking-wider text-zinc-300 mb-2">
                  Before image zoom & position
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Zoom</span>
                  <span className="text-zinc-200">{present.before.transform.zoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={2.8}
                  step={0.01}
                  value={present.before.transform.zoom}
                  onChange={(e) => {
                    const zoom = Number(e.target.value);
                    commit((prev) => ({
                      ...prev,
                      before: {
                        ...prev.before,
                        transform: {
                          ...prev.before.transform,
                          zoom,
                        },
                      },
                    }));
                  }}
                  className="w-full accent-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    commit((prev) => ({
                      ...prev,
                      before: {
                        ...prev.before,
                        transform: {
                          ...prev.before.transform,
                          zoom: 1,
                          offsetX: 0,
                          offsetY: 0,
                        },
                      },
                    }));
                  }}
                  className="mt-3 w-full rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Reset position
                </button>
                <div className="mt-2 text-xs text-zinc-400">
                  Tip: drag the image to reposition inside the frame.
                </div>
              </div>

              <TextEditor
                labelId="after"
                defaultText="After"
                labelStyle={present.labels.after}
                onChangeStyle={(nextStyle) =>
                  commit((prev) => ({
                    ...prev,
                    labels: {
                      ...prev.labels,
                      after: nextStyle,
                    },
                  }))
                }
              />

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs uppercase tracking-wider text-zinc-300 mb-2">
                  After image zoom & position
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Zoom</span>
                  <span className="text-zinc-200">{present.after.transform.zoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={2.8}
                  step={0.01}
                  value={present.after.transform.zoom}
                  onChange={(e) => {
                    const zoom = Number(e.target.value);
                    commit((prev) => ({
                      ...prev,
                      after: {
                        ...prev.after,
                        transform: {
                          ...prev.after.transform,
                          zoom,
                        },
                      },
                    }));
                  }}
                  className="w-full accent-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    commit((prev) => ({
                      ...prev,
                      after: {
                        ...prev.after,
                        transform: {
                          ...prev.after.transform,
                          zoom: 1,
                          offsetX: 0,
                          offsetY: 0,
                        },
                      },
                    }));
                  }}
                  className="mt-3 w-full rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Reset position
                </button>
                <div className="mt-2 text-xs text-zinc-400">
                  Tip: drag the image to reposition inside the frame.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

