import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Acesso administrativo",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: PageProps<"/acesso-administrativo">) {
  const current = await getCurrentAdmin();
  const params = await searchParams;
  const requested = typeof params.returnTo === "string" ? params.returnTo : "/admin";
  const returnTo = requested.startsWith("/admin") && !requested.startsWith("//") ? requested : "/admin";
  if (current) redirect(returnTo);

  return (
    <main className="admin-login-page">
      <section className="admin-login-brand">
        <div><Logo /><span>Painel de gestão</span></div>
        <div className="login-brand-copy"><span>Administração D’Hages</span><h1>Cuide de cada viagem em um só lugar.</h1><p>Pacotes, mídias, leads e conteúdo organizados com segurança.</p></div>
        <small>Somente usuários administrativos. Não existe acesso de cliente.</small>
      </section>
      <section className="admin-login-panel">
        <div className="admin-login-card"><span className="editor-eyebrow">Acesso seguro</span><h2>Bem-vindo de volta</h2><p>Use suas credenciais administrativas para continuar.</p><LoginForm returnTo={returnTo} /></div>
      </section>
    </main>
  );
}
