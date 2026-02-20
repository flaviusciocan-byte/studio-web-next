import { Router } from "express";
import { spineMetricsSchema } from "@zaria/shared";
import { enforceTenant, requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { parseWithSchema } from "../../utils/validation.js";
import { describeSpine } from "../../services/spine/spine-service.js";

export const spineRouter = Router();

spineRouter.use(requireAuth, enforceTenant);

spineRouter.post(
  "/evaluate",
  asyncHandler(async (req, res) => {
    const metrics = parseWithSchema(spineMetricsSchema, req.body);
    const result = describeSpine(metrics);
    res.json(result);
  })
);
