"use client";

import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  FlaskConical,
  HardHat,
  Clock,
  BadgeCheck,
  Droplets,
} from "lucide-react";
import { cn } from "@/lib/utils";

const reasons = [
  {
    icon: ShieldCheck,
    title: "Certified Materials",
    description:
      "All glass, aluminum, and sealants are sourced from certified manufacturers meeting IS, EN, and ASTM standards.",
  },
  {
    icon: FlaskConical,
    title: "Rigorous Testing",
    description:
      "Every facade system undergoes wind load, water penetration, and air infiltration testing before installation.",
  },
  {
    icon: HardHat,
    title: "Trained Installation Teams",
    description:
      "Our crews are safety-certified and trained on advanced installation techniques with modern equipment.",
  },
  {
    icon: Clock,
    title: "On-Time Completion",
    description:
      "Proven track record of delivering projects within agreed timelines, with detailed progress tracking.",
  },
  {
    icon: BadgeCheck,
    title: "Code Compliance",
    description:
      "Full compliance with NBC, local building codes, and fire safety regulations across all projects.",
  },
  {
    icon: Droplets,
    title: "No Leakage Guarantee",
    description:
      "Engineered waterproofing solutions with comprehensive joint sealing and drainage systems that prevent leakage.",
  },
];

export function WhyChooseSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="quality" className="relative py-24 lg:py-32 bg-primary overflow-hidden">
      {/* Glass grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.1) 75%)",
        backgroundSize: "40px 40px"
      }} />

      {/* Floating glass orbs */}
      <div className="absolute top-20 left-[10%] h-48 w-48 rounded-full bg-[#C5A55A]/5 blur-3xl animate-float" />
      <div className="absolute bottom-20 right-[15%] h-32 w-32 rounded-full bg-[#C5A55A]/5 blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      <div ref={ref} className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-12 bg-[#C5A55A]" />
          <span className="text-sm font-semibold tracking-[0.2em] text-[#C5A55A] uppercase">
            Why Choose Us
          </span>
          <div className="h-px w-12 bg-[#C5A55A]/30" />
        </div>
        <div className="mb-16 max-w-2xl">
          <h2 className="font-serif text-3xl font-bold leading-[1.15] text-primary-foreground md:text-4xl lg:text-5xl text-balance">
            Built on Trust, Backed by Engineering
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-primary-foreground/60 text-pretty">
            We remove the risk from your facade project. Every decision we make prioritizes
            structural safety, long-term performance, and your peace of mind.
          </p>
        </div>

        {/* Glass cards grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, index) => (
            <div
              key={reason.title}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-500 hover:border-[#C5A55A]/30 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-[#C5A55A]/5",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: isVisible ? `${index * 100}ms` : "0ms" }}
            >
              {/* Glass reflection on top */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

              {/* Glow on hover */}
              <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-[#C5A55A]/0 transition-all duration-500 group-hover:bg-[#C5A55A]/10 blur-2xl" />

              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#C5A55A]/20 bg-[#C5A55A]/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-[#C5A55A]/15 group-hover:scale-110">
                  <reason.icon className="h-5 w-5 text-[#C5A55A]" />
                </div>
                <h3 className="text-lg font-bold text-primary-foreground">{reason.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/55">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
