// admin-projects.ts - Supabase-backed project management for admin interface
import { supabase } from "./supabase";

/* =====================
   Types
===================== */
export interface AdminProject {
  id: string;
  title: string;
  location: string;
  type: string;
  image: string;
  year?: string;
  description?: string;
}

/** Shape of a raw row returned from the `projects` table. */
interface ProjectRow {
  id: string;
  name: string;
  location: string;
  category: string;
  image_url: string | null;
  year: string | null;
  description: string | null;
  created_at: string;
}

/* =====================
   Defaults
===================== */
export const DEFAULT_PROJECTS: AdminProject[] = [
  {
    id: "default-1",
    image: "/images/project-1.jpg",
    title: "Horizon Corporate Tower",
    location: "Mumbai, Maharashtra",
    type: "Curtain Wall System",
  },
  {
    id: "default-2",
    image: "/images/project-2.jpg",
    title: "Galaxy Mall & Convention Centre",
    location: "Bangalore, Karnataka",
    type: "ACP Cladding & Glazing",
  },
  {
    id: "default-3",
    image: "/images/project-3.jpg",
    title: "MedLife Super Speciality Hospital",
    location: "Delhi NCR",
    type: "Structural Glazing",
  },
  {
    id: "default-4",
    image: "/images/project-4.jpg",
    title: "The Grand Heritage Hotel",
    location: "Jaipur, Rajasthan",
    type: "Spider Glazing & Canopy",
  },
];

/* =====================
   Columns fetched from DB
   — never use select("*"); list only what the UI needs.
===================== */
const PROJECT_COLUMNS =
  "id, name, location, category, image_url, year, description, created_at" as const;

/** Default page size. Pass a higher value only when exporting. */
const DEFAULT_LIMIT = 20;

/* =====================
   Mapping
===================== */
function mapFromDb(row: ProjectRow): AdminProject {
  return {
    id: row.id,
    title: row.name,
    location: row.location,
    type: row.category,
    image: row.image_url ?? "",
    year: row.year ?? undefined,
    description: row.description ?? undefined,
  };
}

function mapToDb(project: Omit<AdminProject, "id">) {
  return {
    name: project.title,
    location: project.location,
    category: project.type,
    year: project.year ?? new Date().getFullYear().toString(),
    image_url: project.image || null,
    description: project.description ?? null,
  };
}

/* =====================
   Image Upload
===================== */
async function uploadProjectImage(dataUrl: string): Promise<string | null> {
  try {
    const [meta, base64Data] = dataUrl.split(",");
    const mimeType = meta.split(";")[0].split(":")[1];
    const extension = mimeType === "image/png" ? "png" : "jpg";
    const fileName = `project-${Date.now()}.${extension}`;

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteNumbers], { type: mimeType });

    const { data, error } = await supabase.storage
      .from("project-images")
      .upload(fileName, blob, { contentType: mimeType });

    if (error) {
      console.error("[admin-projects] image upload failed:", error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("project-images")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (err) {
    console.error("[admin-projects] error processing image:", err);
    return null;
  }
}

/* =====================
   Queries
===================== */

/**
 * Fetch projects from Supabase, newest first.
 *
 * @param limit - Max rows to return (default 20). Pass `Infinity` only for exports.
 */
export async function getProjects(limit = DEFAULT_LIMIT): Promise<AdminProject[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<ProjectRow[]>();

  if (error) {
    console.error("[admin-projects] fetch error:", error.message);
    return [];
  }

  return (data ?? []).map(mapFromDb);
}

/**
 * Fetch a lightweight project count without loading all rows.
 * Use this for the dashboard stat display instead of `projects.length`.
 */
export async function getProjectCount(): Promise<number> {
  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("[admin-projects] count error:", error.message);
    return 0;
  }

  return count ?? 0;
}

/** Insert a new project (uploads image to storage if base64). */
export async function addProject(
  project: Omit<AdminProject, "id">
): Promise<AdminProject | null> {
  let imageUrl = project.image;

  if (imageUrl?.startsWith("data:")) {
    imageUrl = (await uploadProjectImage(imageUrl)) ?? imageUrl;
  }

  const { data, error } = await supabase
    .from("projects")
    .insert([mapToDb({ ...project, image: imageUrl })])
    .select(PROJECT_COLUMNS)
    .single<ProjectRow>();

  if (error) {
    console.error("[admin-projects] insert error:", error.message);
    return null;
  }

  return mapFromDb(data);
}

/** Update an existing project by id. */
export async function updateProject(
  id: string,
  updates: Partial<Omit<AdminProject, "id">>
): Promise<AdminProject | null> {
  let imageUrl = updates.image;

  if (imageUrl?.startsWith("data:")) {
    imageUrl = (await uploadProjectImage(imageUrl)) ?? imageUrl;
  }

  const patch: Record<string, string | null> = {};
  if (updates.title !== undefined)       patch.name        = updates.title;
  if (updates.location !== undefined)    patch.location    = updates.location;
  if (updates.type !== undefined)        patch.category    = updates.type;
  if (imageUrl !== undefined)            patch.image_url   = imageUrl || null;
  if (updates.year !== undefined)        patch.year        = updates.year ?? null;
  if (updates.description !== undefined) patch.description = updates.description ?? null;

  const { data, error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", id)
    .select(PROJECT_COLUMNS)
    .single<ProjectRow>();

  if (error) {
    console.error("[admin-projects] update error:", error.message);
    return null;
  }

  return mapFromDb(data);
}

/** Delete a project by id. */
export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("[admin-projects] delete error:", error.message);
    return false;
  }

  return true;
}

/** Return total bytes used in the project-images storage bucket. */
export async function getStorageUsedBytes(): Promise<number> {
  try {
    const { data, error } = await supabase.storage
      .from("project-images")
      .list("", { limit: 1000 });

    if (error || !data) return 0;

    return data.reduce((sum, file) => {
      const size = (file.metadata as Record<string, number> | null)?.size ?? 0;
      return sum + size;
    }, 0);
  } catch {
    return 0;
  }
}

// ── Legacy stubs ─────────────────────────────────────────────────────────────
/** @deprecated Data is now stored in Supabase. Remove this call. */
export const getStoredProjects = (): AdminProject[] => [];
/** @deprecated Data is now stored in Supabase. Remove this call. */
export const saveStoredProjects = (_projects: AdminProject[]): void => {};