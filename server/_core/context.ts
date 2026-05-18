import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import * as db from "../db";
import { createHmac, timingSafeEqual } from "node:crypto";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

function parseCookie(header: string | undefined, name: string) {
  if (!header) return undefined;
  const cookies = header.split(";").map(part => part.trim());
  const found = cookies.find(part => part.startsWith(`${name}=`));
  if (!found) return undefined;
  return decodeURIComponent(found.slice(name.length + 1));
}

function base64url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signPayload(payload: string) {
  const secret = process.env.JWT_SECRET || "entrevozes-dev-secret";
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeCompare(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function verifyLocalSessionToken(token: string) {
  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) return null;

  const expected = signPayload(payloadEncoded);
  if (!safeCompare(signature, expected)) return null;

  const json = Buffer.from(payloadEncoded, "base64url").toString("utf8");
  const payload = JSON.parse(json) as { openId: string; exp: number };

  if (!payload.openId || !payload.exp || Date.now() > payload.exp) return null;

  return payload;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const token =
      opts.req.cookies?.[COOKIE_NAME] ||
      parseCookie(opts.req.headers.cookie, COOKIE_NAME);

    if (token) {
      const payload = verifyLocalSessionToken(token);
      if (payload?.openId) {
        user = await db.getUserByOpenId(payload.openId);
      }
    }
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
