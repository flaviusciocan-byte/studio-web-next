import { Router } from "express";
import { loginSchema, registerSchema } from "@zaria/shared";
import { asyncHandler } from "../../utils/async-handler.js";
import { parseWithSchema } from "../../utils/validation.js";
import { createApiKey, loginUser, registerTenantOwner } from "./service.js";
import { enforceTenant, requireAuth, requireRole } from "../../middleware/auth.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const payload = parseWithSchema(registerSchema, req.body);
    const result = await registerTenantOwner(payload);
    res.status(201).json(result);
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const payload = parseWithSchema(loginSchema, req.body);
    const result = await loginUser(payload);
    res.json(result);
  })
);

authRouter.post(
  "/api-keys",
  requireAuth,
  enforceTenant,
  requireRole(["OWNER", "EDITOR"]),
  asyncHandler(async (req, res) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "Integration Key";
    const result = await createApiKey({
      tenantId: req.auth!.tenantId,
      createdBy: req.auth!.userId,
      name
    });
    res.status(201).json(result);
  })
);
