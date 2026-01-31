/**
 * Image utilities for handling JPEG and PNG uploads
 */

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export interface ConvertedImage {
  base64: string;
  mimeType: string;
  blob: Blob;
}

/**
 * Check if a file type is a supported image format
 */
export function isKnownImageFormat(file: File): boolean {
  return (
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp"
  );
}

/**
 * Convert an image file to base64
 * Only supports JPEG, PNG, and WebP
 */
export async function convertImageToJpeg(file: File): Promise<ConvertedImage> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File is too large. Maximum size is 20MB.");
  }

  // Check format
  if (!isKnownImageFormat(file)) {
    throw new Error(
      "Unsupported image format. Please use JPEG, PNG, or WebP.\n\n" +
      "If using an iPhone, you can change your camera settings to 'Most Compatible' " +
      "in Settings → Camera → Formats, or share the photo via Messages/Mail which auto-converts to JPEG."
    );
  }

  // Read file directly
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
