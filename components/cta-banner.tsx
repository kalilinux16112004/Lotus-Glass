"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";

export function CTABanner() {
  return (
    <section className="relative overflow-hidden bg-background py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-20 sm:px-16 lg:px-24">
          {/* Glass grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />

          {/* Floating glass orbs */}
          <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-[#C5A55A]/5 -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-[#C5A55A]/5 translate-y-1/2 -translate-x-1/3 blur-3xl" />

          {/* Decorative glass panels */}
          <div className="absolute top-8 right-12 h-28 w-28 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm rotate-12 hidden lg:block" />
          <div className="absolute bottom-8 left-12 h-20 w-20 rounded-xl border border-[#C5A55A]/10 bg-[#C5A55A]/5 backdrop-blur-sm -rotate-6 hidden lg:block" />

          <div className="relative flex flex-col items-center text-center">
            {/* Glass badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-2">
              <span className="h-2 w-2 rounded-full bg-[#C5A55A] animate-glow" />
              <span className="text-sm font-medium tracking-[0.15em] text-[#C5A55A] uppercase">
                Ready to Build?
              </span>
            </div>
            <h2 className="font-serif text-3xl font-bold leading-[1.15] text-primary-foreground md:text-4xl lg:text-5xl text-balance">
              Let{"'"}s Bring Your Vision to Life
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-primary-foreground/60 text-pretty">
              Whether you{"'"}re planning a new facade, upgrading an existing building, or need
              expert consultation, our team is ready to deliver with reliability and proven engineering.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-[#C5A55A] text-[#0B1D3A] hover:bg-[#C5A55A]/90 font-semibold text-base px-8 rounded-full shadow-lg shadow-[#C5A55A]/25 transition-all duration-300 hover:shadow-[#C5A55A]/40 hover:scale-[1.02]"
              >
                <Link href="/contact">
                  <Phone className="mr-2 h-4 w-4" />
                  Start a Conversation
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/15 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground font-semibold text-base px-8 rounded-full bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/25"
              >
                <Link href="/projects">
                  View Our Work
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
