"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PROJECTS,
  getProjects,
  type AdminProject,
} from "@/lib/admin-projects";

export function ProjectsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [projects, setProjects] = useState<AdminProject[]>(DEFAULT_PROJECTS);

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

  useEffect(() => {
    getProjects().then((dbProjects) => {
      if (dbProjects.length === 0) {
        setProjects(DEFAULT_PROJECTS);
      } else {
        setProjects(dbProjects);
      }
    });
  }, []);

  return (
    <section id="projects" className="relative py-24 lg:py-32 bg-background overflow-hidden">
      <div ref={ref} className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-12 bg-accent" />
          <span className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Featured Projects
          </span>
          <div className="h-px w-12 bg-accent/30" />
        </div>
        <div className="mb-16 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl font-bold leading-[1.15] text-foreground md:text-4xl lg:text-5xl text-balance">
              Showcasing Our Finest Work
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
              Every project reflects our commitment to structural excellence, safety compliance,
              and architectural innovation.
            </p>
          </div>
          <Button
            variant="outline"
            className="shrink-0 border-accent/30 text-accent hover:bg-accent/10 hover:text-accent font-semibold rounded-full bg-transparent backdrop-blur-sm transition-all duration-300 hover:border-accent/50"
          >
            View Full Portfolio
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Projects grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className={cn(
                "group relative overflow-hidden rounded-2xl transition-all duration-500",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: isVisible ? `${index * 150}ms` : "0ms" }}
            >
              <div className="aspect-[16/10] overflow-hidden rounded-2xl">
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={`${project.title} - ${project.type} project in ${project.location}`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D3A]/90 via-[#0B1D3A]/20 to-transparent transition-opacity duration-300" />

              {/* Glass info card at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-3 sm:p-5 transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/20">
                  {/* Location - Hidden on mobile to save space */}
                  <div className="hidden sm:flex items-center gap-2 text-[#C5A55A]">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium tracking-[0.15em] uppercase">
                      {project.location}
                    </span>
                  </div>
                  
                  {/* Title - Adjusted margin and size for mobile */}
                  <h3 className="text-base sm:text-lg font-bold text-white sm:mt-2">{project.title}</h3>
                  
                  {/* Type badge - Slightly smaller on mobile */}
                  <div className="mt-1.5 sm:mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 sm:px-3 sm:py-1">
                    <span className="text-[10px] sm:text-xs font-medium text-white/70">{project.type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}