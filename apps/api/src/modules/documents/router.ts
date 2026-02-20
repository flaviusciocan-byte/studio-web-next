import { Router } from "express";
import multer from "multer";
import { createDocumentSchema, processDocumentSchema, spineMetricsSchema } from "@zaria/shared";
import { enforceTenant, requireAuth, requireRole } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { parseWithSchema } from "../../utils/validation.js";
import {
  createDocument,
  getDocument,
  listDocuments,
  processDocument,
  updateDocumentSpine
} from "./service.js";
import { HttpError } from "../../utils/http-error.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024
  }
});

const readDocumentId = (value: unknown): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, "documentId is required");
  }
  return value;
};

export const documentRouter = Router();

documentRouter.use(requireAuth, enforceTenant);

documentRouter.post(
  "/",
  requireRole(["OWNER", "EDITOR"]),
  asyncHandler(async (req, res) => {
    const payload = parseWithSchema(createDocumentSchema, req.body);
    const document = await createDocument({
      tenantId: req.auth!.tenantId,
      createdBy: req.auth!.userId,
      inputType: payload.inputType,
      title: payload.title,
      rawText: payload.rawText,
      sourceReference: payload.sourceReference,
      templateId: payload.templateId,
      spine: payload.spine,
      metadata: payload.metadata
    });

    res.status(201).json({ item: document });
  })
);

documentRouter.post(
  "/import",
  requireRole(["OWNER", "EDITOR"]),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new HttpError(400, "File is required");
    }

    const mimeType = req.file.mimetype;
    if (!["text/plain", "text/markdown", "application/json"].includes(mimeType)) {
      throw new HttpError(415, "Unsupported file type");
    }

    const text = req.file.buffer.toString("utf-8");
    const title = typeof req.body.title === "string" && req.body.title.trim() ? req.body.title.trim() : req.file.originalname;
    const templateId = typeof req.body.templateId === "string" ? req.body.templateId : "zaria-imperial";

    const spine = parseWithSchema(spineMetricsSchema, {
      ad: Number(req.body.ad ?? 50),
      pm: Number(req.body.pm ?? 50),
      esi: Number(req.body.esi ?? 50)
    });

    const document = await createDocument({
      tenantId: req.auth!.tenantId,
      createdBy: req.auth!.userId,
      inputType: "imported",
      title,
      rawText: text,
      sourceReference: `upload:${req.file.originalname}`,
      templateId,
      spine
    });

    res.status(201).json({ item: document });
  })
);

documentRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await listDocuments(req.auth!.tenantId);
    res.json({ items });
  })
);

documentRouter.get(
  "/:documentId",
  asyncHandler(async (req, res) => {
    const documentId = readDocumentId(req.params.documentId);
    const item = await getDocument(req.auth!.tenantId, documentId);
    res.json({ item });
  })
);

documentRouter.post(
  "/:documentId/process",
  requireRole(["OWNER", "EDITOR"]),
  asyncHandler(async (req, res) => {
    const payload = parseWithSchema(processDocumentSchema, req.body ?? {});
    const documentId = readDocumentId(req.params.documentId);
    const item = await processDocument({
      tenantId: req.auth!.tenantId,
      documentId,
      force: payload.force
    });

    res.json({ item });
  })
);

documentRouter.patch(
  "/:documentId/spine",
  requireRole(["OWNER", "EDITOR"]),
  asyncHandler(async (req, res) => {
    const spine = parseWithSchema(spineMetricsSchema, req.body);
    const documentId = readDocumentId(req.params.documentId);
    const item = await updateDocumentSpine({
      tenantId: req.auth!.tenantId,
      documentId,
      spine
    });

    res.json({ item });
  })
);
