import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import { env } from "../config/env.js";
import type { AuthTokenPayload } from "@zaria/shared";

export const hashSecret = async (value: string): Promise<string> => bcrypt.hash(value, 12);

export const verifySecret = async (value: string, hash: string): Promise<boolean> =>
  bcrypt.compare(value, hash);

export const signAccessToken = (payload: AuthTokenPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    audience: "zaria-builder",
    issuer: "zaria-api"
  });

export interface VerifiedAccessToken {
  sub: string;
  tenantId: string;
  email: string;
  role: UserRole;
}

export const verifyAccessToken = (token: string): VerifiedAccessToken => {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    audience: "zaria-builder",
    issuer: "zaria-api"
  }) as jwt.JwtPayload;

  if (!decoded.sub || !decoded.tenantId || !decoded.email || !decoded.role) {
    throw new Error("Invalid access token payload");
  }

  const role = decoded.role;
  if (role !== "OWNER" && role !== "EDITOR" && role !== "VIEWER") {
    throw new Error("Invalid access token role");
  }

  return {
    sub: decoded.sub,
    tenantId: decoded.tenantId as string,
    email: decoded.email as string,
    role
  };
};
