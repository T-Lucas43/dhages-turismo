import Link from "next/link";
import { Compass, Home, MapPinned, Phone } from "lucide-react";

const items = [
  { label: "Início", href: "/", icon: Home },
  { label: "Pacotes", href: "/pacotes", icon: Compass },
  { label: "Destinos", href: "/destinos", icon: MapPinned },
  { label: "Contato", href: "/contato", icon: Phone },
];

export function MobileBar() {
  return (
    <nav className="mobile-bar" aria-label="Atalhos do site">
      {items.map(({ label, href, icon: Icon }) => (
        <Link key={href} href={href}><Icon size={21} /><span>{label}</span></Link>
      ))}
    </nav>
  );
}
