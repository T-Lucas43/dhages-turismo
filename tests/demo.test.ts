import { describe, expect, it } from "vitest";
import { packages } from "@/data/demo";

describe("catálogo demonstrativo", () => {
  it("mantém cinco pacotes navegáveis com dados para os filtros", () => {
    expect(packages).toHaveLength(5);
    expect(new Set(packages.map((item) => item.slug)).size).toBe(packages.length);

    for (const item of packages) {
      expect(item.destinationSlug).toBeTruthy();
      expect(item.categorySlug).toBeTruthy();
      expect(item.city).toBeTruthy();
      expect(item.stateCode).toMatch(/^[A-Z]{2}$/);
      expect(item.departureIso).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(item.durationDays).toBeGreaterThan(0);
    }
  });
});
