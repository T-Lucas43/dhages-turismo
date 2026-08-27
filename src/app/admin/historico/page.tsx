import { prisma } from "@/lib/prisma";

export default async function AuditHistoryPage() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 250, include: { adminUser: { select: { name: true } } } });
  return <div className="admin-content admin-list-page"><div className="admin-welcome"><div><span>Segurança e rastreabilidade</span><h1>Histórico de alterações</h1><p>Últimas 250 ações relevantes realizadas no painel.</p></div></div><section className="admin-panel audit-list"><div className="admin-table-wrap">{logs.length ? <table><thead><tr><th>Data</th><th>Administrador</th><th>Ação</th><th>Entidade</th><th>Resumo</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(log.createdAt)}</td><td>{log.adminUser?.name ?? "Sistema"}</td><td><code>{log.action}</code></td><td>{log.entityType}</td><td>{log.summary ?? "—"}</td></tr>)}</tbody></table> : <div className="admin-empty"><strong>Nenhuma atividade registrada</strong></div>}</div></section></div>;
}
