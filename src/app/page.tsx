import Link from "next/link";
import { ArrowRight, CalendarDays, Headphones, MapPin, MessageCircle, Search, ShieldCheck, Star, Users } from "lucide-react";
import { PackageCard } from "@/components/package-card";
import { HeroBackground } from "@/components/motion/hero-background";
import { Reveal } from "@/components/motion/reveal";
import { PublicShell } from "@/components/public-shell";
import { SectionHeading } from "@/components/section-heading";
import { whatsappUrl } from "@/data/demo";
import { getPublicCompany, getPublicHomeContent, getPublicPackages } from "@/lib/public-data";

const categoryIcons = ["☀", "❋", "⌁", "↗"];

const benefits = [
  { icon: ShieldCheck, title: "Viaje com segurança", text: "Roteiros planejados, parceiros selecionados e suporte durante toda a jornada." },
  { icon: Headphones, title: "Atendimento de verdade", text: "Nossa equipe está perto antes, durante e depois da sua viagem." },
  { icon: Users, title: "Experiências em grupo", text: "Um jeito leve de descobrir destinos e criar novas amizades." },
];

export default async function Home() {
  const [packages, content, company] = await Promise.all([getPublicPackages(), getPublicHomeContent(), getPublicCompany()]);
  return (
    <PublicShell>
      <section className="hero">
        <HeroBackground />
        <div className="hero-shade" />
        <div className="hero-orbit orbit-one" aria-hidden="true" />
        <div className="hero-orbit orbit-two" aria-hidden="true" />
        <div className="shell hero-content">
          <Reveal className="hero-copy" distance={18}>
            <span className="hero-kicker">Descubra o melhor do Norte do Brasil</span>
            <h1>Sua próxima viagem <em>começa aqui</em></h1>
            <p>Pacotes especiais, atendimento próximo e cada detalhe cuidado para você viajar com tranquilidade.</p>
            <div className="hero-proof">
              <div className="avatars"><span>DH</span><span>LT</span><span>AS</span></div>
              <div><strong>+1.200 viajantes</strong><small><Star size={13} fill="currentColor" /> 4,9 de avaliação</small></div>
            </div>
          </Reveal>
          <Reveal delay={0.14} distance={22}><form className="search-panel" action="/pacotes">
            <div className="search-heading"><Search size={20} /><div><strong>Encontre seu próximo destino</strong><span>Escolha os detalhes da sua viagem</span></div></div>
            <label><span>Destino</span><div className="field"><MapPin size={18} /><input name="busca" placeholder="Para onde você quer ir?" /></div></label>
            <div className="field-grid">
              <label><span>Quando?</span><div className="field"><CalendarDays size={18} /><input name="data" type="date" /></div></label>
              <label><span>Categoria</span><select name="categoria" defaultValue=""><option value="">Todas</option>{content.categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label>
            </div>
            <label><span>Faixa de preço</span><select name="preco" defaultValue=""><option value="">Qualquer valor</option><option>Até R$ 500</option><option>R$ 500 a R$ 1.500</option><option>Acima de R$ 1.500</option></select></label>
            <button className="button button-gold button-block" type="submit"><Search size={18} /> Buscar pacotes</button>
          </form></Reveal>
        </div>
        <div className="hero-scroll">Explore <span>↓</span></div>
      </section>

      <section className="section shell">
        <SectionHeading eyebrow="Escolhidos para você" title="Pacotes em destaque" text="Experiências selecionadas para viver dias inesquecíveis." href="/pacotes" linkLabel="Ver todos os pacotes" />
        {packages.length ? <Reveal className="package-grid">{packages.filter((item) => item.featured).concat(packages.filter((item) => !item.featured)).slice(0, 3).map((item) => <PackageCard key={item.slug} item={item} />)}</Reveal> : <div className="public-empty"><strong>Novas viagens em preparação</strong><p>Fale com nossa equipe para conhecer os próximos roteiros.</p></div>}
      </section>

      <section className="section section-soft"><div className="shell">
        <SectionHeading eyebrow="Do seu jeito" title="Qual viagem combina com você?" text="Escolha uma experiência e deixe o restante com a gente." />
        <Reveal className="category-grid">{content.categories.map((category, index) => <Link href={`/pacotes?categoria=${encodeURIComponent(category.slug)}`} className="category-card" key={category.slug}><span>{categoryIcons[index % categoryIcons.length]}</span><div><h3>{category.name}</h3><p>{category.count} roteiro{category.count === 1 ? "" : "s"}</p></div><ArrowRight size={20} /></Link>)}</Reveal>
      </div></section>

      <section className="section shell benefits-section">
        <Reveal className="benefits-photo"><img src="/media/destinations/alter-do-chao.webp" alt="Paisagem brasileira cercada de natureza" loading="lazy" /><div className="experience-badge"><strong>10+</strong><span>anos criando<br />boas histórias</span></div></Reveal>
        <Reveal delay={0.1}><span className="eyebrow">Por que escolher a D’Hages?</span><h2>Mais que uma viagem.<br />Uma experiência bem cuidada.</h2><p className="lead">Da primeira conversa ao retorno para casa, você conta com uma equipe que conhece o seu destino.</p><div className="benefit-list">{benefits.map(({ icon: Icon, title, text }) => <div key={title}><span><Icon /></span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div><Link className="text-link" href="/sobre">Conheça a nossa história <ArrowRight size={18} /></Link></Reveal>
      </section>

      {content.testimonial && <section className="testimonial-section"><div className="shell testimonial-inner"><div><span className="eyebrow eyebrow-light">Histórias reais</span><h2>Quem viaja com a gente, recomenda.</h2><p>“{content.testimonial.quote}”</p><div className="testimonial-author"><span>{content.testimonial.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("")}</span><div><strong>{content.testimonial.name}</strong><small>{content.testimonial.destination}</small></div></div></div><div className="testimonial-score"><strong>{content.testimonial.rating},0</strong><span>{"★".repeat(content.testimonial.rating)}</span><small>avaliação desta experiência</small></div></div></section>}

      {content.gallery.length > 0 && <section className="section shell"><SectionHeading eyebrow="Histórias em imagens" title="Galeria de viagens realizadas" text="Um pouco dos lugares e encontros que já vivemos juntos." /><div className="public-gallery">{content.gallery.map((item) => item.mediaType === "VIDEO" ? <video key={item.id} src={item.path} controls preload="metadata" aria-label={item.altText ?? item.title ?? "Vídeo de viagem"} /> : <img key={item.id} src={item.path} alt={item.altText ?? item.title ?? "Viagem D’Hages"} loading="lazy" />)}</div></section>}

      {content.faqs.length > 0 && <section className="section section-soft"><div className="shell faq-section"><SectionHeading eyebrow="Antes de viajar" title="Perguntas frequentes" text="Respostas rápidas para planejar com tranquilidade." /><div className="faq-list">{content.faqs.map((faq) => <details key={faq.id}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></div></section>}

      <section className="section shell cta-section"><div><span className="eyebrow">Vamos planejar?</span><h2>Seu próximo destino está esperando.</h2><p>Converse com a nossa equipe e encontre o pacote ideal para você.</p></div><a className="button button-gold" href={whatsappUrl("Olá! Quero ajuda para escolher minha próxima viagem.", company.whatsapp)} target="_blank" rel="noreferrer"><MessageCircle size={19} /> Falar com um especialista</a></section>
    </PublicShell>
  );
}
