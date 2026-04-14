"use client";

import { useEffect, useMemo, useRef } from "react";
import type { CSSProperties, RefObject } from "react";
import type { EditorState, FitMode, SlotId, SlotTransform } from "@/lib/types";
import { getThemeBackgroundStyle } from "@/lib/themes";
import EditableLabel from "@/components/EditableLabel";

type EditorCanvasProps = {
  editor: EditorState;
  viewportSize?: {
    width: number;
    height: number;
  };
  exportRootRef?: RefObject<HTMLDivElement | null>;
  onObjectFitComputed?: (slotId: SlotId, fit: FitMode) => void;
  onLabelTextCommitted?: (slotId: SlotId, nextText: string) => void;
  onTransformInteractionStart?: (slotId: SlotId) => void;
  onTransformInteractionEnd?: (slotId: SlotId) => void;
  onTransformChange?: (slotId: SlotId, nextTransform: SlotTransform) => void;
};

export default function EditorCanvas({
  editor,
  viewportSize,
  exportRootRef,
  onObjectFitComputed,
  onLabelTextCommitted,
  onTransformInteractionStart,
  onTransformInteractionEnd,
  onTransformChange,
}: EditorCanvasProps) {
  const slotFrameStyle: CSSProperties = {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  };
  const emptyStateStyle: CSSProperties = {
    color: "rgba(255, 255, 255, 0.3)",
  };

  const beforeSlotRef = useRef<HTMLDivElement | null>(null);
  const afterSlotRef = useRef<HTMLDivElement | null>(null);

  const dragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startOffsetX: number;
    startOffsetY: number;
    slotId: SlotId;
    baseZoom: number;
    baseObjectFit: FitMode;
  } | null>(null);

  const hasComputedBeforeRef = useRef(false);
  const hasComputedAfterRef = useRef(false);

  useEffect(() => {
    // If images change, allow recomputation for each slot.
    hasComputedBeforeRef.current = false;
    hasComputedAfterRef.current = false;
  }, [editor.before.imageDataUrl, editor.after.imageDataUrl]);

  const bgStyle = useMemo(() => {
    return getThemeBackgroundStyle(
      editor.theme.selectedThemeId,
      editor.theme.customBackgroundDataUrl
    ) as CSSProperties;
  }, [editor.theme.selectedThemeId, editor.theme.customBackgroundDataUrl]);
  const canvasFrameStyle = useMemo(
    () =>
      ({
        ...bgStyle,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "#ffffff",
        fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      }) as CSSProperties,
    [bgStyle]
  );
  const fittedCanvasStyle = useMemo(() => {
    const aspectRatio = 4 / 5;
    const fallbackWidth = 520;
    const maxWidth = viewportSize?.width ?? fallbackWidth;
    const maxHeight = viewportSize?.height ?? fallbackWidth / aspectRatio;

    if (!maxWidth || !maxHeight) {
      return {
        width: fallbackWidth,
        height: fallbackWidth / aspectRatio,
      } satisfies CSSProperties;
    }

    const width = Math.min(maxWidth, maxHeight * aspectRatio);

    return {
      width,
      height: width / aspectRatio,
      maxWidth: "100%",
      maxHeight: "100%",
    } satisfies CSSProperties;
  }, [viewportSize]);

  const computeFit = (slotId: SlotId, img: HTMLImageElement) => {
    const slotEl = slotId === "before" ? beforeSlotRef.current : afterSlotRef.current;
    if (!slotEl) return;
    const rect = slotEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const slotAspect = rect.width / rect.height;
    const imageAspect = img.naturalWidth / img.naturalHeight;
    const fit: FitMode = imageAspect > slotAspect ? "cover" : "contain";

    const shouldSkip =
      slotId === "before" ? hasComputedBeforeRef.current : hasComputedAfterRef.current;
    if (shouldSkip) return;

    onObjectFitComputed?.(slotId, fit);
    if (slotId === "before") hasComputedBeforeRef.current = true;
    if (slotId === "after") hasComputedAfterRef.current = true;
  };

  const renderSlot = (slotId: SlotId) => {
    const slot = slotId === "before" ? editor.before : editor.after;
    const label = slotId === "before" ? editor.labels.before : editor.labels.after;

    return (
      <div
        className="flex-1 relative rounded-2xl overflow-hidden touch-none select-none"
        style={slotFrameStyle}
        onPointerDown={(e) => {
          if (!slot.imageDataUrl) return;
          if (e.button !== 0 && e.pointerType === "mouse") return;

          // Allow label editing without starting a drag.
          const target = e.target as HTMLElement | null;
          if (target?.closest("[data-editor-no-drag]")) return;

          if (!onTransformChange) return;
          dragRef.current = {
            pointerId: e.pointerId,
            startClientX: e.clientX,
            startClientY: e.clientY,
            startOffsetX: slot.transform.offsetX,
            startOffsetY: slot.transform.offsetY,
            slotId,
            baseZoom: slot.transform.zoom,
            baseObjectFit: slot.transform.objectFit,
          };
          onTransformInteractionStart?.(slotId);
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          e.preventDefault();
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return;
          if (dragRef.current.pointerId !== e.pointerId) return;
          if (!onTransformChange) return;

          const dx = e.clientX - dragRef.current.startClientX;
          const dy = e.clientY - dragRef.current.startClientY;

          const next: SlotTransform = {
            zoom: dragRef.current.baseZoom,
            objectFit: dragRef.current.baseObjectFit,
            offsetX: dragRef.current.startOffsetX + dx,
            offsetY: dragRef.current.startOffsetY + dy,
          };
          onTransformChange(slotId, next);
          e.preventDefault();
        }}
        onPointerUp={() => {
          if (!dragRef.current) return;
          onTransformInteractionEnd?.(dragRef.current.slotId);
          dragRef.current = null;
        }}
        onPointerCancel={() => {
          if (!dragRef.current) return;
          onTransformInteractionEnd?.(dragRef.current.slotId);
          dragRef.current = null;
        }}
      >
        <div className="absolute inset-0" ref={slotId === "before" ? beforeSlotRef : afterSlotRef} />

        <div className="absolute inset-0 overflow-hidden select-none">
          {slot.imageDataUrl ? (
            // Data URLs and DOM export require a plain img element here.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slot.imageDataUrl}
              alt=""
              draggable={false}
              onLoad={(e) => computeFit(slotId, e.currentTarget)}
              className="absolute left-1/2 top-1/2 will-change-transform"
              style={{
                width: "100%",
                height: "100%",
                objectFit: slot.transform.objectFit,
                objectPosition: "center",
                transform: `translate(-50%, -50%) translate(${slot.transform.offsetX}px, ${slot.transform.offsetY}px) scale(${slot.transform.zoom})`,
              }}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-sm"
              style={emptyStateStyle}
            >
              Upload {slotId === "before" ? "Before" : "After"} image
            </div>
          )}
        </div>

        <div className="absolute left-0 right-0 bottom-0 px-4 pb-4" style={{ textAlign: label.align }}>
          <div data-editor-no-drag>
          <EditableLabel
            labelStyle={label}
            defaultText={slotId === "before" ? "Before" : "After"}
            onCommit={(nextText) => onLabelTextCommitted?.(slotId, nextText)}
          />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={exportRootRef}
      className="overflow-hidden flex-shrink-0"
      style={{ ...canvasFrameStyle, ...fittedCanvasStyle }}
    >
      <div className="h-full p-6 flex flex-col gap-4">
        {renderSlot("before")}
        {renderSlot("after")}
      </div>
    </div>
  );
}
