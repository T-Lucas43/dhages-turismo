import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({ eyebrow, title, text, href, linkLabel }: { eyebrow: string; title: string; text?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="section-heading">
      <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>
      {href && <Link href={href}>{linkLabel ?? "Ver tudo"} <ArrowRight size={18} /></Link>}
    </div>
  );
}
