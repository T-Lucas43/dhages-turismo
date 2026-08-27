import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { getPublicDestinations } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Destinos",
  description: "Explore destinos no Pará, Maranhão e região Norte com os roteiros selecionados da D’Hages Turismo.",
};

export default async function DestinationsPage() {
  const destinations = await getPublicDestinations();
  return <PublicShell><section className="page-hero compact-hero"><div className="shell"><span className="eyebrow eyebrow-light">Explore o mapa</span><h1>Destinos para viver de perto</h1><p>Do Pará ao Maranhão, descubra experiências escolhidas com cuidado.</p></div></section><section className="section shell">{destinations.length ? <div className="destination-grid">{destinations.map((item) => <Link href={`/pacotes?destino=${item.slug}`} key={item.id} className="destination-card"><img src={item.coverPath} alt={item.name} /><span className="destination-overlay" /><div><span><MapPin size={16} /> {item.state}</span><h2>{item.name}</h2><p>{item.packageCount} pacote{item.packageCount === 1 ? "" : "s"} ativo{item.packageCount === 1 ? "" : "s"}</p><strong>Explorar <ArrowRight size={17} /></strong></div></Link>)}</div> : <div className="public-empty"><MapPin /><strong>Novos destinos em preparação</strong><p>Volte em breve ou fale com a nossa equipe.</p></div>}</section></PublicShell>;
}
