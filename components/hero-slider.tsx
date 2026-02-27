"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const slides = [
  {
    image: "/images/hero-1.jpg",
    headline: "LOTUS ENTERPRISES",
    subheadline:
      "A Complete Architectural Solution Company",
    subheadline2:
      "Exterior Façade & Turnkey Contractors delivering engineered glazing solutions with precision and reliability."
    
  },
  {
    image: "/images/hero-2.jpg",
    headline: "Precision. Safety. Performance.",
    subheadline:
      "From curtain walls to spider glazing, we deliver facade solutions built with certified materials and rigorous quality control.",
  },
  {
    image: "/images/hero-3.jpg",
    headline: "Trusted by India's Leading Builders",
    subheadline:
      "Over two decades of delivering complex glazing projects on time, within budget, and above expectations.",
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 800
    );
    },
    [isTransitioning]
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000
    );
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section id="home" className="relative min-h-[90vh] w-full overflow-hidden bg-[#0B1D3A]">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(197,165,90,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(197,165,90,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Split layout container */}
      <div className="relative z-10 mx-auto flex min-h-[86vh] max-w-7xl flex-col lg:flex-row items-center gap-6 lg:gap-8 px-6 pt-32 pb-8 md:pt-36 lg:pt-28 lg:pb-0 lg:px-8">

        {/* LEFT SIDE -- Text content */}
        <div className="flex-1 flex flex-col justify-center lg:pr-8">
          <div className="relative">
            {slides.map((slide, index) => (
              <div
                key={slide.headline}
                className={cn(
                  "transition-all duration-700",
                  index === current
                    ? "opacity-100 translate-y-0 relative"
                    : "opacity-0 translate-y-6 absolute top-0 left-0 right-0 pointer-events-none"
                )}
              >
                {index === current && (
                  <div className="space-y-4 lg:space-y-5">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#C5A55A]/30 bg-[#C5A55A]/10 px-4 py-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C5A55A]" />
                      <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A55A] uppercase">
                        Since 2003
                      </span>
                    </div>

                    {/* Headline */}
                    <h1 className="font-serif text-3xl font-bold leading-[1.1] text-white sm:text-4xl md:text-5xl lg:text-6xl text-balance">
                      {slide.headline}
                    </h1>

                    {/* Subheadline */}
                    <p className="max-w-lg text-base leading-relaxed text-white/70 md:text-lg text-pretty">
                      {slide.subheadline}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap gap-3 pt-1">
                      <Button
                        asChild
                        size="lg"
                        className="bg-[#C5A55A] text-[#0B1D3A] hover:bg-[#d4b56a] font-semibold text-base px-8 rounded-full shadow-lg shadow-[#C5A55A]/20 transition-all duration-300 hover:shadow-[#C5A55A]/35"
                      >
                        <Link href="/projects">
                          Explore Projects
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="border-white/25 text-white hover:bg-white/10 hover:text-white font-semibold text-base px-8 rounded-full bg-transparent transition-all duration-300 hover:border-white/40"
                      >
                        <Link href="/contact">Start a Conversation</Link>
                      </Button>
                    </div>

                    {/* Dot navigation -- under CTA buttons */}
                    <div className="flex items-center gap-2.5 pt-2">
                      {slides.map((_, dotIndex) => (
                        <button
                          key={`dot-${dotIndex}`}
                          onClick={() => goTo(dotIndex)}
                          className={cn(
                            "rounded-full transition-all duration-500 cursor-pointer",
                            dotIndex === current
                              ? "h-3 w-10 bg-[#C5A55A] shadow-md shadow-[#C5A55A]/40"
                              : "h-3 w-3 bg-white/25 hover:bg-white/50 hover:scale-125"
                          )}
                          aria-label={`Go to slide ${dotIndex + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE -- Image slider panel */}
        <div className="relative w-full lg:w-[48%] flex-shrink-0">
          <div className="relative aspect-[4/3] lg:aspect-[4/3] w-full overflow-hidden rounded-2xl lg:rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
            {/* Sliding images */}
            {slides.map((slide, index) => (
              <div
                key={`img-${slide.headline}`}
                className={cn(
                  "absolute inset-0 transition-all duration-1000 ease-in-out",
                  index === current
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-105"
                )}
              >
                <img
                  src={slide.image || "/placeholder.svg"}
                  alt={slide.headline}
                  className="h-full w-full object-cover"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D3A]/40 via-transparent to-[#0B1D3A]/10" />
              </div>
            ))}

            {/* Glass frame corners */}
            <div className="absolute top-0 left-0 h-16 w-16 border-t-2 border-l-2 border-[#C5A55A]/40 rounded-tl-2xl lg:rounded-tl-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 h-16 w-16 border-b-2 border-r-2 border-[#C5A55A]/40 rounded-br-2xl lg:rounded-br-3xl pointer-events-none" />

            {/* Glass slide counter badge */}
            <div className="absolute bottom-8 left-4 sm:bottom-10 flex items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-xl px-4 py-2 pointer-events-none">
              <span className="text-sm font-semibold text-white tabular-nums">
                {String(current + 1).padStart(2, "0")}
              </span>
              <span className="h-px w-4 bg-white/40" />
              <span className="text-sm text-white/50 tabular-nums">
                {String(slides.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Decorative glow behind image */}
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-[#C5A55A]/5 blur-2xl" />
        </div>
      </div>

      {/* Bottom transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="h-px bg-gradient-to-r from-transparent via-[#C5A55A]/30 to-transparent" />
        <div className="h-10 bg-gradient-to-t from-[#0B1D3A] to-transparent" />
      </div>
    </section>
  );
}
