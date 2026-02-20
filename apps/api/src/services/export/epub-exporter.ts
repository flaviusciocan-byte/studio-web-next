import JSZip from "jszip";
import type { Chapter } from "@zaria/shared";
import type { ExportExecutionContext, GeneratedAsset } from "./export-types.js";

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

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

export const generateEpubAsset = async (
  context: ExportExecutionContext
): Promise<GeneratedAsset> => {
  const { renderModel, processed } = context;
  const zip = new JSZip();
  const id = `urn:uuid:${context.documentId}`;

  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n  <rootfiles>\n    <rootfile full-path="OEBPS/package.opf" media-type="application/oebps-package+xml"/>\n  </rootfiles>\n</container>`
  );

  const palette = renderModel.template.palette;
  const css = `
body { font-family: serif; margin: 0; padding: 1.618rem; color: ${palette.purpleDeep}; background: ${palette.white}; }
h1,h2,h3,h4,h5,h6 { color: ${palette.purple}; page-break-after: avoid; }
a { color: ${palette.gold}; text-decoration: none; }
.chapter { margin-bottom: 2.618rem; }
`;
  zip.file("OEBPS/styles.css", css.trim());

  const flatChapters = flattenChapters(processed.chapters);

  const chapterManifest = flatChapters
    .map(
      (chapter, idx) =>
        `<item id="chap${idx + 1}" href="chapters/chapter-${idx + 1}.xhtml" media-type="application/xhtml+xml"/>`
    )
    .join("\n    ");

  const spineItems = flatChapters
    .map((_chapter, idx) => `<itemref idref="chap${idx + 1}"/>`)
    .join("\n    ");

  const navPoints = flatChapters
    .map(
      (chapter, idx) =>
        `<li><a href="chapters/chapter-${idx + 1}.xhtml">${escapeXml(chapter.title)}</a></li>`
    )
    .join("\n        ");

  zip.file(
    "OEBPS/nav.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${processed.metadata.language}">
  <head>
    <title>Navigation</title>
    <link rel="stylesheet" href="styles.css"/>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>Table of Contents</h1>
      <ol>
        ${navPoints}
      </ol>
    </nav>
  </body>
</html>`
  );

  flatChapters.forEach((chapter, idx) => {
    zip.file(
      `OEBPS/chapters/chapter-${idx + 1}.xhtml`,
      `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${processed.metadata.language}">
  <head>
    <title>${escapeXml(chapter.title)}</title>
    <link rel="stylesheet" href="../styles.css"/>
  </head>
  <body>
    <article class="chapter">
      <h${Math.min(chapter.level + 1, 6)}>${escapeXml(chapter.title)}</h${Math.min(chapter.level + 1, 6)}>
      ${chapter.content
        .split(/\n\n+/)
        .map((paragraph) => `<p>${escapeXml(paragraph)}</p>`)
        .join("\n      ")}
    </article>
  </body>
</html>`
    );
  });

  zip.file(
    "OEBPS/package.opf",
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="${processed.metadata.language}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${id}</dc:identifier>
    <dc:title>${escapeXml(processed.metadata.title)}</dc:title>
    <dc:language>${processed.metadata.language}</dc:language>
    <dc:creator>${escapeXml(processed.metadata.author ?? "ZARIA Builder")}</dc:creator>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>
    <item id="css" href="styles.css" media-type="text/css"/>
    ${chapterManifest}
  </manifest>
  <spine>
    ${spineItems}
  </spine>
</package>`
  );

  const epub = await zip.generateAsync({ type: "nodebuffer", mimeType: "application/epub+zip" });

  return {
    format: "epub",
    filename: `${processed.metadata.title.replace(/\s+/g, "-").toLowerCase()}.epub`,
    mimeType: "application/epub+zip",
    buffer: epub
  };
};
