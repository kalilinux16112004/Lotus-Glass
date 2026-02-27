import { Navbar } from "@/components/navbar";
import { ServicesSection } from "@/components/services-section";
import { WorkflowSection } from "@/components/workflow-section";
import { CTABanner } from "@/components/cta-banner";
import ContactSection from "@/components/contact-section";
import { Footer } from "@/components/footer";

export default function ServicesPage() {
  return (
    <main>
      <Navbar forceSolid />
      <ServicesSection />
      <section className="relative py-24 lg:py-32 bg-background overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "52px 52px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-12 bg-accent" />
            <span className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
              Expanded Services
            </span>
            <div className="h-px w-12 bg-accent/30" />
          </div>
          <div className="mb-16 max-w-2xl">
            <h2 className="font-serif text-3xl font-bold leading-[1.15] text-foreground md:text-4xl lg:text-5xl text-balance">
              Delivery Models That Fit Your Project
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
              Choose a collaboration model that aligns with your design phase, budget, and timeline.
              We support everything from engineering-only scopes to turnkey facade delivery.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "Design + Build",
                text:
                  "Single-point responsibility across design, procurement, fabrication, and installation for simplified delivery.",
              },
              {
                title: "Engineering Support",
                text:
                  "Facade engineering, calculations, detailing, and value engineering for architect-led projects.",
              },
              {
                title: "Retrofit & Upgrades",
                text:
                  "Modernization and performance upgrades for existing facades with minimal disruption to operations.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl p-7 shadow-lg"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
                <h3 className="text-lg font-bold text-card-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-xl font-bold text-card-foreground">Materials & Standards</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  All systems use certified glass, aluminum, sealants, and fasteners verified for
                  weather, fire, and structural performance.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  "IS/EN/ASTM compliant",
                  "Wind & water tested",
                  "Fire-rated options",
                  "Thermal optimized",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <WorkflowSection />
      <CTABanner />
      <ContactSection />
      <Footer />
    </main>
  );
}
