// utils.ts - Shared utility functions for Lotus Glass
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names, resolving conflicts intelligently.
 *
 * Combines `clsx` (conditional class logic) with `tailwind-merge`
 * (deduplication of conflicting utilities, e.g. `p-2` vs `p-4`).
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-blue-500", "py-4")
 * // → "px-4 bg-blue-500 py-4"  (py-2 is overridden by py-4)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}