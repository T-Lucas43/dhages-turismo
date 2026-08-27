import { z } from "zod";

const optionalText = (maximum: number) => z
  .union([z.null(), z.string().trim().max(maximum)])
  .optional()
  .transform((value) => value === "" ? null : value);
// Null must be matched before coercion: Number(null) is 0 and Date(null) is
// 1970-01-01, which would turn an intentionally empty optional field into data.
const optionalDate = z.union([z.null(), z.coerce.date()]).optional();
const optionalNumber = z.union([z.null(), z.coerce.number()]).optional();
const optionalInteger = z.union([z.null(), z.coerce.number().int()]).optional();

export const itineraryItemSchema = z.object({
  dayNumber: optionalInteger,
  time: optionalText(20),
  title: z.string().trim().min(2).max(180),
  details: z.string().trim().min(2).max(5000),
});

export const packageFormSchema = z.object({
  name: z.string().trim().min(3).max(180),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens.").max(191),
  summary: z.string().trim().min(20).max(500),
  description: z.string().trim().min(50).max(50_000),
  categoryId: z.string().cuid(),
  destinationId: z.string().cuid(),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().min(2).max(80),
  stateCode: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  departureAt: z.coerce.date(),
  returnAt: z.coerce.date(),
  boardingTime: optionalText(20),
  boardingLocation: optionalText(240),
  durationDays: z.coerce.number().int().positive().max(365),
  cashPrice: z.coerce.number().positive(),
  installmentCount: z.coerce.number().int().min(1).max(24),
  installmentValue: optionalNumber,
  installmentTotal: optionalNumber,
  totalSpots: optionalInteger,
  remainingSpots: optionalInteger,
  showSpots: z.boolean().default(false),
  accommodation: optionalText(10_000),
  transport: optionalText(10_000),
  meals: optionalText(10_000),
  guide: optionalText(180),
  childPolicy: optionalText(10_000),
  requiredDocuments: optionalText(10_000),
  paymentMethods: optionalText(10_000),
  importantNotes: optionalText(10_000),
  mapUrl: optionalText(600),
  publicationStatus: z.enum(["DRAFT", "PUBLISHED", "INACTIVE", "ARCHIVED"]),
  availabilityStatus: z.enum(["AVAILABLE", "FEW_SPOTS", "SOLD_OUT", "CANCELLED"]),
  featured: z.boolean().default(false),
  featuredOrder: optionalInteger,
  featuredStartsAt: optionalDate,
  featuredEndsAt: optionalDate,
  waitingListEnabled: z.boolean().default(false),
  publishedAt: optionalDate,
  publicationEndsAt: optionalDate,
  seoTitle: optionalText(70),
  seoDescription: optionalText(170),
  shareImagePath: optionalText(500),
  includedItems: z.array(z.string().trim().min(1).max(500)).max(100).default([]),
  excludedItems: z.array(z.string().trim().min(1).max(500)).max(100).default([]),
  itinerary: z.array(itineraryItemSchema).max(100).default([]),
}).superRefine((data, context) => {
  if (data.returnAt < data.departureAt) context.addIssue({ code: "custom", path: ["returnAt"], message: "O retorno não pode ser anterior à saída." });
  if (data.totalSpots != null && data.totalSpots < 1) context.addIssue({ code: "custom", path: ["totalSpots"], message: "Informe pelo menos uma vaga." });
  if (data.remainingSpots != null && data.remainingSpots < 0) context.addIssue({ code: "custom", path: ["remainingSpots"], message: "As vagas não podem ser negativas." });
  if (data.totalSpots != null && data.remainingSpots != null && data.remainingSpots > data.totalSpots) context.addIssue({ code: "custom", path: ["remainingSpots"], message: "As vagas restantes não podem superar o total." });
  if (data.featuredStartsAt && data.featuredEndsAt && data.featuredEndsAt < data.featuredStartsAt) context.addIssue({ code: "custom", path: ["featuredEndsAt"], message: "O fim do destaque deve ser posterior ao início." });
  if (data.publishedAt && data.publicationEndsAt && data.publicationEndsAt < data.publishedAt) context.addIssue({ code: "custom", path: ["publicationEndsAt"], message: "O encerramento deve ser posterior à publicação." });
});

export const packageActionSchema = z.object({
  action: z.enum([
    "DUPLICATE",
    "PUBLISH",
    "UNPUBLISH",
    "INACTIVATE",
    "ARCHIVE",
    "RESTORE",
    "DELETE_PERMANENTLY",
    "FEATURE",
    "UNFEATURE",
    "AVAILABLE",
    "FEW_SPOTS",
    "SOLD_OUT",
    "CANCELLED",
  ]),
  confirmation: z.string().optional(),
});

export type PackageFormInput = z.input<typeof packageFormSchema>;
