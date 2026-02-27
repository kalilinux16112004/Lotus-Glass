import { Navbar } from "@/components/navbar";
import { HeroSlider } from "@/components/hero-slider";
import { StatsBand } from "@/components/stats-band";
import { AboutSection } from "@/components/about-section";
import { ServicesSection } from "@/components/services-section";
import { ProjectsSection } from "@/components/projects-section";
import { WhyChooseSection } from "@/components/why-choose-section";
import { WorkflowSection } from "@/components/workflow-section";
import { CTABanner } from "@/components/cta-banner";
import ContactSection from "@/components/contact-section";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <main>
      <Navbar />
      <HeroSlider />
      <StatsBand />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <WhyChooseSection />
      <WorkflowSection />
      <CTABanner />
      <ContactSection />
      <Footer />
    </main>
  );
}
