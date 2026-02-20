import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

export const apiRateLimit = rateLimit({
  windowMs: env.API_RATE_LIMIT_WINDOW_MS,
  max: env.API_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: "Rate limit exceeded"
    }
  }
});

export const exportRateLimit = rateLimit({
  windowMs: env.API_RATE_LIMIT_WINDOW_MS,
  max: env.EXPORT_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: "Export rate limit exceeded"
    }
  }
});
