import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { storageRoot } from "../../config/storage.js";

export const persistExportArtifact = async (params: {
  tenantId: string;
  documentId: string;
  exportId: string;
  filename: string;
  bytes: Buffer;
}): Promise<string> => {
  const directory = path.join(storageRoot, params.tenantId, params.documentId);
  await mkdir(directory, { recursive: true });

  const resolved = path.join(directory, `${params.exportId}-${params.filename}`);
  await writeFile(resolved, params.bytes);
  return resolved;
};
