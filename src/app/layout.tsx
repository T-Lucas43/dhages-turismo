import type { Metadata } from "next";
import "./globals.css";
import { serverEnv } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(serverEnv.APP_URL),
  title: {
    default: "D’Hages Turismo | Sua próxima viagem começa aqui",
    template: "%s | D’Hages Turismo",
  },
  description: "Pacotes de viagem saindo de Belém com atendimento próximo, roteiros selecionados e suporte em cada etapa.",
  keywords: ["turismo em Belém", "pacotes de viagem", "D’Hages Turismo", "viagens no Pará"],
  applicationName: "D’Hages Turismo",
  creator: "D’Hages Turismo",
  openGraph: { type: "website", locale: "pt_BR", siteName: "D’Hages Turismo", title: "D’Hages Turismo | Sua próxima viagem começa aqui", description: "Pacotes de viagem saindo de Belém com atendimento próximo e suporte em cada etapa.", images: [{ url: "/brand/logo.webp" }] },
  twitter: { card: "summary_large_image", title: "D’Hages Turismo", description: "Sua próxima viagem começa aqui.", images: ["/brand/logo.webp"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
