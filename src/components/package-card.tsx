"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3, MapPin, MessageCircle, Pause, Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { formatCurrency, TravelPackage, whatsappUrl } from "@/data/demo";

const availabilityLabel = {
  AVAILABLE: "Disponível",
  FEW_SPOTS: "Poucas vagas",
  SOLD_OUT: "Esgotado",
  CANCELLED: "Cancelado",
};

export function PackageCard({ item }: { item: TravelPackage }) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const waitingList = item.availability === "SOLD_OUT";
  const message = waitingList
    ? `Olá! Gostaria de entrar na lista de espera do pacote ${item.name}, com saída em ${item.departure}.`
    : `Olá! Gostaria de receber mais informações sobre o pacote ${item.name}, com saída em ${item.departure}.`;

  async function playPreview() {
    if (reduceMotion || !videoRef.current) return;
    videoRef.current.load();
    await videoRef.current.play().catch(() => undefined);
    setVideoPlaying(!videoRef.current.paused);
  }

  function stopPreview() {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setVideoPlaying(false);
  }

  function trackWhatsapp() {
    if (!item.id || !/^c[a-z0-9]{20,}$/i.test(item.id)) return;
    void fetch("/api/leads/whatsapp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ packageId: item.id, message: `Interesse em ${item.name}` }), keepalive: true });
  }

  return (
    <motion.article
      className="package-card"
      initial="rest"
      whileHover={reduceMotion ? undefined : "hover"}
      whileTap={reduceMotion ? undefined : { scale: 0.992 }}
      variants={{ rest: { y: 0 }, hover: { y: -7 } }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      <div className="package-image-wrap" onMouseEnter={item.previewVideo ? playPreview : undefined} onMouseLeave={item.previewVideo ? stopPreview : undefined}>
        <motion.img src={item.image} alt={`Vista do destino ${item.destination}`} className="package-image" loading="lazy" variants={{ rest: { scale: 1 }, hover: { scale: 1.045 } }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} />
        {item.previewVideo && !reduceMotion && <><video ref={videoRef} className={`package-preview-video ${videoPlaying ? "playing" : ""}`} src={item.previewVideo} poster={item.videoPoster ?? item.image} muted loop playsInline preload="none" aria-label={`Prévia em vídeo de ${item.name}`} /><button className="video-toggle" type="button" onClick={() => videoPlaying ? stopPreview() : void playPreview()} aria-label={videoPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}>{videoPlaying ? <Pause /> : <Play fill="currentColor" />}</button></>}
        <div className="card-badges">
          {item.featured && <span className="badge badge-featured">Destaque</span>}
          <span className={`badge badge-${item.availability.toLowerCase()}`}>{availabilityLabel[item.availability]}</span>
        </div>
        <span className="category-pill">{item.category}</span>
      </div>
      <div className="package-body">
        <div className="package-location"><MapPin size={15} /> {item.destination} · {item.state}</div>
        <h3>{item.name}</h3>
        <div className="package-meta">
          <span><CalendarDays size={16} /> {item.departure}</span>
          <span><Clock3 size={16} /> {item.duration}</span>
        </div>
        <div className="package-price-row">
          <div><small>A partir de</small><strong>{formatCurrency(item.price)}</strong><span>{item.installments}</span></div>
        </div>
        <div className="card-actions">
          <Link className="button button-primary" href={`/pacotes/${item.slug}`}>Ver detalhes <ArrowUpRight size={17} /></Link>
          <a className="icon-button" href={whatsappUrl(message, item.whatsappNumber)} target="_blank" rel="noreferrer" aria-label={`Falar no WhatsApp sobre ${item.name}`} onClick={trackWhatsapp}><MessageCircle size={20} /></a>
        </div>
      </div>
    </motion.article>
  );
}
