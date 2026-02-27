"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ isScrolled = true }: { isScrolled?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300",
        isScrolled
          ? "bg-secondary/60 backdrop-blur-lg border border-border/50 text-foreground/60"
          : "bg-white/10 backdrop-blur-sm border border-white/15 text-white/60"
      )}>
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <button
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:scale-110",
        isScrolled
          ? "bg-secondary/60 backdrop-blur-lg border border-border/50 text-foreground/60 hover:text-accent hover:border-accent/30"
          : "bg-white/10 backdrop-blur-sm border border-white/15 text-white/60 hover:text-white hover:bg-white/20"
      )}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
