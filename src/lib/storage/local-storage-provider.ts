import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { serverEnv } from "../env";
import type { SavedMedia, StorageProvider } from "./types";

const acceptedImages = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const acceptedVideos = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export class LocalStorageProvider implements StorageProvider {
  private readonly root = resolve(serverEnv.UPLOAD_DIR);

  private absolute(relativePath: string) {
    const normalized = relativePath.replace(/^[/\\]+/, "").replaceAll("/", sep);
    const target = resolve(this.root, normalized);
    if (target !== this.root && !target.startsWith(`${this.root}${sep}`)) throw new Error("Caminho de mídia inválido.");
    return target;
  }

  private publicUrl(relativePath: string) {
    return `${serverEnv.UPLOAD_BASE_URL.replace(/\/$/, "")}/${relativePath.replaceAll("\\", "/")}`;
  }

  async savePackageMedia({ packageId, originalName, buffer }: { packageId: string; originalName: string; buffer: Buffer }): Promise<SavedMedia> {
    const detected = await fileTypeFromBuffer(buffer);
    if (!detected) throw new Error(`Não foi possível identificar o arquivo ${originalName}.`);
    const baseDir = `packages/${packageId}`;
    await mkdir(this.absolute(baseDir), { recursive: true });
    const fileId = randomUUID();

    if (acceptedImages.has(detected.mime)) {
      if (buffer.byteLength > serverEnv.MAX_IMAGE_UPLOAD_BYTES) throw new Error(`A imagem ${originalName} excede o limite permitido.`);
      const image = sharp(buffer, { failOn: "error" }).rotate();
      const metadata = await image.metadata();
      const mainRelative = `${baseDir}/${fileId}.webp`;
      const thumbRelative = `${baseDir}/${fileId}-thumb.webp`;
      await Promise.all([
        image.clone().resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toFile(this.absolute(mainRelative)),
        image.clone().resize({ width: 640, height: 420, fit: "cover", position: "attention" }).webp({ quality: 78 }).toFile(this.absolute(thumbRelative)),
      ]);
      return { type: "IMAGE", path: this.publicUrl(mainRelative), thumbnailPath: this.publicUrl(thumbRelative), posterPath: null, mimeType: "image/webp", sizeBytes: buffer.byteLength, width: metadata.width ?? null, height: metadata.height ?? null };
    }

    if (acceptedVideos.has(detected.mime)) {
      if (buffer.byteLength > serverEnv.MAX_VIDEO_UPLOAD_BYTES) throw new Error(`O vídeo ${originalName} excede o limite permitido.`);
      const safeExtension = detected.mime === "video/webm" ? "webm" : detected.mime === "video/quicktime" ? "mov" : "mp4";
      const videoRelative = `${baseDir}/${fileId}.${safeExtension}`;
      const posterRelative = `${baseDir}/${fileId}-poster.webp`;
      await writeFile(this.absolute(videoRelative), buffer, { flag: "wx" });
      const posterSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="1280" height="720" fill="#062e47"/><circle cx="640" cy="315" r="72" fill="#e9c35c"/><path d="M625 275L685 315L625 355Z" fill="#062e47"/><text x="640" y="465" fill="#fffdf7" font-family="Arial" font-size="36" text-anchor="middle">Vídeo do pacote</text></svg>`);
      await sharp(posterSvg).webp({ quality: 88 }).toFile(this.absolute(posterRelative));
      return { type: "VIDEO", path: this.publicUrl(videoRelative), thumbnailPath: this.publicUrl(posterRelative), posterPath: this.publicUrl(posterRelative), mimeType: detected.mime, sizeBytes: buffer.byteLength, width: null, height: null };
    }

    throw new Error(`O formato ${extname(originalName) || detected.mime} não é permitido.`);
  }

  async read(relativePath: string) { return readFile(this.absolute(relativePath)); }

  async delete(relativePath: string) { await rm(this.absolute(relativePath), { force: true }); }
}

export const storageProvider = new LocalStorageProvider();
