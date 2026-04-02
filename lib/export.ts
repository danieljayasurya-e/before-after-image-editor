export type ExportFormat = "png" | "jpeg";

export type ExportOptions = {
  format: ExportFormat;
  width?: number; // px
  height?: number; // px
  jpegQuality?: number; // 0..1
};

const DEFAULT_WIDTH = 1080; // 4:5 -> 1080x1350
const DEFAULT_HEIGHT = 1350;

async function waitForImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          const el = img as HTMLImageElement;
          if (el.complete && el.naturalWidth > 0) return resolve();
          el.onload = () => resolve();
          el.onerror = () => resolve();
        })
    )
  );
}

export async function exportElementAsImage(
  root: HTMLElement,
  options: ExportOptions
): Promise<Blob> {
  const width = options.width ?? DEFAULT_WIDTH;
  const height = options.height ?? DEFAULT_HEIGHT;
  const jpegQuality = options.jpegQuality ?? 0.92;

  await waitForImages(root);

  const rect = root.getBoundingClientRect();
  const pixelRatio = Math.max(2, window.devicePixelRatio || 1);
  const htmlToImage = await import("html-to-image");

  const mimeType = options.format === "png" ? "image/png" : "image/jpeg";
  const blob = await htmlToImage.toBlob(root, {
    cacheBust: true,
    pixelRatio,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    canvasWidth: width,
    canvasHeight: height,
    type: mimeType,
    quality: options.format === "jpeg" ? jpegQuality : 1,
  });

  if (!blob) {
    throw new Error("Failed to generate export image.");
  }
  return blob;
}
