import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PackageEditor } from "@/components/admin/package-editor";
import { prisma } from "@/lib/prisma";

export default async function NewPackagePage() {
  const [categories, destinations] = await Promise.all([
    prisma.packageCategory.findMany({ where: { active: true, deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
    prisma.destination.findMany({ where: { active: true, deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, city: true, state: true, stateCode: true } }),
  ]);
  return <div className="admin-content editor-content">
    <Link className="editor-back" href="/admin/pacotes"><ArrowLeft /> Voltar para pacotes</Link>
    <div className="editor-title"><div><span>Novo pacote</span><h1>Crie uma nova experiência</h1><p>Preencha as dez etapas, salve e depois envie imagens e vídeos.</p></div><span className="draft-badge">Rascunho</span></div>
    <PackageEditor categories={categories} destinations={destinations} />
  </div>;
}
