"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Image as ImageIcon,
  Play,
  Star,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react";

type MediaKind = "image" | "video";

type MediaDraft = {
  id: string;
  file: File;
  previewUrl: string;
  kind: MediaKind;
};

const maxFiles = 12;
const maxImageBytes = 15 * 1024 * 1024;
const maxVideoBytes = 120 * 1024 * 1024;

const formatBytes = (bytes: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(
    bytes / 1024 / 1024,
  );

export function MediaUploader({ packageId }: { packageId?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrls = useRef(new Set<string>());
  const [items, setItems] = useState<MediaDraft[]>([]);
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  useEffect(
    () => () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const counts = useMemo(
    () => ({
      images: items.filter((item) => item.kind === "image").length,
      videos: items.filter((item) => item.kind === "video").length,
    }),
    [items],
  );

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploadMessage(null);

    const availableSlots = Math.max(0, maxFiles - items.length);
    const selected = Array.from(files).slice(0, availableSlots);
    const next: MediaDraft[] = [];

    for (const file of selected) {
      const kind: MediaKind | null = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : null;

      if (!kind) {
        setError(`O arquivo “${file.name}” não é uma imagem ou vídeo compatível.`);
        continue;
      }

      const limit = kind === "image" ? maxImageBytes : maxVideoBytes;
      if (file.size > limit) {
        setError(
          `“${file.name}” excede ${kind === "image" ? "15 MB" : "120 MB"}.`,
        );
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      objectUrls.current.add(previewUrl);
      next.push({ id: crypto.randomUUID(), file, previewUrl, kind });
    }

    if (files.length > availableSlots) {
      setError(`Você pode adicionar no máximo ${maxFiles} arquivos por pacote.`);
    }

    if (next.length) {
      setItems((current) => [...current, ...next]);
      setPrimaryId((current) => current ?? next[0].id);
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function removeItem(id: string) {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        objectUrls.current.delete(target.previewUrl);
      }
      const remaining = current.filter((item) => item.id !== id);
      setPrimaryId((currentPrimary) =>
        currentPrimary === id ? (remaining[0]?.id ?? null) : currentPrimary,
      );
      return remaining;
    });
  }

  function moveItem(index: number, direction: -1 | 1) {
    setItems((current) => {
      const destination = index + direction;
      if (destination < 0 || destination >= current.length) return current;
      const reordered = [...current];
      [reordered[index], reordered[destination]] = [
        reordered[destination],
        reordered[index],
      ];
      return reordered;
    });
  }

  async function upload() {
    if (!packageId || !items.length) return;
    setUploading(true);
    setError(null);
    setUploadMessage(null);
    const payload = new FormData();
    items.forEach((item) => payload.append("files", item.file));
    const csrfToken = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("dhages_admin_csrf="))
      ?.split("=")[1];

    try {
      const response = await fetch(`/api/admin/packages/${packageId}/media`, {
        method: "POST",
        headers: csrfToken ? { "x-csrf-token": csrfToken } : undefined,
        body: payload,
      });
      const result = (await response.json()) as { error?: string; media?: Array<{ id: string }> };
      if (!response.ok) throw new Error(result.error ?? "Falha ao enviar as mídias.");
      const primaryIndex = items.findIndex((item) => item.id === primaryId);
      const uploadedPrimary = primaryIndex >= 0 ? result.media?.[primaryIndex] : undefined;
      if (uploadedPrimary) {
        await fetch(`/api/admin/packages/${packageId}/media/${uploadedPrimary.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json", ...(csrfToken ? { "x-csrf-token": csrfToken } : {}) },
          body: JSON.stringify({ primary: true }),
        });
      }
      setUploadMessage(`${result.media?.length ?? items.length} mídia(s) enviada(s) com sucesso.`);
      items.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
        objectUrls.current.delete(item.previewUrl);
      });
      setItems([]);
      setPrimaryId(null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Falha ao enviar as mídias.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="media-uploader" aria-labelledby="media-uploader-title">
      <div className="media-heading">
        <div>
          <span className="editor-eyebrow">Galeria do pacote</span>
          <h2 id="media-uploader-title">Imagens e vídeos</h2>
          <p>Adicione até 12 arquivos e defina a ordem, a capa ou o vídeo de prévia.</p>
        </div>
        <div className="media-counts" aria-label="Resumo dos arquivos">
          <span><ImageIcon size={15} /> {counts.images} imagens</span>
          <span><Video size={15} /> {counts.videos} vídeos</span>
        </div>
      </div>

      <button
        className="media-dropzone"
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        <span><UploadCloud /></span>
        <strong>Selecionar imagens e vídeos</strong>
        <small>JPEG, PNG, WebP, AVIF, MP4, WebM ou MOV</small>
        <small>As imagens serão convertidas automaticamente para WebP.</small>
      </button>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
        onChange={(event) => addFiles(event.target.files)}
      />

      {error && <div className="media-feedback error"><CircleAlert size={17} /> {error}</div>}
      {uploadMessage && <div className="media-feedback success">{uploadMessage}</div>}

      {items.length ? (
        <div className="media-preview-grid">
          {items.map((item, index) => (
            <article className={`media-preview ${primaryId === item.id ? "primary" : ""}`} key={item.id}>
              <div className="media-preview-frame">
                {item.kind === "image" ? (
                  <img src={item.previewUrl} alt={`Prévia de ${item.file.name}`} />
                ) : (
                  <video src={item.previewUrl} muted playsInline preload="metadata" />
                )}
                <span className="media-type">
                  {item.kind === "video" ? <><Play size={12} fill="currentColor" /> Vídeo</> : <><ImageIcon size={12} /> Imagem</>}
                </span>
                {primaryId === item.id && (
                  <span className="media-primary"><Star size={12} fill="currentColor" /> {item.kind === "image" ? "Capa" : "Prévia"}</span>
                )}
              </div>
              <div className="media-preview-info">
                <strong title={item.file.name}>{item.file.name}</strong>
                <small>{formatBytes(item.file.size)} MB</small>
              </div>
              <div className="media-actions">
                <button type="button" disabled={index === 0} onClick={() => moveItem(index, -1)} aria-label="Mover para a esquerda"><ArrowLeft /></button>
                <button type="button" disabled={index === items.length - 1} onClick={() => moveItem(index, 1)} aria-label="Mover para a direita"><ArrowRight /></button>
                <button type="button" className={primaryId === item.id ? "selected" : ""} onClick={() => setPrimaryId(item.id)} aria-label="Definir como mídia principal"><Star /></button>
                <button type="button" className="danger" onClick={() => removeItem(item.id)} aria-label="Remover arquivo"><Trash2 /></button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="media-empty"><ImageIcon /><span>Nenhuma mídia selecionada ainda.</span></div>
      )}

      <div className="media-footer">
        <span>{items.length}/{maxFiles} arquivos</span>
        <button className="button button-primary" type="button" disabled={!packageId || !items.length || uploading} onClick={upload}>
          {uploading ? "Enviando..." : packageId ? "Enviar mídias" : "Salve o pacote para enviar"}
        </button>
      </div>
    </section>
  );
}
