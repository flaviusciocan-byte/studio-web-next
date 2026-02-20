import JSZip from "jszip";
import type { ExportManifest, ExportManifestItem, SpineMetrics, TemplateSpec } from "@zaria/shared";
import type { GeneratedAsset } from "./export-types.js";
import type { ProcessedDocument } from "@zaria/shared";

export const generateBundleAsset = async (params: {
  tenantId: string;
  documentId: string;
  metadata: ProcessedDocument["metadata"];
  template: TemplateSpec;
  spine: SpineMetrics;
  assets: GeneratedAsset[];
  checksums: Map<string, string>;
}): Promise<{ asset: GeneratedAsset; manifest: ExportManifest }> => {
  const zip = new JSZip();

  const manifestItems: ExportManifestItem[] = params.assets.map((asset) => ({
    format: asset.format,
    filename: asset.filename,
    sha256: params.checksums.get(asset.filename) ?? "",
    bytes: asset.buffer.length,
    createdAt: new Date().toISOString()
  }));

  const manifest: ExportManifest = {
    tenantId: params.tenantId,
    documentId: params.documentId,
    spine: params.spine,
    templateId: params.template.id,
    metadata: params.metadata,
    items: manifestItems
  };

  for (const asset of params.assets) {
    zip.file(asset.filename, asset.buffer);
  }

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  zip.file(
    "template.json",
    JSON.stringify(
      {
        id: params.template.id,
        name: params.template.name,
        description: params.template.description,
        typography: params.template.typography,
        palette: params.template.palette,
        coverStyle: params.template.coverStyle,
        pageStyle: params.template.pageStyle
      },
      null,
      2
    )
  );

  const bundle = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  const slug = params.metadata.title.replace(/\s+/g, "-").toLowerCase();

  return {
    asset: {
      format: "bundle",
      filename: `${slug}-bundle.zip`,
      mimeType: "application/zip",
      buffer: bundle
    },
    manifest
  };
};
