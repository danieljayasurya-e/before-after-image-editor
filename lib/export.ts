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

  const html2canvasMod = await import("html2canvas");
  const html2canvas = html2canvasMod.default;

  const canvas = await html2canvas(root, {
    // Ensure locked 4:5 output dimensions.
    width,
    height,
    scale: 1,
    backgroundColor: null,
    useCORS: false,
    allowTaint: false,
  });

  const mimeType = options.format === "png" ? "image/png" : "image/jpeg";

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) return reject(new Error("Failed to create image blob."));
        resolve(b);
      },
      mimeType,
      options.format === "jpeg" ? jpegQuality : undefined
    );
  });

  return blob;
}

