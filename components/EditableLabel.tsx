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
      color: labelStyle.color,
      fontSize: labelStyle.fontSizePx,
      textAlign: labelStyle.align,
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
      className="inline-block rounded-full bg-black/30 backdrop-blur px-4 py-1 border border-white/10 cursor-text select-none"
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
            fontSize: labelStyle.fontSizePx,
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

