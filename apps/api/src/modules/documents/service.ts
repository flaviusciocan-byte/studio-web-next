import type { Document, InputType, Prisma } from "@prisma/client";
import type { SpineMetrics } from "@zaria/shared";
import { prisma } from "../../config/prisma.js";
import { processTextDocument } from "../../services/processing/processing-engine.js";
import { sha256 } from "../../utils/crypto.js";
import { HttpError } from "../../utils/http-error.js";
import { emitWebhookEvent } from "../webhooks/service.js";

const toInputType = (value: "raw" | "structured" | "imported" | "copywriter"): InputType => {
  if (value === "raw") return "RAW";
  if (value === "structured") return "STRUCTURED";
  if (value === "imported") return "IMPORTED";
  return "COPYWRITER";
};

export const createDocument = async (params: {
  tenantId: string;
  createdBy: string;
  inputType: "raw" | "structured" | "imported" | "copywriter";
  title: string;
  rawText: string;
  sourceReference?: string;
  templateId: string;
  spine: SpineMetrics;
  metadata?: {
    subtitle?: string;
    author?: string;
    language?: string;
    keywords?: string[];
  };
}): Promise<Document> => {
  return prisma.document.create({
    data: {
      tenantId: params.tenantId,
      createdBy: params.createdBy,
      inputType: toInputType(params.inputType),
      title: params.title,
      rawText: params.rawText,
      sourceReference: params.sourceReference,
      templateId: params.templateId,
      spineAd: params.spine.ad,
      spinePm: params.spine.pm,
      spineEsi: params.spine.esi,
      metadata: params.metadata as Prisma.InputJsonValue | undefined
    }
  });
};

export const listDocuments = async (tenantId: string): Promise<Document[]> =>
  prisma.document.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" }
  });

export const getDocument = async (tenantId: string, documentId: string): Promise<Document> => {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      tenantId
    }
  });

  if (!document) {
    throw new HttpError(404, "Document not found");
  }

  return document;
};

export const processDocument = async (params: {
  tenantId: string;
  documentId: string;
  force?: boolean;
}): Promise<Document> => {
  const current = await getDocument(params.tenantId, params.documentId);

  const digest = sha256(
    `${current.rawText}|${current.title}|${current.templateId}|${current.spineAd}|${current.spinePm}|${current.spineEsi}`
  );

  if (!params.force && current.processingDigest === digest && current.processedAt) {
    return current;
  }

  const processed = processTextDocument({
    title: current.title,
    rawText: current.rawText,
    metadata: (current.metadata as
      | {
          subtitle?: string;
          author?: string;
          language?: string;
          keywords?: string[];
        }
      | undefined) ?? {
      language: "en"
    },
    spine: {
      ad: current.spineAd,
      pm: current.spinePm,
      esi: current.spineEsi
    }
  });

  const updated = await prisma.document.update({
    where: { id: current.id },
    data: {
      normalizedText: processed.normalizedText,
      chapters: processed.chapters as unknown as Prisma.InputJsonValue,
      toc: processed.toc as unknown as Prisma.InputJsonValue,
      layout: processed.layout as unknown as Prisma.InputJsonValue,
      metadata: processed.metadata as unknown as Prisma.InputJsonValue,
      processingDigest: digest,
      processedAt: new Date()
    }
  });

  await emitWebhookEvent({
    tenantId: params.tenantId,
    event: "document.processed",
    payload: {
      documentId: updated.id,
      title: updated.title,
      processedAt: updated.processedAt,
      metadata: processed.metadata
    }
  });

  return updated;
};

export const updateDocumentSpine = async (params: {
  tenantId: string;
  documentId: string;
  spine: SpineMetrics;
}): Promise<Document> => {
  await getDocument(params.tenantId, params.documentId);
  return prisma.document.update({
    where: { id: params.documentId },
    data: {
      spineAd: params.spine.ad,
      spinePm: params.spine.pm,
      spineEsi: params.spine.esi,
      processingDigest: null,
      processedAt: null
    }
  });
};
