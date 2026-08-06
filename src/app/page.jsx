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

export default function Home() {
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
          href="https://wa.me/6285155433613"
          className="group inline-flex items-center justify-center gap-0 md:gap-2 w-14 h-14 aspect-square md:w-auto md:h-auto md:aspect-auto px-0 md:px-4 py-0 md:py-3 overflow-hidden rounded-full bg-[#25D366] shadow-xl transition duration-200 hover:bg-[#1ebe57] hover:shadow-2xl"
          aria-label="WhatsApp"
        >
          <img
            src="/whatsapp-logo.webp"
            alt="WhatsApp"
            className="w-10 h-10 object-contain transition duration-200 group-hover:brightness-90"
          />
          <span className="hidden text-sm font-semibold text-white md:inline">Hubungi Kami</span>
        </Link>
      </div>
    </>
  );
}
