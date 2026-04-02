"use client";

import { useMemo, useRef, useState } from "react";
import type { LabelStyle } from "@/lib/types";

type EditableLabelProps = {
  labelStyle: LabelStyle;
  defaultText: string;
  onCommit: (nextText: string) => void;
};

export default function EditableLabel({
  labelStyle,
  defaultText,
  onCommit,
}: EditableLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(labelStyle.text);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const text = labelStyle.text || defaultText;
  const hasCustomText = Boolean(labelStyle.text);

  const pillStyle = useMemo(() => {
    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      maxWidth: "100%",
      minHeight: `${labelStyle.fontSizePx + 10}px`,
      boxSizing: "border-box",
      backgroundColor: "rgba(8, 10, 18, 0.68)",
      border: "1px solid rgba(255, 255, 255, 0.16)",
      borderRadius: "9999px",
      lineHeight: 1,
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.22)",
      color: labelStyle.color,
      fontSize: `${labelStyle.fontSizePx}px`,
      textAlign: labelStyle.align,
      whiteSpace: "nowrap",
    } as const;
  }, [labelStyle]);

  const commit = () => {
    const next = draft.trim();
    setIsEditing(false);
    if (next !== labelStyle.text) onCommit(next);
  };

  const startEditing = () => {
    setDraft(labelStyle.text);
    setIsEditing(true);
    // Allow React to mount the input before focusing.
    queueMicrotask(() => inputRef.current?.focus());
  };

  return (
    <span
      className="cursor-text select-none px-4 py-1"
      style={pillStyle}
      role="button"
      tabIndex={0}
      onClick={startEditing}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") startEditing();
      }}
      aria-label={`Edit label text (currently: ${hasCustomText ? labelStyle.text : defaultText})`}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setIsEditing(false);
              setDraft(labelStyle.text);
            }
          }}
          className="bg-transparent outline-none w-full placeholder:text-white/30"
          style={{
            width: "100%",
            lineHeight: 1,
            fontSize: `${labelStyle.fontSizePx}px`,
            color: labelStyle.color,
            textAlign: labelStyle.align,
          }}
        />
      ) : (
        text
      )}
    </span>
  );
}
