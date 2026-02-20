import { mkdir } from "node:fs/promises";
import path from "node:path";
import { env } from "./env.js";

export const storageRoot = path.resolve(env.STORAGE_PATH);

export const ensureStorage = async (): Promise<void> => {
  await mkdir(storageRoot, { recursive: true });
};
