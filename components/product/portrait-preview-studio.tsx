"use client";

import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  ChevronDownIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { upload } from "@vercel/blob/client";
import { addPortraitItem } from "components/cart/actions";
import { SignInPrompt } from "components/auth/auth-button";
import Price from "components/price";
import { BeforeAfterSlider } from "components/ui/before-after";
import { OrnateFrame } from "components/ui/ornate-frame";
import { VariantSelector } from "components/product/variant-selector";
import clsx from "clsx";
import {
  BACKGROUND_OPTIONS,
  FRAMING_OPTIONS,
  PET_TYPES,
  REVISION_CHIPS,
  STYLE_PRESETS,
  type StylePresetId,
} from "lib/portrait/constants";
import { showcaseImages } from "lib/images";
import { Product, ProductVariant } from "lib/shopify/types";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  ReactNode,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCart } from "components/cart/cart-context";

type PreviewEntry = {
  id: string;
  url: string;
  prompt: string;
};

type StepId = "photo" | "style" | "refine" | "order";

const STORAGE_KEY = "portrait-studio:v1";

type PersistedState = {
  petName: string;
  petType: string;
  stylePreset: StylePresetId;
  background: string;
  framing: string;
  artistNotes: string;
  sourcePhotoUrl: string;
  sessionId?: string;
  previews: PreviewEntry[];
  selectedPreviewId?: string;
  activeStep: StepId;
};

function readPersistedState(): Partial<PersistedState> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

const STYLE_THUMBS: Record<StylePresetId, string> = {
  "warm-vintage": showcaseImages.gallery[0]!.src,
  "classic-oil": showcaseImages.gallery[1]!.src,
  "modern-realistic": showcaseImages.gallery[2]!.src,
  "light-impressionist": showcaseImages.gallery[3]!.src,
};

const BACKGROUND_SWATCHES: Record<string, string> = {
  "Neutral gray": "#b7b3ac",
  Cream: "#f1e7d2",
  "Soft blue": "#aebfce",
  "Warm beige": "#d8c3a4",
  "Dark charcoal": "#3b3733",
};

const PAINTING_LINE_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;

const SPARKLES = [
  { left: "12%", top: "22%", delay: "0s", duration: "2.7s" },
  { left: "78%", top: "14%", delay: "0.6s", duration: "3.2s" },
  { left: "30%", top: "64%", delay: "1.1s", duration: "2.9s" },
  { left: "64%", top: "42%", delay: "0.3s", duration: "3.5s" },
  { left: "86%", top: "70%", delay: "1.5s", duration: "2.6s" },
  { left: "18%", top: "44%", delay: "2s", duration: "3.1s" },
  { left: "48%", top: "18%", delay: "0.9s", duration: "2.8s" },
  { left: "40%", top: "82%", delay: "1.8s", duration: "3.3s" },
] as const;

function StepShell({
  index,
  title,
  summary,
  active,
  done,
  disabled,
  onToggle,
  children,
}: {
  index: number;
  title: string;
  summary?: string;
  active: boolean;
  done: boolean;
  disabled?: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section
      className={clsx(
        "surface-card overflow-hidden transition-shadow duration-500",
        active && "shadow-soft",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="flex w-full items-center gap-4 px-5 py-3 text-left disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span
          className={clsx(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition duration-300",
            done
              ? "bg-accent text-canvas dark:bg-gold dark:text-ink"
              : active
                ? "bg-ink text-canvas dark:bg-canvas dark:text-ink"
                : "border border-line-strong text-ink-muted dark:border-white/15 dark:text-canvas/60",
          )}
        >
          {done ? <CheckIcon className="h-4 w-4" strokeWidth={2.5} /> : index}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-medium text-ink dark:text-canvas">
            {title}
          </span>
          {summary && !active ? (
            <span className="block truncate text-xs text-ink-muted dark:text-canvas/50">
              {summary}
            </span>
          ) : null}
        </span>
        <ChevronDownIcon
          className={clsx(
            "h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300 dark:text-canvas/40",
            active && "rotate-180",
          )}
        />
      </button>
      <div
        className={clsx(
          "grid transition-[grid-template-rows] duration-500 ease-out",
          active ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-1">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function PortraitPreviewStudio({ product }: { product: Product }) {
  const t = useTranslations("PortraitStudio");
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { addCartItem } = useCart();
  const [message, formAction] = useActionState(addPortraitItem, null);

  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState<string>(PET_TYPES[0]);
  const [stylePreset, setStylePreset] = useState<StylePresetId>("classic-oil");
  const [background, setBackground] = useState<string>(BACKGROUND_OPTIONS[1]);
  const [framing, setFraming] = useState<string>(FRAMING_OPTIONS[0]);
  const [artistNotes, setArtistNotes] = useState("");
  const [sourcePhotoUrl, setSourcePhotoUrl] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [previews, setPreviews] = useState<PreviewEntry[]>([]);
  const [selectedPreviewId, setSelectedPreviewId] = useState<string>();
  const [revisionMessage, setRevisionMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<StepId>("photo");
  const [statusIndex, setStatusIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const easelRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  function isMobileViewport() {
    return typeof window !== "undefined" && window.innerWidth < 1024;
  }

  function scrollToEasel() {
    easelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openStep(step: StepId) {
    setActiveStep(step);
    if (isMobileViewport()) {
      railRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Restore an in-progress session from localStorage on first mount.
  useEffect(() => {
    const saved = readPersistedState();
    if (saved) {
      if (typeof saved.petName === "string") setPetName(saved.petName);
      if (
        saved.petType &&
        (PET_TYPES as readonly string[]).includes(saved.petType)
      ) {
        setPetType(saved.petType);
      }
      if (
        saved.stylePreset &&
        STYLE_PRESETS.some((preset) => preset.id === saved.stylePreset)
      ) {
        setStylePreset(saved.stylePreset);
      }
      if (
        saved.background &&
        (BACKGROUND_OPTIONS as readonly string[]).includes(saved.background)
      ) {
        setBackground(saved.background);
      }
      if (
        saved.framing &&
        (FRAMING_OPTIONS as readonly string[]).includes(saved.framing)
      ) {
        setFraming(saved.framing);
      }
      if (typeof saved.artistNotes === "string") {
        setArtistNotes(saved.artistNotes);
      }
      if (typeof saved.sourcePhotoUrl === "string") {
        setSourcePhotoUrl(saved.sourcePhotoUrl);
      }
      if (typeof saved.sessionId === "string") setSessionId(saved.sessionId);
      const savedPreviews = Array.isArray(saved.previews)
        ? saved.previews.filter(
            (entry): entry is PreviewEntry =>
              Boolean(entry) &&
              typeof entry.id === "string" &&
              typeof entry.url === "string",
          )
        : [];
      if (savedPreviews.length > 0) {
        setPreviews(savedPreviews);
        if (
          savedPreviews.some((entry) => entry.id === saved.selectedPreviewId)
        ) {
          setSelectedPreviewId(saved.selectedPreviewId);
        }
      }
      const stepNeedsPreviews =
        saved.activeStep === "refine" || saved.activeStep === "order";
      if (
        saved.activeStep &&
        ["photo", "style", "refine", "order"].includes(saved.activeStep) &&
        (!stepNeedsPreviews || savedPreviews.length > 0)
      ) {
        setActiveStep(saved.activeStep);
      }
    }
    setHydrated(true);
  }, []);

  // Persist the working state so a reload doesn't lose progress.
  useEffect(() => {
    if (!hydrated) return;
    const state: PersistedState = {
      petName,
      petType,
      stylePreset,
      background,
      framing,
      artistNotes,
      sourcePhotoUrl,
      sessionId,
      previews,
      selectedPreviewId,
      activeStep,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or unavailable — the editor still works, just without persistence.
    }
  }, [
    hydrated,
    petName,
    petType,
    stylePreset,
    background,
    framing,
    artistNotes,
    sourcePhotoUrl,
    sessionId,
    previews,
    selectedPreviewId,
    activeStep,
  ]);

  function startOver() {
    if (!window.confirm(t("startOverConfirm"))) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors; state below is reset regardless.
    }
    setPetName("");
    setPetType(PET_TYPES[0]);
    setStylePreset("classic-oil");
    setBackground(BACKGROUND_OPTIONS[1]);
    setFraming(FRAMING_OPTIONS[0]);
    setArtistNotes("");
    setSourcePhotoUrl("");
    setUploadError(null);
    setSessionId(undefined);
    setPreviews([]);
    setSelectedPreviewId(undefined);
    setRevisionMessage("");
    setGenerationError(null);
    setRemainingQuota(null);
    setActiveStep("photo");
  }

  // Rotate the atelier status lines while a preview is being painted.
  useEffect(() => {
    if (!generating) return;
    setStatusIndex(0);
    const interval = setInterval(() => {
      setStatusIndex((value) => (value + 1) % PAINTING_LINE_KEYS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [generating]);

  const variant = product.variants.find((item: ProductVariant) =>
    item.selectedOptions.every(
      (option) => option.value === searchParams.get(option.name.toLowerCase()),
    ),
  );
  const defaultVariantId =
    product.variants.length === 1 ? product.variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const selectedVariant = product.variants.find(
    (item) => item.id === selectedVariantId,
  );
  const selectedPreview = previews.find(
    (item) => item.id === selectedPreviewId,
  );

  const trimmedName = petName.trim();
  const photoDone = Boolean(sourcePhotoUrl && trimmedName);
  const styleDone = previews.length > 0;

  const canGenerate = Boolean(
    session?.user &&
      sourcePhotoUrl &&
      trimmedName &&
      petType &&
      stylePreset &&
      background &&
      framing,
  );

  const canAddToCart = Boolean(
    selectedVariantId && selectedPreview && sourcePhotoUrl && sessionId,
  );

  const portraitPayload = useMemo(
    () => ({
      merchandiseId: selectedVariantId ?? "",
      petName: trimmedName,
      petType,
      background,
      artistNotes,
      sourcePhotoUrl,
      selectedPreviewUrl: selectedPreview?.url ?? "",
      previewSessionId: sessionId ?? "",
      stylePreset,
    }),
    [
      selectedVariantId,
      trimmedName,
      petType,
      background,
      artistNotes,
      sourcePhotoUrl,
      selectedPreview?.url,
      sessionId,
      stylePreset,
    ],
  );

  async function handleUpload(file: File) {
    setUploadError(null);
    setUploading(true);

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setSourcePhotoUrl(blob.url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : t("uploadError"));
    } finally {
      setUploading(false);
    }
  }

  async function generatePreview(revision?: string) {
    if (!canGenerate) return;

    setGenerating(true);
    setGenerationError(null);
    // On mobile the easel is above the controls — bring the show into view.
    if (isMobileViewport()) scrollToEasel();

    try {
      const response = await fetch("/api/ai/portrait-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          sourcePhotoUrl,
          previousPreviewUrl: selectedPreview?.url,
          petName: trimmedName,
          petType,
          stylePreset,
          background,
          framing,
          revisionMessage: revision ?? revisionMessage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? t("errors.generationFailed"));
      }

      setSessionId(data.sessionId);
      setRemainingQuota(data.remainingQuota);
      setPreviews((current) => [
        ...current,
        {
          id: data.previewId,
          url: data.previewUrl,
          prompt: revision ?? revisionMessage,
        },
      ]);
      setSelectedPreviewId(data.previewId);
      setRevisionMessage("");
      setActiveStep("refine");
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : t("errors.generationFailed"),
      );
    } finally {
      setGenerating(false);
    }
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void handleUpload(file);
  }

  const plaqueTitle = trimmedName
    ? `“${trimmedName}”`
    : t("stage.plaqueFallback");
  const plaqueSubtitle = `${t(`styles.${stylePreset}`)} · ${t("stage.plaqueMedium")}`;

  if (!session?.user) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <OrnateFrame variant="gilt" className="mx-auto w-full max-w-md">
          <div className="relative aspect-[4/5]">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 border border-dashed border-line-strong bg-canvas-deep/60 px-8 text-center dark:border-white/15 dark:bg-white/[0.04]">
              <p className="eyebrow">{t("stage.signedOutTitle")}</p>
              <p className="body-muted max-w-xs text-sm">
                {t("stage.signedOutHint")}
              </p>
            </div>
          </div>
        </OrnateFrame>
        <SignInPrompt />
      </div>
    );
  }

  const stageBaseImage = selectedPreview?.url ?? sourcePhotoUrl;

  // Context-sensitive primary action for the mobile bar.
  const stepNumbers: Record<StepId, number> = {
    photo: 1,
    style: 2,
    refine: 3,
    order: 4,
  };
  const barAction =
    activeStep === "photo"
      ? {
          label: t("continue"),
          disabled: !photoDone,
          onClick: () => openStep("style"),
        }
      : activeStep === "style"
        ? {
            label: generating ? t("generating") : t("generate"),
            disabled: !canGenerate || generating,
            onClick: () => void generatePreview(),
          }
        : {
            label: t("chooseSize"),
            disabled: !selectedPreview || generating,
            onClick: () => openStep("order"),
          };
  const barHint =
    activeStep === "photo"
      ? photoDone
        ? `${trimmedName} · ${t(`petTypes.${petType}`)}`
        : t("photoStatusMissing")
      : activeStep === "style"
        ? `${t(`styles.${stylePreset}`)} · ${t(`backgrounds.${background}`)}`
        : activeStep === "refine"
          ? t("versionsCount", { count: previews.length })
          : (selectedVariant?.title ?? t("chooseSize"));

  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-12">
      {/* ——— The easel ——— */}
      <div ref={easelRef} className="scroll-mt-20 lg:sticky lg:top-20">
        {/* Width derived from viewport height so the framed canvas always fits the fold on laptops */}
        <div className="relative mx-auto w-full lg:max-w-[max(18rem,min(100%,calc((100svh-260px)*0.8)))]">
          <OrnateFrame variant="gilt" className="relative z-10">
            <div className="relative aspect-[4/5]" aria-busy={generating}>
              {!sourcePhotoUrl ? (
                <label
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  className={clsx(
                    "absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-4 border border-dashed px-8 text-center transition duration-300",
                    isDragging
                      ? "border-gold bg-gold-soft/40 dark:bg-gold/15"
                      : "border-line-strong bg-canvas-deep/60 hover:border-accent dark:border-white/15 dark:bg-white/[0.04] dark:hover:border-gold-soft",
                  )}
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-canvas dark:bg-gold dark:text-ink">
                    <ArrowUpTrayIcon className="h-6 w-6" strokeWidth={1.5} />
                  </span>
                  <span className="display-heading text-2xl">
                    {isDragging ? t("stage.dropActive") : t("stage.dropTitle")}
                  </span>
                  <span className="body-muted max-w-xs text-sm">
                    {t("stage.dropHint")}
                  </span>
                  <span className="btn-secondary px-5 py-2 text-xs">
                    {t("stage.browse")}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleUpload(file);
                    }}
                  />
                </label>
              ) : generating ? (
                <>
                  <Image
                    src={stageBaseImage}
                    alt={t("uploadedAlt")}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 90vw, 560px"
                  />
                  {/* A painterly wash sweeping over the photo */}
                  <div className="paint-sweep absolute inset-0">
                    <Image
                      src={stageBaseImage}
                      alt=""
                      aria-hidden="true"
                      fill
                      className="painting-look object-cover"
                      sizes="(max-width: 1024px) 90vw, 560px"
                    />
                    <div className="canvas-texture" />
                  </div>
                  <div className="shimmer-band" />
                  {SPARKLES.map((sparkle, index) => (
                    <span
                      key={index}
                      aria-hidden="true"
                      className="sparkle"
                      style={
                        {
                          left: sparkle.left,
                          top: sparkle.top,
                          "--sparkle-delay": sparkle.delay,
                          "--sparkle-duration": sparkle.duration,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                  <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent px-6 pb-6 pt-16 text-center">
                    <p className="font-display text-2xl italic text-white">
                      {t("painting.title", { petName: trimmedName })}
                    </p>
                    <p
                      key={statusIndex}
                      aria-live="polite"
                      className="animate-fade-up mt-2 text-sm text-white/75 opacity-0"
                    >
                      {t(`painting.lines.${PAINTING_LINE_KEYS[statusIndex]}`)}…
                    </p>
                    <div className="progress-glide mx-auto mt-4 max-w-[220px]" />
                    <p className="mt-3 text-[0.65rem] uppercase tracking-[0.2em] text-white/45">
                      {t("painting.patience")}
                    </p>
                  </div>
                </>
              ) : selectedPreview ? (
                <>
                  <BeforeAfterSlider
                    beforeSrc={sourcePhotoUrl}
                    afterSrc={selectedPreview.url}
                    alt={t("previewAlt")}
                    beforeLabel={t("compare.before")}
                    afterLabel={t("compare.after")}
                    ariaLabel={t("compare.aria")}
                    sizes="(max-width: 1024px) 90vw, 560px"
                  />
                  {/* One-shot varnish shine when a fresh preview lands */}
                  <div key={selectedPreview.id} className="varnish-sweep" />
                </>
              ) : (
                <>
                  <Image
                    src={sourcePhotoUrl}
                    alt={t("uploadedAlt")}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 90vw, 560px"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent px-6 pb-5 pt-14 text-center">
                    <p className="text-sm text-white/85">
                      {t("stage.readyHint")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink/55 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm transition hover:bg-ink/75"
                  >
                    <ArrowPathIcon className="h-3.5 w-3.5" />
                    {t("replacePhoto")}
                  </button>
                </>
              )}

              {uploading ? (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-canvas/85 backdrop-blur-sm dark:bg-canvas-dark/85">
                  <p className="font-display text-xl italic text-ink dark:text-canvas">
                    {t("stage.uploading")}
                  </p>
                  <div className="progress-glide max-w-[200px]" />
                </div>
              ) : null}
            </div>
          </OrnateFrame>

          {/* Live-engraved plaque */}
          <div className="absolute inset-x-0 -bottom-5 z-20 flex justify-center">
            <span className="plaque">
              <span className="font-display text-base italic leading-tight">
                {plaqueTitle}
              </span>
              <span className="text-[0.58rem] font-medium uppercase tracking-[0.22em] opacity-80">
                {plaqueSubtitle}
              </span>
            </span>
          </div>
        </div>

        {/* Hidden input reused by the replace-photo button */}
        {sourcePhotoUrl ? (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file);
            }}
          />
        ) : null}

        {uploadError ? (
          <p className="mt-8 text-center text-sm text-rose">{uploadError}</p>
        ) : null}

        {/* Filmstrip of painted versions */}
        {previews.length > 0 ? (
          <div className="mt-8 flex items-center justify-center gap-3 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedPreviewId(undefined)}
              className={clsx(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition",
                !selectedPreviewId
                  ? "border-accent ring-2 ring-accent dark:border-gold dark:ring-gold"
                  : "border-line opacity-70 hover:opacity-100 dark:border-white/10",
              )}
            >
              <Image
                src={sourcePhotoUrl}
                alt={t("compare.before")}
                fill
                className="object-cover"
                sizes="64px"
              />
              <span className="absolute inset-x-0 bottom-0 bg-ink/60 py-0.5 text-center text-[0.5rem] uppercase tracking-wider text-white">
                {t("stage.originalThumb")}
              </span>
            </button>
            {previews.map((preview, index) => (
              <button
                key={preview.id}
                type="button"
                onClick={() => setSelectedPreviewId(preview.id)}
                className={clsx(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition",
                  selectedPreviewId === preview.id
                    ? "border-accent ring-2 ring-accent dark:border-gold dark:ring-gold"
                    : "border-line opacity-70 hover:opacity-100 dark:border-white/10",
                )}
              >
                <Image
                  src={preview.url}
                  alt={`${t("thumbnailAlt")} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        ) : null}

        <p className="mx-auto mt-5 max-w-md text-center text-xs italic leading-relaxed text-ink-faint dark:text-canvas/40">
          {t("disclaimer")}
        </p>

        {sourcePhotoUrl || trimmedName || previews.length > 0 ? (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={startOver}
              className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-ink-muted transition hover:text-rose dark:text-canvas/50 dark:hover:text-rose"
            >
              <ArrowPathIcon className="h-3.5 w-3.5" />
              {t("startOver")}
            </button>
          </div>
        ) : null}
      </div>

      {/* ——— The steps ——— */}
      <div ref={railRef} className="flex scroll-mt-20 flex-col gap-4">
        <StepShell
          index={1}
          title={t("steps.photo")}
          summary={
            photoDone
              ? `${trimmedName} · ${t(`petTypes.${petType}`)}`
              : undefined
          }
          active={activeStep === "photo"}
          done={photoDone}
          onToggle={() => setActiveStep("photo")}
        >
          <div className="space-y-4">
            <p
              className={clsx(
                "flex items-center gap-2 rounded-xl px-4 py-3 text-sm",
                sourcePhotoUrl
                  ? "bg-sage/10 text-sage"
                  : "bg-gold-soft/40 text-ink dark:bg-gold/10 dark:text-canvas",
              )}
            >
              {sourcePhotoUrl ? (
                <CheckIcon className="h-4 w-4 shrink-0" strokeWidth={2.5} />
              ) : (
                <ArrowUpTrayIcon className="h-4 w-4 shrink-0" />
              )}
              {sourcePhotoUrl ? t("photoStatusAdded") : t("photoStatusMissing")}
            </p>
            <label className="block">
              <span className="studio-label">{t("petName")}</span>
              <input
                value={petName}
                onChange={(event) => setPetName(event.target.value)}
                className="studio-input"
                placeholder={t("petNamePlaceholder")}
              />
            </label>
            <div>
              <span className="studio-label">{t("petType")}</span>
              <div className="grid grid-cols-2 gap-2">
                {PET_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPetType(type)}
                    className={clsx(
                      "rounded-full border px-4 py-2.5 text-sm transition",
                      petType === type
                        ? "border-accent bg-accent/10 font-medium text-accent dark:border-gold dark:bg-gold/10 dark:text-gold"
                        : "border-line text-ink-muted hover:border-accent/50 dark:border-white/10 dark:text-canvas/60",
                    )}
                  >
                    {t(`petTypes.${type}`)}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              disabled={!photoDone}
              onClick={() => setActiveStep("style")}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("continue")}
            </button>
          </div>
        </StepShell>

        <StepShell
          index={2}
          title={t("steps.style")}
          summary={`${t(`styles.${stylePreset}`)} · ${t(`backgrounds.${background}`)}`}
          active={activeStep === "style"}
          done={styleDone}
          onToggle={() => setActiveStep("style")}
        >
          <div className="space-y-4">
            <div>
              <span className="studio-label">{t("stylePreset")}</span>
              <div className="grid grid-cols-2 gap-3">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setStylePreset(preset.id)}
                    className={clsx(
                      "group relative overflow-hidden rounded-xl border text-left transition",
                      stylePreset === preset.id
                        ? "border-accent ring-2 ring-accent dark:border-gold dark:ring-gold"
                        : "border-line hover:border-accent/50 dark:border-white/10",
                    )}
                  >
                    <span className="relative block h-16 w-full overflow-hidden">
                      <Image
                        src={STYLE_THUMBS[preset.id]}
                        alt=""
                        aria-hidden="true"
                        fill
                        className="painting-look object-cover transition duration-500 group-hover:scale-105"
                        sizes="180px"
                      />
                    </span>
                    <span className="block px-3 py-2 text-xs font-medium text-ink dark:text-canvas">
                      {t(`styles.${preset.id}`)}
                    </span>
                    {stylePreset === preset.id ? (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-canvas dark:bg-gold dark:text-ink">
                        <CheckIcon className="h-3 w-3" strokeWidth={3} />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="studio-label">{t("background")}</span>
              <div className="flex flex-wrap items-center gap-2.5">
                {BACKGROUND_OPTIONS.map((option) => {
                  const swatch = BACKGROUND_SWATCHES[option];
                  const isActive = background === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      title={t(`backgrounds.${option}`)}
                      aria-label={t(`backgrounds.${option}`)}
                      aria-pressed={isActive}
                      onClick={() => setBackground(option)}
                      className={clsx(
                        "flex h-9 w-9 items-center justify-center rounded-full border transition",
                        isActive
                          ? "ring-2 ring-accent ring-offset-2 ring-offset-canvas dark:ring-gold dark:ring-offset-canvas-dark"
                          : "hover:scale-110",
                        swatch
                          ? "border-line-strong dark:border-white/20"
                          : "border-dashed border-line-strong text-ink-muted dark:border-white/25 dark:text-canvas/60",
                      )}
                      style={swatch ? { backgroundColor: swatch } : undefined}
                    >
                      {!swatch ? <span className="text-sm">✎</span> : null}
                    </button>
                  );
                })}
                <span className="ml-1 text-xs text-ink-muted dark:text-canvas/50">
                  {t(`backgrounds.${background}`)}
                </span>
              </div>
            </div>

            <div>
              <span className="studio-label">{t("framing")}</span>
              <div className="grid grid-cols-3 gap-2">
                {FRAMING_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFraming(option)}
                    className={clsx(
                      "rounded-full border px-2 py-2 text-xs transition",
                      framing === option
                        ? "border-accent bg-accent/10 font-medium text-accent dark:border-gold dark:bg-gold/10 dark:text-gold"
                        : "border-line text-ink-muted hover:border-accent/50 dark:border-white/10 dark:text-canvas/60",
                    )}
                  >
                    {t(`framingOptions.${option}`)}
                  </button>
                ))}
              </div>
            </div>

            <details className="group">
              <summary className="studio-label cursor-pointer list-none marker:content-none">
                {t("artistNotes")}{" "}
                <span className="text-ink-faint dark:text-canvas/40">+</span>
              </summary>
              <textarea
                value={artistNotes}
                onChange={(event) => setArtistNotes(event.target.value)}
                rows={3}
                className="studio-input mt-2"
                placeholder={t("artistNotesPlaceholder")}
              />
            </details>

            <button
              type="button"
              disabled={!canGenerate || generating}
              onClick={() => void generatePreview()}
              className={clsx(
                "btn-shine inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold tracking-wide text-ink transition hover:-translate-y-0.5 hover:bg-gold-soft",
                (!canGenerate || generating) &&
                  "cursor-not-allowed opacity-50 hover:translate-y-0",
              )}
            >
              <SparklesIcon className="h-4 w-4" />
              {generating ? t("generating") : t("generate")}
            </button>
            {remainingQuota !== null ? (
              <p className="text-center text-xs text-ink-faint dark:text-canvas/40">
                {t("quotaLeft", { count: remainingQuota })}
              </p>
            ) : null}
            {generationError ? (
              <p className="text-sm text-rose">{generationError}</p>
            ) : null}
          </div>
        </StepShell>

        <StepShell
          index={3}
          title={t("steps.refine")}
          summary={
            previews.length > 0
              ? t("versionsCount", { count: previews.length })
              : undefined
          }
          active={activeStep === "refine"}
          done={styleDone}
          disabled={previews.length === 0}
          onToggle={() => setActiveStep("refine")}
        >
          <div className="space-y-4">
            <p className="body-muted text-sm">{t("refineHint")}</p>
            <div className="flex flex-wrap gap-2">
              {REVISION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={generating}
                  onClick={() => {
                    setRevisionMessage(chip);
                    void generatePreview(chip);
                  }}
                  className="rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-xs transition hover:border-accent hover:text-accent disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-gold-soft dark:hover:text-gold-soft"
                >
                  {t(`chips.${chip}`)}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              <input
                value={revisionMessage}
                onChange={(event) => setRevisionMessage(event.target.value)}
                placeholder={t("revisionPlaceholder")}
                className="studio-input"
              />
              <button
                type="button"
                disabled={!revisionMessage.trim() || generating}
                onClick={() => void generatePreview()}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generating ? t("generating") : t("revise")}
              </button>
            </div>
            {remainingQuota !== null ? (
              <p className="text-xs text-ink-faint dark:text-canvas/40">
                {t("quotaLeft", { count: remainingQuota })}
              </p>
            ) : null}
            {generationError ? (
              <p className="text-sm text-rose">{generationError}</p>
            ) : null}
            <button
              type="button"
              disabled={!selectedPreview}
              onClick={() => setActiveStep("order")}
              className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("chooseSize")}
            </button>
          </div>
        </StepShell>

        <StepShell
          index={4}
          title={t("steps.order")}
          summary={
            selectedVariant && canAddToCart
              ? `${selectedVariant.title}`
              : undefined
          }
          active={activeStep === "order"}
          done={false}
          disabled={!selectedPreview}
          onToggle={() => setActiveStep("order")}
        >
          <div className="space-y-4">
            <VariantSelector
              options={product.options}
              variants={product.variants}
            />
            {selectedVariant ? (
              <div className="flex items-center justify-between">
                <span className="studio-label mb-0">
                  {selectedVariant.title}
                </span>
                <span className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm text-canvas dark:bg-gold dark:text-ink">
                  <Price
                    amount={selectedVariant.price.amount}
                    currencyCode={selectedVariant.price.currencyCode}
                  />
                </span>
              </div>
            ) : null}
            <form
              action={async () => {
                if (!selectedVariant || !canAddToCart) return;
                addCartItem(selectedVariant, product);
                formAction(portraitPayload);
              }}
            >
              <button
                type="submit"
                disabled={!canAddToCart}
                className={clsx(
                  "btn-primary btn-shine w-full py-4",
                  !canAddToCart && "cursor-not-allowed opacity-50",
                )}
              >
                {t("addToCart")}
              </button>
              <p aria-live="polite" className="mt-3 text-sm text-rose">
                {message}
              </p>
            </form>
          </div>
        </StepShell>
      </div>

      {/* ——— Mobile action bar ——— */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/90 px-4 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] pt-2.5 backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-canvas-dark/90">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            type="button"
            onClick={scrollToEasel}
            aria-label={t("stage.plaqueFallback")}
            className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-line bg-canvas-deep dark:border-white/10 dark:bg-white/5"
          >
            {stageBaseImage ? (
              <Image
                src={stageBaseImage}
                alt=""
                fill
                className="object-cover"
                sizes="44px"
              />
            ) : (
              <ArrowUpTrayIcon className="absolute inset-0 m-auto h-4 w-4 text-ink-faint dark:text-canvas/40" />
            )}
            {generating ? (
              <span className="absolute inset-0 animate-pulse bg-gold-soft/70 mix-blend-overlay" />
            ) : null}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.58rem] font-medium uppercase tracking-[0.18em] text-ink-faint dark:text-canvas/40">
              {t("stepIndicator", {
                index: stepNumbers[activeStep],
                total: 4,
              })}{" "}
              · {t(`steps.${activeStep}`)}
            </p>
            {generating ? (
              <>
                <p
                  key={statusIndex}
                  className="animate-fade-up truncate text-xs text-ink-muted opacity-0 dark:text-canvas/60"
                >
                  {t(`painting.lines.${PAINTING_LINE_KEYS[statusIndex]}`)}…
                </p>
                <div className="progress-glide mt-1" />
              </>
            ) : (
              <p className="truncate text-xs text-ink-muted dark:text-canvas/60">
                {barHint}
              </p>
            )}
          </div>
          {activeStep === "order" ? (
            <form
              action={async () => {
                if (!selectedVariant || !canAddToCart) return;
                addCartItem(selectedVariant, product);
                formAction(portraitPayload);
              }}
            >
              <button
                type="submit"
                disabled={!canAddToCart}
                className="btn-primary shrink-0 px-4 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("addToCart")}
              </button>
            </form>
          ) : (
            <button
              type="button"
              disabled={barAction.disabled}
              onClick={barAction.onClick}
              className="btn-primary shrink-0 px-4 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              {barAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
