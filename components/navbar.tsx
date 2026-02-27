"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Quality", href: "/quality" },
  { label: "Contact", href: "/contact" },
];

export function Navbar({ forceSolid = false }: { forceSolid?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSolid = forceSolid || isScrolled;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isSolid
          ? "bg-background/80 backdrop-blur-2xl shadow-lg shadow-foreground/5 border-b border-border/50 py-2"
          : "bg-transparent py-4"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="relative z-10 flex-shrink-0 group">
          <img
            src="/images/logo.png"
            alt="Lotus Enterprises Logo"
            className="h-14 lg:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center lg:flex">
          <div className={cn(
            "flex items-center gap-1 rounded-full px-3 py-1.5 transition-all duration-500",
            isSolid ? "bg-secondary/60 backdrop-blur-lg border border-border/50" : "bg-white/5 backdrop-blur-sm border border-white/10"
          )}>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "relative px-5 py-2 text-base font-semibold tracking-wide transition-all duration-300 rounded-full",
                  isSolid
                    ? "text-foreground/80 hover:text-accent hover:bg-accent/10"
                    : "text-white hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-3 lg:flex">
          <Button
            asChild
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold tracking-wide rounded-full shadow-lg shadow-accent/20 transition-all duration-300 hover:shadow-accent/40 hover:scale-[1.02]"
          >
            <Link href="/contact" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Get a Quote
            </Link>
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
              isSolid
                ? "text-foreground bg-secondary/60 backdrop-blur-lg border border-border/50"
                : "text-white bg-white/10 backdrop-blur-sm border border-white/15"
            )}
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile menu -- glass panel */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-500",
          isMobileOpen
            ? "max-h-[500px] opacity-100"
            : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-4 mb-4 rounded-2xl bg-card/80 backdrop-blur-2xl border border-border/50 shadow-xl overflow-hidden">
          <div className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="px-4 py-3 text-base font-medium tracking-wide text-foreground/70 hover:text-accent hover:bg-accent/10 transition-all duration-300 rounded-xl"
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-border/50 my-2" />
            <Button
              asChild
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold rounded-xl shadow-lg shadow-accent/20"
            >
              <Link href="/contact" onClick={() => setIsMobileOpen(false)}>
                <Phone className="h-4 w-4 mr-2" />
                Get a Quote
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}