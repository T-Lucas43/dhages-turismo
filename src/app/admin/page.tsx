import Link from "next/link";
import {
  Activity,
  BarChart3,
  Bell,
  FileText,
  MoreHorizontal,
  Package,
  Plus,
  UsersRound,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

const departureFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function statusLabel(status: string) {
  return {
    DRAFT: "Rascunho",
    PUBLISHED: "Publicado",
    INACTIVE: "Inativo",
    ARCHIVED: "Arquivado",
  }[status] ?? status;
}

function relativeTime(date: Date) {
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days} dia${days === 1 ? "" : "s"}`;
}

export default async function AdminPage() {
  const now = new Date();
  const [statsPackages, newLeads, recentPackages, recentActivity, topPackages] = await Promise.all([
    prisma.package.findMany({ where: { deletedAt: null }, select: { publicationStatus: true, availabilityStatus: true, featured: true, viewCount: true, whatsappClickCount: true } }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.package.findMany({
      where: { deletedAt: null, publicationStatus: { not: "ARCHIVED" } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        destination: { select: { name: true, stateCode: true } },
        media: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }], take: 1 },
        _count: { select: { leads: true } },
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { adminUser: { select: { name: true } } },
    }),
    prisma.package.findMany({ where: { deletedAt: null, publicationStatus: { not: "ARCHIVED" } }, orderBy: [{ viewCount: "desc" }, { whatsappClickCount: "desc" }], take: 4, select: { id: true, name: true, viewCount: true, whatsappClickCount: true } }),
  ]);

  const published = statsPackages.filter((item) => item.publicationStatus === "PUBLISHED").length;
  const fewSpots = statsPackages.filter((item) => item.availabilityStatus === "FEW_SPOTS" && item.publicationStatus === "PUBLISHED").length;
  const views = statsPackages.reduce((total, item) => total + item.viewCount, 0);
  const statusSummary = [
    ["Total", statsPackages.length],
    ["Rascunhos", statsPackages.filter((item) => item.publicationStatus === "DRAFT").length],
    ["Inativos", statsPackages.filter((item) => item.publicationStatus === "INACTIVE").length],
    ["Arquivados", statsPackages.filter((item) => item.publicationStatus === "ARCHIVED").length],
    ["Esgotados", statsPackages.filter((item) => item.availabilityStatus === "SOLD_OUT").length],
    ["Em destaque", statsPackages.filter((item) => item.featured).length],
  ] as const;

  const metrics = [
    { label: "Pacotes publicados", value: published.toString(), note: "visíveis no site", icon: Package, tone: "blue" },
    { label: "Leads novos", value: newLeads.toString(), note: newLeads ? "aguardando atendimento" : "caixa de entrada em dia", icon: UsersRound, tone: "gold" },
    { label: "Poucas vagas", value: fewSpots.toString(), note: fewSpots ? "pedem atenção" : "nenhum alerta agora", icon: Bell, tone: "orange" },
    { label: "Visualizações", value: new Intl.NumberFormat("pt-BR").format(views), note: "acumuladas nos pacotes", icon: BarChart3, tone: "green" },
  ];

  return (
    <div className="admin-content">
      <div className="admin-welcome">
        <div>
          <span className="admin-date">{dateFormatter.format(now)}</span>
          <h1>Visão geral</h1>
          <p>Acompanhe os registros e o desempenho da D’Hages Turismo.</p>
        </div>
        <Link href="/admin/pacotes/novo" className="button button-primary"><Plus size={18} /> Novo pacote</Link>
      </div>

      <section className="metric-grid" aria-label="Resumo do painel">
        {metrics.map(({ label, value, note, icon: Icon, tone }) => (
          <article key={label}>
            <span className={`metric-icon ${tone}`}><Icon /></span>
            <div><small>{label}</small><strong>{value}</strong><p>{note}</p></div>
          </article>
        ))}
      </section>

      <section className="dashboard-status-grid" aria-label="Estados dos pacotes">{statusSummary.map(([label, value]) => <Link key={label} href={label === "Arquivados" ? "/admin/arquivados" : "/admin/pacotes"}><small>{label}</small><strong>{value}</strong></Link>)}</section>

      <section className="admin-grid">
        <div className="admin-panel admin-packages">
          <div className="panel-heading">
            <div><h2>Pacotes recentes</h2><p>Registros atualizados por último.</p></div>
            <Link href="/admin/pacotes">Ver todos</Link>
          </div>
          <div className="admin-table-wrap">
            {recentPackages.length ? (
              <table>
                <thead><tr><th>Pacote</th><th>Saída</th><th>Status</th><th>Preço</th><th>Contatos</th><th><span className="sr-only">Ações</span></th></tr></thead>
                <tbody>
                  {recentPackages.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img src={item.media[0]?.thumbnailPath ?? item.media[0]?.path ?? "/media/destinations/ajuruteua.webp"} alt="" />
                        <div><strong>{item.name}</strong><small>{item.destination.name} · {item.destination.stateCode}</small></div>
                      </td>
                      <td>{departureFormatter.format(item.departureAt)}</td>
                      <td><span className={`table-status ${item.publicationStatus.toLowerCase()}`}>{statusLabel(item.publicationStatus)}</span></td>
                      <td>{moneyFormatter.format(Number(item.cashPrice))}</td>
                      <td>{item._count.leads + item.whatsappClickCount}</td>
                      <td><Link href={`/admin/pacotes/${item.id}/editar`} aria-label={`Editar ${item.name}`}><MoreHorizontal /></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty"><Package /><strong>Nenhum pacote cadastrado</strong><p>Crie o primeiro pacote para começar.</p><Link className="button button-primary" href="/admin/pacotes/novo">Novo pacote</Link></div>
            )}
          </div>
        </div>

        <div className="dashboard-side"><div className="admin-panel top-packages-panel"><div className="panel-heading"><div><h2>Mais acessados</h2><p>Visualizações e cliques no WhatsApp.</p></div></div><div className="top-package-list">{topPackages.map((item, index) => <Link key={item.id} href={`/admin/pacotes/${item.id}/editar`}><b>{index + 1}</b><span><strong>{item.name}</strong><small>{item.viewCount} visualizações · {item.whatsappClickCount} contatos</small></span></Link>)}</div></div><div className="admin-panel activity-panel">
          <div className="panel-heading"><div><h2>Atividades recentes</h2><p>Alterações registradas no sistema.</p></div></div>
          <div className="activity-list">
            {recentActivity.length ? recentActivity.map((item) => (
              <div key={item.id}>
                <span>{item.entityType === "Package" ? <FileText /> : <Activity />}</span>
                <p><strong>{item.summary ?? item.action}</strong><small>{item.adminUser?.name ?? "Sistema"} · {relativeTime(item.createdAt)}</small></p>
              </div>
            )) : (
              <div className="activity-empty"><Activity /><p><strong>Nenhuma atividade ainda</strong><small>As mudanças administrativas aparecerão aqui.</small></p></div>
            )}
          </div>
        </div></div>
      </section>
    </div>
  );
}
