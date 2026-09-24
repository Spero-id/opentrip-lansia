import Link from "next/link";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const WHATSAPP_MESSAGE =
  process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
  "Halo Abangkuh, saya ingin bertanya tentang trip di Jelajah Memoria";

export default function WhatsAppFloat() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Link
        href={whatsappUrl}
        className="group inline-flex items-center justify-center gap-0 md:gap-2 w-14 h-14 aspect-square md:w-auto md:h-auto md:aspect-auto px-0 md:px-4 py-0 md:py-3 overflow-hidden rounded-full bg-[#25D366] shadow-xl transition duration-200 hover:bg-[#1ebe57] hover:shadow-2xl"
        aria-label="WhatsApp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="/whatsapp-logo.webp"
          alt="WhatsApp"
          className="w-10 h-10 object-contain transition duration-200 group-hover:brightness-90"
        />
        <span className="hidden text-sm font-medium text-white md:inline">
          Hubungi Kami
        </span>
      </Link>
    </div>
  );
}
