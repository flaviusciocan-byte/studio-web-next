import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { apiRateLimit } from "./middleware/rate-limit.js";
import { requestContext } from "./middleware/request-context.js";
import { errorHandler } from "./middleware/error-handler.js";
import { healthRouter } from "./modules/health/router.js";
import { authRouter } from "./modules/auth/router.js";
import { templateRouter } from "./modules/templates/router.js";
import { documentRouter } from "./modules/documents/router.js";
import { exportRouter } from "./modules/exports/router.js";
import { webhookRouter } from "./modules/webhooks/router.js";
import { spineRouter } from "./modules/spine/router.js";
import { tenantRouter } from "./modules/tenants/router.js";
import { compatibilityRouter } from "./modules/compat/router.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));
app.use(requestContext);
app.use(apiRateLimit);

app.use("/health", healthRouter);
app.use("/v1/auth", authRouter);
app.use("/v1/templates", templateRouter);
app.use("/v1/documents", documentRouter);
app.use("/v1/exports", exportRouter);
app.use("/v1/webhooks", webhookRouter);
app.use("/v1/spine", spineRouter);
app.use("/v1/tenants", tenantRouter);
app.use("/api", compatibilityRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(
  "/v1/openapi",
  express.static(path.resolve(__dirname, "../openapi"), {
    extensions: ["yaml", "json"]
  })
);

app.use(errorHandler);

export { app };
