import { FormDialog } from "@/features/formulir/FormDialog";
import { ambilKategoriPublik } from "@/server/dal/publik";

/** Form pelanggaran sebagai dialog di atas halaman yang sedang dibuka. */
export default async function DialogKirim() {
  const kategori = await ambilKategoriPublik();
  return <FormDialog jenis="pelanggaran" kategori={kategori.WB} />;
}
