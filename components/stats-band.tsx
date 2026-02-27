"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Calendar, MapPin, Award } from "lucide-react";

const stats = [
  {
    icon: Calendar,
    value: 22,
    suffix: "+",
    label: "Years of Experience",
  },
  {
    icon: Building2,
    value: 500,
    suffix: "+",
    label: "Projects Delivered",
  },
  {
    icon: MapPin,
    value: 18,
    suffix: "+",
    label: "Cities Across India",
  },
  {
    icon: Award,
    value: 100,
    suffix: "%",
    label: "Turnkey Capability",
  },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;

          timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        } else {
          // 👈 reset when leaving view
          setCount(0);
          if (timer) clearInterval(timer);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (timer) clearInterval(timer);
      observer.disconnect();
    };
  }, [value]);

  return (
    <div
      ref={ref}
      className="font-serif text-4xl font-bold text-[#C5A55A] md:text-5xl tabular-nums"
    >
      {count}
      {suffix}
    </div>
  );
}

export function StatsBand() {
  return (
    <section className="relative bg-primary py-20 overflow-hidden">
      {/* Glass grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      {/* Decorative glass orbs */}
      <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-[#C5A55A]/5 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-[#C5A55A]/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="group relative flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center transition-all duration-500 hover:border-[#C5A55A]/30 hover:bg-white/[0.08]"
            >
              {/* Top glass reflection */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#C5A55A]/20 bg-[#C5A55A]/10 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#C5A55A]/15">
                <stat.icon className="h-6 w-6 text-[#C5A55A]" />
              </div>
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              <p className="mt-2 text-sm font-medium tracking-wide text-primary-foreground/60 uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
