/**
 * Image utilities for handling various image formats including HEIC
 */

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB general limit
const MAX_HEIC_SIZE = 15 * 1024 * 1024; // 15MB for HEIC (memory concerns during conversion)

export interface ConvertedImage {
  base64: string;
  mimeType: string;
  blob: Blob;
}

/**
 * Check if a file type is a known format that can be read directly
 */
export function isKnownImageFormat(file: File): boolean {
  return (
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp"
  );
}

/**
 * Convert any image file to JPEG base64
 * Handles HEIC via heic2any library, other formats via direct read or canvas
 *
 * Strategy: For unknown formats (including HEIC from Safari with empty type),
 * try heic2any first, then fall back to canvas conversion if it fails.
 */
export async function convertImageToJpeg(file: File): Promise<ConvertedImage> {
  // Check general file size limit
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File is too large. Maximum size is 20MB.");
  }

  // For JPEG/PNG/WebP, read directly without conversion
  if (isKnownImageFormat(file)) {
    return readFileDirectly(file);
  }

  // Unknown format (includes HEIC from Safari with empty type)
  // Try heic2any first, fall back to canvas if it fails
  try {
    return await convertHeicToJpeg(file);
  } catch {
    // Not a HEIC file or heic2any failed - try canvas
    return convertViaCanvas(file);
  }
}

/**
 * Convert HEIC file to JPEG using heic2any library
 * Throws on failure - caller should handle fallback to canvas
 */
async function convertHeicToJpeg(file: File): Promise<ConvertedImage> {
  // Size check for HEIC (memory concerns during conversion)
  if (file.size > MAX_HEIC_SIZE) {
    throw new Error("HEIC file is too large. Please use a photo under 15MB, or convert to JPEG first.");
  }

  // Dynamic import to avoid bundle bloat (2.7MB loaded only when needed)
  const heic2any = (await import("heic2any")).default;

  const convertedBlob = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });

  // heic2any can return single blob or array
  const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

  const base64 = await blobToBase64(blob);
  return {
    base64,
    mimeType: "image/jpeg",
    blob,
  };
}

/**
 * Read a file directly as base64 (for already compatible formats)
 */
function readFileDirectly(file: File): Promise<ConvertedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve({
        base64,
        mimeType: file.type,
        blob: file,
      });
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert an image via canvas (fallback for non-HEIC, non-standard formats)
 */
function convertViaCanvas(file: File): Promise<ConvertedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error("Image loading timed out. Try using JPEG or PNG format."));
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to convert image"));
              return;
            }

            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const base64 = result.split(",")[1];
              resolve({
                base64,
                mimeType: "image/jpeg",
                blob,
              });
            };
            reader.onerror = () => reject(new Error("Failed to read converted image"));
            reader.readAsDataURL(blob);
          },
          "image/jpeg",
          0.9
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image. Try using JPEG or PNG format."));
    };

    img.src = url;
  });
}

/**
 * Convert a Blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
}
