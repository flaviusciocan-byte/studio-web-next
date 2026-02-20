import type { Template } from "@prisma/client";
import type { ProcessedDocument, TemplateSpec } from "@zaria/shared";
import { deriveSpineProfile, type SpineProfile } from "@zaria/shared";
import { prisma } from "../../config/prisma.js";
import { HttpError } from "../../utils/http-error.js";
import { systemTemplateById } from "./template-catalog.js";
import type { SpineMetrics } from "@zaria/shared";

interface RenderModel {
  template: TemplateSpec;
  spineProfile: SpineProfile;
  processed: ProcessedDocument;
  cover: {
    title: string;
    subtitle?: string;
    accentBandHeight: number;
    badgeText: string;
  };
}

const parseTemplateRecord = (template: Template): TemplateSpec => {
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
};

export const resolveTemplate = async (
  tenantId: string,
  templateId: string
): Promise<TemplateSpec> => {
  const systemTemplate = systemTemplateById(templateId);
  if (systemTemplate) {
    return systemTemplate;
  }

  const dbTemplate = await prisma.template.findFirst({
    where: {
      key: templateId,
      OR: [{ tenantId }, { isSystem: true }]
    }
  });

  if (!dbTemplate) {
    throw new HttpError(404, `Template ${templateId} not found`);
  }

  return parseTemplateRecord(dbTemplate);
};

export const buildRenderModel = (
  template: TemplateSpec,
  processed: ProcessedDocument,
  spine: SpineMetrics
): RenderModel => {
  const spineProfile = deriveSpineProfile(spine);
  return {
    template,
    spineProfile,
    processed,
    cover: {
      title: processed.metadata.title,
      subtitle: processed.metadata.subtitle,
      accentBandHeight: spineProfile.layout.accentWeight === "bold" ? 56 : 40,
      badgeText: `${spineProfile.rhythm.toUpperCase()} • ${spineProfile.emotionalMode.toUpperCase()}`
    }
  };
};

export type { RenderModel };
