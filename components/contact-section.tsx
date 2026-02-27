"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { addContactSubmission } from "@/lib/contact-submissions";

// Branch type definition
interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

// Sample branches data - replace with your actual data
const branches: Branch[] = [
  {
    id: "mumbai",
    name: "Head Office – Mumbai",
    address:
      "B-11, DM Singh Compound, Opp. Shradda Tower, Thakur Complex, Kandivali (E), Mumbai – 400101",
    phone: "+91 9334779058 / +91 9833992158 | 022-28701651",
    email:
      "info@lotusenterprises.net / lotusenterprises2006@rediffmail.com",
  },
  {
    id: "vadodara",
    name: "Branch Office – Vadodara",
    address:
      "Office No. 1, 2nd Floor, Mrudula Sadan, Opp. Maharashtra Lodge, Dandia Bazar, Vadodara, Gujarat – 390001",
    phone: "+91 9328449803 / +91 8866308730",
    email: "info@lotusenterprises.net",
  },
  {
    id: "rajasthan",
    name: "Branch Office – Rajasthan",
    address:
      "Near B.B.I. Bank, Pratap Bazar, Bani Station – 306115, Dist. Pali (Rajasthan)",
    phone: "+91 8955270917 / +91 9020445577",
    email: "info@lotusenterprises.net",
  },
];

const businessHours = "Mon – Sat: 9:00 AM – 6:00 PM";

const certifications = ["BIS Certified", "ISO 9001:2015", "Fire Safe"];

// Branch Selector Component
function BranchSelector() {
  const [selectedBranch, setSelectedBranch] = useState<Branch>(branches[0]);

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="branch-select" className="text-sm font-semibold text-white/90">
          Select Branch
        </Label>
        <select
          id="branch-select"
          className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/50 focus:border-[#C5A55A] transition-all duration-300"
          value={selectedBranch.id}
          onChange={(e) => {
            const branch = branches.find((b) => b.id === e.target.value);
            if (branch) setSelectedBranch(branch);
          }}
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id} className="bg-[#0B1D3A] text-white">
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {/* Branch Info */}
      <div className="space-y-3 sm:space-y-4 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex gap-2 sm:gap-3 items-start group">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 group-hover:bg-[#C5A55A]/20 group-hover:border-[#C5A55A]/30">
            <MapPin className="text-[#C5A55A] h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold tracking-wider text-[#C5A55A] uppercase mb-1">Address</p>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{selectedBranch.address}</p>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 items-center group">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 group-hover:bg-[#C5A55A]/20 group-hover:border-[#C5A55A]/30">
            <Phone className="text-[#C5A55A] h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold tracking-wider text-[#C5A55A] uppercase mb-1">Phone</p>
            <p className="text-xs sm:text-sm text-white/80">{selectedBranch.phone}</p>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 items-center group">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 group-hover:bg-[#C5A55A]/20 group-hover:border-[#C5A55A]/30">
            <Mail className="text-[#C5A55A] h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold tracking-wider text-[#C5A55A] uppercase mb-1">Email</p>
            <p className="text-xs sm:text-sm text-white/80">{selectedBranch.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Contact Section Component
export default function ContactSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await addContactSubmission({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      service: formData.service.trim(),
      message: formData.message.trim(),
    });

    setIsSubmitted(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    });
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  return (
    <section id="contact" className="relative py-16 sm:py-20 md:py-24 lg:py-32 bg-[#0B1D3A] overflow-hidden">
      {/* Glass grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(197,165,90,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(197,165,90,0.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating glass orbs */}
      <div className="absolute top-20 left-[10%] h-64 w-64 rounded-full bg-[#C5A55A]/5 blur-3xl animate-glow" />
      <div className="absolute bottom-16 right-[8%] h-48 w-48 rounded-full bg-[#C5A55A]/5 blur-3xl animate-glow" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-white/[0.02] blur-3xl" />

      {/* Decorative floating glass panels */}
      <div className="absolute top-32 right-[5%] hidden xl:block">
        <div className="h-20 w-20 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md animate-float" style={{ animationDelay: "0s" }} />
      </div>
      <div className="absolute bottom-40 left-[4%] hidden xl:block">
        <div className="h-14 w-14 rounded-lg border border-[#C5A55A]/10 bg-[#C5A55A]/[0.03] backdrop-blur-md animate-float" style={{ animationDelay: "3s" }} />
      </div>

      <div
        ref={ref}
        className={cn(
          "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        {/* Section header */}
        <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
          <div className="h-px w-8 sm:w-12 bg-[#C5A55A]" />
          <span className="text-xs sm:text-sm font-semibold tracking-[0.15em] sm:tracking-[0.2em] text-[#C5A55A] uppercase">
            Contact Us
          </span>
          <div className="h-px w-8 sm:w-12 bg-[#C5A55A]/30" />
        </div>
        <div className="mb-10 sm:mb-12 md:mb-16 max-w-2xl">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-[1.15] text-white md:text-4xl lg:text-5xl text-balance">
            Get In Touch
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-relaxed text-white/60 text-pretty">
            Have a project in mind? Reach out to discuss your requirements with our
            engineering team.
          </p>
        </div>

        <div className="grid gap-8 sm:gap-10 md:gap-12 lg:grid-cols-6 lg:gap-12 lg:items-stretch">
          {/* Contact form -- Glass card */}
          <div className="lg:col-span-3 lg:h-full">
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden group lg:h-full">
              {/* Subtle hover glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#C5A55A]/0 via-[#C5A55A]/10 to-[#C5A55A]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl" />
              
              {/* Glass reflection */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
                <div className="grid gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-white/90">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(event) => handleInputChange("name", event.target.value)}
                      required
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#C5A55A]/50 focus-visible:border-[#C5A55A] transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-white/90">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={(event) => handleInputChange("email", event.target.value)}
                      required
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#C5A55A]/50 focus-visible:border-[#C5A55A] transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-white/90">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={(event) => handleInputChange("phone", event.target.value)}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#C5A55A]/50 focus-visible:border-[#C5A55A] transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service" className="text-sm font-semibold text-white/90">
                      Service Required
                    </Label>
                    <Input
                      id="service"
                      placeholder="e.g. Curtain Wall, Glazing"
                      value={formData.service}
                      onChange={(event) => handleInputChange("service", event.target.value)}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#C5A55A]/50 focus-visible:border-[#C5A55A] transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-semibold text-white/90">
                    Project Details
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your project requirements, location, timeline..."
                    rows={9}
                    value={formData.message}
                    onChange={(event) => handleInputChange("message", event.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#C5A55A]/50 focus-visible:border-[#C5A55A] resize-none transition-all duration-300"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitted}
                  className="w-full sm:w-auto bg-[#C5A55A] text-white hover:bg-[#D4B36A] font-semibold text-sm sm:text-base px-8 sm:px-10 rounded-full shadow-lg shadow-[#C5A55A]/20 transition-all duration-300 hover:shadow-[#C5A55A]/30 hover:scale-[1.02] border-0"
                >
                  {isSubmitted ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Enquiry Sent Successfully
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Enquiry
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Contact info -- Glass card */}
          <div className="lg:col-span-3 lg:h-full">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-6 md:p-8 shadow-2xl lg:h-full">
              {/* Glass reflection */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 md:mb-5">Our Locations</h3>
              <BranchSelector />

              <div className="my-4 sm:my-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-[10px] sm:text-xs font-bold tracking-[0.15em] text-[#C5A55A] uppercase mb-1">
                    Business Hours
                  </p>
                  <p className="text-sm sm:text-base font-medium text-white/90">{businessHours}</p>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {certifications.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center rounded-full border border-[#C5A55A]/30 bg-[#C5A55A]/10 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-[#C5A55A]"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Export the BranchSelector separately if needed
export { BranchSelector };