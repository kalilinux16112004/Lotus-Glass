import { supabase } from "./supabase";

export interface ContactSubmission {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  /** Displayed as "service" in the UI; maps to project_type in DB */
  service: string;
  message: string;
  submittedAt: string;
}

// Map Supabase row → ContactSubmission
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFromDb(row: Record<string, any>): ContactSubmission {
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

// Fetch all submissions from Supabase (admin only – requires auth)
export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const { data, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contact submissions:", error);
    return [];
  }

  return (data ?? []).map(mapFromDb);
}

// Insert a new contact form submission (public)
export async function addContactSubmission(
  input: Omit<ContactSubmission, "id" | "submittedAt">
): Promise<ContactSubmission | null> {
  const { data, error } = await supabase
    .from("contact_submissions")
    .insert([
      {
        name: input.name,
        company: input.company ?? null,
        email: input.email,
        phone: input.phone,
        project_type: input.service,
        message: input.message,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error saving contact submission:", error);
    return null;
  }

  return mapFromDb(data);
}

// Delete a submission by id (admin only – requires auth)
export async function deleteContactSubmission(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("contact_submissions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting contact submission:", error);
    return false;
  }

  return true;
}

// ── Legacy stubs kept so any remaining import sites compile ─────────────────
export const getStoredContactSubmissions = (): ContactSubmission[] => [];
export const saveStoredContactSubmissions = (
  _submissions: ContactSubmission[]
): void => {};
