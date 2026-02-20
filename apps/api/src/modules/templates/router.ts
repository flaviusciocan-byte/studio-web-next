import { Router } from "express";
import { createTemplateSchema, type TemplateSpec } from "@zaria/shared";
import { prisma } from "../../config/prisma.js";
import { enforceTenant, requireAuth, requireRole } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { parseWithSchema } from "../../utils/validation.js";
import { zariaSystemTemplates } from "../../services/template/template-catalog.js";

export const templateRouter = Router();

templateRouter.get(
  "/",
  requireAuth,
  enforceTenant,
  asyncHandler(async (req, res) => {
    const custom = await prisma.template.findMany({
      where: {
        tenantId: req.auth!.tenantId,
        isSystem: false
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const customTemplates: TemplateSpec[] = custom.map((template: (typeof custom)[number]) => {
      const config = template.config as unknown as TemplateSpec;
      return {
        id: template.key,
        name: template.name,
        description: template.description,
        typography: config.typography,
        palette: config.palette,
        coverStyle: config.coverStyle,
        pageStyle: config.pageStyle
      };
    });

    res.json({
      items: [...zariaSystemTemplates, ...customTemplates]
    });
  })
);

templateRouter.post(
  "/",
  requireAuth,
  enforceTenant,
  requireRole(["OWNER", "EDITOR"]),
  asyncHandler(async (req, res) => {
    const payload = parseWithSchema(createTemplateSchema, req.body);

    const item = await prisma.template.create({
      data: {
        tenantId: req.auth!.tenantId,
        key: payload.id,
        name: payload.name,
        description: payload.description,
        config: {
          typography: payload.typography,
          palette: payload.palette,
          coverStyle: payload.coverStyle,
          pageStyle: payload.pageStyle
        },
        isSystem: false
      }
    });

    res.status(201).json({
      item: {
        id: item.key,
        name: item.name,
        description: item.description,
        ...((item.config as unknown as Omit<TemplateSpec, "id" | "name" | "description">) ?? {})
      }
    });
  })
);
