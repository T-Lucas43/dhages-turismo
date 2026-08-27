import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BedDouble, CalendarDays, Check, Clock3, CreditCard, FileCheck2, MapPin, Soup, UserRoundCheck, Users, X } from "lucide-react";
import { PackageCard } from "@/components/package-card";
import { SharePackageButton, WhatsappInterestLink } from "@/components/package-actions";
import { PublicShell } from "@/components/public-shell";
import { formatCurrency } from "@/data/demo";
import { getPublicPackageBySlug, getPublicPackages } from "@/lib/public-data";

export async function generateMetadata({ params }: PageProps<"/pacotes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublicPackageBySlug(slug);
  if (!item) return { title: "Pacote não encontrado" };
  return {
    title: item.seoTitle || item.name,
    description: item.seoDescription || item.summary,
    alternates: { canonical: `/pacotes/${item.slug}` },
    openGraph: { title: item.seoTitle || item.name, description: item.seoDescription || item.summary, type: "website", images: [{ url: item.shareImagePath || item.image }] },
  };
}

const availabilityLabels = { AVAILABLE: "Disponível", FEW_SPOTS: "Poucas vagas", SOLD_OUT: "Esgotado", CANCELLED: "Cancelado" };

export default async function PackageDetailPage({ params }: PageProps<"/pacotes/[slug]">) {
  const { slug } = await params;
  const [item, packages] = await Promise.all([getPublicPackageBySlug(slug, true), getPublicPackages()]);
  if (!item) notFound();
  const soldOut = item.availability === "SOLD_OUT";
  const cancelled = item.availability === "CANCELLED";
  const waitingList = soldOut && item.waitingListEnabled;
  const message = waitingList ? `Olá! Gostaria de entrar na lista de espera do pacote ${item.name}, com saída em ${item.departure}.` : `Olá! Gostaria de receber mais informações sobre o pacote ${item.name}, com saída em ${item.departure}.`;
  const sideMedia = item.media.filter((media) => media.path !== item.image).slice(0, 2);
  const related = packages.filter((entry) => entry.slug !== item.slug && (entry.categorySlug === item.categorySlug || entry.destinationSlug === item.destinationSlug)).slice(0, 3);

  return <PublicShell>
    <section className="detail-top shell">
      <Link href="/pacotes" className="back-link"><ArrowLeft size={18} /> Voltar aos pacotes</Link>
      <div className="detail-gallery"><div className="detail-main-image"><img src={item.image} alt={`Paisagem de ${item.destination}`} /><span>{item.category}</span></div><div className="detail-side-images">{sideMedia.length ? sideMedia.map((media) => media.type === "VIDEO" ? <video key={media.id} src={media.path} poster={media.posterPath ?? undefined} controls preload="metadata" aria-label={media.altText ?? `Vídeo de ${item.destination}`} /> : <img key={media.id} src={media.thumbnailPath ?? media.path} alt={media.altText ?? `Experiência em ${item.destination}`} />) : <><img src={item.image} alt="Experiência de viagem" /><img src={item.image} alt="Paisagem do roteiro" /></>}</div></div>
    </section>
    <section className="detail-layout shell">
      <div className="detail-content">
        <div className="detail-heading"><div><span className={`status status-${item.availability.toLowerCase()}`}>{availabilityLabels[item.availability]}</span><h1>{item.name}</h1><p><MapPin size={18} /> {item.destination}, {item.city} — {item.stateCode}</p></div><SharePackageButton title={item.name} text={item.summary} /></div>
        <div className="detail-highlights"><span><CalendarDays /><small>Saída</small><strong>{item.departure}</strong></span><span><CalendarDays /><small>Retorno</small><strong>{item.returnDate}</strong></span><span><Clock3 /><small>Duração</small><strong>{item.duration}</strong></span><span><Users /><small>Embarque</small><strong>{item.boardingLocation ?? item.city}{item.boardingTime ? ` · ${item.boardingTime}` : ""}</strong></span></div>
        <div className="detail-section"><h2>Sobre esta experiência</h2><p className="detail-summary">{item.summary}</p><p className="pre-line">{item.description}</p></div>
        <div className="included-grid"><div><h2>O que está incluso</h2>{item.includedItems.length ? item.includedItems.map((value) => <p key={value}><Check size={17} /> {value}</p>) : <p>Nenhum item informado.</p>}</div><div className="not-included"><h2>Não está incluso</h2>{item.excludedItems.length ? item.excludedItems.map((value) => <p key={value}><X size={17} /> {value}</p>) : <p>Consulte nossa equipe.</p>}</div></div>
        {item.itinerary.length > 0 && <div className="detail-section"><h2>Roteiro da viagem</h2><div className="timeline">{item.itinerary.map((step, index) => <div key={step.id}><span>{step.dayNumber ?? index + 1}</span><div><strong>{step.time ? `${step.time} · ` : ""}{step.title}</strong><p>{step.details}</p></div></div>)}</div></div>}
        <div className="detail-section package-extra-grid">{item.accommodation && <div><BedDouble /><h3>Hospedagem</h3><p>{item.accommodation}</p></div>}{item.transport && <div><Users /><h3>Transporte</h3><p>{item.transport}</p></div>}{item.meals && <div><Soup /><h3>Alimentação</h3><p>{item.meals}</p></div>}{item.guide && <div><UserRoundCheck /><h3>Guia</h3><p>{item.guide}</p></div>}{item.requiredDocuments && <div><FileCheck2 /><h3>Documentos</h3><p>{item.requiredDocuments}</p></div>}{item.paymentMethods && <div><CreditCard /><h3>Pagamento</h3><p>{item.paymentMethods}</p></div>}</div>
        {item.childPolicy && <div className="detail-section info-note"><h2>Política para crianças</h2><p>{item.childPolicy}</p></div>}
        {item.importantNotes && <div className="detail-section info-note"><h2>Informações importantes</h2><p>{item.importantNotes}</p></div>}
        {item.mapUrl && <div className="detail-section"><h2>Localização</h2><a className="text-link" href={item.mapUrl} target="_blank" rel="noreferrer"><MapPin /> Abrir localização no mapa</a></div>}
        {item.faqs.length > 0 && <div className="detail-section"><h2>Perguntas sobre este pacote</h2><div className="faq-list">{item.faqs.map((faq) => <details key={faq.id}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></div>}
      </div>
      <aside className="booking-card"><span>A partir de</span><strong>{formatCurrency(item.price)}</strong><small>à vista por pessoa</small><div className="divider" /><b>{item.installments}</b>{item.installmentTotal && <p>Total parcelado: {formatCurrency(item.installmentTotal)}</p>}{item.showSpots && item.remainingSpots != null && <p><strong>{item.remainingSpots}</strong> vaga{item.remainingSpots === 1 ? "" : "s"} restante{item.remainingSpots === 1 ? "" : "s"}</p>}{cancelled ? <div className="booking-unavailable">Este pacote foi cancelado. Fale com a equipe para alternativas.</div> : soldOut && !waitingList ? <div className="booking-unavailable">As vagas estão esgotadas e a lista de espera não está aberta.</div> : <WhatsappInterestLink packageId={item.id} packageName={item.name} message={message} number={item.whatsappNumber} label={waitingList ? "Entrar na lista de espera" : "Tenho interesse"} />}<small className="booking-help">Você será atendido pela nossa equipe no WhatsApp.</small></aside>
    </section>
    {related.length > 0 && <section className="section section-soft"><div className="shell"><h2 className="related-title">Você também pode gostar</h2><div className="package-grid">{related.map((entry) => <PackageCard key={entry.slug} item={entry} />)}</div></div></section>}
  </PublicShell>;
}
