export type InputType = "raw" | "structured" | "imported" | "copywriter";

export type ExportFormat = "pdf" | "epub" | "docx" | "bundle";

export interface SpineMetrics {
  ad: number;
  pm: number;
  esi: number;
}

export interface Chapter {
  id: string;
  title: string;
  level: number;
  content: string;
  sections: Chapter[];
}

export interface DocumentMetadata {
  title: string;
  subtitle?: string;
  author?: string;
  language: string;
  keywords: string[];
  wordCount: number;
  estimatedReadingMinutes: number;
}

export interface TocEntry {
  id: string;
  title: string;
  level: number;
  order: number;
}

export interface LayoutHints {
  pageSize: "A4" | "LETTER";
  bodyFontSize: number;
  headingScale: number;
  lineHeight: number;
  paragraphSpacing: number;
  margin: number;
  accentWeight: "subtle" | "balanced" | "bold";
}

export interface ProcessedDocument {
  normalizedText: string;
  chapters: Chapter[];
  metadata: DocumentMetadata;
  toc: TocEntry[];
  layout: LayoutHints;
}

export interface TemplateTypography {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
}

export interface TemplatePalette {
  white: string;
  purple: string;
  purpleDeep: string;
  gold: string;
}

export interface TemplateSpec {
  id: string;
  name: string;
  description: string;
  typography: TemplateTypography;
  palette: TemplatePalette;
  coverStyle: "monolith" | "crest" | "minimal";
  pageStyle: "classic" | "edge" | "editorial";
}

export interface ExportManifestItem {
  format: ExportFormat;
  filename: string;
  sha256: string;
  bytes: number;
  createdAt: string;
}

export interface ExportManifest {
  tenantId: string;
  documentId: string;
  spine: SpineMetrics;
  templateId: string;
  metadata: DocumentMetadata;
  items: ExportManifestItem[];
}

export interface AuthTokenPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
}
