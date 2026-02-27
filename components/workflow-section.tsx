"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Ruler,
  CheckCircle,
  Factory,
  Search,
  Hammer,
  Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: MessageSquare,
    title: "Consultation",
    description: "Understanding your vision, requirements, and project scope.",
  },
  {
    icon: Ruler,
    title: "Design & Engineering",
    description: "Technical drawings, structural calculations, and material specification.",
  },
  {
    icon: CheckCircle,
    title: "Validation",
    description: "Peer review, load testing simulation, and regulatory compliance check.",
  },
  {
    icon: Factory,
    title: "Fabrication",
    description: "Precision manufacturing with certified materials in our facility.",
  },
  {
    icon: Search,
    title: "Quality Audit",
    description: "Pre-dispatch quality audit and safety verification of all components.",
  },
  {
    icon: Hammer,
    title: "Installation",
    description: "Expert on-site installation by trained, safety-certified teams.",
  },
  {
    icon: Handshake,
    title: "Handover",
    description: "Final inspection, documentation, and ongoing maintenance support.",
  },
];

export function WorkflowSection() {
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
    <section className="relative py-24 lg:py-32 bg-secondary overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
        backgroundSize: "48px 48px"
      }} />

      <div ref={ref} className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-12 bg-accent" />
          <span className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Our Process
          </span>
          <div className="h-px w-12 bg-accent/30" />
        </div>
        <div className="mb-16 max-w-2xl">
          <h2 className="font-serif text-3xl font-bold leading-[1.15] text-secondary-foreground md:text-4xl lg:text-5xl text-balance">
            A Systematic Approach to Excellence
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            Our structured workflow ensures every project is delivered with precision,
            safety, and full accountability from start to finish.
          </p>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="lg:hidden relative">
          <div className="absolute left-[31px] top-0 bottom-0 w-px bg-border" />
          <div className="flex flex-col gap-8">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={cn(
                  "relative flex gap-5 transition-all duration-500",
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                )}
                style={{ transitionDelay: isVisible ? `${index * 100}ms` : "0ms" }}
              >
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl text-accent shadow-lg">
                  <step.icon className="h-5 w-5" />
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground shadow-md">
                    {index + 1}
                  </span>
                </div>
                <div className="pt-2">
                  <h3 className="text-base font-bold text-secondary-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: horizontal glass cards */}
        <div className="hidden lg:block">
          {/* Connecting line */}
          <div className="relative mb-8">
            <div className="absolute top-8 left-8 right-8 h-px bg-border" />
            <div
              className={cn(
                "absolute top-8 left-8 h-px bg-accent transition-all duration-2000",
                isVisible ? "right-8" : "right-full"
              )}
            />
          </div>

          <div className="grid grid-cols-7 gap-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={cn(
                  "group flex flex-col items-center text-center transition-all duration-500",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                )}
                style={{ transitionDelay: isVisible ? `${index * 120}ms` : "0ms" }}
              >
                {/* Glass circle */}
                <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl text-accent shadow-lg transition-all duration-300 group-hover:border-accent/40 group-hover:shadow-xl group-hover:shadow-accent/10 group-hover:scale-110">
                  <step.icon className="h-5 w-5" />
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground shadow-md">
                    {index + 1}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-secondary-foreground">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
