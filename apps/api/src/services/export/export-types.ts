import type { ExportFormat, ProcessedDocument } from "@zaria/shared";
import type { RenderModel } from "../template/template-engine.js";

export interface GeneratedAsset {
  format: ExportFormat;
  filename: string;
  mimeType: string;
  buffer: Buffer;
}

export interface ExportExecutionContext {
  tenantId: string;
  documentId: string;
  renderModel: RenderModel;
  processed: ProcessedDocument;
}
