import { Router } from "express";
import { z } from "zod";
import { enforceTenant, requireAuth, requireRole } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { parseWithSchema } from "../../utils/validation.js";
import { prisma } from "../../config/prisma.js";
import { processTextDocument } from "../../services/processing/processing-engine.js";
import { describeSpine } from "../../services/spine/spine-service.js";
import { resolveTemplate } from "../../services/template/template-engine.js";
import { HttpError } from "../../utils/http-error.js";

const toggleSchema = z.object({
  enabled: z.boolean()
});

const memorySearchSchema = z.object({
  query: z.string().min(2).max(140),
  limit: z.number().int().min(1).max(50).default(10)
});

const transformSchema = z.object({
  title: z.string().min(1).max(180),
  text: z.string().min(1),
  templateId: z.string().min(1).default("zaria-imperial"),
  metadata: z
    .object({
      subtitle: z.string().max(180).optional(),
      author: z.string().max(120).optional(),
      language: z.string().default("en"),
      keywords: z.array(z.string().max(40)).max(24).default([])
    })
    .optional(),
  spine: z
    .object({
      ad: z.number().min(0).max(100),
      pm: z.number().min(0).max(100),
      esi: z.number().min(0).max(100)
    })
    .default({ ad: 50, pm: 50, esi: 50 })
});

const buildSnippet = (text: string, query: string): string => {
  const normalizedText = text.replace(/\s+/g, " ");
  const index = normalizedText.toLowerCase().indexOf(query.toLowerCase());

  if (index === -1) {
    return normalizedText.slice(0, 220);
  }

  const start = Math.max(0, index - 80);
  const end = Math.min(normalizedText.length, index + query.length + 120);
  return normalizedText.slice(start, end);
};

export const compatibilityRouter = Router();

compatibilityRouter.use(requireAuth, enforceTenant);

compatibilityRouter.post(
  "/modules/:module/toggle",
  requireRole(["OWNER", "EDITOR"]),
  asyncHandler(async (req, res) => {
    const payload = parseWithSchema(toggleSchema, req.body);
    const moduleValue = req.params.module;
    if (typeof moduleValue !== "string" || moduleValue.trim().length === 0) {
      throw new HttpError(400, "Module name is required");
    }
    const moduleName = moduleValue.trim().toLowerCase();

    const flag = await prisma.featureFlag.upsert({
      where: {
        tenantId_module: {
          tenantId: req.auth!.tenantId,
          module: moduleName
        }
      },
      update: {
        enabled: payload.enabled,
        updatedBy: req.auth!.userId
      },
      create: {
        tenantId: req.auth!.tenantId,
        module: moduleName,
        enabled: payload.enabled,
        updatedBy: req.auth!.userId
      }
    });

    res.json({
      module: flag.module,
      enabled: flag.enabled,
      tenantId: flag.tenantId,
      updatedAt: flag.updatedAt
    });
  })
);

compatibilityRouter.post(
  "/memory/search",
  asyncHandler(async (req, res) => {
    const payload = parseWithSchema(memorySearchSchema, req.body);

    const items = await prisma.document.findMany({
      where: {
        tenantId: req.auth!.tenantId,
        OR: [
          { rawText: { contains: payload.query, mode: "insensitive" } },
          { normalizedText: { contains: payload.query, mode: "insensitive" } }
        ]
      },
      select: {
        id: true,
        title: true,
        rawText: true,
        normalizedText: true,
        processedAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: "desc" },
      take: payload.limit
    });

    res.json({
      query: payload.query,
      items: items.map((item: (typeof items)[number]) => ({
        id: item.id,
        title: item.title,
        snippet: buildSnippet(item.normalizedText ?? item.rawText, payload.query),
        processed: Boolean(item.processedAt),
        updatedAt: item.updatedAt
      }))
    });
  })
);

compatibilityRouter.post(
  "/ollama/generate",
  asyncHandler(async (req, res) => {
    const payload = parseWithSchema(transformSchema, req.body);

    const processed = processTextDocument({
      title: payload.title,
      rawText: payload.text,
      metadata: payload.metadata,
      spine: payload.spine
    });

    const template = await resolveTemplate(req.auth!.tenantId, payload.templateId);
    const spine = describeSpine(payload.spine);

    res.json({
      mode: "transform",
      inputType: "compatibility",
      template,
      spine,
      processed
    });
  })
);
