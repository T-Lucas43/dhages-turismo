export type Availability = "AVAILABLE" | "FEW_SPOTS" | "SOLD_OUT" | "CANCELLED";

export type TravelPackage = {
  id?: string;
  slug: string;
  name: string;
  destination: string;
  destinationSlug?: string;
  city?: string;
  state: string;
  stateCode?: string;
  category: string;
  categorySlug?: string;
  departure: string;
  departureIso?: string;
  returnDate: string;
  duration: string;
  durationDays?: number;
  price: number;
  installments: string;
  image: string;
  availability: Availability;
  featured?: boolean;
  summary: string;
  previewVideo?: string;
  videoPoster?: string;
  waitingListEnabled?: boolean;
  whatsappNumber?: string;
};

export const company = {
  name: "D’Hages Turismo",
  city: "Belém – PA",
  phones: ["(91) 99215-2727", "(91) 98114-9800"],
  whatsapp: "5591992152727",
  instagram: "@dhages_turismo",
  address:
    "Av. Senador Lemos, 3153, lojas 30/31, 1º piso, IT Center – Sacramento, Belém/PA",
  hours: "Segunda a sexta, das 9h às 18h · Sábado, das 9h às 13h",
};

export const packages: TravelPackage[] = [
  {
    slug: "ajuruteua-pa",
    name: "Ajuruteua — PA",
    destination: "Ajuruteua",
    destinationSlug: "ajuruteua-pa",
    city: "Bragança",
    state: "Pará",
    stateCode: "PA",
    category: "Praia",
    categorySlug: "praias-ilhas",
    departure: "23 set 2026",
    departureIso: "2026-09-23T09:00:00-03:00",
    returnDate: "24 set 2026",
    duration: "2 dias e 1 noite",
    durationDays: 2,
    price: 489,
    installments: "6x de R$ 86,50",
    image: "/media/destinations/ajuruteua.webp",
    availability: "FEW_SPOTS",
    featured: true,
    summary:
      "Areia clara, mar aberto e uma experiência leve para renovar as energias no litoral paraense.",
  },
  {
    slug: "carolina-chapada-das-mesas",
    name: "Carolina — Chapada das Mesas",
    destination: "Carolina",
    destinationSlug: "carolina-ma",
    city: "Carolina",
    state: "Maranhão",
    stateCode: "MA",
    category: "Aventura",
    categorySlug: "aventura",
    departure: "10 set 2026",
    departureIso: "2026-09-10T05:00:00-03:00",
    returnDate: "14 set 2026",
    duration: "5 dias e 4 noites",
    durationDays: 5,
    price: 1490,
    installments: "10x de R$ 165,00",
    image: "/media/destinations/chapada-das-mesas.webp",
    availability: "AVAILABLE",
    featured: true,
    summary:
      "Cachoeiras, trilhas e paisagens grandiosas em um roteiro acompanhado do começo ao fim.",
  },
  {
    slug: "alter-do-chao-para",
    name: "Alter do Chão — PA",
    destination: "Alter do Chão",
    destinationSlug: "alter-do-chao-pa",
    city: "Santarém",
    state: "Pará",
    stateCode: "PA",
    category: "Natureza",
    categorySlug: "natureza",
    departure: "12 out 2026",
    departureIso: "2026-10-12T06:00:00-03:00",
    returnDate: "16 out 2026",
    duration: "5 dias e 4 noites",
    durationDays: 5,
    price: 2190,
    installments: "10x de R$ 239,00",
    image: "/media/destinations/alter-do-chao.webp",
    availability: "AVAILABLE",
    featured: true,
    summary:
      "Dias de descanso entre águas tranquilas, floresta e os encantos amazônicos do Tapajós.",
  },
  {
    slug: "mosqueiro-feriado",
    name: "Mosqueiro — Feriado",
    destination: "Ilha do Mosqueiro",
    destinationSlug: "mosqueiro-pa",
    city: "Belém",
    state: "Pará",
    stateCode: "PA",
    category: "Bate e volta",
    categorySlug: "bate-e-volta",
    departure: "15 nov 2026",
    departureIso: "2026-11-15T06:00:00-03:00",
    returnDate: "15 nov 2026",
    duration: "1 dia",
    durationDays: 1,
    price: 189,
    installments: "3x de R$ 66,00",
    image: "/media/destinations/mosqueiro.webp",
    availability: "SOLD_OUT",
    summary:
      "Um dia inteiro para curtir a ilha com embarque organizado em Belém e suporte da equipe.",
  },
  {
    slug: "salinas-verao-paraense",
    name: "Salinas — Verão paraense",
    destination: "Salinópolis",
    destinationSlug: "salinopolis-pa",
    city: "Salinópolis",
    state: "Pará",
    stateCode: "PA",
    category: "Praia",
    categorySlug: "praias-ilhas",
    departure: "5 dez 2026",
    departureIso: "2026-12-05T06:00:00-03:00",
    returnDate: "7 dez 2026",
    duration: "3 dias e 2 noites",
    durationDays: 3,
    price: 899,
    installments: "8x de R$ 121,00",
    image: "/media/destinations/salinas.webp",
    availability: "AVAILABLE",
    summary:
      "Praia, gastronomia e dias leves na costa atlântica do Pará, com saída organizada de Belém.",
  },
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

export const whatsappUrl = (message: string, number = company.whatsapp) =>
  `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
