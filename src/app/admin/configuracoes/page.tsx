import { SettingsForm } from "@/components/admin/settings-form";
import { prisma } from "@/lib/prisma";

const optional = (value: string | null) => value ?? "";

export default async function SettingsPage() {
  const settings = await prisma.companySettings.findUnique({ where: { singletonKey: "default" } });
  if (!settings) return <div className="admin-content"><div className="admin-empty"><strong>Configurações não encontradas</strong><p>Execute o seed do banco para criar o cadastro inicial.</p></div></div>;
  const initialValues = { companyName: settings.companyName, city: settings.city, state: settings.state, phonePrimary: settings.phonePrimary, phoneSecondary: optional(settings.phoneSecondary), whatsappNumber: settings.whatsappNumber, instagramHandle: optional(settings.instagramHandle), address: settings.address, businessHours: optional(settings.businessHours), mapEmbedUrl: optional(settings.mapEmbedUrl), aboutTitle: optional(settings.aboutTitle), aboutText: optional(settings.aboutText), mission: optional(settings.mission), vision: optional(settings.vision), valuesText: optional(settings.valuesText), fewSpotsThreshold: settings.fewSpotsThreshold, maxFeaturedPackages: settings.maxFeaturedPackages, logoDarkPath: optional(settings.logoDarkPath), logoLightPath: optional(settings.logoLightPath), defaultShareImagePath: optional(settings.defaultShareImagePath) };
  return <div className="admin-content settings-page"><div className="admin-welcome"><div><span>Sistema</span><h1>Configurações</h1><p>Informações da empresa, regras e conteúdo institucional.</p></div></div><SettingsForm initialValues={initialValues} /></div>;
}
