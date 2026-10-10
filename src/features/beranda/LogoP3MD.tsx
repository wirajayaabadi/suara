import Image from "next/image";
import { NAMA_LEMBAGA } from "@/lib/konstanta";

/**
 * Logo P3MD dengan warna asli: tanpa filter, tint, opacity, atau blend (dok. 06 §8).
 * Rasio asli 1024×1280 (4:5). Tinggi minimum 48px.
 */
export function LogoP3MD({
  tinggi,
  segera = false,
  className,
}: {
  tinggi: number;
  /** Logo di atas lipatan: muat segera, bukan lazy. */
  segera?: boolean;
  className?: string;
}) {
  const t = Math.max(48, tinggi);
  return (
    <Image
      src="/brand/logo-p3md.png"
      alt={`Logo ${NAMA_LEMBAGA}`}
      height={t}
      width={Math.round((t * 4) / 5)}
      loading={segera ? "eager" : "lazy"}
      className={className}
    />
  );
}
