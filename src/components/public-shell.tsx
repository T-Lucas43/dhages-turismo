import type { ReactNode } from "react";
import { Footer } from "./footer";
import { Header } from "./header";
import { MobileBar } from "./mobile-bar";
import { ScrollProgress } from "./motion/scroll-progress";
import { getPublicCompany } from "@/lib/public-data";

export async function PublicShell({ children }: { children: ReactNode }) {
  const company = await getPublicCompany();
  return <><ScrollProgress /><Header company={company} /><main>{children}</main><Footer company={company} /><MobileBar /></>;
}
