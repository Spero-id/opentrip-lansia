import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import MarketingSection from "@/components/landing/MarketingSection";
import TutorialSection from "@/components/landing/TutorialSection";
import DestinationSection from "@/components/landing/DestinationSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import Subs from "@/components/landing/Subs";
import FaqSection from "@/components/landing/FAQSection";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const WHATSAPP_MESSAGE = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "Halo Abangkuh, saya ingin bertanya tentang trip di Jelajah Memoria";

export default function Home() {

   const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <MarketingSection />
        <DestinationSection />
        <TutorialSection />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <Subs />
      <Footer />
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
          <span className="hidden text-sm font-medium text-white md:inline">Hubungi Kami</span>
        </Link>
      </div>
    </>
  );
}
