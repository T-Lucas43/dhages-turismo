import Link from "next/link";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { PackageCard } from "@/components/package-card";
import { PublicShell } from "@/components/public-shell";
import { getPublicPackages } from "@/lib/public-data";

export const metadata = { title: "Pacotes de viagem", description: "Encontre pacotes de viagem saindo de Belém com atendimento personalizado." };

function one(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] ?? "" : value ?? ""; }

export default async function PackagesPage({ searchParams }: PageProps<"/pacotes">) {
  const params = await searchParams;
  const allPackages = await getPublicPackages();
  const busca = one(params.busca).trim().toLowerCase();
  const destino = one(params.destino);
  const categoria = one(params.categoria);
  const estado = one(params.estado);
  const cidade = one(params.cidade);
  const data = one(params.data);
  const preco = one(params.preco);
  const duracao = one(params.duracao);
  const disponibilidade = one(params.disponibilidade);
  const ordem = one(params.ordem) || "recentes";
  const page = Math.max(1, Number(one(params.pagina)) || 1);
  const pageSize = 9;

  let filtered = allPackages.filter((item) => {
    const searchable = `${item.name} ${item.destination} ${item.city ?? ""} ${item.state} ${item.category}`.toLowerCase();
    if (busca && !searchable.includes(busca)) return false;
    if (destino && item.destinationSlug !== destino && item.destination !== destino) return false;
    if (categoria && item.categorySlug !== categoria && item.category !== categoria) return false;
    if (estado && item.stateCode !== estado && item.state !== estado) return false;
    if (cidade && item.city !== cidade) return false;
    if (data && item.departureIso && item.departureIso.slice(0, 10) < data) return false;
    if (preco === "ate-500" && item.price > 500) return false;
    if (preco === "500-1500" && (item.price < 500 || item.price > 1500)) return false;
    if (preco === "acima-1500" && item.price <= 1500) return false;
    if (duracao === "1-2" && (item.durationDays ?? 0) > 2) return false;
    if (duracao === "3-5" && ((item.durationDays ?? 0) < 3 || (item.durationDays ?? 0) > 5)) return false;
    if (duracao === "6+" && (item.durationDays ?? 0) < 6) return false;
    if (disponibilidade && item.availability !== disponibilidade) return false;
    return true;
  });
  filtered = [...filtered].sort((a, b) => ordem === "menor" ? a.price - b.price : ordem === "maior" ? b.price - a.price : ordem === "proxima" ? new Date(a.departureIso ?? 0).getTime() - new Date(b.departureIso ?? 0).getTime() : new Date(b.departureIso ?? 0).getTime() - new Date(a.departureIso ?? 0).getTime());
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const destinations = Array.from(new Map(allPackages.map((item) => [item.destinationSlug ?? item.destination, item.destination])).entries());
  const categories = Array.from(new Map(allPackages.map((item) => [item.categorySlug ?? item.category, item.category])).entries());
  const states = Array.from(new Map(allPackages.map((item) => [item.stateCode ?? item.state, item.state])).entries());
  const cities = Array.from(new Set(allPackages.map((item) => item.city).filter(Boolean))) as string[];
  const hasFilters = Boolean(busca || destino || categoria || estado || cidade || data || preco || duracao || disponibilidade);

  return <PublicShell>
    <section className="page-hero compact-hero"><div className="shell"><span className="eyebrow eyebrow-light">Próximas experiências</span><h1>Encontre a viagem que combina com você</h1><p>Pesquise, compare e fale com a nossa equipe para cuidar dos próximos passos.</p></div></section>
    <section className="catalog shell">
      <form id="catalog-filters" className="filter-panel" action="/pacotes">
        <div className="filter-title"><h2><SlidersHorizontal size={19} /> Filtros</h2><Link href="/pacotes">Limpar</Link></div>
        <label><span>Buscar</span><div className="field"><Search size={17} /><input name="busca" defaultValue={one(params.busca)} placeholder="Destino ou pacote" /></div></label>
        <label><span>Destino</span><select name="destino" defaultValue={destino}><option value="">Todos os destinos</option>{destinations.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>Categoria</span><select name="categoria" defaultValue={categoria}><option value="">Todas</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>Estado</span><select name="estado" defaultValue={estado}><option value="">Todos</option>{states.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>Cidade</span><select name="cidade" defaultValue={cidade}><option value="">Todas</option>{cities.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>A partir de</span><input name="data" defaultValue={data} type="date" /></label>
        <label><span>Faixa de preço</span><select name="preco" defaultValue={preco}><option value="">Qualquer valor</option><option value="ate-500">Até R$ 500</option><option value="500-1500">R$ 500 a R$ 1.500</option><option value="acima-1500">Acima de R$ 1.500</option></select></label>
        <label><span>Duração</span><select name="duracao" defaultValue={duracao}><option value="">Qualquer duração</option><option value="1-2">1 a 2 dias</option><option value="3-5">3 a 5 dias</option><option value="6+">6 dias ou mais</option></select></label>
        <label><span>Disponibilidade</span><select name="disponibilidade" defaultValue={disponibilidade}><option value="">Todas</option><option value="AVAILABLE">Disponível</option><option value="FEW_SPOTS">Poucas vagas</option><option value="SOLD_OUT">Esgotado</option></select></label>
        <button className="button button-primary button-block" type="submit">Aplicar filtros</button>
      </form>
      <div className="catalog-results">
        <div className="catalog-toolbar"><div><strong>{filtered.length} pacote{filtered.length === 1 ? "" : "s"} encontrado{filtered.length === 1 ? "" : "s"}</strong><span>Saindo de Belém e região</span></div><form className="sort-form"><input type="hidden" name="busca" value={one(params.busca)} /><input type="hidden" name="destino" value={destino} /><input type="hidden" name="categoria" value={categoria} /><label><span>Ordenar:</span><select name="ordem" defaultValue={ordem}><option value="recentes">Mais recentes</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option><option value="proxima">Data mais próxima</option></select></label><button type="submit">Aplicar</button></form><a className="mobile-filter-button" href="#catalog-filters"><SlidersHorizontal size={18} /> Filtros</a></div>
        {hasFilters && <div className="active-filter"><Link href="/pacotes">Limpar filtros <X size={14} /></Link></div>}
        {visible.length ? <div className="package-grid catalog-grid">{visible.map((item) => <PackageCard key={item.slug} item={item} />)}</div> : <div className="public-empty"><Search /><strong>Nenhum pacote combina com esses filtros</strong><p>Limpe os filtros ou fale com a equipe para montar uma opção.</p><Link className="button button-primary" href="/pacotes">Limpar filtros</Link></div>}
        {totalPages > 1 && <nav className="pagination" aria-label="Paginação">{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <Link className={number === page ? "active" : ""} key={number} href={{ pathname: "/pacotes", query: { ...params, pagina: number } }}>{number}</Link>)}</nav>}
      </div>
    </section>
  </PublicShell>;
}
