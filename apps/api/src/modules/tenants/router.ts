import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { enforceTenant, requireAuth, requireRole } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import { parseWithSchema } from "../../utils/validation.js";

const featureSchema = z.object({
  enabled: z.boolean()
});

export const tenantRouter = Router();

tenantRouter.use(requireAuth, enforceTenant);

tenantRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.auth!.tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        featureFlags: {
          select: {
            module: true,
            enabled: true,
            updatedAt: true
          },
          orderBy: {
            module: "asc"
          }
        },
        _count: {
          select: {
            users: true,
            documents: true,
            exports: true,
            webhooks: true
          }
        }
      }
    });

    res.json({ item: tenant });
  })
);

tenantRouter.patch(
  "/features/:module",
  requireRole(["OWNER", "EDITOR"]),
  asyncHandler(async (req, res) => {
    const payload = parseWithSchema(featureSchema, req.body);
    const moduleValue = req.params.module;
    if (typeof moduleValue !== "string" || moduleValue.trim().length === 0) {
      throw new HttpError(400, "Module name is required");
    }
    const moduleName = moduleValue.trim().toLowerCase();

    const item = await prisma.featureFlag.upsert({
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

    res.json({ item });
  })
);
