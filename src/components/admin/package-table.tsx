"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Copy, ExternalLink, Pencil, Plus, Search, Star } from "lucide-react";

export type AdminPackageRow = {
  id: string;
  name: string;
  slug: string;
  destination: string;
  stateCode: string;
  category: string;
  departureAt: string;
  cashPrice: string;
  publicationStatus: "DRAFT" | "PUBLISHED" | "INACTIVE" | "ARCHIVED";
  availabilityStatus: "AVAILABLE" | "FEW_SPOTS" | "SOLD_OUT" | "CANCELLED";
  featured: boolean;
  image: string;
};

const publicationLabels = { DRAFT: "Rascunho", PUBLISHED: "Publicado", INACTIVE: "Inativo", ARCHIVED: "Arquivado" };
const availabilityLabels = { AVAILABLE: "Disponível", FEW_SPOTS: "Poucas vagas", SOLD_OUT: "Esgotado", CANCELLED: "Cancelado" };
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const date = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

function csrfToken() {
  return document.cookie.split("; ").find((cookie) => cookie.startsWith("dhages_admin_csrf="))?.split("=")[1];
}

export function PackageTable({ rows, archived = false }: { rows: AdminPackageRow[]; archived?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const filtered = useMemo(() => rows.filter((row) => {
    const textMatch = `${row.name} ${row.destination} ${row.category}`.toLowerCase().includes(query.toLowerCase());
    return textMatch && (status === "ALL" || row.publicationStatus === status || row.availabilityStatus === status);
  }), [rows, query, status]);

  async function runAction(ids: string[], action: string) {
    if (!ids.length) return;
    if (action === "ARCHIVE" && !window.confirm(`Arquivar ${ids.length} pacote(s)?`)) return;
    setBusy(true);
    setMessage(null);
    const results = await Promise.all(ids.map(async (id) => {
      const response = await fetch(`/api/admin/packages/${id}/actions`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-csrf-token": csrfToken() ?? "" },
        body: JSON.stringify({ action }),
      });
      const payload = await response.json() as { error?: string };
      return { ok: response.ok, error: payload.error };
    }));
    const failed = results.find((result) => !result.ok);
    setMessage(failed?.error ?? `${ids.length} pacote(s) atualizado(s).`);
    setSelected([]);
    setBusy(false);
    router.refresh();
  }

  async function copyPublicLink(slug: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/pacotes/${slug}`);
    setMessage("Link público copiado.");
  }

  return (
    <div className="admin-content admin-list-page">
      <div className="admin-welcome">
        <div><span>Conteúdo</span><h1>{archived ? "Pacotes arquivados" : "Pacotes"}</h1><p>{archived ? "Restaure um registro ou exclua-o definitivamente." : "Crie, edite, publique e organize os pacotes cadastrados."}</p></div>
        {!archived && <Link className="button button-primary" href="/admin/pacotes/novo"><Plus size={18} /> Novo pacote</Link>}
      </div>

      <section className="admin-panel list-toolbar">
        <label className="admin-list-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar pacote, destino ou categoria" /></label>
        {!archived && <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar status"><option value="ALL">Todos os status</option><option value="DRAFT">Rascunhos</option><option value="PUBLISHED">Publicados</option><option value="INACTIVE">Inativos</option><option value="AVAILABLE">Disponíveis</option><option value="FEW_SPOTS">Poucas vagas</option><option value="SOLD_OUT">Esgotados</option><option value="CANCELLED">Cancelados</option></select>}
        {selected.length > 0 && <div className="bulk-actions"><strong>{selected.length} selecionado(s)</strong>{archived ? <button type="button" disabled={busy} onClick={() => runAction(selected, "RESTORE")}>Restaurar</button> : <><button type="button" disabled={busy} onClick={() => runAction(selected, "PUBLISH")}>Publicar</button><button type="button" disabled={busy} onClick={() => runAction(selected, "ARCHIVE")}>Arquivar</button></>}</div>}
      </section>
      {message && <p className="admin-form-message" role="status">{message}</p>}

      <section className="admin-panel admin-packages full-package-list">
        {filtered.length ? <div className="admin-table-wrap"><table>
          <thead><tr><th><input type="checkbox" aria-label="Selecionar todos" checked={filtered.length > 0 && filtered.every((row) => selected.includes(row.id))} onChange={(event) => setSelected(event.target.checked ? filtered.map((row) => row.id) : [])} /></th><th>Pacote</th><th>Saída</th><th>Publicação</th><th>Disponibilidade</th><th>Preço</th><th>Ações</th></tr></thead>
          <tbody>{filtered.map((row) => <tr key={row.id}>
            <td><input type="checkbox" aria-label={`Selecionar ${row.name}`} checked={selected.includes(row.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id))} /></td>
            <td><img src={row.image} alt="" /><div><strong>{row.name}{row.featured && <Star className="row-featured" fill="currentColor" />}</strong><small>{row.destination} · {row.stateCode} · {row.category}</small></div></td>
            <td>{date.format(new Date(row.departureAt))}</td>
            <td><span className={`table-status ${row.publicationStatus.toLowerCase()}`}>{publicationLabels[row.publicationStatus]}</span></td>
            <td><span className={`table-status ${row.availabilityStatus.toLowerCase()}`}>{availabilityLabels[row.availabilityStatus]}</span></td>
            <td>{money.format(Number(row.cashPrice))}</td>
            <td><div className="row-actions">
              {archived ? <button onClick={() => runAction([row.id], "RESTORE")} type="button">Restaurar</button> : <>
                <Link href={`/admin/pacotes/${row.id}/editar`} aria-label={`Editar ${row.name}`}><Pencil /></Link>
                <button type="button" onClick={() => runAction([row.id], "DUPLICATE")} aria-label={`Duplicar ${row.name}`}><Copy /></button>
                <button type="button" onClick={() => runAction([row.id], row.featured ? "UNFEATURE" : "FEATURE")} aria-label={row.featured ? "Remover destaque" : "Destacar"}><Star /></button>
                <button type="button" onClick={() => copyPublicLink(row.slug)} aria-label="Copiar link"><ExternalLink /></button>
                <button className="danger" type="button" onClick={() => runAction([row.id], "ARCHIVE")} aria-label="Arquivar"><Archive /></button>
              </>}
            </div></td>
          </tr>)}</tbody>
        </table></div> : <div className="admin-empty"><Search /><strong>Nenhum pacote encontrado</strong><p>Altere os filtros ou cadastre um novo pacote.</p></div>}
      </section>
    </div>
  );
}
