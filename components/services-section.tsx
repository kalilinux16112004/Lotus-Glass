"use client";

import { useEffect, useRef, useState } from "react";
import {
  Layers,
  Grid3X3,
  Maximize,
  PanelTop,
  Sun,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
  {
    icon: Layers,
    title: "Structural Glazing",
    description:
      "High-performance structural silicone glazing systems designed for superior weather resistance, thermal insulation, and long-term durability.",
  },
  {
    icon: Grid3X3,
    title: "Curtain Wall Systems",
    description:
      "Precision-engineered unitized and stick curtain wall systems that combine aesthetic elegance with structural integrity.",
  },
  {
    icon: Maximize,
    title: "Spider Glazing",
    description:
      "Frameless point-supported glass facades using stainless steel spider fittings, creating seamless transparency and modern aesthetics.",
  },
  {
    icon: PanelTop,
    title: "ACP Cladding",
    description:
      "Aluminium composite panel cladding solutions with fire-rated materials and precision installation in a wide range of finishes.",
  },
  {
    icon: Sun,
    title: "Skylights & Canopies",
    description:
      "Engineered skylight systems and glass canopies that bring natural light into interiors while maintaining waterproofing and safety.",
  },
  {
    icon: Settings,
    title: "Custom Facade Engineering",
    description:
      "Bespoke facade solutions tailored to complex architectural designs including challenging geometries and curved glass.",
  },
];

export function ServicesSection() {
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
    <section id="services" className="relative py-24 lg:py-32 bg-secondary overflow-hidden">
      {/* Background glass grid */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: "linear-gradient(90deg, currentColor 1px, transparent 1px), linear-gradient(currentColor 1px, transparent 1px)",
        backgroundSize: "80px 80px"
      }} />

      <div ref={ref} className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-12 bg-accent" />
          <span className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Our Services
          </span>
          <div className="h-px w-12 bg-accent/30" />
        </div>
        <div className="mb-16 max-w-2xl">
          <h2 className="font-serif text-3xl font-bold leading-[1.15] text-secondary-foreground md:text-4xl lg:text-5xl text-balance">
            Comprehensive Facade Solutions
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            From design to delivery, we provide a complete range of architectural glazing and
            cladding services built on engineering precision and certified quality.
          </p>
        </div>

        {/* Services grid - Glass cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/70 backdrop-blur-lg p-8 transition-all duration-500 hover:shadow-2xl hover:border-accent/30 hover:bg-card/90",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: isVisible ? `${index * 100}ms` : "0ms" }}
            >
              {/* Glass reflection on top edge */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-accent/0 transition-all duration-500 group-hover:bg-accent/[0.03]" />

              {/* Gold accent line on hover */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent/0 via-accent to-accent/0 scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />

              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-accent/15 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent/10">
                  <service.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
