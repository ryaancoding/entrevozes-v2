import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import crypto from "node:crypto";
import * as db from "../db";

export const LOCAL_ADMIN_COOKIE_NAME = "entrevozes_admin_session";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

function getSecret() {
  return (
    process.env.JWT_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "entrevozes_local_dev_secret"
  );
}

function signOpenId(openId: string) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(openId)
    .digest("hex");
}

function parseCookies(cookieHeader?: string) {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) {
    return cookies;
  }

  for (const part of cookieHeader.split(";")) {
    const [rawKey, ...rawValue] = part.trim().split("=");

    if (!rawKey) {
      continue;
    }

    cookies[rawKey] = decodeURIComponent(rawValue.join("=") || "");
  }

  return cookies;
}

function readLocalAdminToken(req: CreateExpressContextOptions["req"]) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[LOCAL_ADMIN_COOKIE_NAME] || null;
}

async function authenticateLocalAdmin(
  req: CreateExpressContextOptions["req"]
): Promise<User | null> {
  const token = readLocalAdminToken(req);

  if (!token) {
    return null;
  }

  const separatorIndex = token.lastIndexOf(".");

  if (separatorIndex <= 0) {
    return null;
  }

  const openId = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expectedSignature = signOpenId(openId);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  return db.getUserByOpenId(openId);
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await authenticateLocalAdmin(opts.req);
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
