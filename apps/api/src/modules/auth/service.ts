import { prisma } from "../../config/prisma.js";
import { HttpError } from "../../utils/http-error.js";
import { hashSecret, signAccessToken, verifySecret } from "../../utils/auth.js";
import { randomToken } from "../../utils/crypto.js";

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const registerTenantOwner = async (input: {
  tenantName: string;
  tenantSlug: string;
  email: string;
  password: string;
  fullName: string;
}): Promise<{ token: string; tenantId: string; userId: string }> => {
  const normalizedSlug = toSlug(input.tenantSlug);
  const existing = await prisma.tenant.findUnique({ where: { slug: normalizedSlug } });
  if (existing) {
    throw new HttpError(409, "Tenant slug already exists");
  }

  const passwordHash = await hashSecret(input.password);

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: input.tenantName,
        slug: normalizedSlug
      }
    });

    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: input.email.toLowerCase(),
        fullName: input.fullName,
        passwordHash,
        role: "OWNER"
      }
    });

    return { tenant, user };
  });

  const token = signAccessToken({
    sub: result.user.id,
    tenantId: result.tenant.id,
    email: result.user.email,
    role: "OWNER"
  });

  return {
    token,
    tenantId: result.tenant.id,
    userId: result.user.id
  };
};

export const loginUser = async (input: {
  email: string;
  password: string;
  tenantSlug: string;
}): Promise<{ token: string; tenantId: string; userId: string; role: string }> => {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: input.tenantSlug }
  });

  if (!tenant) {
    throw new HttpError(401, "Invalid credentials");
  }

  const user = await prisma.user.findUnique({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: input.email.toLowerCase()
      }
    }
  });

  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const validPassword = await verifySecret(input.password, user.passwordHash);
  if (!validPassword) {
    throw new HttpError(401, "Invalid credentials");
  }

  const token = signAccessToken({
    sub: user.id,
    tenantId: tenant.id,
    email: user.email,
    role: user.role
  });

  return {
    token,
    tenantId: tenant.id,
    userId: user.id,
    role: user.role
  };
};

export const createApiKey = async (params: {
  tenantId: string;
  createdBy: string;
  name: string;
}): Promise<{ apiKey: string; id: string; name: string }> => {
  const raw = randomToken(28);
  const keyHash = await hashSecret(raw);

  const record = await prisma.apiKey.create({
    data: {
      tenantId: params.tenantId,
      createdBy: params.createdBy,
      name: params.name,
      keyHash
    }
  });

  return {
    apiKey: `${record.id}.${raw}`,
    id: record.id,
    name: record.name
  };
};
