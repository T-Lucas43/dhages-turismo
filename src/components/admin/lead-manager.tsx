"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageCircle, Phone, Search, UserRound } from "lucide-react";

type LeadRow = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string | null;
  origin: string;
  status: "NEW" | "IN_PROGRESS" | "PROPOSAL_SENT" | "WON" | "LOST" | "WAITING_LIST";
  adminNotes: string | null;
  createdAt: string;
  packageName: string | null;
};

const statuses = [
  ["NEW", "Novo"], ["IN_PROGRESS", "Em atendimento"], ["PROPOSAL_SENT", "Proposta enviada"], ["WON", "Venda concluída"], ["LOST", "Desistência"], ["WAITING_LIST", "Lista de espera"],
] as const;
const origins: Record<string, string> = { CONTACT_FORM: "Contato", PACKAGE_FORM: "Pacote", WHATSAPP: "WhatsApp", WAITING_LIST: "Lista de espera" };

function csrfToken() {
  return document.cookie.split("; ").find((cookie) => cookie.startsWith("dhages_admin_csrf="))?.split("=")[1];
}

export function LeadManager({ leads }: { leads: LeadRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<LeadRow | null>(leads[0] ?? null);
  const [status, setStatus] = useState<LeadRow["status"]>(selected?.status ?? "NEW");
  const [notes, setNotes] = useState(selected?.adminNotes ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const filtered = useMemo(() => leads.filter((lead) => (filter === "ALL" || lead.status === filter) && `${lead.name} ${lead.phone} ${lead.email} ${lead.packageName}`.toLowerCase().includes(query.toLowerCase())), [leads, query, filter]);

  function select(lead: LeadRow) {
    setSelected(lead);
    setStatus(lead.status);
    setNotes(lead.adminNotes ?? "");
    setMessage(null);
  }

  async function save() {
    if (!selected) return;
    setBusy(true);
    const response = await fetch(`/api/admin/leads/${selected.id}`, { method: "PATCH", headers: { "content-type": "application/json", "x-csrf-token": csrfToken() ?? "" }, body: JSON.stringify({ status, adminNotes: notes || null }) });
    const result = await response.json() as { error?: string };
    setMessage(response.ok ? "Atendimento atualizado." : result.error ?? "Não foi possível salvar.");
    setBusy(false);
    if (response.ok) router.refresh();
  }

  return <div className="admin-content admin-list-page"><div className="admin-welcome"><div><span>Relacionamento</span><h1>Leads</h1><p>Acompanhe contatos do formulário, pacotes e WhatsApp.</p></div></div><div className="lead-layout"><section className="admin-panel lead-list"><div className="lead-toolbar"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome, telefone ou pacote" /></label><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">Todos</option>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>{filtered.length ? <div className="lead-items">{filtered.map((lead) => <button className={selected?.id === lead.id ? "active" : ""} type="button" key={lead.id} onClick={() => select(lead)}><span className="lead-avatar"><UserRound /></span><span><strong>{lead.name ?? (lead.origin === "WHATSAPP" ? "Clique no WhatsApp" : "Contato sem nome")}</strong><small>{lead.packageName ?? origins[lead.origin] ?? lead.origin}</small></span><span><b className={`lead-status ${lead.status.toLowerCase()}`}>{statuses.find(([value]) => value === lead.status)?.[1]}</b><small>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(lead.createdAt))}</small></span></button>)}</div> : <div className="admin-empty"><Search /><strong>Nenhum lead encontrado</strong><p>Novos contatos aparecerão aqui.</p></div>}</section>{selected && <aside className="admin-panel lead-detail"><div className="lead-detail-heading"><span><UserRound /></span><div><h2>{selected.name ?? "Contato pelo site"}</h2><p>{selected.packageName ?? origins[selected.origin] ?? selected.origin}</p></div></div><div className="lead-contact-links">{selected.phone && <a href={`tel:${selected.phone}`}><Phone /> {selected.phone}</a>}{selected.email && <a href={`mailto:${selected.email}`}><Mail /> {selected.email}</a>}{selected.phone && <a href={`https://wa.me/55${selected.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle /> Abrir WhatsApp</a>}</div>{selected.message && <blockquote>{selected.message}</blockquote>}<label><span>Status do atendimento</span><select value={status} onChange={(event) => setStatus(event.target.value as LeadRow["status"])}>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span>Observações administrativas</span><textarea rows={7} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Registre contatos, proposta e próximos passos." /></label>{message && <p className="admin-form-message">{message}</p>}<button className="button button-primary" type="button" onClick={save} disabled={busy}>{busy ? "Salvando..." : "Salvar atendimento"}</button></aside>}</div></div>;
}
