import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("12h"),
  API_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  API_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  EXPORT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  CORS_ORIGIN: z.string().url().default("http://localhost:5173"),
  STORAGE_PATH: z.string().default("./apps/api/storage"),
  WEBHOOK_TIMEOUT_MS: z.coerce.number().int().positive().default(6000)
});

export const env = envSchema.parse(process.env);
