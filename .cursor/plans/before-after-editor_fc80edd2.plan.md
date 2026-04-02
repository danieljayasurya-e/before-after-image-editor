---
name: before-after-editor
overview: Scaffold a Next.js + Tailwind production-ready “Before-After Image Editor” app, implementing upload, 4:5 framed stacked preview, inline editable labels, theme backgrounds (including custom image), swap, and PNG/JPEG export via html2canvas.
todos:
  - id: scaffold-next-tailwind
    content: Create the Next.js (TypeScript) + Tailwind app scaffold in the empty workspace (Tailwind config, app router structure).
    status: completed
  - id: state-model
    content: Define editor state (before/after image data URLs + computed object-fit, label texts + styles, selected theme or custom background).
    status: completed
  - id: editor-canvas
    content: Implement `components/EditorCanvas.tsx` rendering strict `aspect-[4/5]` frame with background layer, two stacked image regions, and overlay labels.
    status: completed
  - id: image-upload
    content: Implement `components/ImageUploader.tsx` supporting drag & drop + file picker; validate PNG/JPG/JPEG; update preview state.
    status: completed
  - id: theme-system
    content: Implement `lib/themes.ts` with 15–20 built-in themes and `components/ThemeSelector.tsx` for theme select + custom background upload.
    status: completed
  - id: label-editing
    content: Implement `components/EditableLabel.tsx` and `components/TextEditor.tsx` for inline editing + font size/color/alignment per label.
    status: completed
  - id: swap-button
    content: Add `Swap` control in `components/Toolbar.tsx` that atomically swaps before/after images, texts, and label style settings.
    status: completed
  - id: export-controls
    content: Implement `lib/export.ts` using html2canvas to export PNG/JPEG at 1080x1350 (4:5) while matching preview styling.
    status: completed
  - id: toolbar-and-ux
    content: Assemble `components/Toolbar.tsx` (floating controls) and polish responsive layout + transitions + error toasts.
    status: completed
  - id: optional-advanced
    content: Optionally implement image drag-to-reposition, zoom controls, and undo/redo state history if it doesn’t threaten delivery timeline.
    status: completed
isProject: false
---

## Goals

Build a modern React (Next.js) application named **Before-After Image Editor** that lets users upload a “Before” and “After” image, preview them inside a strict **4:5** framed canvas with editable labels and theme backgrounds, then export the result as **PNG or JPEG** at a locked **4:5** ratio.

## Architecture (data flow)

```mermaid
graph LR
User[User] --> Upload[Image Upload]
Upload --> EditorState[Editor State]
Theme[Theme Selection] --> EditorState
Labels[Label Editing] --> EditorState
EditorState --> EditorCanvas[EditorCanvas Preview]
EditorCanvas --> Export[Export Controls]
Export --> Download[Download PNG/JPEG]
```



## Proposed Component/File Structure

- `app/page.tsx`: Next entry, renders the editor client component.
- `app/EditorPage.tsx` (`"use client"`): owns editor state + wires toolbar/canvas.
- `components/EditorCanvas.tsx`: strict **4:5** frame, background theme, stacked image areas, labels.
- `components/Toolbar.tsx`: floating toolbar (upload, theme select/upload, swap, export).
- `components/ImageUploader.tsx`: drag & drop + file picker; validates PNG/JPG/JPEG.
- `components/ThemeSelector.tsx`: built-in themes list (15-20) + custom background image upload.
- `components/TextEditor.tsx`: controls font size/color/alignment for each label.
- `components/EditableLabel.tsx`: inline editing UI for “Before”/“After” strings.
- `lib/themes.ts`: built-in theme definitions.
- `lib/export.ts`: html2canvas export + locked 4:5 dimensions.
- `lib/imageUtils.ts`: file validation, reading, aspect-ratio helpers.

## Key UI/Rendering Requirements

1. **Strict 4:5 canvas**
  - Use Tailwind arbitrary aspect ratio: `aspect-[4/5]` on the outer editor frame.
  - Center workspace responsively and keep consistent padding/gap.
2. **Stacked layout**
  - Two stacked regions inside the frame:
    - Top: “Before” image + label overlay
    - Bottom: “After” image + label overlay
  - Gap + padding are fixed via Tailwind utilities so export matches preview.
3. **Object-fit intelligent choice**
  - When an image loads, compare image aspect ratio vs the rendered sub-frame aspect ratio to decide:
    - use `objectFit: "cover"` when the image is “wider” than the slot
    - use `objectFit: "contain"` otherwise
  - Always center (`objectPosition: "center"`).
4. **Editable labels + styling**
  - Inline editing of “Before” and “After”.
  - Controls for font size, color, and alignment (left/center/right) per label.
5. **Theme system**
  - Built-in themes: provide **15–20** entries mixing:
    - gradients (blue/purple/sunset/neon/ocean/aurora/etc.)
    - grid background (CSS repeating grid)
    - solid colors
    - subtle pattern variants
  - Custom background image upload:
    - read as Data URL
    - apply to full canvas background (`background-size: cover`, `background-position: center`).
6. **Swap**
  - Instant swap of:
    - before image + after image
    - before label text + after label text
    - and each label’s style settings (font size/color/alignment) to match expectations.
7. **Export (PNG + JPEG)**
  - Use `html2canvas` to render `EditorCanvas` at a locked **4:5** size.
  - Default export dimensions: **1080×1350** (4:5), enforce ratio if user ever changes size.
  - PNG: `image/png`.
  - JPEG: `image/jpeg` with configurable quality (default ~0.92).
  - Client-only dynamic import for `html2canvas` to avoid SSR issues.

## Implementation Plan (todos)

1. Scaffold Next.js + Tailwind project in this empty workspace.
2. Implement editor state model (images, label texts, label styles, theme, custom background).
3. Build `EditorCanvas` with strict aspect ratio + layered preview (background -> image slots -> labels).
4. Implement upload UX with drag & drop + validation.
5. Implement theme selector UX (built-ins + custom background).
6. Implement inline label editing + text styling controls.
7. Add swap button wiring.
8. Add export UX (PNG/JPEG) using html2canvas with locked 4:5 export sizing.
9. Add smooth UI transitions (swap animations, toolbar affordances) and basic error messaging.
10. (Optional, if time) Add drag-to-reposition + zoom for images, and undo/redo for state changes.

