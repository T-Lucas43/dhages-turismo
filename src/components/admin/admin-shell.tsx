"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Archive,
  Bell,
  ChevronDown,
  CircleHelp,
  Folder,
  Gauge,
  History,
  Image as ImageIcon,
  LayoutGrid,
  LogOut,
  MapPinned,
  MessageSquareText,
  MoreHorizontal,
  Package,
  Search,
  Settings,
  UserCog,
  UsersRound,
} from "lucide-react";
import { Logo } from "@/components/logo";

type AdminShellProps = {
  children: React.ReactNode;
  user: { name: string; role: string };
  counts: { packages: number; leads: number };
};

const navItems = [
  { label: "Painel", icon: Gauge, href: "/admin" },
  { label: "Pacotes", icon: Package, href: "/admin/pacotes", countKey: "packages" as const },
  { label: "Categorias", icon: Folder, href: "/admin/categorias" },
  { label: "Destinos", icon: MapPinned, href: "/admin/destinos" },
  { label: "Leads", icon: UsersRound, href: "/admin/leads", countKey: "leads" as const },
  { label: "Depoimentos", icon: MessageSquareText, href: "/admin/depoimentos" },
  { label: "Perguntas frequentes", icon: CircleHelp, href: "/admin/perguntas" },
  { label: "Galeria", icon: ImageIcon, href: "/admin/galeria" },
  { label: "Arquivados", icon: Archive, href: "/admin/arquivados", divider: true },
  { label: "Usuários ADM", icon: UserCog, href: "/admin/usuarios" },
  { label: "Histórico", icon: History, href: "/admin/historico" },
  { label: "Configurações", icon: Settings, href: "/admin/configuracoes" },
];

function getCsrfToken() {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("dhages_admin_csrf="))
    ?.split("=")[1];
}

export function AdminShell({ children, user, counts }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  async function logout() {
    const csrfToken = getCsrfToken();
    const response = await fetch("/api/admin/auth/logout", {
      method: "POST",
      headers: csrfToken ? { "x-csrf-token": csrfToken } : undefined,
    });
    if (response.ok) {
      router.replace("/acesso-administrativo");
      router.refresh();
    }
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Logo compact />
        <nav>
          {navItems.map(({ label, icon: Icon, href, countKey, divider }) => (
            <Link
              href={href}
              key={href}
              className={`${isActive(href) ? "active" : ""} ${divider ? "with-divider" : ""}`}
            >
              <Icon size={19} />
              <span>{label}</span>
              {countKey && counts[countKey] > 0 && <b>{counts[countKey]}</b>}
            </Link>
          ))}
        </nav>
        <div className="admin-profile">
          <span>{initials || "AD"}</span>
          <div><strong>{user.name}</strong><small>{user.role}</small></div>
          <button type="button" onClick={logout} aria-label="Sair do painel"><LogOut size={17} /></button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <form className="admin-search" action="/admin/pacotes">
            <Search size={18} />
            <input name="busca" placeholder="Buscar pacotes..." aria-label="Buscar pacotes" />
          </form>
          <div>
            <Link className="admin-notification-link" href="/admin/leads" aria-label="Leads novos"><Bell size={20} />{counts.leads > 0 && <span />}</Link>
            <Link href="/" target="_blank">Ver site público</Link>
            <button className="admin-logout-compact" type="button" onClick={logout} aria-label="Sair"><LogOut size={18} /></button>
          </div>
        </header>
        {children}
      </main>

      <nav className="admin-mobile-nav" aria-label="Navegação administrativa móvel">
        <Link className={isActive("/admin") ? "active" : ""} href="/admin"><Gauge /><span>Painel</span></Link>
        <Link className={isActive("/admin/pacotes") ? "active" : ""} href="/admin/pacotes"><Package /><span>Pacotes</span></Link>
        <Link className={isActive("/admin/categorias") ? "active" : ""} href="/admin/categorias"><LayoutGrid /><span>Categorias</span></Link>
        <Link className={isActive("/admin/leads") ? "active" : ""} href="/admin/leads"><UsersRound /><span>Leads</span></Link>
        <Link className={isActive("/admin/configuracoes") ? "active" : ""} href="/admin/configuracoes"><MoreHorizontal /><span>Mais</span></Link>
      </nav>
    </div>
  );
}
