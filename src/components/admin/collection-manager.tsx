"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

export type CollectionRecord = { id: string } & Record<string, string | number | boolean | null>;
export type CollectionField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox" | "select";
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  wide?: boolean;
};
export type CollectionColumn = {
  key: string;
  label: string;
  format?: "active" | "published" | "rating" | "mediaType";
};

function formatColumnValue(record: CollectionRecord, column: CollectionColumn) {
  const value = record[column.key];
  if (column.format === "active") return value ? "Ativo" : "Inativo";
  if (column.format === "published") return value ? "Publicado" : "Oculto";
  if (column.format === "rating") return `${value ?? 0}/5`;
  if (column.format === "mediaType") return value === "VIDEO" ? "Vídeo" : "Imagem";
  return String(value ?? "—");
}

function csrfToken() {
  return document.cookie.split("; ").find((cookie) => cookie.startsWith("dhages_admin_csrf="))?.split("=")[1];
}

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function CollectionManager({ entity, title, description, singular, records, fields, columns }: {
  entity: string;
  title: string;
  description: string;
  singular: string;
  records: CollectionRecord[];
  fields: CollectionField[];
  columns: CollectionColumn[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CollectionRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const filtered = useMemo(() => records.filter((record) => Object.values(record).some((value) => String(value ?? "").toLowerCase().includes(query.toLowerCase()))), [records, query]);
  const formOpen = creating || Boolean(editing);
  const blank = Object.fromEntries(fields.map((field) => [field.key, field.defaultValue ?? (field.type === "checkbox" ? true : "")])) as CollectionRecord;
  const values = editing ?? blank;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const formData = new FormData(event.currentTarget);
    const payload: Record<string, string | number | boolean | null> = {};
    fields.forEach((field) => {
      if (field.type === "checkbox") payload[field.key] = formData.get(field.key) === "on";
      else if (field.type === "number") payload[field.key] = Number(formData.get(field.key) || 0);
      else payload[field.key] = String(formData.get(field.key) ?? "").trim() || null;
    });
    const response = await fetch(`/api/admin/content/${entity}${editing ? `/${editing.id}` : ""}`, {
      method: editing ? "PATCH" : "POST",
      headers: { "content-type": "application/json", "x-csrf-token": csrfToken() ?? "" },
      body: JSON.stringify(payload),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) setMessage({ tone: "error", text: result.error ?? "Não foi possível salvar." });
    else {
      setMessage({ tone: "success", text: `${singular} ${editing ? "atualizado" : "criado"} com sucesso.` });
      setEditing(null);
      setCreating(false);
      router.refresh();
    }
    setBusy(false);
  }

  async function remove(record: CollectionRecord) {
    if (!window.confirm(`Remover este ${singular.toLowerCase()}?`)) return;
    setBusy(true);
    const response = await fetch(`/api/admin/content/${entity}/${record.id}`, { method: "DELETE", headers: { "x-csrf-token": csrfToken() ?? "" } });
    const result = await response.json() as { error?: string };
    setMessage(response.ok ? { tone: "success", text: `${singular} removido.` } : { tone: "error", text: result.error ?? "Não foi possível remover." });
    setBusy(false);
    if (response.ok) router.refresh();
  }

  return <div className="admin-content admin-list-page">
    <div className="admin-welcome"><div><span>Conteúdo</span><h1>{title}</h1><p>{description}</p></div><button className="button button-primary" type="button" onClick={() => { setCreating(true); setEditing(null); }}><Plus /> Novo {singular.toLowerCase()}</button></div>
    {message && <div className={`admin-form-feedback ${message.tone}`} role="status">{message.text}</div>}
    <div className={`collection-layout ${formOpen ? "with-form" : ""}`}>
      <section className="admin-panel collection-list">
        <div className="collection-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar em ${title.toLowerCase()}`} /></div>
        {filtered.length ? <div className="admin-table-wrap"><table><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}<th>Ações</th></tr></thead><tbody>{filtered.map((record) => <tr key={record.id}>{columns.map((column) => <td key={column.key}>{formatColumnValue(record, column)}</td>)}<td><div className="row-actions"><button type="button" onClick={() => { setEditing(record); setCreating(false); }} aria-label="Editar"><Pencil /></button><button className="danger" type="button" disabled={busy} onClick={() => remove(record)} aria-label="Remover"><Trash2 /></button></div></td></tr>)}</tbody></table></div> : <div className="admin-empty"><Search /><strong>Nenhum registro encontrado</strong><p>Crie o primeiro cadastro ou altere a busca.</p></div>}
      </section>
      {formOpen && <aside className="admin-panel collection-form-panel"><div className="collection-form-heading"><div><span>{editing ? "Editar" : "Novo cadastro"}</span><h2>{editing ? `${singular} selecionado` : `Adicionar ${singular.toLowerCase()}`}</h2></div><button type="button" onClick={() => { setEditing(null); setCreating(false); }} aria-label="Fechar formulário"><X /></button></div><form className="collection-form" onSubmit={submit}>{fields.map((field) => <label className={field.wide ? "wide" : ""} key={field.key}><span>{field.label}</span>{field.type === "textarea" ? <textarea name={field.key} rows={4} defaultValue={String(values[field.key] ?? "")} required={field.required} placeholder={field.placeholder} /> : field.type === "select" ? <select name={field.key} defaultValue={String(values[field.key] ?? "")} required={field.required}><option value="">Selecionar</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === "checkbox" ? <span className="collection-checkbox"><input name={field.key} type="checkbox" defaultChecked={Boolean(values[field.key])} /><small>Ativo e visível</small></span> : <input name={field.key} type={field.type === "number" ? "number" : "text"} defaultValue={String(values[field.key] ?? "")} required={field.required} placeholder={field.placeholder} onBlur={field.key === "name" ? (event) => { const slugInput = event.currentTarget.form?.elements.namedItem("slug") as HTMLInputElement | null; if (slugInput && !slugInput.value) slugInput.value = slugify(event.currentTarget.value); } : undefined} />}</label>)}<button className="button button-primary" type="submit" disabled={busy}>{busy ? "Salvando..." : "Salvar cadastro"}</button></form></aside>}
    </div>
  </div>;
}
