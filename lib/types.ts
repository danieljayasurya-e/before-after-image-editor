export type LabelAlignment = "left" | "center" | "right";

export type FitMode = "cover" | "contain";

export interface LabelStyle {
  text: string;
  fontSizePx: number;
  color: string;
  align: LabelAlignment;
}

export interface SlotTransform {
  zoom: number; // 1 = default
  offsetX: number; // px within frame
  offsetY: number; // px within frame
  objectFit: FitMode;
}

export interface ImageSlotState {
  imageDataUrl?: string;
  transform: SlotTransform;
}

export interface ThemeState {
  selectedThemeId: string;
  customBackgroundDataUrl?: string;
}

export interface EditorState {
  before: ImageSlotState;
  after: ImageSlotState;
  labels: {
    before: LabelStyle;
    after: LabelStyle;
  };
  theme: ThemeState;
}

export type SlotId = "before" | "after";

export const DEFAULT_LABEL_STYLE: LabelStyle = {
  text: "",
  fontSizePx: 44,
  color: "#FFFFFF",
  align: "center",
};

export const DEFAULT_SLOT_TRANSFORM: SlotTransform = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  objectFit: "cover",
};

export const DEFAULT_EDITOR_STATE: EditorState = {
  before: {
    imageDataUrl: undefined,
    transform: { ...DEFAULT_SLOT_TRANSFORM },
  },
  after: {
    imageDataUrl: undefined,
    transform: { ...DEFAULT_SLOT_TRANSFORM },
  },
  labels: {
    before: { ...DEFAULT_LABEL_STYLE, text: "Before" },
    after: { ...DEFAULT_LABEL_STYLE, text: "After" },
  },
  theme: {
    selectedThemeId: "gradient_sunset",
    customBackgroundDataUrl: undefined,
  },
};

