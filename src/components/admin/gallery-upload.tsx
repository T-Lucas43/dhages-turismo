"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, UploadCloud } from "lucide-react";

function csrfToken() {
  return document.cookie.split("; ").find((cookie) => cookie.startsWith("dhages_admin_csrf="))?.split("=")[1];
}

export function GalleryUpload() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const response = await fetch("/api/admin/gallery/upload", { method: "POST", headers: { "x-csrf-token": csrfToken() ?? "" }, body: new FormData(event.currentTarget) });
    const result = await response.json() as { error?: string };
    setMessage(response.ok ? "Mídia processada e adicionada à galeria." : result.error ?? "Falha no envio.");
    setBusy(false);
    if (response.ok) {
      event.currentTarget.reset();
      router.refresh();
    }
  }
  return <form className="admin-panel gallery-upload-card" onSubmit={submit}><div><span><ImagePlus /></span><div><strong>Enviar mídia para a galeria</strong><small>Imagens são convertidas para WebP; vídeos MP4, WebM e MOV são preservados.</small></div></div><div className="gallery-upload-fields"><input name="title" placeholder="Título da viagem" /><input name="altText" placeholder="Texto alternativo" /><input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime" required /><button className="button button-primary" type="submit" disabled={busy}><UploadCloud /> {busy ? "Enviando..." : "Enviar arquivo"}</button></div>{message && <p>{message}</p>}</form>;
}
