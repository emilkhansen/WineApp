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

// Debug logger - can be set externally for UI debugging
export let debugLogger: ((msg: string) => void) | null = null;
export function setDebugLogger(logger: ((msg: string) => void) | null) {
  debugLogger = logger;
}
function dbg(msg: string) {
  debugLogger?.(msg);
  console.log(`[image-utils] ${msg}`);
}

/**
 * Convert any image file to JPEG base64
 * Handles HEIC via heic2any library, other formats via direct read or canvas
 *
 * Strategy: For unknown formats (including HEIC from Safari with empty type),
 * try heic2any first, then fall back to canvas conversion if it fails.
 */
export async function convertImageToJpeg(file: File): Promise<ConvertedImage> {
  dbg(`convertImageToJpeg: name="${file.name}" type="${file.type}" size=${file.size}`);

  // Check general file size limit
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File is too large. Maximum size is 20MB.");
  }

  // For JPEG/PNG/WebP, read directly without conversion
  if (isKnownImageFormat(file)) {
    dbg("Path: readFileDirectly (known format)");
    return readFileDirectly(file);
  }

  // Unknown format (includes HEIC from Safari with empty type)
  // Try heic2any first, fall back to canvas if it fails
  dbg("Path: trying heic2any first...");
  try {
    const result = await convertHeicToJpeg(file);
    dbg("heic2any succeeded");
    return result;
  } catch (heicError) {
    const heicMsg = heicError instanceof Error ? heicError.message : String(heicError);
    dbg(`heic2any failed: ${heicMsg}`);
    dbg("Falling back to canvas...");
    // Not a HEIC file or heic2any failed - try canvas
    try {
      const result = await convertViaCanvas(file);
      dbg("canvas conversion succeeded");
      return result;
    } catch (canvasError) {
      const canvasMsg = canvasError instanceof Error ? canvasError.message : String(canvasError);
      dbg(`canvas also failed: ${canvasMsg}`);
      throw canvasError;
    }
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

  dbg("heic2any: importing library...");
  // Dynamic import to avoid bundle bloat (2.7MB loaded only when needed)
  const heic2any = (await import("heic2any")).default;
  dbg("heic2any: library loaded, starting conversion...");

  const convertedBlob = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });

  dbg("heic2any: conversion done, processing blob...");
  // heic2any can return single blob or array
  const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

  const base64 = await blobToBase64(blob);
  dbg(`heic2any: base64 ready, length=${base64.length}`);
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
    dbg("canvas: creating object URL...");
    const img = new Image();
    const url = URL.createObjectURL(file);
    dbg(`canvas: objectURL created, loading image...`);

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      dbg("canvas: TIMEOUT after 10s");
      URL.revokeObjectURL(url);
      reject(new Error("Image loading timed out. Try using JPEG or PNG format."));
    }, 10000);

    img.onload = () => {
      dbg(`canvas: image loaded, size=${img.width}x${img.height}`);
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
        dbg("canvas: drawn to canvas, converting to blob...");

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              dbg("canvas: toBlob returned null");
              reject(new Error("Failed to convert image"));
              return;
            }

            dbg(`canvas: blob created, size=${blob.size}, reading as base64...`);
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const base64 = result.split(",")[1];
              dbg(`canvas: complete, base64 length=${base64.length}`);
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

    img.onerror = (e) => {
      dbg(`canvas: img.onerror fired: ${e}`);
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
