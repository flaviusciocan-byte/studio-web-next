import { Router } from "express";
import { createWebhookSchema } from "@zaria/shared";
import { WebhookEvent } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { enforceTenant, requireAuth, requireRole } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import { parseWithSchema } from "../../utils/validation.js";

const toPrismaEvent = (event: "document.processed" | "export.completed" | "export.failed"): WebhookEvent => {
  if (event === "document.processed") return WebhookEvent.DOCUMENT_PROCESSED;
  if (event === "export.completed") return WebhookEvent.EXPORT_COMPLETED;
  return WebhookEvent.EXPORT_FAILED;
};

const toWireEvent = (event: WebhookEvent): string => {
  if (event === WebhookEvent.DOCUMENT_PROCESSED) return "document.processed";
  if (event === WebhookEvent.EXPORT_COMPLETED) return "export.completed";
  return "export.failed";
};

const readEndpointId = (value: unknown): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, "endpointId is required");
  }
  return value;
};

export const webhookRouter = Router();

webhookRouter.use(requireAuth, enforceTenant);

webhookRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.webhookEndpoint.findMany({
      where: { tenantId: req.auth!.tenantId },
      orderBy: { createdAt: "desc" }
    });

    res.json({
      items: items.map((item: (typeof items)[number]) => ({
        id: item.id,
        event: toWireEvent(item.event),
        targetUrl: item.targetUrl,
        active: item.active,
        createdAt: item.createdAt
      }))
    });
  })
);

webhookRouter.get(
  "/deliveries",
  asyncHandler(async (req, res) => {
    const items = await prisma.webhookDelivery.findMany({
      where: { tenantId: req.auth!.tenantId },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    res.json({ items });
  })
);

webhookRouter.post(
  "/",
  requireRole(["OWNER", "EDITOR"]),
  asyncHandler(async (req, res) => {
    const payload = parseWithSchema(createWebhookSchema, req.body);

    const item = await prisma.webhookEndpoint.create({
      data: {
        tenantId: req.auth!.tenantId,
        event: toPrismaEvent(payload.event),
        targetUrl: payload.targetUrl,
        secret: payload.secret
      }
    });

    res.status(201).json({
      item: {
        id: item.id,
        event: payload.event,
        targetUrl: item.targetUrl,
        active: item.active,
        createdAt: item.createdAt
      }
    });
  })
);

webhookRouter.delete(
  "/:endpointId",
  requireRole(["OWNER", "EDITOR"]),
  asyncHandler(async (req, res) => {
    const endpointId = readEndpointId(req.params.endpointId);
    await prisma.webhookEndpoint.deleteMany({
      where: {
        id: endpointId,
        tenantId: req.auth!.tenantId
      }
    });
    res.status(204).send();
  })
);
