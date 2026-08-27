import { z } from "zod";

export const companySettingsSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().min(2).max(80),
  phonePrimary: z.string().trim().min(10).max(30),
  phoneSecondary: z.string().trim().max(30).nullable().optional(),
  whatsappNumber: z.string().trim().min(10).max(30),
  instagramHandle: z.string().trim().max(120).nullable().optional(),
  address: z.string().trim().min(5).max(500),
  businessHours: z.string().trim().max(300).nullable().optional(),
  mapEmbedUrl: z.string().trim().max(800).nullable().optional(),
  aboutTitle: z.string().trim().max(240).nullable().optional(),
  aboutText: z.string().trim().max(30_000).nullable().optional(),
  mission: z.string().trim().max(5000).nullable().optional(),
  vision: z.string().trim().max(5000).nullable().optional(),
  valuesText: z.string().trim().max(5000).nullable().optional(),
  fewSpotsThreshold: z.coerce.number().int().min(1).max(1000),
  maxFeaturedPackages: z.coerce.number().int().min(1).max(50),
  logoDarkPath: z.string().trim().max(500).nullable().optional(),
  logoLightPath: z.string().trim().max(500).nullable().optional(),
  defaultShareImagePath: z.string().trim().max(500).nullable().optional(),
});

export const adminUserCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(10).max(128),
  role: z.enum(["OWNER", "ADMIN", "EDITOR"]),
  active: z.boolean().default(true),
});

export const adminUserUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.union([z.string().min(10).max(128), z.literal("")]).optional(),
  role: z.enum(["OWNER", "ADMIN", "EDITOR"]),
  active: z.boolean(),
});
