import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  Document,
  ExportArtifact,
  ExportFormat as PrismaExportFormat,
  Prisma
} from "@prisma/client";
import type { ExportFormat, ProcessedDocument, SpineMetrics } from "@zaria/shared";
import { prisma } from "../../config/prisma.js";
import { HttpError } from "../../utils/http-error.js";
import { sha256 } from "../../utils/crypto.js";
import { buildRenderModel, resolveTemplate } from "../template/template-engine.js";
import { generatePdfAsset } from "./pdf-exporter.js";
import { generateEpubAsset } from "./epub-exporter.js";
import { generateDocxAsset } from "./docx-exporter.js";
import { generateBundleAsset } from "./bundle-exporter.js";
import { persistExportArtifact } from "./storage.js";
import type { GeneratedAsset } from "./export-types.js";
import { emitWebhookEvent } from "../../modules/webhooks/service.js";

const toPrismaFormat = (format: ExportFormat): PrismaExportFormat => {
  if (format === "pdf") return "PDF";
  if (format === "epub") return "EPUB";
  if (format === "docx") return "DOCX";
  return "BUNDLE";
};

const parseProcessed = (document: Document): ProcessedDocument => {
  if (!document.normalizedText || !document.chapters || !document.toc || !document.layout || !document.metadata) {
    throw new HttpError(409, "Document was not processed yet");
  }

  return {
    normalizedText: document.normalizedText,
    chapters: document.chapters as unknown as ProcessedDocument["chapters"],
    toc: document.toc as unknown as ProcessedDocument["toc"],
    layout: document.layout as unknown as ProcessedDocument["layout"],
    metadata: document.metadata as unknown as ProcessedDocument["metadata"]
  };
};

const buildAsset = async (params: {
  format: Exclude<ExportFormat, "bundle">;
  tenantId: string;
  documentId: string;
  processed: ProcessedDocument;
  spine: SpineMetrics;
  templateId: string;
}): Promise<GeneratedAsset> => {
  const template = await resolveTemplate(params.tenantId, params.templateId);
  const renderModel = buildRenderModel(template, params.processed, params.spine);

  const context = {
    tenantId: params.tenantId,
    documentId: params.documentId,
    renderModel,
    processed: params.processed
  };

  if (params.format === "pdf") {
    return generatePdfAsset(context);
  }
  if (params.format === "epub") {
    return generateEpubAsset(context);
  }
  return generateDocxAsset(context);
};

const persistArtifactRecord = async (params: {
  artifactId: string;
  tenantId: string;
  documentId: string;
  generated: GeneratedAsset;
  manifest?: unknown;
}): Promise<ExportArtifact> => {
  const hash = sha256(params.generated.buffer);
  const storagePath = await persistExportArtifact({
    tenantId: params.tenantId,
    documentId: params.documentId,
    exportId: params.artifactId,
    filename: params.generated.filename,
    bytes: params.generated.buffer
  });

  return prisma.exportArtifact.update({
    where: { id: params.artifactId },
    data: {
      status: "SUCCESS",
      filename: params.generated.filename,
      mimeType: params.generated.mimeType,
      bytes: params.generated.buffer.length,
      sha256: hash,
      storagePath,
      manifest: params.manifest as Prisma.InputJsonValue | undefined
    }
  });
};

const createPendingRecord = async (tenantId: string, documentId: string, format: ExportFormat) =>
  prisma.exportArtifact.create({
    data: {
      tenantId,
      documentId,
      format: toPrismaFormat(format),
      status: "PENDING"
    }
  });

export const createExport = async (params: {
  tenantId: string;
  documentId: string;
  format: ExportFormat;
  includeFormats?: Array<"pdf" | "epub" | "docx">;
  spine?: SpineMetrics;
}): Promise<ExportArtifact> => {
  const document = await prisma.document.findFirst({
    where: {
      id: params.documentId,
      tenantId: params.tenantId
    }
  });

  if (!document) {
    throw new HttpError(404, "Document not found");
  }

  const processed = parseProcessed(document);
  const spine: SpineMetrics = params.spine ?? {
    ad: document.spineAd,
    pm: document.spinePm,
    esi: document.spineEsi
  };

  const pending = await createPendingRecord(params.tenantId, params.documentId, params.format);

  try {
    if (params.format !== "bundle") {
      const generated = await buildAsset({
        format: params.format,
        tenantId: params.tenantId,
        documentId: params.documentId,
        processed,
        templateId: document.templateId,
        spine
      });

      const completed = await persistArtifactRecord({
        artifactId: pending.id,
        tenantId: params.tenantId,
        documentId: params.documentId,
        generated,
        manifest: {
          spine,
          templateId: document.templateId,
          metadata: processed.metadata
        }
      });

      await emitWebhookEvent({
        tenantId: params.tenantId,
        event: "export.completed",
        payload: {
          exportId: completed.id,
          documentId: params.documentId,
          format: params.format,
          filename: completed.filename,
          bytes: completed.bytes
        }
      });

      return completed;
    }

    const selected = params.includeFormats ?? ["pdf", "epub", "docx"];
    const artifacts = await Promise.all(
      selected.map((format) =>
        buildAsset({
          format,
          tenantId: params.tenantId,
          documentId: params.documentId,
          processed,
          templateId: document.templateId,
          spine
        })
      )
    );

    const checksums = new Map<string, string>();
    artifacts.forEach((asset) => {
      checksums.set(asset.filename, sha256(asset.buffer));
    });

    const template = await resolveTemplate(params.tenantId, document.templateId);

    const { asset, manifest } = await generateBundleAsset({
      tenantId: params.tenantId,
      documentId: params.documentId,
      metadata: processed.metadata,
      template,
      spine,
      assets: artifacts,
      checksums
    });

    const completed = await persistArtifactRecord({
      artifactId: pending.id,
      tenantId: params.tenantId,
      documentId: params.documentId,
      generated: asset,
      manifest
    });

    await emitWebhookEvent({
      tenantId: params.tenantId,
      event: "export.completed",
      payload: {
        exportId: completed.id,
        documentId: params.documentId,
        format: params.format,
        filename: completed.filename,
        bytes: completed.bytes,
        items: manifest.items
      }
    });

    return completed;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown export failure";

    await prisma.exportArtifact.update({
      where: { id: pending.id },
      data: {
        status: "FAILED",
        error: message
      }
    });

    await emitWebhookEvent({
      tenantId: params.tenantId,
      event: "export.failed",
      payload: {
        exportId: pending.id,
        documentId: params.documentId,
        format: params.format,
        error: message
      }
    });

    throw error;
  }
};

export const readExportFile = async (artifact: ExportArtifact): Promise<Buffer> => {
  if (!artifact.storagePath) {
    throw new HttpError(404, "Export file not available");
  }

  return readFile(path.resolve(artifact.storagePath));
};
