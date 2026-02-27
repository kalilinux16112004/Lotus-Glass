import { Navbar } from "@/components/navbar";
import { WhyChooseSection } from "@/components/why-choose-section";
import { WorkflowSection } from "@/components/workflow-section";
import { CTABanner } from "@/components/cta-banner";
import { Footer } from "@/components/footer";

export default function QualityPage() {
  return (
    <main>
      <Navbar />
      <WhyChooseSection />
      <section className="relative py-24 lg:py-32 bg-background overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-12 bg-accent" />
            <span className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
              Quality Assurance
            </span>
            <div className="h-px w-12 bg-accent/30" />
          </div>
          <div className="mb-16 max-w-2xl">
            <h2 className="font-serif text-3xl font-bold leading-[1.15] text-foreground md:text-4xl lg:text-5xl text-balance">
              Verified at Every Stage
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
              From design validation to final handover, each step is documented, tested, and
              reviewed to ensure long-term performance.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl p-8 shadow-lg">
              <h3 className="text-lg font-bold text-card-foreground">Quality Checkpoints</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {[
                  "Design intent review and structural calculations",
                  "Mock-up validation and facade performance testing",
                  "Material traceability and vendor audit records",
                  "On-site installation audits and torque verification",
                  "Water, air, and seismic movement validation",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl p-8 shadow-lg">
              <h3 className="text-lg font-bold text-card-foreground">Safety & Compliance</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Our teams follow strict compliance protocols for occupational safety, fire ratings,
                and building code requirements on every project.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  "NBC Compliant",
                  "Fire Safe Materials",
                  "Site Safety Audits",
                  "Certified Installers",
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
      <Footer />
    </main>
  );
}
