import { Router } from "express";
import { exportRequestSchema } from "@zaria/shared";
import { prisma } from "../../config/prisma.js";
import { enforceTenant, requireAuth, requireRole } from "../../middleware/auth.js";
import { exportRateLimit } from "../../middleware/rate-limit.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import { parseWithSchema } from "../../utils/validation.js";
import { createExport, readExportFile } from "../../services/export/export-service.js";

export const exportRouter = Router();

const readRouteParam = (value: unknown, name: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, `${name} is required`);
  }
  return value;
};

exportRouter.use(requireAuth, enforceTenant);

exportRouter.post(
  "/:documentId",
  requireRole(["OWNER", "EDITOR"]),
  exportRateLimit,
  asyncHandler(async (req, res) => {
    const payload = parseWithSchema(exportRequestSchema, req.body);
    const documentId = readRouteParam(req.params.documentId, "documentId");

    const artifact = await createExport({
      tenantId: req.auth!.tenantId,
      documentId,
      format: payload.format,
      includeFormats: payload.includeFormats,
      spine: payload.spine
    });

    res.status(201).json({ item: artifact });
  })
);

exportRouter.get(
  "/:exportId",
  asyncHandler(async (req, res) => {
    const exportId = readRouteParam(req.params.exportId, "exportId");
    const item = await prisma.exportArtifact.findFirst({
      where: {
        id: exportId,
        tenantId: req.auth!.tenantId
      }
    });

    if (!item) {
      throw new HttpError(404, "Export not found");
    }

    res.json({ item });
  })
);

exportRouter.get(
  "/:exportId/download",
  asyncHandler(async (req, res) => {
    const exportId = readRouteParam(req.params.exportId, "exportId");
    const item = await prisma.exportArtifact.findFirst({
      where: {
        id: exportId,
        tenantId: req.auth!.tenantId,
        status: "SUCCESS"
      }
    });

    if (!item) {
      throw new HttpError(404, "Export not found");
    }

    const bytes = await readExportFile(item);

    res.setHeader("Content-Type", item.mimeType ?? "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=\"${item.filename ?? `${item.id}.bin`}\"`
    );
    res.send(bytes);
  })
);
