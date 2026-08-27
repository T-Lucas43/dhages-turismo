import type { Metadata } from "next";
import { AtSign, Clock3, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PublicShell } from "@/components/public-shell";
import { whatsappUrl } from "@/data/demo";
import { isFrontendOnly } from "@/lib/env";
import { getPublicCompany } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Contato",
  description: "Converse com a D’Hages Turismo em Belém e planeje sua próxima viagem com atendimento próximo.",
};

export default async function ContactPage() {
  const company = await getPublicCompany();
  return <PublicShell><section className="page-hero compact-hero"><div className="shell"><span className="eyebrow eyebrow-light">Estamos por perto</span><h1>Vamos conversar sobre sua próxima viagem?</h1><p>Envie uma mensagem ou visite a nossa equipe em {company.city}.</p></div></section><section className="section shell contact-layout"><div className="contact-cards"><a href={whatsappUrl("Olá! Gostaria de falar com a D’Hages Turismo.", company.whatsapp)} target="_blank" rel="noreferrer"><MessageCircle /><div><small>WhatsApp</small><strong>{company.phones[0]}</strong></div></a>{company.phones[1] && <a href={`tel:+55${company.phones[1].replace(/\D/g, "")}`}><Phone /><div><small>Telefone</small><strong>{company.phones[1]}</strong></div></a>}{company.instagram && <a href={`https://instagram.com/${company.instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer"><AtSign /><div><small>Instagram</small><strong>{company.instagram}</strong></div></a>}<div><MapPin /><div><small>Endereço</small><strong>{company.address}</strong></div></div><div><Clock3 /><div><small>Atendimento</small><strong>{company.hours}</strong></div></div></div><ContactForm frontendOnly={isFrontendOnly} whatsappNumber={company.whatsapp} /></section></PublicShell>;
}
