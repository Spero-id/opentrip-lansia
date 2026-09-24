import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import MarketingSection from "@/components/landing/MarketingSection";
import TutorialSection from "@/components/landing/TutorialSection";
import DestinationSection from "@/components/landing/DestinationSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import Footer from "@/components/layout/Footer";
import Subs from "@/components/landing/Subs";
import FaqSection from "@/components/landing/FAQSection";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";

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
      <WhatsAppFloat />
    </>
  );
}
