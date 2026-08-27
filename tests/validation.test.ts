import { describe, expect, it } from "vitest";
import { leadSchema } from "@/lib/validation/lead";
import { packageActionSchema, packageFormSchema } from "@/lib/validation/package";

const validPackage = {
  name: "Ajuruteua Especial", slug: "ajuruteua-especial", summary: "Um pacote completo para aproveitar o litoral paraense.", description: "Descrição detalhada e suficientemente longa para explicar toda a experiência oferecida aos viajantes.", categoryId: "cm12345678901234567890123", destinationId: "cm12345678901234567890124", city: "Bragança", state: "Pará", stateCode: "pa", departureAt: "2026-09-10T12:00:00Z", returnAt: "2026-09-12T12:00:00Z", durationDays: 3, cashPrice: 500, installmentCount: 5, totalSpots: 30, remainingSpots: 5, publicationStatus: "DRAFT", availabilityStatus: "FEW_SPOTS", featured: false, waitingListEnabled: true, showSpots: true, includedItems: ["Transporte"], excludedItems: ["Despesas pessoais"], itinerary: [{ dayNumber: 1, title: "Embarque", details: "Recepção e partida." }],
};

describe("validações administrativas", () => {
  it("aceita um pacote completo e normaliza a UF", () => {
    const result = packageFormSchema.safeParse(validPackage);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.stateCode).toBe("PA");
  });

  it("preserva campos opcionais vazios como nulos", () => {
    const result = packageFormSchema.safeParse({
      ...validPackage,
      totalSpots: null,
      remainingSpots: null,
      installmentValue: null,
      publishedAt: null,
      seoTitle: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalSpots).toBeNull();
      expect(result.data.remainingSpots).toBeNull();
      expect(result.data.installmentValue).toBeNull();
      expect(result.data.publishedAt).toBeNull();
      expect(result.data.seoTitle).toBeNull();
    }
  });

  it("rejeita retorno anterior e vagas restantes acima do total", () => {
    const result = packageFormSchema.safeParse({ ...validPackage, returnAt: "2026-09-09T12:00:00Z", remainingSpots: 31 });
    expect(result.success).toBe(false);
  });

  it("protege a exclusão definitiva com confirmação", () => {
    expect(packageActionSchema.parse({ action: "DELETE_PERMANENTLY", confirmation: "Ajuruteua" }).action).toBe("DELETE_PERMANENTLY");
    expect(packageActionSchema.safeParse({ action: "INVALID" }).success).toBe(false);
  });

  it("valida consentimento e campos mínimos do lead", () => {
    expect(leadSchema.safeParse({ name: "Maria", phone: "91999999999", email: "", message: "Quero viajar", origin: "CONTACT_FORM", consent: true }).success).toBe(true);
    expect(leadSchema.safeParse({ name: "M", phone: "123", message: "Oi", consent: false }).success).toBe(false);
  });
});
