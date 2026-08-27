import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { storageProvider } from "@/lib/storage/local-storage-provider";

const relative = (path: string) => path.replace(/^\/uploads\/?/, "");

describe("armazenamento de mídias", () => {
  it("converte imagem para WebP e cria thumbnail", async () => {
    const source = await sharp({ create: { width: 900, height: 600, channels: 3, background: "#0b628e" } }).png().toBuffer();
    const saved = await storageProvider.savePackageMedia({ packageId: "vitest-image", originalName: "teste.png", buffer: source });
    try {
      expect(saved.type).toBe("IMAGE");
      expect(saved.mimeType).toBe("image/webp");
      expect(saved.path.endsWith(".webp")).toBe(true);
      expect(saved.thumbnailPath?.endsWith("-thumb.webp")).toBe(true);
      expect((await readFile(new URL(`../storage/uploads/${relative(saved.path)}`, import.meta.url))).length).toBeGreaterThan(0);
    } finally {
      await storageProvider.delete(relative(saved.path));
      if (saved.thumbnailPath) await storageProvider.delete(relative(saved.thumbnailPath));
    }
  });

  it("aceita o vídeo Full HD local e gera pôster", async () => {
    const source = await readFile(new URL("../public/media/hero-amazonia.mp4", import.meta.url));
    const saved = await storageProvider.savePackageMedia({ packageId: "vitest-video", originalName: "amazonia.mp4", buffer: source });
    try {
      expect(saved.type).toBe("VIDEO");
      expect(saved.mimeType).toBe("video/mp4");
      expect(saved.posterPath?.endsWith("-poster.webp")).toBe(true);
    } finally {
      await storageProvider.delete(relative(saved.path));
      if (saved.posterPath) await storageProvider.delete(relative(saved.posterPath));
    }
  });

  it("rejeita conteúdo que não corresponde a uma mídia permitida", async () => {
    await expect(storageProvider.savePackageMedia({ packageId: "vitest-invalid", originalName: "arquivo.jpg", buffer: Buffer.from("conteúdo malicioso") })).rejects.toThrow();
  });
});
