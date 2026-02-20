import { createHash, createHmac, randomBytes } from "node:crypto";

export const sha256 = (value: Buffer | string): string =>
  createHash("sha256").update(value).digest("hex");

export const randomToken = (bytes = 32): string => randomBytes(bytes).toString("hex");

export const signPayload = (secret: string, payload: string): string =>
  createHmac("sha256", secret).update(payload).digest("hex");
