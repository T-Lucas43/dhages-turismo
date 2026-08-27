import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  UPLOAD_DIR: z.string().default("./storage/uploads"),
  UPLOAD_BASE_URL: z.string().default("/uploads"),
  MAX_IMAGE_UPLOAD_BYTES: z.coerce.number().int().positive().default(10_485_760),
  MAX_VIDEO_UPLOAD_BYTES: z.coerce.number().int().positive().default(104_857_600),
  APP_URL: z.url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const isFrontendOnly = process.env.FRONTEND_ONLY === "1";

const frontendOnlyFallbacks = isFrontendOnly
  ? {
      DATABASE_URL: "mysql://frontend-only:disabled@127.0.0.1:3306/disabled",
      SESSION_SECRET: "frontend-only-build-with-admin-api-disabled",
    }
  : {};

export const serverEnv = serverEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL ?? frontendOnlyFallbacks.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET ?? frontendOnlyFallbacks.SESSION_SECRET,
  UPLOAD_DIR: process.env.UPLOAD_DIR,
  UPLOAD_BASE_URL: process.env.UPLOAD_BASE_URL,
  MAX_IMAGE_UPLOAD_BYTES: process.env.MAX_IMAGE_UPLOAD_BYTES,
  MAX_VIDEO_UPLOAD_BYTES: process.env.MAX_VIDEO_UPLOAD_BYTES,
  APP_URL: process.env.APP_URL,
  NODE_ENV: process.env.NODE_ENV,
});
