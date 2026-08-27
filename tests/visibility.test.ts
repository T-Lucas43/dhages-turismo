import { describe, expect, it } from "vitest";
import { isPackagePublic, publicPackageWhere } from "@/lib/packages/visibility";

const now = new Date("2026-08-27T15:00:00.000Z");
const base = { publicationStatus: "PUBLISHED" as const, publishedAt: null, publicationEndsAt: null, deletedAt: null };

describe("visibilidade pública central", () => {
  it("exibe somente um pacote publicado dentro do período", () => {
    expect(isPackagePublic(base, now)).toBe(true);
    expect(isPackagePublic({ ...base, publishedAt: new Date("2026-08-28T00:00:00Z") }, now)).toBe(false);
    expect(isPackagePublic({ ...base, publicationEndsAt: new Date("2026-08-26T00:00:00Z") }, now)).toBe(false);
  });

  it.each(["DRAFT", "INACTIVE", "ARCHIVED"] as const)("oculta o estado %s", (publicationStatus) => {
    expect(isPackagePublic({ ...base, publicationStatus }, now)).toBe(false);
  });

  it("oculta registros excluídos e fornece um filtro Prisma central", () => {
    expect(isPackagePublic({ ...base, deletedAt: now }, now)).toBe(false);
    expect(publicPackageWhere(now)).toMatchObject({ publicationStatus: "PUBLISHED", deletedAt: null });
  });
});
