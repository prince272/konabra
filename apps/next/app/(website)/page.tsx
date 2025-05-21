import { AlertsSection } from "@/components/website/alerts-section";
import { ContactUsSection } from "@/components/website/contact-us-section";
import { FeaturesSection } from "@/components/website/features-section";
import { HeroSection } from "@/components/website/hero-section";
import { IncidentsMapSection } from "@/components/website/incidents-map-section";
import { StatsSection } from "@/components/website/stats-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <AlertsSection />
      <IncidentsMapSection />
      <ContactUsSection />
    </>
  );
}
