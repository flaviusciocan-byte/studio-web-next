import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { verifyAccessToken, verifySecret } from "../utils/auth.js";
import { HttpError } from "../utils/http-error.js";

const parseBearer = (authHeader?: string): string | null => {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7).trim();
};

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const bearer = parseBearer(req.headers.authorization);
  const apiKey = req.headers["x-api-key"]?.toString();

  if (!bearer && !apiKey) {
    throw new HttpError(401, "Authentication required");
  }

  if (bearer) {
    try {
      const payload = verifyAccessToken(bearer);
      req.auth = {
        userId: payload.sub,
        tenantId: payload.tenantId,
        email: payload.email,
        role: payload.role,
        authType: "jwt"
      };
      next();
      return;
    } catch {
      throw new HttpError(401, "Invalid bearer token");
    }
  }

  if (!apiKey) {
    throw new HttpError(401, "Authentication required");
  }

  const [apiKeyRecordId, rawSecret] = apiKey.split(".");
  if (!apiKeyRecordId || !rawSecret) {
    throw new HttpError(401, "Malformed API key");
  }

  const record = await prisma.apiKey.findUnique({
    where: { id: apiKeyRecordId }
  });

  if (!record) {
    throw new HttpError(401, "Invalid API key");
  }

  const valid = await verifySecret(rawSecret, record.keyHash);
  if (!valid) {
    throw new HttpError(401, "Invalid API key");
  }

  req.auth = {
    userId: record.createdBy,
    tenantId: record.tenantId,
    role: "EDITOR",
    authType: "api-key"
  };

  await prisma.apiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() }
  });

  next();
};

export const requireRole = (allowed: Array<"OWNER" | "EDITOR" | "VIEWER">) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.auth?.role;
    if (!role || !allowed.includes(role)) {
      throw new HttpError(403, "Insufficient role");
    }
    next();
  };
};

export const enforceTenant = (req: Request, _res: Response, next: NextFunction): void => {
  const headerTenant = req.headers["x-tenant-id"]?.toString();
  const tokenTenant = req.auth?.tenantId;

  if (!tokenTenant) {
    throw new HttpError(401, "Tenant context missing");
  }

  if (headerTenant && headerTenant !== tokenTenant) {
    throw new HttpError(403, "Tenant mismatch");
  }

  req.headers["x-tenant-id"] = tokenTenant;
  next();
};
