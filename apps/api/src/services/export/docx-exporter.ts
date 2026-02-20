import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import type { Chapter } from "@zaria/shared";
import type { ExportExecutionContext, GeneratedAsset } from "./export-types.js";

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

const headingForLevel = (level: number) => {
  if (level <= 1) return HeadingLevel.HEADING_1;
  if (level === 2) return HeadingLevel.HEADING_2;
  if (level === 3) return HeadingLevel.HEADING_3;
  if (level === 4) return HeadingLevel.HEADING_4;
  return HeadingLevel.HEADING_5;
};

export const generateDocxAsset = async (
  context: ExportExecutionContext
): Promise<GeneratedAsset> => {
  const { processed } = context;
  const chapters = flattenChapters(processed.chapters);

  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: processed.metadata.title })]
    })
  );

  if (processed.metadata.subtitle) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: processed.metadata.subtitle, italics: true })]
      })
    );
  }

  children.push(new Paragraph({ text: "" }));

  chapters.forEach((chapter) => {
    children.push(
      new Paragraph({
        heading: headingForLevel(chapter.level),
        children: [new TextRun({ text: chapter.title, bold: true })]
      })
    );

    chapter.content
      .split(/\n\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .forEach((paragraph) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: paragraph })],
            spacing: {
              after: 220
            }
          })
        );
      });
  });

  const document = new Document({
    creator: processed.metadata.author ?? "ZARIA Builder",
    title: processed.metadata.title,
    description: processed.metadata.subtitle,
    sections: [{ properties: {}, children }]
  });

  const buffer = await Packer.toBuffer(document);

  return {
    format: "docx",
    filename: `${processed.metadata.title.replace(/\s+/g, "-").toLowerCase()}.docx`,
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer
  };
};
