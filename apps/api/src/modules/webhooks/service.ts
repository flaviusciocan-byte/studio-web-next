import { createHmac } from "node:crypto";
import { Prisma, WebhookEvent } from "@prisma/client";
import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";

const toPrismaEvent = (event: "document.processed" | "export.completed" | "export.failed"): WebhookEvent => {
  if (event === "document.processed") return WebhookEvent.DOCUMENT_PROCESSED;
  if (event === "export.completed") return WebhookEvent.EXPORT_COMPLETED;
  return WebhookEvent.EXPORT_FAILED;
};

const sign = (secret: string, payload: string): string =>
  createHmac("sha256", secret).update(payload).digest("hex");

const safeString = async (response: Response): Promise<string> => {
  try {
    return await response.text();
  } catch {
    return "";
  }
};

export const emitWebhookEvent = async (params: {
  tenantId: string;
  event: "document.processed" | "export.completed" | "export.failed";
  payload: Record<string, unknown>;
}): Promise<void> => {
  const event = toPrismaEvent(params.event);

  const endpoints = await prisma.webhookEndpoint.findMany({
    where: {
      tenantId: params.tenantId,
      event,
      active: true
    }
  });

  if (endpoints.length === 0) {
    return;
  }

  const body = JSON.stringify({
    event: params.event,
    timestamp: new Date().toISOString(),
    data: params.payload
  });

  await Promise.all(
    endpoints.map(async (endpoint: (typeof endpoints)[number]) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), env.WEBHOOK_TIMEOUT_MS);

      try {
        const signature = sign(endpoint.secret, body);
        const response = await fetch(endpoint.targetUrl, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-zaria-signature": signature,
            "x-zaria-event": params.event
          },
          body,
          signal: controller.signal
        });

        clearTimeout(timeout);
        const responseBody = await safeString(response);

        await prisma.webhookDelivery.create({
          data: {
            tenantId: params.tenantId,
            endpointId: endpoint.id,
            event,
            payload: params.payload as Prisma.InputJsonValue,
            statusCode: response.status,
            responseBody,
            success: response.ok,
            deliveredAt: new Date()
          }
        });
      } catch (error) {
        clearTimeout(timeout);
        const message = error instanceof Error ? error.message : "Webhook request failed";

        await prisma.webhookDelivery.create({
          data: {
            tenantId: params.tenantId,
            endpointId: endpoint.id,
            event,
            payload: params.payload as Prisma.InputJsonValue,
            responseBody: message,
            success: false,
            deliveredAt: new Date()
          }
        });
      }
    })
  );
};
