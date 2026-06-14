// Extracts plain text from an uploaded PDF or Word (.docx) file, in the browser.
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth/mammoth.browser.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const MAX_CHARS = 200000; // safety cap so localStorage / prompts stay reasonable

export async function extractText(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it) => it.str).join(" ") + "\n\n";
      if (text.length > MAX_CHARS) break;
    }
    return clean(text);
  }

  if (name.endsWith(".docx")) {
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return clean(result.value);
  }

  if (name.endsWith(".doc")) {
    throw new Error("Old .doc format isn't supported — please save as .docx or PDF and re-upload.");
  }

  throw new Error("Unsupported file type. Please upload a PDF or Word (.docx) file.");
}

function clean(text) {
  const trimmed = text.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return trimmed.slice(0, MAX_CHARS);
}
