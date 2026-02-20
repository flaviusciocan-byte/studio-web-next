import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";
import type { Chapter } from "@zaria/shared";
import type { ExportExecutionContext, GeneratedAsset } from "./export-types.js";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

const hexToRgb = (hex: string): ReturnType<typeof rgb> => {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  return rgb(r, g, b);
};

const wrapText = (
  text: string,
  maxWidth: number,
  fontSize: number,
  font: PDFFont,
): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(candidate, fontSize);
    if (width <= maxWidth) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
      }
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
};

const flattenChapters = (chapters: Chapter[]): Chapter[] => {
  const result: Chapter[] = [];

  const walk = (nodes: Chapter[]): void => {
    nodes.forEach((node) => {
      result.push(node);
      walk(node.sections);
    });
  };

  walk(chapters);
  return result;
};

export const generatePdfAsset = async (
  context: ExportExecutionContext,
): Promise<GeneratedAsset> => {
  const pdf = await PDFDocument.create();
  const headingFont = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const bodyFont = await pdf.embedFont(StandardFonts.TimesRoman);

  const { renderModel, processed } = context;
  const palette = renderModel.template.palette;
  const layout = renderModel.spineProfile.layout;
  const margin = layout.margin;

  const cover = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
  cover.drawRectangle({
    x: 0,
    y: A4_HEIGHT - renderModel.cover.accentBandHeight,
    width: A4_WIDTH,
    height: renderModel.cover.accentBandHeight,
    color: hexToRgb(palette.purpleDeep),
  });

  cover.drawText(processed.metadata.title, {
    x: margin,
    y: A4_HEIGHT - 160,
    font: headingFont,
    size: 36,
    color: hexToRgb(palette.purple),
  });

  if (processed.metadata.subtitle) {
    cover.drawText(processed.metadata.subtitle, {
      x: margin,
      y: A4_HEIGHT - 200,
      font: bodyFont,
      size: 15,
      color: hexToRgb(palette.purpleDeep),
    });
  }

  cover.drawRectangle({
    x: margin,
    y: A4_HEIGHT - 240,
    width: 210,
    height: 28,
    color: hexToRgb(palette.gold),
  });

  cover.drawText(renderModel.cover.badgeText, {
    x: margin + 12,
    y: A4_HEIGHT - 223,
    font: headingFont,
    size: 11,
    color: hexToRgb(palette.white),
  });

  const tocPage = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
  tocPage.drawText("Table of Contents", {
    x: margin,
    y: A4_HEIGHT - margin,
    font: headingFont,
    size: 24,
    color: hexToRgb(palette.purple),
  });

  let tocCursor = A4_HEIGHT - margin - 40;
  processed.toc.forEach((entry) => {
    tocPage.drawText(`${" ".repeat((entry.level - 1) * 2)}${entry.order}. ${entry.title}`, {
      x: margin,
      y: tocCursor,
      font: bodyFont,
      size: 11,
      color: hexToRgb(palette.purpleDeep),
    });
    tocCursor -= 16;
  });

  const chapters = flattenChapters(processed.chapters);
  let page = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
  let cursorY = A4_HEIGHT - margin;

  const newPage = (): void => {
    page = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
    cursorY = A4_HEIGHT - margin;
  };

  for (const chapter of chapters) {
    if (cursorY < 140) {
      newPage();
    }

    const headingSize = Math.max(14, 22 - (chapter.level - 1) * 2);
    page.drawText(chapter.title, {
      x: margin,
      y: cursorY,
      font: headingFont,
      size: headingSize,
      color: hexToRgb(palette.purple),
    });
    cursorY -= headingSize + 8;

    const paragraphLines = wrapText(
      chapter.content,
      A4_WIDTH - margin * 2,
      layout.bodyFontSize,
      bodyFont,
    );

    for (const line of paragraphLines) {
      if (cursorY < margin) {
        newPage();
      }

      page.drawText(line, {
        x: margin,
        y: cursorY,
        font: bodyFont,
        size: layout.bodyFontSize,
        color: hexToRgb(palette.purpleDeep),
      });
      cursorY -= layout.bodyFontSize * layout.lineHeight;
    }

    cursorY -= layout.paragraphSpacing;
  }

  const bytes = await pdf.save();

  return {
    format: "pdf",
    filename: `${processed.metadata.title.replace(/\s+/g, "-").toLowerCase()}.pdf`,
    mimeType: "application/pdf",
    buffer: Buffer.from(bytes),
  };
};
