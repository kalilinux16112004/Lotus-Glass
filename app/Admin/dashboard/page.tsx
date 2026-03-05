// page.tsx - Admin dashboard for managing projects and contact submissions
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Database, HardDrive, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getProjects, addProject, updateProject, deleteProject,
  getStorageUsedBytes, type AdminProject,
} from "@/lib/admin-projects";
import {
  getContactSubmissions, deleteContactSubmission, type ContactSubmission,
} from "@/lib/contact-submissions";
import { useIsMobile } from "@/hooks/use-mobile";

/* =====================
   Constants
===================== */
const PROJECT_CARD_ASPECT_RATIO = 16 / 10;
const STORAGE_IMAGE_LIMIT_BYTES = 1000 * 1024 * 1024;
const STORAGE_DB_LIMIT_BYTES    =  500 * 1024 * 1024;

const COMPRESS_MAX_DIMENSION = 1400;
const COMPRESS_QUALITY       = 0.82;
const COMPRESS_MAX_BYTES     = 800 * 1024;

const CURRENT_YEAR = new Date().getFullYear();
// Year options: 1990 → current year, newest first
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 1990 + 1 },
  (_, i) => String(CURRENT_YEAR - i)
);

/* =====================
   Types
===================== */
type ResizeHandle = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

interface CropSelection { x: number; y: number; width: number; height: number; }

// All string fields — no `as const` so setState accepts any string value
interface ProjectForm {
  title: string;
  location: string;
  type: string;
  year: string;
  image: string;
}

const defaultCrop = (): CropSelection => ({ x: 5, y: 5, width: 90, height: 90 });
const defaultForm = (): ProjectForm   => ({
  title: "", location: "", type: "",
  year: String(CURRENT_YEAR),
  image: "",
});

/* =====================
   Pure helpers
===================== */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatSubmissionDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function getAspectLockedSelection(
  imageWidth: number, imageHeight: number,
  sizePercent: number, centerX = 50, centerY = 50,
): CropSelection {
  const imageAspect = imageWidth / imageHeight;
  const maxW = PROJECT_CARD_ASPECT_RATIO > imageAspect ? 100 : (PROJECT_CARD_ASPECT_RATIO / imageAspect) * 100;
  const maxH = PROJECT_CARD_ASPECT_RATIO > imageAspect ? (imageAspect / PROJECT_CARD_ASPECT_RATIO) * 100 : 100;
  const scale = Math.min(1, Math.max(0.3, sizePercent / 100));
  const w = maxW * scale, h = maxH * scale;
  const x = Math.min(100 - w, Math.max(0, centerX - w / 2));
  const y = Math.min(100 - h, Math.max(0, centerY - h / 2));
  return { x: +x.toFixed(2), y: +y.toFixed(2), width: +w.toFixed(2), height: +h.toFixed(2) };
}

async function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error("Could not load image for compression."));
    img.onload  = () => {
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > COMPRESS_MAX_DIMENSION || h > COMPRESS_MAX_DIMENSION) {
        const ratio = COMPRESS_MAX_DIMENSION / Math.max(w, h);
        w = Math.round(w * ratio); h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable."));
      ctx.drawImage(img, 0, 0, w, h);
      let quality = COMPRESS_QUALITY;
      let result  = canvas.toDataURL("image/jpeg", quality);
      let tries   = 0;
      while (result.length * 0.75 > COMPRESS_MAX_BYTES && tries < 4) {
        quality = Math.max(0.4, quality - 0.05);
        result  = canvas.toDataURL("image/jpeg", quality);
        tries++;
      }
      resolve(result);
    };
    img.src = dataUrl;
  });
}

/* =====================
   Component
===================== */
export default function AdminDashboardPage() {
  const router   = useRouter();
  const isMobile = useIsMobile();

  const [activeTab,  setActiveTab]  = useState<"projects" | "submissions">("projects");
  const [adminEmail, setAdminEmail] = useState("admin@gmail.com");

  const [projects,           setProjects]           = useState<AdminProject[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [storageImageBytes,  setStorageImageBytes]  = useState(0);
  const [storageDbBytes,     setStorageDbBytes]     = useState<number | null>(null);

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject,  setEditingProject]  = useState<AdminProject | null>(null);
  const [newProject,      setNewProject]      = useState<ProjectForm>(defaultForm());

  const [rawImageDataUrl,      setRawImageDataUrl]      = useState("");
  const [uploadedImageSize,    setUploadedImageSize]    = useState({ width: 16, height: 9 });
  const [imageEditError,       setImageEditError]       = useState("");
  const [isApplyingCrop,       setIsApplyingCrop]       = useState(false);
  const [isCompressing,        setIsCompressing]        = useState(false);
  const [compressedSizeLabel,  setCompressedSizeLabel]  = useState("");
  const [zoomLevel,            setZoomLevel]            = useState(1);
  const [cropSizePercent,      setCropSizePercent]      = useState(90);
  const [cropSelection,        setCropSelection]        = useState<CropSelection>(defaultCrop());
  const [isDraggingSelection,  setIsDraggingSelection]  = useState(false);
  const [isResizingSelection,  setIsResizingSelection]  = useState(false);
  const [activeResizeHandle,   setActiveResizeHandle]   = useState<ResizeHandle | null>(null);
  const [dragStart,            setDragStart]            = useState({ x: 0, y: 0 });
  const [selectionAtDragStart, setSelectionAtDragStart] = useState({ x: 5, y: 5 });
  const [cropAtDragStart,      setCropAtDragStart]      = useState<CropSelection>(defaultCrop());

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDelete,    setPendingDelete]    = useState<{
    id: string; type: "project" | "submission"; title: string;
  } | null>(null);

  const cropEditorRef         = useRef<HTMLDivElement | null>(null);
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartZoomRef     = useRef(1);

  const fetchDbSize = async () => {
    const { data, error } = await supabase.rpc("get_db_size");
    if (!error && typeof data === "number") setStorageDbBytes(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace("/Admin"); return; }
      setAdminEmail(data.session.user.email ?? "admin");
      getProjects().then(setProjects);
      getContactSubmissions().then(setContactSubmissions);
      getStorageUsedBytes().then(setStorageImageBytes);
      fetchDbSize();
    });
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/Admin");
  };

  /* ── Form helpers ── */
  const handleProjectFieldChange = (field: keyof ProjectForm, value: string) =>
    setNewProject((prev) => ({ ...prev, [field]: value }));

  const resetProjectForm = () => {
    setNewProject(defaultForm());
    setRawImageDataUrl(""); setUploadedImageSize({ width: 16, height: 9 });
    setImageEditError(""); setIsCompressing(false); setCompressedSizeLabel("");
    setZoomLevel(1); setCropSizePercent(90); setCropSelection(defaultCrop());
    setIsDraggingSelection(false); setIsResizingSelection(false);
    setActiveResizeHandle(null); setEditingProject(null); setShowProjectForm(false);
  };

  const handleEditProject = (project: AdminProject) => {
    setEditingProject(project);
    setNewProject({
      title:    project.title,
      location: project.location,
      type:     project.type,
      year:     project.year ?? String(CURRENT_YEAR),
      image:    project.image,
    });
    setRawImageDataUrl(""); setUploadedImageSize({ width: 16, height: 9 });
    setImageEditError(""); setIsCompressing(false); setCompressedSizeLabel("");
    setZoomLevel(1); setCropSizePercent(90); setCropSelection(defaultCrop());
    setIsDraggingSelection(false); setIsResizingSelection(false);
    setActiveResizeHandle(null); setShowProjectForm(true);
  };

  /* ── Image file change ── */
  const handleProjectImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload  = () => typeof reader.result === "string" ? resolve(reader.result) : resolve("");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
    event.target.value = "";

    if (!dataUrl) { setImageEditError("Unable to load selected image. Please try another file."); return; }

    const dims = await new Promise<{ width: number; height: number }>((resolve) => {
      const img = new Image();
      img.onload  = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 16, height: 9 });
      img.src = dataUrl;
    });

    setIsCompressing(true); setImageEditError(""); setCompressedSizeLabel("");
    try {
      const compressed  = await compressImage(dataUrl);
      const approxBytes = Math.round(compressed.length * 0.75);
      setCompressedSizeLabel(`Compressed to ${formatBytes(approxBytes)}`);
      setRawImageDataUrl(compressed);
      handleProjectFieldChange("image", compressed);
    } catch {
      setRawImageDataUrl(dataUrl);
      handleProjectFieldChange("image", dataUrl);
      setImageEditError("Compression failed — original image will be used.");
    } finally {
      setIsCompressing(false);
    }

    setUploadedImageSize(dims);
    setZoomLevel(1); setCropSizePercent(90);
    setCropSelection(isMobile ? defaultCrop() : getAspectLockedSelection(dims.width, dims.height, 90));
    setIsResizingSelection(false); setActiveResizeHandle(null);
  };

  /* ── Crop / drag ── */
  const startSelectionDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingSelection(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setSelectionAtDragStart({ x: cropSelection.x, y: cropSelection.y });
  };

  const startSelectionTouchDrag = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile || e.touches.length !== 1) return;
    const t = e.touches[0];
    setIsDraggingSelection(true);
    setDragStart({ x: t.clientX, y: t.clientY });
    setSelectionAtDragStart({ x: cropSelection.x, y: cropSelection.y });
  };

  const applyResizeDelta = (dX: number, dY: number, bounds: DOMRect) => {
    if (!activeResizeHandle) return;
    const dxP = (dX / bounds.width)  * 100;
    const dyP = (dY / bounds.height) * 100;
    const MIN = 8;
    setCropSelection(() => {
      let { x, y, width: w, height: h } = cropAtDragStart;
      if (activeResizeHandle.includes("w")) { x += dxP; w -= dxP; }
      if (activeResizeHandle.includes("e")) { w += dxP; }
      if (activeResizeHandle.includes("n")) { y += dyP; h -= dyP; }
      if (activeResizeHandle.includes("s")) { h += dyP; }
      if (w < MIN) { if (activeResizeHandle.includes("w")) x = cropAtDragStart.x + (cropAtDragStart.width  - MIN); w = MIN; }
      if (h < MIN) { if (activeResizeHandle.includes("n")) y = cropAtDragStart.y + (cropAtDragStart.height - MIN); h = MIN; }
      if (x < 0)       { if (activeResizeHandle.includes("w")) w += x; x = 0; }
      if (y < 0)       { if (activeResizeHandle.includes("n")) h += y; y = 0; }
      if (x + w > 100) { if (activeResizeHandle.includes("e")) w = 100 - x; else x = 100 - w; }
      if (y + h > 100) { if (activeResizeHandle.includes("s")) h = 100 - y; else y = 100 - h; }
      return { x: +x.toFixed(2), y: +y.toFixed(2), width: +w.toFixed(2), height: +h.toFixed(2) };
    });
  };

  const handleEditorMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((!isDraggingSelection && !isResizingSelection) || !cropEditorRef.current) return;
    const bounds = cropEditorRef.current.getBoundingClientRect();
    const dX = e.clientX - dragStart.x, dY = e.clientY - dragStart.y;
    if (isResizingSelection) { applyResizeDelta(dX, dY, bounds); return; }
    const nX = selectionAtDragStart.x + (dX / bounds.width)  * 100;
    const nY = selectionAtDragStart.y + (dY / bounds.height) * 100;
    setCropSelection((prev) => ({
      ...prev,
      x: +Math.min(100 - prev.width,  Math.max(0, nX)).toFixed(2),
      y: +Math.min(100 - prev.height, Math.max(0, nY)).toFixed(2),
    }));
  };

  const stopSelectionDrag = () => {
    if (isDraggingSelection) setIsDraggingSelection(false);
    if (isResizingSelection) { setIsResizingSelection(false); setActiveResizeHandle(null); }
  };

  const startResize = (handle: ResizeHandle, cx: number, cy: number) => {
    setIsDraggingSelection(false); setIsResizingSelection(true);
    setActiveResizeHandle(handle); setDragStart({ x: cx, y: cy });
    setCropAtDragStart(cropSelection);
  };
  const startResizeMouse = (h: ResizeHandle, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); e.stopPropagation(); startResize(h, e.clientX, e.clientY);
  };
  const startResizeTouch = (h: ResizeHandle, e: React.TouchEvent<HTMLButtonElement>) => {
    if (e.touches.length !== 1) return;
    e.preventDefault(); e.stopPropagation();
    startResize(h, e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleEditorTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile || !cropEditorRef.current) return;
    const bounds = cropEditorRef.current.getBoundingClientRect();
    if (e.touches.length === 2 && pinchStartDistanceRef.current) {
      e.preventDefault();
      const [t1, t2] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      setZoomLevel(+Math.min(3, Math.max(1, pinchStartZoomRef.current * (dist / pinchStartDistanceRef.current))).toFixed(2));
      return;
    }
    if (isResizingSelection && activeResizeHandle && e.touches.length === 1) {
      e.preventDefault();
      const t = e.touches[0];
      applyResizeDelta(t.clientX - dragStart.x, t.clientY - dragStart.y, bounds);
      return;
    }
    if (!isDraggingSelection || e.touches.length !== 1) return;
    e.preventDefault();
    const t = e.touches[0];
    const nX = selectionAtDragStart.x + ((t.clientX - dragStart.x) / bounds.width)  * 100;
    const nY = selectionAtDragStart.y + ((t.clientY - dragStart.y) / bounds.height) * 100;
    setCropSelection((prev) => ({
      ...prev,
      x: +Math.min(100 - prev.width,  Math.max(0, nX)).toFixed(2),
      y: +Math.min(100 - prev.height, Math.max(0, nY)).toFixed(2),
    }));
  };

  const handleCropSizeChange = (value: number) => {
    const v = Math.min(100, Math.max(30, value));
    setCropSizePercent(v);
    setCropSelection(getAspectLockedSelection(
      uploadedImageSize.width, uploadedImageSize.height, v,
      cropSelection.x + cropSelection.width  / 2,
      cropSelection.y + cropSelection.height / 2,
    ));
  };

  const toggleZoom = () => setZoomLevel((p) => (p > 1 ? 1 : 2));

  const handlePreviewTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile || e.touches.length !== 2) return;
    const [t1, t2] = [e.touches[0], e.touches[1]];
    pinchStartDistanceRef.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    pinchStartZoomRef.current = zoomLevel;
    setIsDraggingSelection(false); setIsResizingSelection(false); setActiveResizeHandle(null);
  };
  const handlePreviewTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    if (e.touches.length < 2) pinchStartDistanceRef.current = null;
    if (e.touches.length === 0) stopSelectionDrag();
  };

  /* ── Apply crop ── */
  const applyImageCrop = async () => {
    if (!rawImageDataUrl) return;
    setIsApplyingCrop(true); setImageEditError("");
    try {
      const srcImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload  = () => resolve(img);
        img.onerror = () => reject(new Error("Unable to process image."));
        img.src = rawImageDataUrl;
      });

      const zoom    = Math.min(3, Math.max(1, zoomLevel));
      const srcWPct = cropSelection.width  / zoom;
      const srcHPct = cropSelection.height / zoom;
      const srcXPct = Math.min(100 - srcWPct, Math.max(0, ((cropSelection.x - 50) / zoom) + 50));
      const srcYPct = Math.min(100 - srcHPct, Math.max(0, ((cropSelection.y - 50) / zoom) + 50));
      const sx = (srcXPct / 100) * srcImg.width,  sy = (srcYPct / 100) * srcImg.height;
      const sw = (srcWPct / 100) * srcImg.width,  sh = (srcHPct / 100) * srcImg.height;
      if (sw <= 0 || sh <= 0) throw new Error("Invalid crop area.");

      const canvas = document.createElement("canvas");
      const scale  = Math.min(COMPRESS_MAX_DIMENSION / sw, COMPRESS_MAX_DIMENSION / sh, 1);
      canvas.width  = Math.max(1, Math.round(sw * scale));
      canvas.height = Math.max(1, Math.round(sh * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Unable to edit image.");
      ctx.drawImage(srcImg, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

      const compressed  = await compressImage(canvas.toDataURL("image/jpeg", COMPRESS_QUALITY));
      const approxBytes = Math.round(compressed.length * 0.75);
      setCompressedSizeLabel(`Compressed to ${formatBytes(approxBytes)}`);
      handleProjectFieldChange("image", compressed);
    } catch {
      setImageEditError("Image crop failed. Please adjust crop and try again.");
    } finally {
      setIsApplyingCrop(false);
    }
  };

  /* ── CRUD ── */
  const refreshStorage = () => {
    getStorageUsedBytes().then(setStorageImageBytes);
    fetchDbSize();
  };

  const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input: Omit<AdminProject, "id"> = {
      title:    newProject.title.trim()    || "Untitled Project",
      location: newProject.location.trim() || "—",
      type:     newProject.type.trim()     || "—",
      year:     newProject.year            || String(CURRENT_YEAR),
      image:    newProject.image.trim(),
    };

    if (editingProject) {
      const patch: Partial<Omit<AdminProject, "id">> = {
        title: input.title, location: input.location,
        type:  input.type,  year:     input.year,
      };
      if (input.image && input.image !== editingProject.image) patch.image = input.image;
      const updated = await updateProject(editingProject.id, patch);
      if (updated) {
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        refreshStorage();
      }
    } else {
      if (!input.image) { setImageEditError("Please upload an image before saving."); return; }
      const saved = await addProject(input);
      if (saved) { setProjects((prev) => [saved, ...prev]); refreshStorage(); }
    }
    resetProjectForm();
  };

  const handleDeleteProject = async (id: string) => {
    // deleteProject now also removes the storage image — see admin-projects.ts
    if (await deleteProject(id)) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      refreshStorage();
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (await deleteContactSubmission(id)) {
      setContactSubmissions((prev) => prev.filter((s) => s.id !== id));
      fetchDbSize();
    }
  };

  const openDeleteDialog = (type: "project" | "submission", id: string, title: string) => {
    setPendingDelete({ type, id, title }); setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === "project") handleDeleteProject(pendingDelete.id);
    else handleDeleteSubmission(pendingDelete.id);
    setDeleteDialogOpen(false); setPendingDelete(null);
  };

  /* ── Derived display values ── */
  const imgPct = Math.min(100, (storageImageBytes / STORAGE_IMAGE_LIMIT_BYTES) * 100);
  const dbPct  = storageDbBytes !== null
    ? Math.min(100, (storageDbBytes / STORAGE_DB_LIMIT_BYTES) * 100) : 0;

  const RESIZE_HANDLES: [ResizeHandle, string, React.CSSProperties, string][] = [
    ["nw","top-left",     { left:`${cropSelection.x}%`,                        top:`${cropSelection.y}%`                        }, "h-4 w-4 cursor-nwse-resize rounded-full"],
    ["n", "top",          { left:`${cropSelection.x+cropSelection.width/2}%`,   top:`${cropSelection.y}%`                        }, "h-3 w-10 cursor-ns-resize rounded"      ],
    ["ne","top-right",    { left:`${cropSelection.x+cropSelection.width}%`,     top:`${cropSelection.y}%`                        }, "h-4 w-4 cursor-nesw-resize rounded-full"],
    ["e", "right",        { left:`${cropSelection.x+cropSelection.width}%`,     top:`${cropSelection.y+cropSelection.height/2}%` }, "h-10 w-3 cursor-ew-resize rounded"      ],
    ["se","bottom-right", { left:`${cropSelection.x+cropSelection.width}%`,     top:`${cropSelection.y+cropSelection.height}%`   }, "h-4 w-4 cursor-nwse-resize rounded-full"],
    ["s", "bottom",       { left:`${cropSelection.x+cropSelection.width/2}%`,   top:`${cropSelection.y+cropSelection.height}%`   }, "h-3 w-10 cursor-ns-resize rounded"      ],
    ["sw","bottom-left",  { left:`${cropSelection.x}%`,                         top:`${cropSelection.y+cropSelection.height}%`   }, "h-4 w-4 cursor-nesw-resize rounded-full"],
    ["w", "left",         { left:`${cropSelection.x}%`,                         top:`${cropSelection.y+cropSelection.height/2}%` }, "h-10 w-3 cursor-ew-resize rounded"      ],
  ];

  /* ── Render ── */
  return (
    <main className="min-h-screen bg-[#0B1D3A] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">

          {/* Header */}
          <div className="border-b border-white/10 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl text-white">Admin Dashboard</h1>
                <p className="mt-1 text-base text-white/70">{adminEmail}</p>
              </div>
              <Button type="button" variant="ghost" onClick={handleSignOut}
                className="text-white hover:bg-white/10 hover:text-white">
                <LogOut className="mr-2 h-4 w-4" />Sign Out
              </Button>
            </div>

            {/* Storage cards */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between text-white/80">
                  <span className="inline-flex items-center gap-2 text-sm font-medium">
                    <Database className="h-4 w-4" />Image Storage
                  </span>
                  <span className="tabular-nums text-sm">{formatBytes(storageImageBytes)} / 1000 MB</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#C5A55A] transition-all" style={{ width: `${imgPct.toFixed(2)}%` }} />
                </div>
                <p className="mt-1 text-xs text-white/40">Project image files in Supabase Storage</p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between text-white/80">
                  <span className="inline-flex items-center gap-2 text-sm font-medium">
                    <HardDrive className="h-4 w-4" />Database Size
                  </span>
                  <span className="tabular-nums text-sm">
                    {storageDbBytes !== null
                      ? `${formatBytes(storageDbBytes)} / 500 MB`
                      : <span className="text-white/40 text-xs">Run get_db_size() SQL to enable</span>}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#C5A55A] transition-all" style={{ width: `${dbPct.toFixed(2)}%` }} />
                </div>
                <p className="mt-1 text-xs text-white/40">
                  Postgres rows — projects + submissions
                  {storageDbBytes === null && (
                    <span className="ml-1 text-amber-400/70">
                      (requires <code className="text-amber-300">get_db_size()</code> RPC — included in migration.sql)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Tabs */}
            <div className="flex items-center gap-3 border-b border-white/10">
              {(["projects", "submissions"] as const).map((tab) => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-lg transition-colors ${
                    activeTab === tab ? "border-b-2 border-[#C5A55A] text-white" : "text-white/60 hover:text-white/85"
                  }`}>
                  {tab === "projects"
                    ? `Projects (${projects.length})`
                    : `Contact Submissions (${contactSubmissions.length})`}
                </button>
              ))}
            </div>

            {/* Projects tab */}
            {activeTab === "projects" ? (
              <section className="pt-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h2 className="font-serif text-4xl text-white">Manage Projects</h2>
                  <Button
                    onClick={() => showProjectForm
                      ? resetProjectForm()
                      : (setEditingProject(null), setShowProjectForm(true))}
                    className="bg-[#C5A55A] text-[#0B1D3A] hover:bg-[#D4B36A]">
                    {showProjectForm ? "Cancel" : <><Plus className="mr-2 h-4 w-4" />Add Project</>}
                  </Button>
                </div>

                {showProjectForm ? (
                  <form onSubmit={handleAddProject}
                    className="mb-6 grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2 sm:p-6">
                    <div className="sm:col-span-2">
                      <p className="text-lg font-semibold text-white">
                        {editingProject ? `Editing: ${editingProject.title}` : "New Project"}
                      </p>
                      <p className="text-sm text-white/50">Only the image is required. All other fields are optional.</p>
                    </div>

                    {/* Text fields */}
                    {([
                      { id: "project-title",    label: "Project Title", field: "title"    as keyof ProjectForm, ph: "Project name"          },
                      { id: "project-location", label: "Location",      field: "location" as keyof ProjectForm, ph: "City, State"            },
                      { id: "project-type",     label: "Project Type",  field: "type"     as keyof ProjectForm, ph: "Curtain Wall / Glazing" },
                    ]).map(({ id, label, field, ph }) => (
                      <div key={id} className="space-y-2">
                        <Label htmlFor={id} className="text-white/90">
                          {label} <span className="text-white/40">(optional)</span>
                        </Label>
                        <Input id={id} value={newProject[field]}
                          onChange={(e) => handleProjectFieldChange(field, e.target.value)}
                          className="border-white/15 bg-white/5 text-white placeholder:text-white/35"
                          placeholder={ph} />
                      </div>
                    ))}

                    {/* Year dropdown */}
                    <div className="space-y-2">
                      <Label htmlFor="project-year" className="text-white/90">
                        Year <span className="text-white/40">(optional)</span>
                      </Label>
                      <select
                        id="project-year"
                        value={newProject.year}
                        onChange={(e) => handleProjectFieldChange("year", e.target.value)}
                        className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#C5A55A]"
                      >
                        {YEAR_OPTIONS.map((y) => (
                          <option key={y} value={y} className="bg-[#0B1D3A] text-white">{y}</option>
                        ))}
                      </select>
                    </div>

                    {/* Image upload */}
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="project-image-file" className="text-white/90">
                        Upload Image
                        {editingProject
                          ? <span className="text-white/40"> (optional — keep existing if not changed)</span>
                          : <span className="text-red-400"> *required</span>}
                      </Label>
                      {editingProject && newProject.image && !newProject.image.startsWith("data:") ? (
                        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-2">
                          <img src={newProject.image} alt="Current project image" className="h-16 w-28 rounded object-cover" />
                          <span className="text-xs text-white/60">Current image — upload a new file to replace it</span>
                        </div>
                      ) : null}
                      <Input id="project-image-file" type="file" accept="image/*"
                        onChange={handleProjectImageFileChange}
                        className="border-white/15 bg-white/5 text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#C5A55A] file:px-3 file:py-1 file:text-sm file:font-medium file:text-[#0B1D3A]" />
                      {isCompressing ? (
                        <p className="text-xs text-white/50 animate-pulse">⏳ Compressing image…</p>
                      ) : compressedSizeLabel ? (
                        <p className="text-xs text-emerald-400">✓ {compressedSizeLabel}</p>
                      ) : null}
                    </div>

                    {/* Crop editor */}
                    {rawImageDataUrl ? (
                      <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-[#0B1D3A]/60 p-4 sm:p-5">
                        <p className="mb-3 text-sm text-white/75">
                          {isMobile
                            ? "Pinch to zoom, drag the box, or use any edge/corner handle."
                            : "Project ratio is locked to 16:10. Drag the crop box to select image area."}
                        </p>

                        <div ref={cropEditorRef}
                          className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-lg border border-white/20 bg-black"
                          style={{ aspectRatio: `${Math.max(1, uploadedImageSize.width)} / ${Math.max(1, uploadedImageSize.height)}` }}
                          onDoubleClick={isMobile ? undefined : toggleZoom}
                          onTouchStart={handlePreviewTouchStart} onTouchMove={handleEditorTouchMove} onTouchEnd={handlePreviewTouchEnd}
                          onMouseMove={handleEditorMouseMove} onMouseUp={stopSelectionDrag} onMouseLeave={stopSelectionDrag}>

                          <img src={rawImageDataUrl} alt="Crop preview"
                            className="h-full w-full object-contain select-none"
                            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center" }}
                            draggable={false} />

                          <div
                            className={`absolute border-2 border-[#C5A55A] bg-transparent ${isDraggingSelection ? "cursor-grabbing" : "cursor-grab"}`}
                            style={{
                              top: `${cropSelection.y}%`, left: `${cropSelection.x}%`,
                              width: `${cropSelection.width}%`, height: `${cropSelection.height}%`,
                              boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                            }}
                            onMouseDown={startSelectionDrag} onTouchStart={startSelectionTouchDrag} />

                          {RESIZE_HANDLES.map(([handle, label, style, cls]) => (
                            <button key={handle} type="button" aria-label={`Resize ${label}`}
                              className={`absolute -translate-x-1/2 -translate-y-1/2 border border-[#0B1D3A] bg-[#C5A55A] ${cls}`}
                              style={style}
                              onMouseDown={(e) => startResizeMouse(handle, e)}
                              onTouchStart={(e) => startResizeTouch(handle, e)} />
                          ))}
                        </div>

                        <p className="mt-3 text-xs text-white/65">
                          Crop: {Math.round(cropSelection.width)}% × {Math.round(cropSelection.height)}%
                          {" "}• X {Math.round(cropSelection.x)}% / Y {Math.round(cropSelection.y)}%
                          {" "}• Zoom {zoomLevel.toFixed(1)}x
                        </p>
                        {isMobile
                          ? <p className="mt-1 text-xs text-white/55">Pinch to zoom • Drag box to move • 8 handles to resize.</p>
                          : <p className="mt-1 text-xs text-white/55">Double-click to toggle zoom.</p>}

                        {!isMobile ? (
                          <div className="mt-3 space-y-2">
                            <Label htmlFor="project-crop-size" className="text-xs text-white/75">Crop Size ({cropSizePercent}%)</Label>
                            <Input id="project-crop-size" type="range" min={30} max={100} value={cropSizePercent}
                              onChange={(e) => handleCropSizeChange(Number(e.target.value))} />
                          </div>
                        ) : null}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Button type="button" onClick={applyImageCrop} disabled={isApplyingCrop}
                            className="bg-[#C5A55A] text-[#0B1D3A] hover:bg-[#D4B36A]">
                            {isApplyingCrop ? "Applying…" : "Apply Crop"}
                          </Button>
                          <Button type="button" variant="outline"
                            onClick={() => {
                              setZoomLevel(1); setCropSizePercent(90);
                              setCropSelection(getAspectLockedSelection(uploadedImageSize.width, uploadedImageSize.height, 90));
                            }}
                            className="border-white/20 bg-transparent text-white hover:bg-white/10">
                            Reset Crop
                          </Button>
                        </div>
                        {imageEditError ? <p className="mt-2 text-sm text-red-300">{imageEditError}</p> : null}
                      </div>
                    ) : null}

                    <div className="sm:col-span-2 flex items-center gap-3">
                      <Button type="submit" className="bg-[#C5A55A] text-[#0B1D3A] hover:bg-[#D4B36A]">
                        {editingProject ? "Update Project" : "Save Project"}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetProjectForm}
                        className="border-white/20 bg-transparent text-white hover:bg-white/10">
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : null}

                {projects.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                    <p className="mb-5 text-3xl text-white/70">No projects yet</p>
                    <Button onClick={() => setShowProjectForm(true)} className="bg-[#C5A55A] text-[#0B1D3A] hover:bg-[#D4B36A]">
                      <Plus className="mr-2 h-4 w-4" />Add Your First Project
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {projects.map((project) => (
                      <article key={project.id} className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
                        {project.image ? (
                          <img src={project.image} alt={project.title} className="mb-3 h-32 w-full rounded-lg object-cover" />
                        ) : null}
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                            <p className="mt-0.5 text-sm text-white/70">{project.location}</p>
                            {project.year ? (
                              <p className="mt-0.5 text-xs text-white/45">{project.year}</p>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <button type="button" onClick={() => handleEditProject(project)}
                              className="text-white/60 transition hover:text-[#C5A55A]" title="Edit">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => openDeleteDialog("project", project.id, project.title)}
                              className="text-white/60 transition hover:text-white" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-[#C5A55A]">{project.type}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              /* Submissions tab */
              <section className="pt-8">
                <h2 className="mb-6 font-serif text-4xl text-white">Contact Form Submissions</h2>
                {contactSubmissions.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                    <p className="text-2xl text-white/70">No contact submissions yet</p>
                  </div>
                ) : null}
                {contactSubmissions.map((sub) => (
                  <article key={sub.id} className="mb-4 rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8">
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-3xl font-semibold text-white">{sub.name}</h3>
                        <p className="mt-1 text-xl text-white/70">{sub.service || "General enquiry"}</p>
                      </div>
                      <button type="button" onClick={() => openDeleteDialog("submission", sub.id, sub.name)}
                        className="text-white/60 transition hover:text-white">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      {[
                        { label: "Email",            value: sub.email },
                        { label: "Phone",            value: sub.phone },
                        { label: "Service Required", value: sub.service || "Not specified" },
                        { label: "Submitted",        value: formatSubmissionDate(sub.submittedAt) },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="mb-1 text-xs tracking-[0.25em] text-white/50 uppercase">{label}</p>
                          <p className="text-2xl text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6">
                      <p className="mb-1 text-xs tracking-[0.25em] text-white/50 uppercase">Message</p>
                      <p className="text-lg text-white/85">{sub.message}</p>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Delete dialog */}
      <AlertDialog open={deleteDialogOpen}
        onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setPendingDelete(null); }}>
        <AlertDialogContent className="border-white/10 bg-[#10274A] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete this{" "}
              {pendingDelete?.type === "project" ? "project" : "contact submission"}?
            </AlertDialogDescription>
            <p className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85">
              {pendingDelete?.title ?? "Selected item"}
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-[#C5A55A] text-[#0B1D3A] hover:bg-[#D4B36A]">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}