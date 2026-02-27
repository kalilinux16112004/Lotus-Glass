"use client";

import { useEffect, useRef, useState } from "react";
import { Shield, Target, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: Shield,
    title: "Safety First",
    desc: "Rigorous adherence to BIS standards and international safety protocols at every stage.",
  },
  {
    icon: Target,
    title: "Precision Engineering",
    desc: "Advanced CAD/CAM design and engineering validation for flawless execution.",
  },
  {
    icon: Wrench,
    title: "End-to-End Solutions",
    desc: "From consultation to handover, we manage every aspect of your facade project.",
  },
];

export function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="relative py-24 lg:py-32 bg-background overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
        backgroundSize: "48px 48px"
      }} />

      <div
        ref={ref}
        className={cn(
          "relative mx-auto max-w-7xl px-6 lg:px-8 transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        {/* Section header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-12 bg-accent" />
          <span className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            About Us
          </span>
          <div className="h-px w-12 bg-accent/30" />
        </div>

        <div className="grid gap-16 lg:grid-cols-2 items-center">
          {/* Text content */}
          <div>
            <h2 className="font-serif text-3xl font-bold leading-[1.15] text-foreground md:text-4xl lg:text-5xl text-balance">
              Building Trust Through Engineering Excellence
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
              Founded in 2003, Lotus Enterprises has grown into one of India{"'"}s most trusted names
              in architectural facade solutions. With over two decades of hands-on experience,
              we bring together engineering expertise, certified materials, and skilled craftsmanship
              to deliver facades that are structurally sound, aesthetically compelling, and built to
              last.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
              Our unwavering commitment to safety, quality control, and regulatory compliance
              has earned the confidence of leading architects, builders, and corporate clients
              across India.
            </p>

            {/* Highlights -- Glass cards */}
            <div className="mt-10 flex flex-col gap-4">
              {highlights.map((item, index) => (
                <div
                  key={item.title}
                  className={cn(
                    "group flex gap-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-lg p-5 transition-all duration-500 hover:border-accent/30 hover:bg-card/80 hover:shadow-lg",
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  )}
                  style={{ transitionDelay: isVisible ? `${300 + index * 150}ms` : "0ms" }}
                >
                  {/* Glass reflection */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-xl" />
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-accent/15 group-hover:scale-105">
                    <item.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image with glass frame */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="/images/about.jpg"
                alt="Lotus Enterprises team installing glass facade panels on a modern building"
                className="h-full w-full object-cover aspect-[4/5] lg:aspect-[3/4]"
              />
              {/* Glass overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="rounded-xl border border-white/15 bg-white/5 backdrop-blur-xl p-5">
                  <p className="text-sm font-semibold text-white tracking-wide">Two Decades of Trust</p>
                  <p className="mt-1 text-xs text-white/70">500+ completed projects across 18+ cities in India</p>
                </div>
              </div>
            </div>

            {/* Decorative glass corners */}
            <div className="absolute -bottom-3 -right-3 h-20 w-20 rounded-2xl border border-accent/20 bg-accent/5 backdrop-blur-sm -z-10 hidden lg:block" />
            <div className="absolute -top-3 -left-3 h-20 w-20 rounded-2xl border border-accent/20 bg-accent/5 backdrop-blur-sm -z-10 hidden lg:block" />
          </div>
        </div>
      </div>
    </section>
  );
}
