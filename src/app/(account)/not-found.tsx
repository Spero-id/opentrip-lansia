import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <p className="text-7xl font-extrabold tracking-tight text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Halaman akun tidak ditemukan</h1>
      <Link href="/profile" className={`${buttonVariants()} mt-2`}>
        Ke Profil
      </Link>
    </div>
  );
}
