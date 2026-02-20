import type { Chapter, ProcessedDocument, SpineMetrics, TocEntry } from "@zaria/shared";
import { deriveSpineProfile } from "@zaria/shared";

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

interface HeadingCandidate {
  lineIndex: number;
  level: number;
  title: string;
}

const stopWords = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "about",
  "your",
  "their",
  "have",
  "will",
  "are",
  "but"
]);

const normalizeText = (raw: string): string =>
  raw
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[\u00A0]/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.replace(/\s{2,}/g, " ").trimEnd())
    .join("\n")
    .trim();

const headingFromLine = (line: string): { level: number; title: string } | null => {
  const markdown = line.match(/^(#{1,6})\s+(.+)$/);
  if (markdown) {
    const hashes = markdown[1];
    const title = markdown[2];
    if (!hashes || !title) {
      return null;
    }
    return { level: hashes.length, title: title.trim() };
  }

  const chapter = line.match(/^chapter\s+([0-9ivxlcdm]+)[:.-]?\s+(.+)$/i);
  if (chapter) {
    const chapterIndex = chapter[1];
    const title = chapter[2];
    if (!chapterIndex || !title) {
      return null;
    }
    return { level: 1, title: `Chapter ${chapterIndex} ${title}`.trim() };
  }

  const numbered = line.match(/^([0-9]+(?:\.[0-9]+){0,4})\s+(.+)$/);
  if (numbered) {
    const numbering = numbered[1];
    const title = numbered[2];
    if (!numbering || !title) {
      return null;
    }
    const depth = numbering.split(".").length;
    return { level: Math.min(depth, 6), title: `${numbering} ${title}`.trim() };
  }

  const upperCaseHeading =
    line.length > 2 &&
    line.length < 90 &&
    /^[A-Z0-9\s:&'\-]+$/.test(line) &&
    !line.endsWith(".") &&
    line.split(" ").length <= 12;

  if (upperCaseHeading) {
    return { level: 1, title: line.trim() };
  }

  return null;
};

const detectHeadings = (lines: string[]): HeadingCandidate[] => {
  const candidates: HeadingCandidate[] = [];
  lines.forEach((line, index) => {
    const match = headingFromLine(line.trim());
    if (match) {
      candidates.push({
        lineIndex: index,
        level: match.level,
        title: match.title
      });
    }
  });
  return candidates;
};

interface FlatChapter {
  id: string;
  level: number;
  title: string;
  content: string;
}

const buildFlatChapters = (normalizedText: string, titleFallback: string): FlatChapter[] => {
  const lines = normalizedText.split("\n");
  const headings = detectHeadings(lines);

  if (headings.length === 0) {
    return [
      {
        id: toSlug(titleFallback) || "chapter-1",
        level: 1,
        title: titleFallback,
        content: normalizedText
      }
    ];
  }

  const chapters: FlatChapter[] = [];

  headings.forEach((heading, idx) => {
    const nextLine = headings[idx + 1]?.lineIndex ?? lines.length;
    const bodyLines = lines.slice(heading.lineIndex + 1, nextLine).join("\n").trim();
    const stableSlug = toSlug(`${heading.title}-${idx + 1}`);

    chapters.push({
      id: stableSlug || `chapter-${idx + 1}`,
      level: heading.level,
      title: heading.title,
      content: bodyLines
    });
  });

  return chapters;
};

const nestChapters = (flat: FlatChapter[]): Chapter[] => {
  const root: Chapter[] = [];
  const stack: Chapter[] = [];

  flat.forEach((current) => {
    const node: Chapter = {
      id: current.id,
      title: current.title,
      level: current.level,
      content: current.content,
      sections: []
    };

    while (stack.length > 0 && (stack[stack.length - 1]?.level ?? 0) >= node.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      const parent = stack[stack.length - 1];
      if (!parent) {
        root.push(node);
      } else {
        parent.sections.push(node);
      }
    }

    stack.push(node);
  });

  return root;
};

const flattenToc = (chapters: Chapter[]): TocEntry[] => {
  const entries: TocEntry[] = [];
  let order = 1;

  const walk = (nodes: Chapter[]): void => {
    nodes.forEach((node) => {
      entries.push({
        id: node.id,
        title: node.title,
        level: node.level,
        order
      });
      order += 1;
      walk(node.sections);
    });
  };

  walk(chapters);
  return entries;
};

const extractKeywords = (text: string): string[] => {
  const frequencies = new Map<string, number>();

  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word))
    .forEach((word) => {
      frequencies.set(word, (frequencies.get(word) ?? 0) + 1);
    });

  return [...frequencies.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word]) => word);
};

const extractMetadata = (
  normalizedText: string,
  chapters: Chapter[],
  fallbackTitle: string,
  provided: { subtitle?: string; author?: string; language?: string; keywords?: string[] }
): ProcessedDocument["metadata"] => {
  const firstHeading = chapters[0]?.title;
  const firstLine = normalizedText.split("\n").find((line) => line.trim().length > 0) ?? fallbackTitle;
  const title = firstHeading ?? firstLine.slice(0, 120);
  const words = normalizedText.split(/\s+/).filter(Boolean).length;

  return {
    title,
    subtitle: provided.subtitle,
    author: provided.author,
    language: provided.language ?? "en",
    keywords: provided.keywords && provided.keywords.length > 0 ? provided.keywords : extractKeywords(normalizedText),
    wordCount: words,
    estimatedReadingMinutes: Math.max(1, Math.ceil(words / 220))
  };
};

export const processTextDocument = (params: {
  title: string;
  rawText: string;
  metadata?: { subtitle?: string; author?: string; language?: string; keywords?: string[] };
  spine: SpineMetrics;
}): ProcessedDocument => {
  const normalizedText = normalizeText(params.rawText);
  const flat = buildFlatChapters(normalizedText, params.title);
  const chapters = nestChapters(flat);
  const metadata = extractMetadata(normalizedText, chapters, params.title, params.metadata ?? {});
  const toc = flattenToc(chapters);

  const layout = deriveSpineProfile(params.spine).layout;

  return {
    normalizedText,
    chapters,
    metadata,
    toc,
    layout
  };
};
