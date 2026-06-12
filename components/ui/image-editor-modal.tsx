"use client";

import {
  ArrowTopRightOnSquareIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  CheckIcon,
  ScissorsIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

export type ImageEditorMode = "view" | "edit";

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () =>
      reject(new Error("Image load failed")),
    );
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

function getRadianAngle(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function rotatedBoundingBox(
  width: number,
  height: number,
  rotation: number,
): { width: number; height: number } {
  const rad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  };
}

// Renders the source image with the given rotation, then extracts the crop
// area (which react-easy-crop reports in rotated-image coordinates).
export async function renderEditedImage(
  src: string,
  cropPixels: Area,
  rotation: number,
): Promise<Blob> {
  const image = await createImage(src);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported");

  const box = rotatedBoundingBox(image.width, image.height, rotation);
  canvas.width = box.width;
  canvas.height = box.height;

  context.translate(box.width / 2, box.height / 2);
  context.rotate(getRadianAngle(rotation));
  context.translate(-image.width / 2, -image.height / 2);
  context.drawImage(image, 0, 0);

  const cropped = context.getImageData(
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
  );
  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;
  context.putImageData(cropped, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Canvas export failed")),
      "image/jpeg",
      0.92,
    );
  });
}

export function ImageEditorModal({
  src,
  alt,
  initialMode = "view",
  cropAspect = 4 / 5,
  onClose,
  onSave,
}: {
  src: string;
  alt: string;
  initialMode?: ImageEditorMode;
  cropAspect?: number;
  onClose: () => void;
  onSave: (image: Blob) => Promise<void>;
}) {
  const t = useTranslations("PortraitStudio.editor");
  const [mode, setMode] = useState<ImageEditorMode>(initialMode);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock page scroll behind the modal.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, saving]);

  function enterEdit() {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCropPixels(null);
    setError(null);
    setMode("edit");
  }

  async function handleSave() {
    if (!cropPixels) return;
    setSaving(true);
    setError(null);
    try {
      const image = await renderEditedImage(src, cropPixels, rotation);
      await onSave(image);
    } catch {
      setError(t("saveError"));
      setSaving(false);
    }
  }

  const iconButtonClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-muted transition hover:border-accent hover:text-accent dark:border-white/15 dark:text-canvas/70 dark:hover:border-gold dark:hover:text-gold";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-canvas p-4 shadow-soft sm:p-5 dark:bg-canvas-dark"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-lg text-ink dark:text-canvas">
            {mode === "edit" ? t("cropTitle") : t("title")}
          </p>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label={t("close")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:text-ink disabled:opacity-40 dark:text-canvas/60 dark:hover:text-canvas"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {mode === "view" ? (
          <>
            <div className="flex max-h-[65vh] items-center justify-center overflow-hidden rounded-xl bg-canvas-deep/60 dark:bg-white/[0.04]">
              {/* Plain img: arbitrary blob URLs at natural size, no next/image sizing constraints */}
              <img
                src={src}
                alt={alt}
                className="max-h-[65vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-xs"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                {t("openFullSize")}
              </a>
              <button
                type="button"
                onClick={enterEdit}
                className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs"
              >
                <ScissorsIcon className="h-4 w-4" />
                {t("cropRotate")}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="relative h-[55vh] w-full overflow-hidden rounded-xl bg-ink/90">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={cropAspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) => setCropPixels(areaPixels)}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setRotation((value) => (value + 270) % 360)}
                disabled={saving}
                aria-label={t("rotateLeft")}
                title={t("rotateLeft")}
                className={iconButtonClass}
              >
                <ArrowUturnLeftIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((value) => (value + 90) % 360)}
                disabled={saving}
                aria-label={t("rotateRight")}
                title={t("rotateRight")}
                className={iconButtonClass}
              >
                <ArrowUturnRightIcon className="h-4 w-4" />
              </button>
              <label className="flex min-w-[140px] flex-1 items-center gap-2">
                <span className="text-xs text-ink-muted dark:text-canvas/50">
                  {t("zoom")}
                </span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  disabled={saving}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="w-full accent-accent dark:accent-gold"
                />
              </label>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode("view")}
                  disabled={saving}
                  className="btn-secondary px-4 py-2 text-xs disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving || !cropPixels}
                  className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" strokeWidth={2.5} />
                  {saving ? t("saving") : t("save")}
                </button>
              </div>
            </div>
          </>
        )}

        {error ? <p className="mt-3 text-sm text-rose">{error}</p> : null}
      </div>
    </div>
  );
}
