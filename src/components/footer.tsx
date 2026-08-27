import Link from "next/link";
import { AtSign, MapPin, MessageCircle, Phone } from "lucide-react";
import { whatsappUrl } from "@/data/demo";
import type { PublicCompany } from "@/lib/public-data";
import { Logo } from "./logo";

export function Footer({ company }: { company: PublicCompany }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>Roteiros acolhedores, suporte próximo e a confiança de viajar bem acompanhado.</p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/pacotes">Todos os pacotes</Link>
          <Link href="/destinos">Destinos</Link>
          <Link href="/sobre">Sobre nós</Link>
          <Link href="/contato">Contato</Link>
        </div>
        <div>
          <h3>Fale conosco</h3>
          <a href={whatsappUrl("Olá! Gostaria de falar com a D’Hages Turismo.", company.whatsapp)} target="_blank" rel="noreferrer"><MessageCircle size={17} /> {company.phones[0]}</a>
          {company.phones[1] && <a href={`tel:+55${company.phones[1].replace(/\D/g, "")}`}><Phone size={17} /> {company.phones[1]}</a>}
          <a href="https://instagram.com/dhages_turismo" target="_blank" rel="noreferrer"><AtSign size={17} /> {company.instagram}</a>
        </div>
        <div>
          <h3>Onde estamos</h3>
          <p className="footer-address"><MapPin size={18} /> {company.address}</p>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 D’Hages Turismo</span>
        <span>Cadastur · Viage com segurança</span>
      </div>
    </footer>
  );
}
