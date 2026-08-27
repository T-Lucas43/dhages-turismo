import type { MetadataRoute } from "next";
import { serverEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = serverEnv.APP_URL.replace(/\/$/, "");
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin", "/acesso-administrativo", "/uploads"] }, sitemap: `${base}/sitemap.xml`, host: base };
}
