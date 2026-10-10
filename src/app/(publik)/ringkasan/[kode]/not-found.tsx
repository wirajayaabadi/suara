import { KontenTidakTersedia } from "@/features/konten/HalamanKonten";

export default function TidakDitemukan() {
  return (
    <div className="flex min-h-svh flex-col">
      <KontenTidakTersedia />
    </div>
  );
}
