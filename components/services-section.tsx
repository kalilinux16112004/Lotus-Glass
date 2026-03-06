"use client";

import { useEffect, useRef, useState } from "react";
import {
  Layers,
  Grid3X3,
  Maximize,
  PanelTop,
  Sun,
  Settings,
  Building2,
  Columns,
  Shield,
  Square,
  Home,
  Hammer,
} from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
  {
    icon: Layers,
    title: "Structural Glazing",
    description:
      "All types of structural glazing systems designed for superior weather resistance, thermal insulation, and long-term durability with high-performance silicone bonding.",
  },
  {
    icon: Sun,
    title: "Polycarbonate Roofing & Pre-Coated Sheet Sheds",
    description:
      "Durable polycarbonate roofing and pre-coated sheet shed solutions offering excellent light transmission, UV protection, and weather resistance for industrial and commercial use.",
  },
  {
    icon: Building2,
    title: "M.S. Structural Work",
    description:
      "Precision mild steel structural fabrication and erection for facades, canopies, frames, and support systems built to engineering specifications.",
  },
  {
    icon: Grid3X3,
    title: "Patch Fitting & Spider Fitting",
    description:
      "Frameless patch fitting and stainless steel spider fitting systems creating seamless glass facades with a modern, transparent aesthetic.",
  },
  {
    icon: PanelTop,
    title: "Metal False Ceiling",
    description:
      "Custom metal false ceiling solutions available in various profiles, finishes, and perforation patterns for commercial and architectural interiors.",
  },
  {
    icon: Columns,
    title: "S.S., S.S. Glass & Aluminum Glass Railing",
    description:
      "Stainless steel, SS glass, and aluminium glass railing systems combining safety, elegance, and modern design for balconies, staircases, and open spaces.",
  },
  {
    icon: Maximize,
    title: "Aluminum Sliding Windows",
    description:
      "All types of aluminium sliding windows engineered for smooth operation, energy efficiency, and architectural precision in residential and commercial projects.",
  },
  {
    icon: Square,
    title: "Dry Cladding (Granite)",
    description:
      "Natural granite dry cladding systems offering timeless aesthetics, structural reliability, and weather durability for exterior facades.",
  },
  {
    icon: Shield,
    title: "Merino HPL Cladding",
    description:
      "High-pressure laminate facade cladding using Merino HPL panels — impact-resistant, UV-stable, and available in a wide range of textures and colours.",
  },
  {
    icon: Home,
    title: "UPVC & FRP Fins",
    description:
      "UPVC and fibre-reinforced polymer fins for architectural sunshading, decorative facade elements, and structural fin applications.",
  },
  {
    icon: Hammer,
    title: "Civil & Interior Work",
    description:
      "Complete civil construction and interior fit-out services including flooring, partitions, false ceilings, painting, and all allied finishing works.",
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
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, currentColor 1px, transparent 1px), linear-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

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
            Comprehensive Facade & Construction Solutions
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            From structural glazing and cladding to civil and interior works, we deliver end-to-end
            solutions built on engineering precision and certified quality.
          </p>
        </div>

        {/* Services grid - Glass cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/70 backdrop-blur-lg p-8 transition-all duration-500 hover:shadow-2xl hover:border-accent/30 hover:bg-card/90",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: isVisible ? `${index * 80}ms` : "0ms" }}
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