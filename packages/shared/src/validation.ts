import { z } from "zod";

export const spineMetricsSchema = z.object({
  ad: z.number().min(0).max(100),
  pm: z.number().min(0).max(100),
  esi: z.number().min(0).max(100)
});

export const createDocumentSchema = z.object({
  inputType: z.enum(["raw", "structured", "imported", "copywriter"]),
  title: z.string().min(1).max(180),
  rawText: z.string().min(1),
  sourceReference: z.string().max(2000).optional(),
  templateId: z.string().min(1),
  spine: spineMetricsSchema,
  metadata: z
    .object({
      subtitle: z.string().max(180).optional(),
      author: z.string().max(120).optional(),
      language: z.string().default("en"),
      keywords: z.array(z.string().max(40)).max(24).default([])
    })
    .optional()
});

export const processDocumentSchema = z.object({
  force: z.boolean().optional()
});

export const exportRequestSchema = z.object({
  format: z.enum(["pdf", "epub", "docx", "bundle"]),
  includeFormats: z.array(z.enum(["pdf", "epub", "docx"])).optional(),
  spine: spineMetricsSchema.optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  tenantSlug: z.string().min(2).max(40)
});

export const registerSchema = z.object({
  tenantName: z.string().min(2).max(120),
  tenantSlug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/),
  email: z.string().email(),
  password: z.string().min(12),
  fullName: z.string().min(2).max(120)
});

export const createWebhookSchema = z.object({
  event: z.enum(["document.processed", "export.completed", "export.failed"]),
  targetUrl: z.string().url(),
  secret: z.string().min(16).max(120)
});

export const createTemplateSchema = z.object({
  id: z
    .string()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(120),
  description: z.string().min(8).max(360),
  typography: z.object({
    headingFont: z.string().min(2).max(80),
    bodyFont: z.string().min(2).max(80),
    monoFont: z.string().min(2).max(80)
  }),
  palette: z.object({
    white: z.literal("#FFFFFF"),
    purple: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    purpleDeep: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    gold: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
  }),
  coverStyle: z.enum(["monolith", "crest", "minimal"]),
  pageStyle: z.enum(["classic", "edge", "editorial"])
});
