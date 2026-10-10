import { Globe } from "lucide-react";
import { LABEL_STATUS_PUBLIK, type StatusPublik } from "@/lib/schemas/publik";

/** Badge status publik: emas lembut + ikon + teks (dok. 06 §4.6). Aman dipakai di server maupun klien. */
export function BadgeStatus({ status }: { status: StatusPublik }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-gold-800">
      <Globe className="size-3.5" aria-hidden="true" />
      {LABEL_STATUS_PUBLIK[status]}
    </span>
  );
}
