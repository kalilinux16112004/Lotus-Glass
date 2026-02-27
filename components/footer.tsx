"use client";

import Link from "next/link";
import { Linkedin, Instagram, Facebook, Youtube, ArrowUp } from "lucide-react";

const navigation = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Our Projects", href: "/projects" },
    { name: "Quality & Safety", href: "/quality" },
    { name: "Contact", href: "/contact" },
  ],
  services: [
    { name: "Structural Glazing", href: "/services" },
    { name: "Curtain Wall Systems", href: "/services" },
    { name: "Spider Glazing", href: "/services" },
    { name: "ACP Cladding", href: "/services" },
    { name: "Skylights & Canopies", href: "/services" },
  ],
  certifications: [
    "BIS Certified Materials",
    "ISO 9001:2015",
    "Fire Safety Compliant",
    "NBC Compliant",
  ],
};

const socials = [
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="relative bg-primary overflow-hidden">
      {/* Glass grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "80px 80px"
      }} />

      {/* Gold gradient glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-[#C5A55A]/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block group">
              <img
                src="/images/logo.png"
                alt="Lotus Enterprises Logo"
                className="h-16 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/50">
              Premium architectural facade and glazing solutions. Engineering excellence
              since 2003.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-primary-foreground/50 transition-all duration-300 hover:border-[#C5A55A]/30 hover:text-[#C5A55A] hover:bg-[#C5A55A]/10 hover:scale-110"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-sm font-bold tracking-[0.15em] text-[#C5A55A] uppercase">
              Company
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-primary-foreground/50 transition-colors duration-300 hover:text-[#C5A55A]"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services links */}
          <div>
            <h3 className="text-sm font-bold tracking-[0.15em] text-[#C5A55A] uppercase">
              Services
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              {navigation.services.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-primary-foreground/50 transition-colors duration-300 hover:text-[#C5A55A]"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Certifications -- Glass card */}
          <div>
            <h3 className="text-sm font-bold tracking-[0.15em] text-[#C5A55A] uppercase">
              Certifications
            </h3>
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
              <ul className="flex flex-col gap-3">
                {navigation.certifications.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-primary-foreground/50"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-[#C5A55A]/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-primary-foreground/35">
              &copy; {new Date().getFullYear()} Lotus Enterprises. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-xs text-primary-foreground/35 hover:text-[#C5A55A] transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="#" className="text-xs text-primary-foreground/35 hover:text-[#C5A55A] transition-colors duration-300">
                Terms of Service
              </Link>
              {/* Back to top */}
              <Link
                href="/"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-primary-foreground/40 transition-all duration-300 hover:border-[#C5A55A]/30 hover:text-[#C5A55A] hover:bg-[#C5A55A]/10 hover:scale-110"
                aria-label="Back to top"
              >
                <ArrowUp className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
