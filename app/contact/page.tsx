import { Navbar } from "@/components/navbar";
import { CTABanner } from "@/components/cta-banner";
import ContactSection from "@/components/contact-section"; // THIS
import { Footer } from "@/components/footer";
console.log(ContactSection);

export default function ContactPage() {
  return (
    <main>
      <Navbar />
      <ContactSection />
      {/*-
       
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
              Visit & Consult
            </span>
            <div className="h-px w-12 bg-accent/30" />
          </div>
          <div className="mb-16 max-w-2xl">
            <h2 className="font-serif text-3xl font-bold leading-[1.15] text-secondary-foreground md:text-4xl lg:text-5xl text-balance">
              Meet Our Engineers In Person
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
              Schedule a site visit or a design consultation. We provide clear recommendations
              and transparent timelines before any execution begins.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "Mumbai HQ",
                text: "Lotus Tower, Andheri East, Mumbai 400069. Mon - Sat, 9:00 AM - 6:00 PM.",
              },
              {
                title: "Pune Site Office",
                text: "Tech Park Annex, Hinjewadi Phase 2. Appointments by prior schedule.",
              },
              {
                title: "Bangalore Partner Desk",
                text: "MG Road Business Center. Consultations for South India projects.",
              },
            ].map((office) => (
              <div
                key={office.title}
                className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl p-7 shadow-lg"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
                <h3 className="text-lg font-bold text-card-foreground">{office.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{office.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl p-8">
            <h3 className="text-xl font-bold text-card-foreground">Consultation Flow</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {[
                "Share drawings or site details",
                "Engineering review & scope",
                "Budgetary estimate",
                "Final proposal & timeline",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-xl border border-border/40 bg-card/60 p-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                    {index + 1}
                  </div>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
       
       */}
      <CTABanner />
      <Footer />
    </main>
  );
}
