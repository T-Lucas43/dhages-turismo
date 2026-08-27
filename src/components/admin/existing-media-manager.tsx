"use client";

import { useState } from "react";
import { Image as ImageIcon, Play, Star, Trash2, Video } from "lucide-react";

type ExistingMedia = {
  id: string;
  type: "IMAGE" | "VIDEO";
  path: string;
  thumbnailPath: string | null;
  posterPath: string | null;
  altText: string | null;
  isCover: boolean;
  isPreview: boolean;
  sortOrder: number;
};

function csrfToken() {
  return document.cookie.split("; ").find((cookie) => cookie.startsWith("dhages_admin_csrf="))?.split("=")[1];
}

export function ExistingMediaManager({ packageId, initialMedia }: { packageId: string; initialMedia: ExistingMedia[] }) {
  const [media, setMedia] = useState(initialMedia);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateMedia(item: ExistingMedia, payload: { primary?: boolean; altText?: string; sortOrder?: number }) {
    setBusyId(item.id);
    setMessage(null);
    const response = await fetch(`/api/admin/packages/${packageId}/media/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-csrf-token": csrfToken() ?? "" },
      body: JSON.stringify(payload),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) setMessage(result.error ?? "Não foi possível atualizar a mídia.");
    else {
      setMedia((current) => current.map((currentItem) => ({
        ...currentItem,
        isCover: item.type === "IMAGE" && payload.primary ? currentItem.id === item.id : currentItem.isCover,
        isPreview: item.type === "VIDEO" && payload.primary ? currentItem.id === item.id : currentItem.isPreview,
        altText: currentItem.id === item.id && typeof payload.altText === "string" ? payload.altText : currentItem.altText,
      })));
      setMessage("Mídia atualizada.");
    }
    setBusyId(null);
  }

  async function removeMedia(item: ExistingMedia) {
    if (!window.confirm("Remover esta mídia do pacote?")) return;
    setBusyId(item.id);
    const response = await fetch(`/api/admin/packages/${packageId}/media/${item.id}`, {
      method: "DELETE",
      headers: { "x-csrf-token": csrfToken() ?? "" },
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) setMessage(result.error ?? "Não foi possível remover a mídia.");
    else {
      setMedia((current) => current.filter((currentItem) => currentItem.id !== item.id));
      setMessage("Mídia removida.");
    }
    setBusyId(null);
  }

  async function uploadPoster(item: ExistingMedia, file?: File) {
    if (!file) return;
    setBusyId(item.id);
    const body = new FormData();
    body.append("poster", file);
    const response = await fetch(`/api/admin/packages/${packageId}/media/${item.id}`, { method: "POST", headers: { "x-csrf-token": csrfToken() ?? "" }, body });
    const result = await response.json() as { error?: string; media?: { posterPath: string | null; thumbnailPath: string | null } };
    if (!response.ok) setMessage(result.error ?? "Não foi possível enviar o pôster.");
    else {
      setMedia((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, posterPath: result.media?.posterPath ?? currentItem.posterPath, thumbnailPath: result.media?.thumbnailPath ?? currentItem.thumbnailPath } : currentItem));
      setMessage("Pôster do vídeo atualizado.");
    }
    setBusyId(null);
  }

  if (!media.length) return null;
  return (
    <section className="editor-card existing-media">
      <div className="editor-card-heading"><span>05</span><div><h2>Mídias já salvas</h2><p>Escolha a capa, o vídeo de prévia e textos alternativos.</p></div></div>
      {message && <p className="admin-form-message">{message}</p>}
      <div className="media-preview-grid">
        {media.map((item) => (
          <article className={`media-preview ${item.isCover || item.isPreview ? "primary" : ""}`} key={item.id}>
            <div className="media-preview-frame">
              {item.type === "IMAGE" ? <img src={item.thumbnailPath ?? item.path} alt={item.altText ?? ""} /> : <video src={item.path} poster={item.posterPath ?? undefined} muted playsInline preload="metadata" />}
              <span className="media-type">{item.type === "VIDEO" ? <><Play size={12} /> Vídeo</> : <><ImageIcon size={12} /> Imagem</>}</span>
              {(item.isCover || item.isPreview) && <span className="media-primary"><Star size={12} fill="currentColor" /> {item.isCover ? "Capa" : "Prévia"}</span>}
            </div>
            <label className="media-alt-field"><span>Texto alternativo</span><input defaultValue={item.altText ?? ""} onBlur={(event) => updateMedia(item, { altText: event.currentTarget.value })} /></label>
            {item.type === "VIDEO" && <label className="media-poster-field"><span>Trocar pôster</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busyId === item.id} onChange={(event) => uploadPoster(item, event.target.files?.[0])} /></label>}
            <div className="media-actions">
              <button type="button" disabled={busyId === item.id} onClick={() => updateMedia(item, { primary: true })} aria-label={item.type === "IMAGE" ? "Definir como capa" : "Definir como vídeo de prévia"}><Star /></button>
              <button className="danger" type="button" disabled={busyId === item.id} onClick={() => removeMedia(item)} aria-label="Remover mídia"><Trash2 /></button>
              <span className="media-kind-label">{item.type === "VIDEO" ? <Video /> : <ImageIcon />}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
