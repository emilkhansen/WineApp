import * as pdfjsLib from "pdfjs-dist";

// Configure worker - use CDN for the worker script
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface PdfPageImage {
  pageNum: number;
  totalPages: number;
  dataUrl: string; // base64 JPEG
}

export async function* extractPdfPages(
  file: File,
  scale: number = 2 // Higher = better quality for OCR
): AsyncGenerator<PdfPageImage> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    yield {
      pageNum,
      totalPages: pdf.numPages,
      dataUrl: canvas.toDataURL("image/jpeg", 0.9),
    };
  }
}
