"use client";

import { useEffect, useRef, useState, useMemo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PROJECTS,
  getProjects,
  type AdminProject,
} from "@/lib/admin-projects";

// --- Custom Image Component for Loading & Fallback ---
function ProjectImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Skeleton Loader */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-accent/10 animate-pulse">
          <Loader2 className="h-6 w-6 animate-spin text-accent/50" />
        </div>
      )}
      <img
        src={hasError ? "/placeholder.svg" : src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={cn(
          "h-full w-full object-cover transition-all duration-700",
          isLoaded
            ? "opacity-100 group-hover:scale-110"
            : "opacity-0 scale-105",
        )}
      />
    </div>
  );
}

const ITEMS_PER_PAGE = 6;

function ProjectsSection({ projects }: { projects: AdminProject[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Filter & Pagination States
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(
    null,
  );

  // Intersection Observer for Scroll Animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Extract unique filters from data
  // Note: Assuming AdminProject includes an optional 'year' property.
  const categories = [
    "All",
    ...Array.from(new Set(projects.map((p) => p.type))),
  ];
  const locations = [
    "All",
    ...Array.from(new Set(projects.map((p) => p.location))),
  ];
  const years = [
    "All",
    ...Array.from(
      new Set(projects.map((p) => (p as any).year).filter(Boolean)),
    ),
  ];

  // Apply Filters
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchCategory =
        activeCategory === "All" || project.type === activeCategory;
      const matchLocation =
        selectedLocation === "All" || project.location === selectedLocation;
      // @ts-ignore - bypassing if 'year' isn't explicitly in the type yet
      const matchYear = selectedYear === "All" || project.year === selectedYear;

      return matchCategory && matchLocation && matchYear;
    });
  }, [projects, activeCategory, selectedLocation, selectedYear]);

  // Apply Pagination
  const displayedProjects = filteredProjects.slice(
    0,
    currentPage * ITEMS_PER_PAGE,
  );
  const hasMore = displayedProjects.length < filteredProjects.length;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, selectedLocation, selectedYear]);

  return (
    <section
      id="projects"
      className="relative py-24 lg:py-32 bg-background overflow-hidden min-h-screen"
    >
      <div ref={ref} className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-12 bg-accent" />
          <span className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Featured Projects
          </span>
          <div className="h-px w-12 bg-accent/30" />
        </div>

        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl font-bold leading-[1.15] text-foreground md:text-4xl lg:text-5xl text-balance">
              Showcasing Our Finest Work
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
              Every project reflects our commitment to structural excellence,
              safety compliance, and architectural innovation.
            </p>
          </div>
          <Button
            className="shrink-0 rounded-full gap-2"
            onClick={() => window.open("/portfolio.pdf", "_blank")}
          >
            <Download className="h-4 w-4" />
            View Full Portfolio
          </Button>
        </div>

        {/* Filters & Tabs Navigation */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Categories Tab */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeCategory === cat
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "bg-accent/5 text-muted-foreground hover:bg-accent/10 hover:text-foreground",
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Location & Year Dropdowns */}
          <div className="flex gap-3">
            <select
              className="bg-accent/5 border border-accent/10 text-foreground text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5 outline-none"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="All">All Locations</option>
              {locations
                .filter((l) => l !== "All")
                .map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
            </select>

            {years.length > 1 && (
              <select
                className="bg-accent/5 border border-accent/10 text-foreground text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5 outline-none"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="All">All Years</option>
                {years
                  .filter((y) => y !== "All")
                  .map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
              </select>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedProjects.map((project, index) => (
            <div
              key={project.title}
              onClick={() => setSelectedProject(project)}
              className={cn(
                "group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-xl",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8",
              )}
              style={{
                transitionDelay: isVisible
                  ? `${(index % ITEMS_PER_PAGE) * 100}ms`
                  : "0ms",
              }}
            >
              <ProjectImage
                src={project.image || ""}
                alt={project.title}
                className="aspect-[16/10]"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300" />

              {/* Glass info card */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/20 group-hover:-translate-y-1">
                  <div className="flex items-center gap-2 text-[#C5A55A] mb-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium tracking-[0.15em] uppercase truncate">
                      {project.location}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                    {project.title}
                  </h3>

                  <div className="flex justify-between items-center">
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1">
                      <span className="text-xs font-medium text-white/80">
                        {project.type}
                      </span>
                    </div>
                    <span className="text-xs text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No projects match your current filters.
          </div>
        )}

        {/* Pagination / Load More Button */}
        {hasMore && (
          <div className="mt-12 flex justify-center">
            <Button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 py-6 text-md shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Load More Projects
            </Button>
          </div>
        )}
      </div>

      {/* Full Portfolio Item Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-border relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white z-10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <ProjectImage
              src={selectedProject.image || ""}
              alt={selectedProject.title}
              className="w-full h-64 sm:h-96"
            />

            <div className="p-6 sm:p-10">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-semibold tracking-wider uppercase">
                      {selectedProject.location}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold font-serif mb-2">
                    {selectedProject.title}
                  </h2>
                  <div className="flex gap-2">
                    <span className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                      {selectedProject.type}
                    </span>
                    {/* @ts-ignore */}
                    {selectedProject.year && (
                      <span className="inline-flex rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                        {/* @ts-ignore */}
                        Year: {selectedProject.year}
                      </span>
                    )}
                  </div>
                </div>

                {/* Download PDF Button */}
              </div>

              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground">
                <p>
                  {/* Provide a fallback description if your AdminProject type doesn't have one yet */}
                  {/* @ts-ignore */}
                  {selectedProject.description ||
                    "Detailed information about this project is currently being updated. It reflects our rigorous standard for quality and structural integrity."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export async function ProjectsSectionShell() {
  const projects = await getProjects();
  return (
    <Suspense
      fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-accent/10 animate-pulse">
          <Loader2 className="h-6 w-6 animate-spin text-accent/50" />
        </div>
      }
    >
      <ProjectsSection projects={projects} />;
    </Suspense>
  );
}
