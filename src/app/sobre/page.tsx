import type { Metadata } from "next";
import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { getPublicCompany, getPublicPackages } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: "Conheça a D’Hages Turismo, agência de Belém que cria viagens acolhedoras, seguras e bem acompanhadas.",
};

export default async function AboutPage() {
  const [company, packages] = await Promise.all([getPublicCompany(), getPublicPackages()]);
  return <PublicShell><section className="page-hero compact-hero"><div className="shell"><span className="eyebrow eyebrow-light">Nossa história</span><h1>{company.aboutTitle}</h1><p>Somos de {company.city} e acreditamos que cada viagem começa com uma boa conversa.</p></div></section><section className="section shell about-layout"><div><span className="eyebrow">{company.name}</span><h2>Planos bem cuidados viram memórias para a vida toda.</h2><p className="pre-line">{company.aboutText}</p><p>Nosso atendimento é próximo: escutamos o que você busca, explicamos cada etapa e acompanhamos a jornada até a volta para casa.</p></div><img src={packages[0]?.image ?? "/media/destinations/ajuruteua.webp"} alt="Viagem organizada pela D’Hages Turismo" /></section><section className="section section-soft"><div className="shell values-grid"><div><HeartHandshake /><h3>Missão</h3><p>{company.mission}</p></div><div><Sparkles /><h3>Visão</h3><p>{company.vision}</p></div><div><ShieldCheck /><h3>Valores</h3><p>{company.valuesText}</p></div></div></section></PublicShell>;
}
