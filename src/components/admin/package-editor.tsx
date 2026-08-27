"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Check, Eye, Save } from "lucide-react";
import { ExistingMediaManager } from "@/components/admin/existing-media-manager";
import { MediaUploader } from "@/components/admin/media-uploader";

type Option = { id: string; name: string };
type DestinationOption = Option & { city: string; state: string; stateCode: string };
type ExistingMedia = {
  id: string;
  type: "IMAGE" | "VIDEO";
  path: string;
  thumbnailPath: string | null;
  posterPath: string | null;
  altText: string | null;
  isCover: boolean;
  isPreview: boolean;
  sortOrder: number;
};

export type PackageEditorInitial = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  categoryId: string;
  destinationId: string;
  city: string;
  state: string;
  stateCode: string;
  departureAt: string;
  returnAt: string;
  boardingTime: string | null;
  boardingLocation: string | null;
  durationDays: number;
  cashPrice: string;
  installmentCount: number;
  installmentValue: string | null;
  installmentTotal: string | null;
  totalSpots: number | null;
  remainingSpots: number | null;
  showSpots: boolean;
  accommodation: string | null;
  transport: string | null;
  meals: string | null;
  guide: string | null;
  childPolicy: string | null;
  requiredDocuments: string | null;
  paymentMethods: string | null;
  importantNotes: string | null;
  mapUrl: string | null;
  publicationStatus: "DRAFT" | "PUBLISHED" | "INACTIVE" | "ARCHIVED";
  availabilityStatus: "AVAILABLE" | "FEW_SPOTS" | "SOLD_OUT" | "CANCELLED";
  featured: boolean;
  featuredOrder: number | null;
  featuredStartsAt: string | null;
  featuredEndsAt: string | null;
  waitingListEnabled: boolean;
  publishedAt: string | null;
  publicationEndsAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  shareImagePath: string | null;
  includedItems: Array<{ text: string }>;
  excludedItems: Array<{ text: string }>;
  itinerary: Array<{ dayNumber: number | null; time: string | null; title: string; details: string }>;
  media: ExistingMedia[];
};

type EditorValues = {
  name: string;
  slug: string;
  summary: string;
  description: string;
  categoryId: string;
  destinationId: string;
  city: string;
  state: string;
  stateCode: string;
  departureAt: string;
  returnAt: string;
  boardingTime: string;
  boardingLocation: string;
  durationDays: string;
  cashPrice: string;
  installmentCount: string;
  installmentValue: string;
  installmentTotal: string;
  totalSpots: string;
  remainingSpots: string;
  showSpots: boolean;
  accommodation: string;
  transport: string;
  meals: string;
  guide: string;
  childPolicy: string;
  requiredDocuments: string;
  paymentMethods: string;
  importantNotes: string;
  mapUrl: string;
  publicationStatus: "DRAFT" | "PUBLISHED" | "INACTIVE" | "ARCHIVED";
  availabilityStatus: "AVAILABLE" | "FEW_SPOTS" | "SOLD_OUT" | "CANCELLED";
  featured: boolean;
  featuredOrder: string;
  featuredStartsAt: string;
  featuredEndsAt: string;
  waitingListEnabled: boolean;
  publishedAt: string;
  publicationEndsAt: string;
  seoTitle: string;
  seoDescription: string;
  shareImagePath: string;
  includedText: string;
  excludedText: string;
  itineraryText: string;
};

const toInputDate = (value?: string | null, withTime = false) => value ? new Date(value).toISOString().slice(0, withTime ? 16 : 10) : "";
const text = (value?: string | null) => value ?? "";
const numberText = (value?: string | number | null) => value == null ? "" : String(value);
const nullableNumber = (value: string) => value.trim() === "" ? null : Number(value);
const nullableDate = (value: string) => value ? new Date(value).toISOString() : null;
const lines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);

function makeSlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function itineraryFromText(value: string) {
  return lines(value).map((line, index) => {
    const [day, time, title, ...detailParts] = line.split("|").map((part) => part.trim());
    return {
      dayNumber: Number.isFinite(Number(day)) && day !== "" ? Number(day) : index + 1,
      time: time || null,
      title: title || `Etapa ${index + 1}`,
      details: detailParts.join(" | ") || title || line,
    };
  });
}

function itineraryToText(items: PackageEditorInitial["itinerary"]) {
  return items.map((item) => `${item.dayNumber ?? ""} | ${item.time ?? ""} | ${item.title} | ${item.details}`).join("\n");
}

function csrfToken() {
  return document.cookie.split("; ").find((cookie) => cookie.startsWith("dhages_admin_csrf="))?.split("=")[1];
}

export function PackageEditor({ categories, destinations, initialData }: { categories: Option[]; destinations: DestinationOption[]; initialData?: PackageEditorInitial }) {
  const router = useRouter();
  const [savedId, setSavedId] = useState(initialData?.id);
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const defaultValues = useMemo<EditorValues>(() => ({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    summary: initialData?.summary ?? "",
    description: initialData?.description ?? "",
    categoryId: initialData?.categoryId ?? "",
    destinationId: initialData?.destinationId ?? "",
    city: initialData?.city ?? "",
    state: initialData?.state ?? "Pará",
    stateCode: initialData?.stateCode ?? "PA",
    departureAt: toInputDate(initialData?.departureAt),
    returnAt: toInputDate(initialData?.returnAt),
    boardingTime: text(initialData?.boardingTime),
    boardingLocation: text(initialData?.boardingLocation),
    durationDays: numberText(initialData?.durationDays ?? 1),
    cashPrice: numberText(initialData?.cashPrice),
    installmentCount: numberText(initialData?.installmentCount ?? 1),
    installmentValue: numberText(initialData?.installmentValue),
    installmentTotal: numberText(initialData?.installmentTotal),
    totalSpots: numberText(initialData?.totalSpots),
    remainingSpots: numberText(initialData?.remainingSpots),
    showSpots: initialData?.showSpots ?? false,
    accommodation: text(initialData?.accommodation),
    transport: text(initialData?.transport),
    meals: text(initialData?.meals),
    guide: text(initialData?.guide),
    childPolicy: text(initialData?.childPolicy),
    requiredDocuments: text(initialData?.requiredDocuments),
    paymentMethods: text(initialData?.paymentMethods),
    importantNotes: text(initialData?.importantNotes),
    mapUrl: text(initialData?.mapUrl),
    publicationStatus: initialData?.publicationStatus ?? "DRAFT",
    availabilityStatus: initialData?.availabilityStatus ?? "AVAILABLE",
    featured: initialData?.featured ?? false,
    featuredOrder: numberText(initialData?.featuredOrder),
    featuredStartsAt: toInputDate(initialData?.featuredStartsAt, true),
    featuredEndsAt: toInputDate(initialData?.featuredEndsAt, true),
    waitingListEnabled: initialData?.waitingListEnabled ?? false,
    publishedAt: toInputDate(initialData?.publishedAt, true),
    publicationEndsAt: toInputDate(initialData?.publicationEndsAt, true),
    seoTitle: text(initialData?.seoTitle),
    seoDescription: text(initialData?.seoDescription),
    shareImagePath: text(initialData?.shareImagePath),
    includedText: initialData?.includedItems.map((item) => item.text).join("\n") ?? "",
    excludedText: initialData?.excludedItems.map((item) => item.text).join("\n") ?? "",
    itineraryText: initialData ? itineraryToText(initialData.itinerary) : "",
  }), [initialData]);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isDirty, isSubmitting } } = useForm<EditorValues>({ defaultValues });
  const watchedSlug = watch("slug");
  const publicationStatus = watch("publicationStatus");
  const featured = watch("featured");

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (isDirty) event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  function chooseDestination(id: string) {
    const destination = destinations.find((item) => item.id === id);
    if (!destination) return;
    setValue("city", destination.city, { shouldDirty: true });
    setValue("state", destination.state, { shouldDirty: true });
    setValue("stateCode", destination.stateCode, { shouldDirty: true });
  }

  async function save(values: EditorValues) {
    setFeedback(null);
    const payload = {
      ...values,
      durationDays: Number(values.durationDays),
      cashPrice: Number(values.cashPrice),
      installmentCount: Number(values.installmentCount),
      installmentValue: nullableNumber(values.installmentValue),
      installmentTotal: nullableNumber(values.installmentTotal),
      totalSpots: nullableNumber(values.totalSpots),
      remainingSpots: nullableNumber(values.remainingSpots),
      featuredOrder: nullableNumber(values.featuredOrder),
      departureAt: new Date(`${values.departureAt}T12:00:00`).toISOString(),
      returnAt: new Date(`${values.returnAt}T12:00:00`).toISOString(),
      featuredStartsAt: nullableDate(values.featuredStartsAt),
      featuredEndsAt: nullableDate(values.featuredEndsAt),
      publishedAt: nullableDate(values.publishedAt),
      publicationEndsAt: nullableDate(values.publicationEndsAt),
      includedItems: lines(values.includedText),
      excludedItems: lines(values.excludedText),
      itinerary: itineraryFromText(values.itineraryText),
    };
    const response = await fetch(savedId ? `/api/admin/packages/${savedId}` : "/api/admin/packages", {
      method: savedId ? "PATCH" : "POST",
      headers: { "content-type": "application/json", "x-csrf-token": csrfToken() ?? "" },
      body: JSON.stringify(payload),
    });
    const result = await response.json() as { error?: string; package?: { id: string; slug: string } };
    if (!response.ok || !result.package) {
      setFeedback({ tone: "error", text: result.error ?? "Não foi possível salvar o pacote." });
      return;
    }
    setSavedId(result.package.id);
    reset(values);
    setFeedback({ tone: "success", text: savedId ? "Pacote atualizado com sucesso." : "Pacote criado. Agora você pode enviar as mídias." });
    if (!savedId) router.replace(`/admin/pacotes/${result.package.id}/editar`);
    router.refresh();
  }

  const required = { required: "Campo obrigatório" };
  return (
    <form onSubmit={handleSubmit(save)}>
      <div className="editor-layout">
        <div className="editor-main-column">
          {feedback && <div className={`admin-form-feedback ${feedback.tone}`} role="status">{feedback.text}</div>}

          <section className="editor-card">
            <div className="editor-card-heading"><span>01</span><div><h2>Informações principais</h2><p>Nome, endereço e textos usados no catálogo.</p></div></div>
            <div className="editor-fields">
              <label className="field-wide"><span>Nome do pacote</span><input {...register("name", { ...required, minLength: 3, onBlur: (event) => { if (!watchedSlug) setValue("slug", makeSlug(event.target.value), { shouldDirty: true }); } })} />{errors.name && <small className="field-error">{errors.name.message}</small>}</label>
              <label className="field-wide"><span>Slug</span><input {...register("slug", required)} placeholder="ajuruteua-pa" />{errors.slug && <small className="field-error">{errors.slug.message}</small>}</label>
              <label className="field-wide"><span>Resumo</span><textarea rows={3} {...register("summary", { ...required, minLength: 20, maxLength: 500 })} />{errors.summary && <small className="field-error">Mínimo de 20 caracteres.</small>}</label>
              <label className="field-wide"><span>Descrição completa</span><textarea rows={7} {...register("description", { ...required, minLength: 50 })} />{errors.description && <small className="field-error">Mínimo de 50 caracteres.</small>}</label>
            </div>
          </section>

          <section className="editor-card">
            <div className="editor-card-heading"><span>02</span><div><h2>Datas, duração e destino</h2><p>Defina o roteiro principal e o ponto de embarque.</p></div></div>
            <div className="editor-fields">
              <label><span>Categoria</span><select {...register("categoryId", required)}><option value="">Selecionar</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label><span>Destino</span><select {...register("destinationId", { ...required, onChange: (event) => chooseDestination(event.target.value) })}><option value="">Selecionar</option>{destinations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label><span>Cidade</span><input {...register("city", required)} /></label>
              <label><span>Estado / UF</span><div className="compound-field"><input {...register("state", required)} /><input maxLength={2} {...register("stateCode", required)} /></div></label>
              <label><span>Saída</span><input type="date" {...register("departureAt", required)} /></label>
              <label><span>Retorno</span><input type="date" {...register("returnAt", required)} /></label>
              <label><span>Duração em dias</span><input type="number" min="1" {...register("durationDays", required)} /></label>
              <label><span>Horário de embarque</span><input type="time" {...register("boardingTime")} /></label>
              <label className="field-wide"><span>Local de embarque</span><input {...register("boardingLocation")} /></label>
            </div>
          </section>

          <section className="editor-card">
            <div className="editor-card-heading"><span>03</span><div><h2>Preços e parcelamento</h2><p>Condições exibidas no card e na página de detalhes.</p></div></div>
            <div className="editor-fields four-columns">
              <label><span>Preço à vista</span><input type="number" min="0.01" step="0.01" {...register("cashPrice", required)} /></label>
              <label><span>Parcelas</span><input type="number" min="1" max="24" {...register("installmentCount", required)} /></label>
              <label><span>Valor da parcela</span><input type="number" min="0" step="0.01" {...register("installmentValue")} /></label>
              <label><span>Total parcelado</span><input type="number" min="0" step="0.01" {...register("installmentTotal")} /></label>
            </div>
          </section>

          <section className="editor-card">
            <div className="editor-card-heading"><span>04</span><div><h2>Disponibilidade</h2><p>Controle de vagas separado do estado de publicação.</p></div></div>
            <div className="editor-fields four-columns">
              <label><span>Situação</span><select {...register("availabilityStatus")}><option value="AVAILABLE">Disponível</option><option value="FEW_SPOTS">Poucas vagas</option><option value="SOLD_OUT">Esgotado</option><option value="CANCELLED">Cancelado</option></select></label>
              <label><span>Vagas totais</span><input type="number" min="1" {...register("totalSpots")} /></label>
              <label><span>Vagas restantes</span><input type="number" min="0" {...register("remainingSpots")} /></label>
              <label className="checkbox-field"><input type="checkbox" {...register("showSpots")} /><span>Mostrar vagas no site</span></label>
            </div>
          </section>

          {savedId && initialData?.media?.length ? <ExistingMediaManager packageId={savedId} initialMedia={initialData.media} /> : null}
          <MediaUploader packageId={savedId} />

          <section className="editor-card">
            <div className="editor-card-heading"><span>06</span><div><h2>Itens inclusos e não inclusos</h2><p>Use uma linha para cada item.</p></div></div>
            <div className="editor-fields">
              <label><span>Inclusos</span><textarea rows={7} {...register("includedText")} placeholder={'Transporte ida e volta\nHospedagem'} /></label>
              <label><span>Não inclusos</span><textarea rows={7} {...register("excludedText")} placeholder={'Despesas pessoais\nRefeições não citadas'} /></label>
            </div>
          </section>

          <section className="editor-card">
            <div className="editor-card-heading"><span>07</span><div><h2>Roteiro</h2><p>Uma etapa por linha: dia | hora | título | detalhes.</p></div></div>
            <div className="editor-fields"><label className="field-wide"><span>Etapas do roteiro</span><textarea rows={9} {...register("itineraryText")} placeholder="1 | 06:00 | Embarque em Belém | Recepção e partida da equipe" /></label></div>
          </section>

          <section className="editor-card">
            <div className="editor-card-heading"><span>08</span><div><h2>Informações adicionais</h2><p>Logística, políticas e orientações ao viajante.</p></div></div>
            <div className="editor-fields">
              <label><span>Hospedagem</span><textarea rows={3} {...register("accommodation")} /></label>
              <label><span>Transporte</span><textarea rows={3} {...register("transport")} /></label>
              <label><span>Alimentação</span><textarea rows={3} {...register("meals")} /></label>
              <label><span>Guia responsável</span><input {...register("guide")} /></label>
              <label><span>Política infantil</span><textarea rows={3} {...register("childPolicy")} /></label>
              <label><span>Documentos necessários</span><textarea rows={3} {...register("requiredDocuments")} /></label>
              <label><span>Formas de pagamento</span><textarea rows={3} {...register("paymentMethods")} /></label>
              <label><span>Observações importantes</span><textarea rows={3} {...register("importantNotes")} /></label>
              <label className="field-wide"><span>URL do mapa</span><input type="url" {...register("mapUrl")} /></label>
            </div>
          </section>

          <section className="editor-card">
            <div className="editor-card-heading"><span>09</span><div><h2>SEO e compartilhamento</h2><p>Controle como o pacote aparece no Google e WhatsApp.</p></div></div>
            <div className="editor-fields">
              <label className="field-wide"><span>Título SEO</span><input maxLength={70} {...register("seoTitle")} /></label>
              <label className="field-wide"><span>Descrição SEO</span><textarea rows={3} maxLength={170} {...register("seoDescription")} /></label>
              <label className="field-wide"><span>Caminho da imagem de compartilhamento</span><input {...register("shareImagePath")} placeholder="/uploads/..." /></label>
            </div>
          </section>
        </div>

        <aside className="editor-side-column">
          <section className="editor-card publish-card">
            <span className="editor-eyebrow">Etapa 10</span>
            <h2>Revisão e publicação</h2>
            <label><span>Status</span><select {...register("publicationStatus")}><option value="DRAFT">Rascunho</option><option value="PUBLISHED">Publicado</option><option value="INACTIVE">Inativo</option><option value="ARCHIVED">Arquivado</option></select></label>
            <label><span>Publicar em</span><input type="datetime-local" {...register("publishedAt")} /></label>
            <label><span>Encerrar em</span><input type="datetime-local" {...register("publicationEndsAt")} /></label>
            <label className="toggle-row"><span><strong>Destacar pacote</strong><small>Exibir na página inicial</small></span><input type="checkbox" {...register("featured")} /></label>
            {featured && <><label><span>Ordem do destaque</span><input type="number" min="1" {...register("featuredOrder")} /></label><label><span>Início do destaque</span><input type="datetime-local" {...register("featuredStartsAt")} /></label><label><span>Fim do destaque</span><input type="datetime-local" {...register("featuredEndsAt")} /></label></>}
            <label className="toggle-row"><span><strong>Lista de espera</strong><small>Receber interesse quando esgotado</small></span><input type="checkbox" {...register("waitingListEnabled")} /></label>
            <div className="publish-checklist"><strong>Estado atual</strong><span><Check /> {publicationStatus === "PUBLISHED" ? "Visível se estiver no período válido" : "Não aparece no site público"}</span><span><Check /> Publicação e vagas são controles separados</span></div>
            <button className="button button-primary" type="submit" disabled={isSubmitting}><Save size={17} /> {isSubmitting ? "Salvando..." : savedId ? "Salvar alterações" : "Criar pacote"}</button>
            {savedId && watchedSlug ? <Link className="button button-secondary" href={`/pacotes/${watchedSlug}`} target="_blank"><Eye size={17} /> Abrir página pública</Link> : <button className="button button-secondary" type="button" disabled><Eye size={17} /> Salve para visualizar</button>}
          </section>
        </aside>
      </div>
    </form>
  );
}
