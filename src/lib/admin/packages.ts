import type { z } from "zod";
import type { packageFormSchema } from "@/lib/validation/package";

type ParsedPackage = z.output<typeof packageFormSchema>;

export function packageScalarData(input: ParsedPackage) {
  const { includedItems: _included, excludedItems: _excluded, itinerary: _itinerary, ...data } = input;
  return {
    ...data,
    publishedAt: data.publicationStatus === "PUBLISHED" ? (data.publishedAt ?? new Date()) : data.publishedAt,
    featuredOrder: data.featured ? data.featuredOrder : null,
    featuredStartsAt: data.featured ? data.featuredStartsAt : null,
    featuredEndsAt: data.featured ? data.featuredEndsAt : null,
  };
}

export function packageRelationsData(input: ParsedPackage) {
  return {
    includedItems: input.includedItems.map((text, sortOrder) => ({ text, sortOrder })),
    excludedItems: input.excludedItems.map((text, sortOrder) => ({ text, sortOrder })),
    itinerary: input.itinerary.map((item, sortOrder) => ({ ...item, sortOrder })),
  };
}

export function packageJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (_key, item) => typeof item === "bigint" ? item.toString() : item));
}
