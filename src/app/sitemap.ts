import type { MetadataRoute } from "next";
import { serverEnv } from "@/lib/env";
import { getPublicPackages } from "@/lib/public-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = serverEnv.APP_URL.replace(/\/$/, "");
  const packages = await getPublicPackages();
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pacotes`, lastModified: now, changeFrequency: "daily", priority: .9 },
    { url: `${base}/destinos`, lastModified: now, changeFrequency: "weekly", priority: .8 },
    { url: `${base}/sobre`, lastModified: now, changeFrequency: "monthly", priority: .6 },
    { url: `${base}/contato`, lastModified: now, changeFrequency: "monthly", priority: .6 },
    ...packages.map((item) => ({ url: `${base}/pacotes/${item.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: .85 })),
  ];
}
