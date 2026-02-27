import { Navbar } from "@/components/navbar";
import { ProjectsSection } from "@/components/projects-section";
import { CTABanner } from "@/components/cta-banner";
import ContactSection from "@/components/contact-section";
import { Footer } from "@/components/footer";

export default function ProjectsPage() {
  return (
    <main>
      <Navbar forceSolid />
      <ProjectsSection />
      <section className="relative py-24 lg:py-32 bg-secondary overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, currentColor 1px, transparent 1px), linear-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-12 bg-accent" />
            <span className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
              Case Highlights
            </span>
            <div className="h-px w-12 bg-accent/30" />
          </div>
          <div className="mb-16 max-w-2xl">
            <h2 className="font-serif text-3xl font-bold leading-[1.15] text-secondary-foreground md:text-4xl lg:text-5xl text-balance">
              Deeper Project Insights
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
              A closer look at how we solve complex facade challenges with engineering precision
              and on-site accountability.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "High-Rise Curtain Wall",
                scope: "Unitized system with high wind-load performance and rapid floor-to-floor installation.",
                result: "Delivered ahead of schedule with zero leakage incidents during monsoon testing.",
              },
              {
                title: "Retail + Hospitality Complex",
                scope: "ACP cladding, skylights, and glass canopy detailing across multiple entrances.",
                result: "Unified facade language across retail and hotel zones with improved daylighting.",
              },
              {
                title: "Healthcare Facility",
                scope: "Structural glazing with enhanced acoustic and thermal insulation requirements.",
                result: "Reduced HVAC load while maintaining sterile, glare-free interiors.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl p-7 shadow-lg"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
                <h3 className="text-lg font-bold text-card-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.scope}</p>
                <div className="mt-4 rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-xs font-semibold text-accent">
                  {item.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTABanner />
      <ContactSection />
      <Footer />
    </main>
  );
}
