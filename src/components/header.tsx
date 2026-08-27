"use client";

import Link from "next/link";
import { Menu, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { whatsappUrl } from "@/data/demo";
import type { PublicCompany } from "@/lib/public-data";
import { Logo } from "./logo";

const links = [
  ["Início", "/"],
  ["Pacotes", "/pacotes"],
  ["Destinos", "/destinos"],
  ["Sobre nós", "/sobre"],
  ["Contato", "/contato"],
];

export function Header({ company }: { company: PublicCompany }) {
  const [open, setOpen] = useState(false);
  const whatsapp = whatsappUrl("Olá! Gostaria de conhecer os pacotes da D’Hages Turismo.", company.whatsapp);

  return (
    <header className="site-header">
      <div className="topline">
        <div className="shell topline-inner">
          <span>Viagens que viram histórias</span>
          <span>{company.city} – {company.state} · Atendimento personalizado</span>
        </div>
      </div>
      <div className="shell header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Navegação principal">
          {links.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
        <a className="button button-gold desktop-whatsapp" href={whatsapp} target="_blank" rel="noreferrer">
          <MessageCircle size={18} /> Falar no WhatsApp
        </a>
        <button
          className="menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="mobile-menu">
          <nav aria-label="Navegação móvel">
            {links.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
            ))}
          </nav>
          <a className="button button-gold" href={whatsapp} target="_blank" rel="noreferrer">
            <MessageCircle size={18} /> Falar no WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}
