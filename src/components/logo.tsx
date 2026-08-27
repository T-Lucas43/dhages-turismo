import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand-logo" aria-label="D’Hages Turismo — início">
      <span className={compact ? "brand-mark compact" : "brand-mark"}>
        <Image
          src="/brand/logo.webp"
          alt="Símbolo da D’Hages Turismo"
          fill
          sizes={compact ? "44px" : "56px"}
          priority
        />
      </span>
      <span className="brand-copy">
        <strong>D’Hages</strong>
        <small>Turismo</small>
      </span>
    </Link>
  );
}
