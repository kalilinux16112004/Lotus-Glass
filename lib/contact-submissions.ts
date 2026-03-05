// contact-submissions.ts - Supabase-backed contact form submission management
import { supabase } from "./supabase";

/* =====================
   Types
===================== */
export interface ContactSubmission {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  /** Displayed as "service" in the UI; maps to project_type in DB. */
  service: string;
  message: string;
  submittedAt: string;
}

/** Shape of a raw row returned from the `contact_submissions` table. */
interface ContactSubmissionRow {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  project_type: string;
  message: string;
  created_at: string;
}

/* =====================
   Columns fetched from DB
   — never use select("*"); list only what the UI needs.
===================== */
const SUBMISSION_COLUMNS =
  "id, name, company, email, phone, project_type, message, created_at" as const;

/** Default page size. */
const DEFAULT_LIMIT = 20;

/* =====================
   Mapping
===================== */
function mapFromDb(row: ContactSubmissionRow): ContactSubmission {
  return {
    id: row.id,
    name: row.name,
    company: row.company ?? undefined,
    email: row.email,
    phone: row.phone,
    service: row.project_type,
    message: row.message,
    submittedAt: row.created_at,
  };
}

/* =====================
   Queries
===================== */

/**
 * Fetch submissions from Supabase, newest first. Requires admin auth.
 *
 * @param limit - Max rows to return (default 20).
 */
export async function getContactSubmissions(
  limit = DEFAULT_LIMIT
): Promise<ContactSubmission[]> {
  const { data, error } = await supabase
    .from("contact_submissions")
    .select(SUBMISSION_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<ContactSubmissionRow[]>();

  if (error) {
    console.error("[contact-submissions] fetch error:", error.message);
    return [];
  }

  return (data ?? []).map(mapFromDb);
}

/**
 * Fetch a lightweight submission count without loading all rows.
 * Use this for dashboard stat display instead of submissions.length.
 */
export async function getSubmissionCount(): Promise<number> {
  const { count, error } = await supabase
    .from("contact_submissions")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("[contact-submissions] count error:", error.message);
    return 0;
  }

  return count ?? 0;
}

/** Insert a new contact form submission. Safe for public use. */
export async function addContactSubmission(
  input: Omit<ContactSubmission, "id" | "submittedAt">
): Promise<ContactSubmission | null> {
  const { data, error } = await supabase
    .from("contact_submissions")
    .insert([
      {
        name: input.name.trim(),
        company: input.company?.trim() || null,
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        project_type: input.service,
        message: input.message.trim(),
      },
    ])
    .select(SUBMISSION_COLUMNS)
    .single<ContactSubmissionRow>();

  if (error) {
    console.error("[contact-submissions] insert error:", error.message);
    return null;
  }

  return mapFromDb(data);
}

/** Delete a submission by id. Requires admin auth. */
export async function deleteContactSubmission(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("contact_submissions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[contact-submissions] delete error:", error.message);
    return false;
  }

  return true;
}

// ── Legacy stubs ─────────────────────────────────────────────────────────────
/** @deprecated Data is now stored in Supabase. Remove this call. */
export const getStoredContactSubmissions = (): ContactSubmission[] => [];
/** @deprecated Data is now stored in Supabase. Remove this call. */
export const saveStoredContactSubmissions = (_: ContactSubmission[]): void => {};