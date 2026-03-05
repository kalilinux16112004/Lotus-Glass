// page.tsx - Admin dashboard for managing projects and contact submissions
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Database, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  getStorageUsedBytes,
  type AdminProject,
} from "@/lib/admin-projects";
import {
  getContactSubmissions,
  deleteContactSubmission,
  type ContactSubmission,
} from "@/lib/contact-submissions";
import { useIsMobile } from "@/hooks/use-mobile";

const PROJECT_CARD_ASPECT_RATIO = 16 / 10;

export default function AdminDashboardPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<"projects" | "submissions">("projects");
  const [adminEmail, setAdminEmail] = useState("admin@gmail.com");
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<AdminProject | null>(null);
  const [storageUsedBytes, setStorageUsedBytes] = useState(0);
  const [newProject, setNewProject] = useState({
    title: "",
    location: "",
    type: "",
    image: "",
  });
  const [rawImageDataUrl, setRawImageDataUrl] = useState("");
  const [uploadedImageSize, setUploadedImageSize] = useState({ width: 16, height: 9 });
  const [imageEditError, setImageEditError] = useState("");
  const [isApplyingCrop, setIsApplyingCrop] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [cropSizePercent, setCropSizePercent] = useState(90);
  const [cropSelection, setCropSelection] = useState({ x: 5, y: 5, width: 90, height: 90 });
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [isResizingSelection, setIsResizingSelection] = useState(false);
  const [activeResizeHandle, setActiveResizeHandle] = useState<
    null | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw"
  >(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectionAtDragStart, setSelectionAtDragStart] = useState({ x: 5, y: 5 });
  const [cropAtDragStart, setCropAtDragStart] = useState({ x: 5, y: 5, width: 90, height: 90 });
  const cropEditorRef = useRef<HTMLDivElement | null>(null);
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    type: "project" | "submission";
    title: string;
  } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/Admin");
        return;
      }

      setAdminEmail(data.session.user.email ?? "admin");
      getProjects().then(setProjects);
      getContactSubmissions().then(setContactSubmissions);
      getStorageUsedBytes().then(setStorageUsedBytes);
    });
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/Admin");
  };

  const handleProjectFieldChange = (field: keyof typeof newProject, value: string) => {
    setNewProject((previous) => ({ ...previous, [field]: value }));
  };

  const getAspectLockedSelection = (
    imageWidth: number,
    imageHeight: number,
    sizePercent: number,
    centerX = 50,
    centerY = 50
  ) => {
    const imageAspect = imageWidth / imageHeight;
    const maxWidthPercent =
      PROJECT_CARD_ASPECT_RATIO > imageAspect
        ? 100
        : (PROJECT_CARD_ASPECT_RATIO / imageAspect) * 100;
    const maxHeightPercent =
      PROJECT_CARD_ASPECT_RATIO > imageAspect
        ? (imageAspect / PROJECT_CARD_ASPECT_RATIO) * 100
        : 100;

    const scale = Math.min(1, Math.max(0.3, sizePercent / 100));
    const width = maxWidthPercent * scale;
    const height = maxHeightPercent * scale;
    const x = Math.min(100 - width, Math.max(0, centerX - width / 2));
    const y = Math.min(100 - height, Math.max(0, centerY - height / 2));

    return {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      width: Number(width.toFixed(2)),
      height: Number(height.toFixed(2)),
    };
  };

  const handleProjectImageUrlChange = (value: string) => {
    setRawImageDataUrl("");
    setUploadedImageSize({ width: 16, height: 9 });
    setImageEditError("");
    setZoomLevel(1);
    setCropSizePercent(90);
    setCropSelection({ x: 5, y: 5, width: 90, height: 90 });
    setIsResizingSelection(false);
    setActiveResizeHandle(null);
    handleProjectFieldChange("image", value);
  };

  const handleProjectImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    const fileReader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      fileReader.onload = () => {
        if (typeof fileReader.result === "string") {
          resolve(fileReader.result);
          return;
        }

        reject(new Error("Could not read selected image."));
      };
      fileReader.onerror = () => reject(new Error("Could not read selected image."));
      fileReader.readAsDataURL(selectedFile);
    }).catch(() => "");

    event.target.value = "";

    if (!dataUrl) {
      setImageEditError("Unable to load selected image. Please try another file.");
      return;
    }

    const imageDimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error("Unable to detect image size."));
      image.src = dataUrl;
    }).catch(() => ({ width: 16, height: 9 }));

    setRawImageDataUrl(dataUrl);
    setUploadedImageSize(imageDimensions);
    setImageEditError("");
    setZoomLevel(1);
    setCropSizePercent(90);
    setCropSelection(
      isMobile
        ? { x: 5, y: 5, width: 90, height: 90 }
        : getAspectLockedSelection(imageDimensions.width, imageDimensions.height, 90)
    );
    setIsResizingSelection(false);
    setActiveResizeHandle(null);
    handleProjectFieldChange("image", dataUrl);
  };

  const startSelectionDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingSelection(true);
    setDragStart({ x: event.clientX, y: event.clientY });
    setSelectionAtDragStart({ x: cropSelection.x, y: cropSelection.y });
  };

  const startSelectionTouchDrag = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile || event.touches.length !== 1) {
      return;
    }

    const touchPoint = event.touches[0];
    setIsDraggingSelection(true);
    setDragStart({ x: touchPoint.clientX, y: touchPoint.clientY });
    setSelectionAtDragStart({ x: cropSelection.x, y: cropSelection.y });
  };

  const handleEditorMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((!isDraggingSelection && !isResizingSelection) || !cropEditorRef.current) {
      return;
    }

    const bounds = cropEditorRef.current.getBoundingClientRect();
    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;

    if (isResizingSelection && activeResizeHandle) {
      const deltaXPercent = (deltaX / bounds.width) * 100;
      const deltaYPercent = (deltaY / bounds.height) * 100;
      const minimumSize = 8;

      setCropSelection(() => {
        let { x, y, width, height } = cropAtDragStart;

        if (activeResizeHandle.includes("w")) {
          x = cropAtDragStart.x + deltaXPercent;
          width = cropAtDragStart.width - deltaXPercent;
        }
        if (activeResizeHandle.includes("e")) {
          width = cropAtDragStart.width + deltaXPercent;
        }
        if (activeResizeHandle.includes("n")) {
          y = cropAtDragStart.y + deltaYPercent;
          height = cropAtDragStart.height - deltaYPercent;
        }
        if (activeResizeHandle.includes("s")) {
          height = cropAtDragStart.height + deltaYPercent;
        }

        if (width < minimumSize) {
          if (activeResizeHandle.includes("w")) {
            x = cropAtDragStart.x + (cropAtDragStart.width - minimumSize);
          }
          width = minimumSize;
        }

        if (height < minimumSize) {
          if (activeResizeHandle.includes("n")) {
            y = cropAtDragStart.y + (cropAtDragStart.height - minimumSize);
          }
          height = minimumSize;
        }

        if (x < 0) {
          if (activeResizeHandle.includes("w")) {
            width += x;
          }
          x = 0;
        }
        if (y < 0) {
          if (activeResizeHandle.includes("n")) {
            height += y;
          }
          y = 0;
        }

        if (x + width > 100) {
          if (activeResizeHandle.includes("e")) {
            width = 100 - x;
          } else {
            x = 100 - width;
          }
        }

        if (y + height > 100) {
          if (activeResizeHandle.includes("s")) {
            height = 100 - y;
          } else {
            y = 100 - height;
          }
        }

        return {
          x: Number(x.toFixed(2)),
          y: Number(y.toFixed(2)),
          width: Number(width.toFixed(2)),
          height: Number(height.toFixed(2)),
        };
      });

      return;
    }

    const nextX = selectionAtDragStart.x + (deltaX / bounds.width) * 100;
    const nextY = selectionAtDragStart.y + (deltaY / bounds.height) * 100;

    setCropSelection((previous) => ({
      ...previous,
      x: Number(Math.min(100 - previous.width, Math.max(0, nextX)).toFixed(2)),
      y: Number(Math.min(100 - previous.height, Math.max(0, nextY)).toFixed(2)),
    }));
  };

  const stopSelectionDrag = () => {
    if (isDraggingSelection) {
      setIsDraggingSelection(false);
    }

    if (isResizingSelection) {
      setIsResizingSelection(false);
      setActiveResizeHandle(null);
    }
  };

  const startResize = (
    handle: "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw",
    clientX: number,
    clientY: number
  ) => {
    setIsDraggingSelection(false);
    setIsResizingSelection(true);
    setActiveResizeHandle(handle);
    setDragStart({ x: clientX, y: clientY });
    setCropAtDragStart(cropSelection);
  };

  const startResizeMouse = (
    handle: "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw",
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    startResize(handle, event.clientX, event.clientY);
  };

  const startResizeTouch = (
    handle: "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw",
    event: React.TouchEvent<HTMLButtonElement>
  ) => {
    if (event.touches.length !== 1) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const touchPoint = event.touches[0];
    startResize(handle, touchPoint.clientX, touchPoint.clientY);
  };

  const handleEditorTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile || !cropEditorRef.current) {
      return;
    }

    if (event.touches.length === 2 && pinchStartDistanceRef.current) {
      event.preventDefault();
      const firstTouch = event.touches[0];
      const secondTouch = event.touches[1];
      const distance = Math.hypot(
        secondTouch.clientX - firstTouch.clientX,
        secondTouch.clientY - firstTouch.clientY
      );

      const scaleFactor = distance / pinchStartDistanceRef.current;
      const nextZoom = pinchStartZoomRef.current * scaleFactor;
      setZoomLevel(Number(Math.min(3, Math.max(1, nextZoom)).toFixed(2)));
      return;
    }

    if (isResizingSelection && activeResizeHandle && event.touches.length === 1) {
      event.preventDefault();
      const touchPoint = event.touches[0];
      const bounds = cropEditorRef.current.getBoundingClientRect();
      const deltaX = touchPoint.clientX - dragStart.x;
      const deltaY = touchPoint.clientY - dragStart.y;
      const deltaXPercent = (deltaX / bounds.width) * 100;
      const deltaYPercent = (deltaY / bounds.height) * 100;
      const minimumSize = 8;

      setCropSelection(() => {
        let { x, y, width, height } = cropAtDragStart;

        if (activeResizeHandle.includes("w")) {
          x = cropAtDragStart.x + deltaXPercent;
          width = cropAtDragStart.width - deltaXPercent;
        }
        if (activeResizeHandle.includes("e")) {
          width = cropAtDragStart.width + deltaXPercent;
        }
        if (activeResizeHandle.includes("n")) {
          y = cropAtDragStart.y + deltaYPercent;
          height = cropAtDragStart.height - deltaYPercent;
        }
        if (activeResizeHandle.includes("s")) {
          height = cropAtDragStart.height + deltaYPercent;
        }

        if (width < minimumSize) {
          if (activeResizeHandle.includes("w")) {
            x = cropAtDragStart.x + (cropAtDragStart.width - minimumSize);
          }
          width = minimumSize;
        }

        if (height < minimumSize) {
          if (activeResizeHandle.includes("n")) {
            y = cropAtDragStart.y + (cropAtDragStart.height - minimumSize);
          }
          height = minimumSize;
        }

        if (x < 0) {
          if (activeResizeHandle.includes("w")) {
            width += x;
          }
          x = 0;
        }
        if (y < 0) {
          if (activeResizeHandle.includes("n")) {
            height += y;
          }
          y = 0;
        }

        if (x + width > 100) {
          if (activeResizeHandle.includes("e")) {
            width = 100 - x;
          } else {
            x = 100 - width;
          }
        }

        if (y + height > 100) {
          if (activeResizeHandle.includes("s")) {
            height = 100 - y;
          } else {
            y = 100 - height;
          }
        }

        return {
          x: Number(x.toFixed(2)),
          y: Number(y.toFixed(2)),
          width: Number(width.toFixed(2)),
          height: Number(height.toFixed(2)),
        };
      });
      return;
    }

    if (!isDraggingSelection || event.touches.length !== 1) {
      return;
    }

    event.preventDefault();
    const touchPoint = event.touches[0];
    const bounds = cropEditorRef.current.getBoundingClientRect();
    const deltaX = touchPoint.clientX - dragStart.x;
    const deltaY = touchPoint.clientY - dragStart.y;

    const nextX = selectionAtDragStart.x + (deltaX / bounds.width) * 100;
    const nextY = selectionAtDragStart.y + (deltaY / bounds.height) * 100;

    setCropSelection((previous) => ({
      ...previous,
      x: Number(Math.min(100 - previous.width, Math.max(0, nextX)).toFixed(2)),
      y: Number(Math.min(100 - previous.height, Math.max(0, nextY)).toFixed(2)),
    }));
  };

  const handleCropSizeChange = (value: number) => {
    const boundedValue = Math.min(100, Math.max(30, value));
    setCropSizePercent(boundedValue);

    const currentCenterX = cropSelection.x + cropSelection.width / 2;
    const currentCenterY = cropSelection.y + cropSelection.height / 2;
    setCropSelection(
      getAspectLockedSelection(
        uploadedImageSize.width,
        uploadedImageSize.height,
        boundedValue,
        currentCenterX,
        currentCenterY
      )
    );
  };

  const toggleZoom = () => {
    setZoomLevel((previous) => (previous > 1 ? 1 : 2));
  };

  const handlePreviewTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile || event.touches.length !== 2) {
      return;
    }

    const firstTouch = event.touches[0];
    const secondTouch = event.touches[1];
    pinchStartDistanceRef.current = Math.hypot(
      secondTouch.clientX - firstTouch.clientX,
      secondTouch.clientY - firstTouch.clientY
    );
    pinchStartZoomRef.current = zoomLevel;
    setIsDraggingSelection(false);
    setIsResizingSelection(false);
    setActiveResizeHandle(null);
  };

  const handlePreviewTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile) {
      return;
    }

    if (event.touches.length < 2) {
      pinchStartDistanceRef.current = null;
    }

    if (event.touches.length === 0) {
      stopSelectionDrag();
    }
  };

  const applyImageCrop = async () => {
    if (!rawImageDataUrl) {
      return;
    }

    const loadImage = (source: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Unable to process image."));
        image.src = source;
      });

    setIsApplyingCrop(true);
    setImageEditError("");

    try {
      const sourceImage = await loadImage(rawImageDataUrl);

      const zoom = Math.min(3, Math.max(1, zoomLevel));

      const sourceWidthPercent = cropSelection.width / zoom;
      const sourceHeightPercent = cropSelection.height / zoom;
      const sourceXPercent = ((cropSelection.x - 50) / zoom) + 50;
      const sourceYPercent = ((cropSelection.y - 50) / zoom) + 50;

      const clampedXPercent = Math.min(100 - sourceWidthPercent, Math.max(0, sourceXPercent));
      const clampedYPercent = Math.min(100 - sourceHeightPercent, Math.max(0, sourceYPercent));

      const sourceX = (clampedXPercent / 100) * sourceImage.width;
      const sourceY = (clampedYPercent / 100) * sourceImage.height;
      const sourceWidth = (sourceWidthPercent / 100) * sourceImage.width;
      const sourceHeight = (sourceHeightPercent / 100) * sourceImage.height;

      if (sourceWidth <= 0 || sourceHeight <= 0) {
        throw new Error("Invalid crop area.");
      }

      const canvas = document.createElement("canvas");
      const maxOutput = 1400;
      const scale = Math.min(maxOutput / sourceWidth, maxOutput / sourceHeight, 1);

      canvas.width = Math.max(1, Math.round(sourceWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceHeight * scale));

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Unable to edit image.");
      }

      context.drawImage(
        sourceImage,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const editedImage = canvas.toDataURL("image/jpeg", 0.92);
      handleProjectFieldChange("image", editedImage);
    } catch {
      setImageEditError("Image crop failed. Please adjust crop and try again.");
    } finally {
      setIsApplyingCrop(false);
    }
  };

  const handleAddProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const projectInput = {
      title: newProject.title.trim() || "Untitled Project",
      location: newProject.location.trim() || "—",
      type: newProject.type.trim() || "—",
      image: newProject.image.trim(),
    };

    if (editingProject) {
      // Update existing project – only send image if it changed (new file chosen)
      const patch: Partial<typeof projectInput> = {
        title: projectInput.title,
        location: projectInput.location,
        type: projectInput.type,
      };
      if (projectInput.image && projectInput.image !== editingProject.image) {
        patch.image = projectInput.image;
      }
      const updated = await updateProject(editingProject.id, patch);
      if (updated) {
        setProjects((previous) =>
          previous.map((p) => (p.id === updated.id ? updated : p))
        );
        getStorageUsedBytes().then(setStorageUsedBytes);
      }
    } else {
      // Add new project – image is required
      if (!projectInput.image) {
        setImageEditError("Please upload an image before saving.");
        return;
      }
      const saved = await addProject(projectInput);
      if (saved) {
        setProjects((previous) => [saved, ...previous]);
        getStorageUsedBytes().then(setStorageUsedBytes);
      }
    }

    resetProjectForm();
  };

  const handleDeleteProject = async (projectId: string) => {
    const ok = await deleteProject(projectId);
    if (ok) {
      setProjects((previous) => previous.filter((p) => p.id !== projectId));
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    const ok = await deleteContactSubmission(submissionId);
    if (ok) {
      setContactSubmissions((previous) =>
        previous.filter((s) => s.id !== submissionId)
      );
    }
  };

  const resetProjectForm = () => {
    setNewProject({ title: "", location: "", type: "", image: "" });
    setRawImageDataUrl("");
    setUploadedImageSize({ width: 16, height: 9 });
    setImageEditError("");
    setZoomLevel(1);
    setCropSizePercent(90);
    setCropSelection({ x: 5, y: 5, width: 90, height: 90 });
    setIsDraggingSelection(false);
    setIsResizingSelection(false);
    setActiveResizeHandle(null);
    setEditingProject(null);
    setShowProjectForm(false);
  };

  const handleEditProject = (project: AdminProject) => {
    setEditingProject(project);
    setNewProject({
      title: project.title,
      location: project.location,
      type: project.type,
      image: project.image,
    });
    setRawImageDataUrl("");
    setUploadedImageSize({ width: 16, height: 9 });
    setImageEditError("");
    setZoomLevel(1);
    setCropSizePercent(90);
    setCropSelection({ x: 5, y: 5, width: 90, height: 90 });
    setIsDraggingSelection(false);
    setIsResizingSelection(false);
    setActiveResizeHandle(null);
    setShowProjectForm(true);
  };

  const openDeleteDialog = (
    type: "project" | "submission",
    id: string,
    title: string
  ) => {
    setPendingDelete({ type, id, title });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) {
      return;
    }

    if (pendingDelete.type === "project") {
      handleDeleteProject(pendingDelete.id);
    } else {
      handleDeleteSubmission(pendingDelete.id);
    }

    setDeleteDialogOpen(false);
    setPendingDelete(null);
  };

  const formatSubmissionDate = (isoDate: string) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return isoDate;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <main className="min-h-screen bg-[#0B1D3A] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="border-b border-white/10 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl text-white">Admin Dashboard</h1>
                <p className="mt-1 text-base text-white/70">{adminEmail}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={handleSignOut}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between text-white/80">
                  <span className="inline-flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Projects
                  </span>
                  <span>{projects.length} / 100</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#C5A55A]"
                    style={{ width: `${Math.min(projects.length, 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between text-white/80">
                  <span className="inline-flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Storage Used
                  </span>
                  <span>
                    {storageUsedBytes < 1024 * 1024
                      ? `${(storageUsedBytes / 1024).toFixed(1)} KB`
                      : `${(storageUsedBytes / (1024 * 1024)).toFixed(2)} MB`}
                    {" / 1000 MB"}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#C5A55A]"
                    style={{
                      width: `${Math.min(100, (storageUsedBytes / (1000 * 1024 * 1024)) * 100).toFixed(2)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className={`px-4 py-3 text-lg transition-colors ${
                  activeTab === "projects"
                    ? "border-b-2 border-[#C5A55A] text-white"
                    : "text-white/60 hover:text-white/85"
                }`}
              >
                Projects ({projects.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("submissions")}
                className={`px-4 py-3 text-lg transition-colors ${
                  activeTab === "submissions"
                    ? "border-b-2 border-[#C5A55A] text-white"
                    : "text-white/60 hover:text-white/85"
                }`}
              >
                Contact Submissions ({contactSubmissions.length})
              </button>
            </div>

            {activeTab === "projects" ? (
              <section className="pt-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h2 className="font-serif text-4xl text-white">Manage Projects</h2>
                  <Button
                    onClick={() => {
                      if (showProjectForm) {
                        resetProjectForm();
                      } else {
                        setEditingProject(null);
                        setShowProjectForm(true);
                      }
                    }}
                    className="bg-[#C5A55A] text-[#0B1D3A] hover:bg-[#D4B36A]"
                  >
                    {showProjectForm ? "Cancel" : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Project
                      </>
                    )}
                  </Button>
                </div>

                {showProjectForm ? (
                  <form
                    onSubmit={handleAddProject}
                    className="mb-6 grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2 sm:p-6"
                  >
                    <div className="sm:col-span-2">
                      <p className="text-lg font-semibold text-white">
                        {editingProject ? `Editing: ${editingProject.title}` : "New Project"}
                      </p>
                      <p className="text-sm text-white/50">Only the image is required. All other fields are optional.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project-title" className="text-white/90">Project Title <span className="text-white/40">(optional)</span></Label>
                      <Input
                        id="project-title"
                        value={newProject.title}
                        onChange={(event) => handleProjectFieldChange("title", event.target.value)}
                        className="border-white/15 bg-white/5 text-white placeholder:text-white/35"
                        placeholder="Project name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project-location" className="text-white/90">Location <span className="text-white/40">(optional)</span></Label>
                      <Input
                        id="project-location"
                        value={newProject.location}
                        onChange={(event) => handleProjectFieldChange("location", event.target.value)}
                        className="border-white/15 bg-white/5 text-white placeholder:text-white/35"
                        placeholder="City, State"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project-type" className="text-white/90">Project Type <span className="text-white/40">(optional)</span></Label>
                      <Input
                        id="project-type"
                        value={newProject.type}
                        onChange={(event) => handleProjectFieldChange("type", event.target.value)}
                        className="border-white/15 bg-white/5 text-white placeholder:text-white/35"
                        placeholder="Curtain Wall / Glazing"
                      />
                    </div>

                    {/* <div className="space-y-2">
                      <Label htmlFor="project-image" className="text-white/90">Image URL (optional)</Label>
                      <Input
                        id="project-image"
                        value={newProject.image}
                        onChange={(event) => handleProjectImageUrlChange(event.target.value)}
                        className="border-white/15 bg-white/5 text-white placeholder:text-white/35"
                        placeholder="/images/project-5.jpg"
                      />
                    </div> */}

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="project-image-file" className="text-white/90">
                        Upload Image
                        {editingProject
                          ? <span className="text-white/40"> (optional — keep existing if not changed)</span>
                          : <span className="text-red-400"> *required</span>}
                      </Label>
                      {editingProject && newProject.image && !newProject.image.startsWith("data:") ? (
                        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-2">
                          <img
                            src={newProject.image}
                            alt="Current project image"
                            className="h-16 w-28 rounded object-cover"
                          />
                          <span className="text-xs text-white/60">Current image — upload a new file to replace it</span>
                        </div>
                      ) : null}
                      <Input
                        id="project-image-file"
                        type="file"
                        accept="image/*"
                        onChange={handleProjectImageFileChange}
                        className="border-white/15 bg-white/5 text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#C5A55A] file:px-3 file:py-1 file:text-sm file:font-medium file:text-[#0B1D3A]"
                      />
                    </div>

                    {rawImageDataUrl ? (
                      <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-[#0B1D3A]/60 p-4 sm:p-5">
                        <p className="mb-3 text-sm text-white/75">
                          {isMobile
                            ? "Image Editor: pinch with 2 fingers to zoom, drag crop box, or adjust from any edge/corner handle."
                            : "Project ratio is locked to 16:10. Drag the crop box to select image area."}
                        </p>

                        <div
                          ref={cropEditorRef}
                          className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-lg border border-white/20 bg-black"
                          style={{
                            aspectRatio: `${Math.max(1, uploadedImageSize.width)} / ${Math.max(1, uploadedImageSize.height)}`,
                          }}
                          onDoubleClick={isMobile ? undefined : toggleZoom}
                          onTouchStart={handlePreviewTouchStart}
                          onTouchMove={handleEditorTouchMove}
                          onTouchEnd={handlePreviewTouchEnd}
                          onMouseMove={handleEditorMouseMove}
                          onMouseUp={stopSelectionDrag}
                          onMouseLeave={stopSelectionDrag}
                        >
                          <img
                            src={rawImageDataUrl}
                            alt="Project image crop preview"
                            className="h-full w-full object-contain select-none"
                            style={{
                              transform: `scale(${zoomLevel})`,
                              transformOrigin: "center",
                            }}
                            draggable={false}
                          />

                          <div
                            className={`absolute border-2 border-[#C5A55A] bg-transparent ${isDraggingSelection ? "cursor-grabbing" : "cursor-grab"}`}
                            style={{
                              top: `${cropSelection.y}%`,
                              left: `${cropSelection.x}%`,
                              width: `${cropSelection.width}%`,
                              height: `${cropSelection.height}%`,
                              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.45)",
                            }}
                            onMouseDown={startSelectionDrag}
                            onTouchStart={startSelectionTouchDrag}
                          />

                          <button
                            type="button"
                            aria-label="Resize top-left"
                            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize rounded-full border border-[#0B1D3A] bg-[#C5A55A]"
                            style={{ left: `${cropSelection.x}%`, top: `${cropSelection.y}%` }}
                            onMouseDown={(event) => startResizeMouse("nw", event)}
                            onTouchStart={(event) => startResizeTouch("nw", event)}
                          />
                          <button
                            type="button"
                            aria-label="Resize top"
                            className="absolute h-3 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize rounded border border-[#0B1D3A] bg-[#C5A55A]"
                            style={{ left: `${cropSelection.x + cropSelection.width / 2}%`, top: `${cropSelection.y}%` }}
                            onMouseDown={(event) => startResizeMouse("n", event)}
                            onTouchStart={(event) => startResizeTouch("n", event)}
                          />
                          <button
                            type="button"
                            aria-label="Resize top-right"
                            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-nesw-resize rounded-full border border-[#0B1D3A] bg-[#C5A55A]"
                            style={{ left: `${cropSelection.x + cropSelection.width}%`, top: `${cropSelection.y}%` }}
                            onMouseDown={(event) => startResizeMouse("ne", event)}
                            onTouchStart={(event) => startResizeTouch("ne", event)}
                          />
                          <button
                            type="button"
                            aria-label="Resize right"
                            className="absolute h-10 w-3 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded border border-[#0B1D3A] bg-[#C5A55A]"
                            style={{ left: `${cropSelection.x + cropSelection.width}%`, top: `${cropSelection.y + cropSelection.height / 2}%` }}
                            onMouseDown={(event) => startResizeMouse("e", event)}
                            onTouchStart={(event) => startResizeTouch("e", event)}
                          />
                          <button
                            type="button"
                            aria-label="Resize bottom-right"
                            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize rounded-full border border-[#0B1D3A] bg-[#C5A55A]"
                            style={{ left: `${cropSelection.x + cropSelection.width}%`, top: `${cropSelection.y + cropSelection.height}%` }}
                            onMouseDown={(event) => startResizeMouse("se", event)}
                            onTouchStart={(event) => startResizeTouch("se", event)}
                          />
                          <button
                            type="button"
                            aria-label="Resize bottom"
                            className="absolute h-3 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize rounded border border-[#0B1D3A] bg-[#C5A55A]"
                            style={{ left: `${cropSelection.x + cropSelection.width / 2}%`, top: `${cropSelection.y + cropSelection.height}%` }}
                            onMouseDown={(event) => startResizeMouse("s", event)}
                            onTouchStart={(event) => startResizeTouch("s", event)}
                          />
                          <button
                            type="button"
                            aria-label="Resize bottom-left"
                            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-nesw-resize rounded-full border border-[#0B1D3A] bg-[#C5A55A]"
                            style={{ left: `${cropSelection.x}%`, top: `${cropSelection.y + cropSelection.height}%` }}
                            onMouseDown={(event) => startResizeMouse("sw", event)}
                            onTouchStart={(event) => startResizeTouch("sw", event)}
                          />
                          <button
                            type="button"
                            aria-label="Resize left"
                            className="absolute h-10 w-3 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded border border-[#0B1D3A] bg-[#C5A55A]"
                            style={{ left: `${cropSelection.x}%`, top: `${cropSelection.y + cropSelection.height / 2}%` }}
                            onMouseDown={(event) => startResizeMouse("w", event)}
                            onTouchStart={(event) => startResizeTouch("w", event)}
                          />
                        </div>

                        <p className="mt-3 text-xs text-white/65">
                          Crop Area: {Math.round(cropSelection.width)}% × {Math.round(cropSelection.height)}% • Position X {Math.round(cropSelection.x)}% / Y {Math.round(cropSelection.y)}% • Zoom {zoomLevel.toFixed(1)}x
                        </p>

                        {isMobile ? (
                          <p className="mt-1 text-xs text-white/55">Pinch to zoom • Drag box to move • Use any of 8 handles to crop from that side/corner.</p>
                        ) : (
                          <p className="mt-1 text-xs text-white/55">Double click on preview to zoom.</p>
                        )}

                        {!isMobile ? (
                          <div className="mt-3 space-y-2">
                            <Label htmlFor="project-crop-size" className="text-xs text-white/75">Crop Size ({cropSizePercent}%)</Label>
                            <Input
                              id="project-crop-size"
                              type="range"
                              min={30}
                              max={100}
                              value={cropSizePercent}
                              onChange={(event) => handleCropSizeChange(Number(event.target.value))}
                            />
                          </div>
                        ) : null}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            onClick={applyImageCrop}
                            disabled={isApplyingCrop}
                            className="bg-[#C5A55A] text-[#0B1D3A] hover:bg-[#D4B36A]"
                          >
                            {isApplyingCrop ? "Applying..." : "Apply Crop"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setZoomLevel(1);
                              setCropSizePercent(90);
                              setCropSelection(
                                getAspectLockedSelection(
                                  uploadedImageSize.width,
                                  uploadedImageSize.height,
                                  90
                                )
                              );
                            }}
                            className="border-white/20 bg-transparent text-white hover:bg-white/10"
                          >
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetProjectForm}
                        className="border-white/20 bg-transparent text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : null}

                {projects.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                    <p className="mb-5 text-3xl text-white/70">No projects yet</p>
                    <Button
                      onClick={() => setShowProjectForm(true)}
                      className="bg-[#C5A55A] text-[#0B1D3A] hover:bg-[#D4B36A]"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Project
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {projects.map((project) => (
                      <article
                        key={project.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5"
                      >
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={project.title}
                            className="mb-3 h-32 w-full rounded-lg object-cover"
                          />
                        ) : null}
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                            <p className="mt-1 text-sm text-white/70">{project.location}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditProject(project)}
                              className="text-white/60 transition hover:text-[#C5A55A]"
                              title="Edit project"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteDialog("project", project.id, project.title)}
                              className="text-white/60 transition hover:text-white"
                              title="Delete project"
                            >
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
              <section className="pt-8">
                <h2 className="mb-6 font-serif text-4xl text-white">Contact Form Submissions</h2>

                {contactSubmissions.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                    <p className="text-2xl text-white/70">No contact submissions yet</p>
                  </div>
                ) : null}

                {contactSubmissions.map((submission) => (
                  <article
                    key={submission.id}
                    className="mb-4 rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8"
                  >
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-3xl font-semibold text-white">{submission.name}</h3>
                        <p className="mt-1 text-xl text-white/70">{submission.service || "General enquiry"}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          openDeleteDialog("submission", submission.id, submission.name)
                        }
                        className="text-white/60 transition hover:text-white"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs tracking-[0.25em] text-white/50 uppercase">Email</p>
                        <p className="text-2xl text-white">{submission.email}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs tracking-[0.25em] text-white/50 uppercase">Phone</p>
                        <p className="text-2xl text-white">{submission.phone}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs tracking-[0.25em] text-white/50 uppercase">Service Required</p>
                        <p className="text-2xl text-white">{submission.service || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs tracking-[0.25em] text-white/50 uppercase">Submitted</p>
                        <p className="text-2xl text-white">{formatSubmissionDate(submission.submittedAt)}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <p className="mb-1 text-xs tracking-[0.25em] text-white/50 uppercase">Message</p>
                      <p className="text-lg text-white/85">{submission.message}</p>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </div>
        </div>
      </div>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setPendingDelete(null);
          }
        }}
      >
        <AlertDialogContent className="border-white/10 bg-[#10274A] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete this {pendingDelete?.type === "project" ? "project" : "contact submission"}?
            </AlertDialogDescription>
            <p className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85">
              {pendingDelete?.title || "Selected item"}
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-[#C5A55A] text-[#0B1D3A] hover:bg-[#D4B36A]"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
