import { z } from "zod";

const slug = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(191);

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: slug.max(120),
  description: z.string().trim().max(5000).nullable().optional(),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
});

export const destinationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slug.max(140),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().min(2).max(80),
  stateCode: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  description: z.string().trim().max(10_000).nullable().optional(),
  coverPath: z.string().trim().max(500).nullable().optional(),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(120),
  destination: z.string().trim().max(160).nullable().optional(),
  quote: z.string().trim().min(10).max(5000),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  avatarPath: z.string().trim().max(500).nullable().optional(),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
});

export const faqSchema = z.object({
  scope: z.enum(["GENERAL", "PACKAGE"]).default("GENERAL"),
  packageId: z.string().cuid().nullable().optional(),
  question: z.string().trim().min(5).max(500),
  answer: z.string().trim().min(5).max(10_000),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
}).superRefine((data, context) => {
  if (data.scope === "PACKAGE" && !data.packageId) context.addIssue({ code: "custom", path: ["packageId"], message: "Escolha o pacote relacionado." });
});

export const gallerySchema = z.object({
  title: z.string().trim().max(180).nullable().optional(),
  path: z.string().trim().min(1).max(500),
  mediaType: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  altText: z.string().trim().max(240).nullable().optional(),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
});

export const contentSchemas = {
  categorias: categorySchema,
  destinos: destinationSchema,
  depoimentos: testimonialSchema,
  perguntas: faqSchema,
  galeria: gallerySchema,
} as const;

export type ContentEntity = keyof typeof contentSchemas;
