import type { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        tenantId: string;
        email?: string;
        role: UserRole;
        authType: "jwt" | "api-key";
      };
      requestId?: string;
    }
  }
}

export {};
