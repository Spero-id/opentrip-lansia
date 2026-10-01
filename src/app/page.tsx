import HeroSection from "@/features/landing/components/HeroSection";
import MarketingSection from "@/features/landing/components/MarketingSection";
import TutorialSection from "@/features/landing/components/TutorialSection";
import DestinationSection from "@/features/landing/components/DestinationSection";
import TestimonialsSection from "@/features/landing/components/TestimonialsSection";
import Subs from "@/features/newsletter/components/Subs";
import FaqSection from "@/features/landing/components/FAQSection";

export default function Home() {
  return (
    <>
      <main>
        <HeroSection />
        <MarketingSection />
        <DestinationSection />
        <TutorialSection />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <Subs />
    </>
  );
}
