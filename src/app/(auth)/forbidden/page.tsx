import Link from "next/link";
import { Home, Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <Lock className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          403 Forbidden
        </h1>
        <p className="text-muted-foreground mb-8">
          Anda tidak memiliki akses untuk membuka halaman ini.
        </p>
        <Link
          href="/"
          className={`${buttonVariants({ size: "lg" })} w-full`}
        >
          <Home className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
