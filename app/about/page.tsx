import { Navbar } from "@/components/navbar";
import { AboutSection } from "@/components/about-section";
import { WhyChooseSection } from "@/components/why-choose-section";
import { WorkflowSection } from "@/components/workflow-section";
import { CTABanner } from "@/components/cta-banner";
import { Footer } from "@/components/footer";

export default function AboutPage() {
  return (
    <main>
      <Navbar forceSolid />
      <AboutSection />
      <section className="relative py-24 lg:py-32 bg-secondary overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, currentColor 1px, transparent 1px), linear-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-12 bg-accent" />
            <span className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
              Company Profile
            </span>
            <div className="h-px w-12 bg-accent/30" />
          </div>
          <div className="mb-16 max-w-2xl">
            <h2 className="font-serif text-3xl font-bold leading-[1.15] text-secondary-foreground md:text-4xl lg:text-5xl text-balance">
              Beyond Facades: A Trusted Engineering Partner
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
              Our team combines engineering, project management, and site execution to deliver
              predictable outcomes on complex architectural envelopes. Every project is guided
              by certified materials, clear documentation, and transparent milestone tracking.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "Leadership & Governance",
                text:
                  "A senior engineering team oversees design approvals, vendor audits, and on-site safety compliance on every project.",
              },
              {
                title: "In-House Capabilities",
                text:
                  "Dedicated facade engineering, site coordination, and quality inspection teams ensure consistent delivery across locations.",
              },
              {
                title: "Sustainable Execution",
                text:
                  "We optimize material usage, reduce waste, and prioritize durable systems that minimize long-term maintenance.",
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
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-card-foreground">Milestones & Coverage</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Multi-city delivery with standardized processes and dedicated regional teams.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  "18+ cities",
                  "500+ facades delivered",
                  "2 decades of execution",
                  "Dedicated QA teams",
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
      <WhyChooseSection />
      <WorkflowSection />
      <CTABanner />
      <Footer />
    </main>
  );
}
