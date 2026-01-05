// src/utils/imageProcessor.ts
import * as ImageManipulator from "expo-image-manipulator";

/**
 * Resize + compress an image, then get base64.
 * maxWidth: recommended 1200 as in your backend guide.
 */
export async function processImageToBase64(
  uri: string,
  options?: { maxWidth?: number; compress?: number }
): Promise<string> {
  const maxWidth = options?.maxWidth ?? 1200;
  const compress = options?.compress ?? 0.8; // 0–1

  // First, get image dimensions (no-op operation but returns width/height)
  const info = await ImageManipulator.manipulateAsync(
    uri,
    [],
    { compress: 1, base64: false }
  );

  const actions: ImageManipulator.Action[] = [];

  if (info.width && info.width > maxWidth) {
    const ratio = maxWidth / info.width;
    const newHeight = info.height ? info.height * ratio : maxWidth;
    actions.push({
      resize: {
        width: maxWidth,
        height: Math.round(newHeight),
      },
    });
  }

  const result = await ImageManipulator.manipulateAsync(
    uri,
    actions,
    {
      compress,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  if (!result.base64) {
    throw new Error("Failed to get base64 from image");
  }

  // Option 2 from your guide: data URL + base64 (defaults to exterior on server)
  return "data:image/jpeg;base64," + result.base64;
}

/**
 * Build the object format your backend expects:
 * { data: "...", type: "exterior" | "interior" | "damage" | "document" | "other" }
 */
export async function buildImagePayload(
  uri: string,
  type: "exterior" | "interior" | "damage" | "document" | "other" = "exterior"
) {
  const data = await processImageToBase64(uri);
  return { data, type };
}

/**
 * Quick size check (approx, in bytes) to keep under 10MB after base64.
 */
export function estimateBase64Bytes(base64: string): number {
  // base64 is ~4/3 of binary size [web:104]
  const len = base64.length;
  return Math.floor((len * 3) / 4);
}

/**
 * Ensure base64 string below 10MB (10 * 1024 * 1024 bytes).
 */
export function isUnder10MB(base64: string): boolean {
  const bytes = estimateBase64Bytes(base64);
  return bytes <= 10 * 1024 * 1024;
}
