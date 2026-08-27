"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, ShieldCheck, X } from "lucide-react";

type UserRow = { id: string; name: string; email: string; role: "OWNER" | "ADMIN" | "EDITOR"; active: boolean; lastLoginAt: string | null; createdAt: string };
function csrfToken() { return document.cookie.split("; ").find((cookie) => cookie.startsWith("dhages_admin_csrf="))?.split("=")[1]; }

export function UserManager({ users, canManage }: { users: UserRow[]; canManage: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const data = new FormData(event.currentTarget);
    const payload = { name: String(data.get("name")), email: String(data.get("email")), password: String(data.get("password")), role: String(data.get("role")), active: data.get("active") === "on" };
    const response = await fetch(`/api/admin/users${editing ? `/${editing.id}` : ""}`, { method: editing ? "PATCH" : "POST", headers: { "content-type": "application/json", "x-csrf-token": csrfToken() ?? "" }, body: JSON.stringify(payload) });
    const result = await response.json() as { error?: string };
    setMessage(response.ok ? "Administrador salvo com sucesso." : result.error ?? "Não foi possível salvar.");
    setBusy(false);
    if (response.ok) { setEditing(null); setCreating(false); router.refresh(); }
  }
  const open = creating || Boolean(editing);
  return <div className="admin-content admin-list-page"><div className="admin-welcome"><div><span>Segurança</span><h1>Usuários administrativos</h1><p>Somente a equipe autorizada acessa o painel. Não existem usuários clientes.</p></div>{canManage && <button className="button button-primary" onClick={() => { setCreating(true); setEditing(null); }}><Plus /> Novo administrador</button>}</div>{message && <p className="admin-form-message">{message}</p>}<div className={`collection-layout ${open ? "with-form" : ""}`}><section className="admin-panel collection-list"><div className="admin-table-wrap"><table><thead><tr><th>Administrador</th><th>Perfil</th><th>Status</th><th>Último acesso</th><th>Ações</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><strong>{user.name}</strong><br /><small>{user.email}</small></td><td>{user.role === "OWNER" ? "Proprietário" : user.role === "ADMIN" ? "Administrador" : "Editor"}</td><td><span className={`table-status ${user.active ? "published" : "inactive"}`}>{user.active ? "Ativo" : "Inativo"}</span></td><td>{user.lastLoginAt ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(user.lastLoginAt)) : "Nunca"}</td><td>{canManage && <div className="row-actions"><button onClick={() => { setEditing(user); setCreating(false); }} aria-label="Editar administrador"><Pencil /></button></div>}</td></tr>)}</tbody></table></div></section>{open && <aside className="admin-panel collection-form-panel"><div className="collection-form-heading"><div><span>Acesso administrativo</span><h2>{editing ? "Editar usuário" : "Novo usuário"}</h2></div><button onClick={() => { setEditing(null); setCreating(false); }} aria-label="Fechar"><X /></button></div><form className="collection-form" onSubmit={submit}><label className="wide"><span>Nome</span><input name="name" defaultValue={editing?.name ?? ""} required /></label><label className="wide"><span>E-mail</span><input name="email" type="email" defaultValue={editing?.email ?? ""} required /></label><label className="wide"><span>{editing ? "Nova senha (deixe vazia para manter)" : "Senha temporária"}</span><input name="password" type="password" minLength={10} required={!editing} autoComplete="new-password" /></label><label><span>Perfil</span><select name="role" defaultValue={editing?.role ?? "EDITOR"}><option value="EDITOR">Editor</option><option value="ADMIN">Administrador</option><option value="OWNER">Proprietário</option></select></label><label><span>Status</span><span className="collection-checkbox"><input name="active" type="checkbox" defaultChecked={editing?.active ?? true} /><small>Acesso ativo</small></span></label><button className="button button-primary" disabled={busy}><ShieldCheck /> {busy ? "Salvando..." : "Salvar acesso"}</button></form></aside>}</div></div>;
}
