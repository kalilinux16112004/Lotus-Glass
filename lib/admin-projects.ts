import { supabase } from "./supabase";

export interface AdminProject {
  id: string;
  title: string;
  location: string;
  type: string;
  image: string;
  year?: string;
  description?: string;
}

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

// Map Supabase row → AdminProject
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFromDb(row: Record<string, any>): AdminProject {
  return {
    id: row.id,
    title: row.name,
    location: row.location,
    type: row.category,
    image: row.image_url ?? "",
    year: row.year,
    description: row.description ?? undefined,
  };
}

// Map AdminProject → Supabase insert payload
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

// Upload a base64 data URL to Supabase Storage and return the public URL
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
      console.error("Image upload failed:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("project-images")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (err) {
    console.error("Error processing image:", err);
    return null;
  }
}

// Fetch all projects from Supabase
export async function getProjects(): Promise<AdminProject[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return (data ?? []).map(mapFromDb);
}

// Insert a new project (uploads image to storage if base64)
export async function addProject(
  project: Omit<AdminProject, "id">
): Promise<AdminProject | null> {
  let imageUrl = project.image;

  if (imageUrl && imageUrl.startsWith("data:")) {
    const uploaded = await uploadProjectImage(imageUrl);
    imageUrl = uploaded ?? imageUrl;
  }

  const { data, error } = await supabase
    .from("projects")
    .insert([mapToDb({ ...project, image: imageUrl })])
    .select()
    .single();

  if (error) {
    console.error("Error adding project:", error);
    return null;
  }

  return mapFromDb(data);
}

// Update an existing project
export async function updateProject(
  id: string,
  updates: Partial<Omit<AdminProject, "id">>
): Promise<AdminProject | null> {
  let imageUrl = updates.image;

  if (imageUrl && imageUrl.startsWith("data:")) {
    const uploaded = await uploadProjectImage(imageUrl);
    imageUrl = uploaded ?? imageUrl;
  }

  const patch: Record<string, string | null> = {};
  if (updates.title !== undefined) patch.name = updates.title;
  if (updates.location !== undefined) patch.location = updates.location;
  if (updates.type !== undefined) patch.category = updates.type;
  if (imageUrl !== undefined) patch.image_url = imageUrl || null;
  if (updates.year !== undefined) patch.year = updates.year;
  if (updates.description !== undefined) patch.description = updates.description ?? null;

  const { data, error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating project:", error);
    return null;
  }

  return mapFromDb(data);
}

// Delete a project by id
export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("Error deleting project:", error);
    return false;
  }

  return true;
}

// Return total bytes used in the project-images storage bucket
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

// ── Legacy stubs kept so any remaining import sites compile ─────────────────
export const getStoredProjects = (): AdminProject[] => [];
export const saveStoredProjects = (_projects: AdminProject[]): void => {};
