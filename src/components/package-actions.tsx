"use client";

import { useState } from "react";
import { MessageCircle, Share2 } from "lucide-react";
import { whatsappUrl } from "@/data/demo";

export function SharePackageButton({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title, text, url }).catch(() => undefined);
    else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  }
  return <button className="share-button" type="button" onClick={share} aria-label="Compartilhar pacote"><Share2 />{copied && <span className="share-feedback">Link copiado</span>}</button>;
}

export function WhatsappInterestLink({ packageId, packageName, message, number, label }: { packageId?: string; packageName: string; message: string; number?: string; label: string }) {
  function track() {
    if (!packageId || !/^c[a-z0-9]{20,}$/i.test(packageId)) return;
    void fetch("/api/leads/whatsapp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ packageId, message: `Interesse em ${packageName}` }), keepalive: true });
  }
  return <a className="button button-gold button-block" href={whatsappUrl(message, number)} target="_blank" rel="noreferrer" onClick={track}><MessageCircle size={19} /> {label}</a>;
}
