import { createHmac, createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { serverEnv } from "../env";

export const createRandomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const hashSensitiveValue = (value: string) =>
  createHmac("sha256", serverEnv.SESSION_SECRET).update(value).digest("hex");

export function safeTokenEqual(rawToken: string, expectedHash: string) {
  const actual = Buffer.from(hashToken(rawToken), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
