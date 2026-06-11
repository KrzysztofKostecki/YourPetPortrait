"use client";

import clsx from "clsx";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

const MIN = 6;
const MAX = 94;

function clamp(value: number) {
  return Math.min(MAX, Math.max(MIN, value));
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  alt,
  beforeLabel,
  afterLabel,
  ariaLabel,
  sizes,
  priority = false,
  stylize = false,
}: {
  beforeSrc: string;
  afterSrc: string;
  alt: string;
  beforeLabel: string;
  afterLabel: string;
  ariaLabel: string;
  sizes?: string;
  priority?: boolean;
  /** Apply painterly filters and canvas texture — for showing one photo as photo vs. simulated painting. */
  stylize?: boolean;
}) {
  const [position, setPosition] = useState(58);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const node = containerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setPosition(clamp(((clientX - rect.left) / rect.width) * 100));
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      draggingRef.current = true;
      setHasInteracted(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      setFromClientX(event.clientX);
    },
    [setFromClientX],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      setFromClientX(event.clientX);
    },
    [setFromClientX],
  );

  const stopDragging = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 4;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setHasInteracted(true);
      setPosition((value) => clamp(value - step));
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setHasInteracted(true);
      setPosition((value) => clamp(value + step));
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full touch-none select-none cursor-ew-resize"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      {/* After: the painting */}
      <div className="absolute inset-0">
        <Image
          src={afterSrc}
          alt={alt}
          fill
          priority={priority}
          className={clsx("object-cover", stylize && "painting-look")}
          sizes={sizes}
          draggable={false}
        />
        {stylize ? (
          <>
            <div className="canvas-texture" />
            <div className="painting-vignette" />
          </>
        ) : null}
        <span className="absolute bottom-4 right-4 z-20 rounded-full bg-ink/55 px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">
          {afterLabel}
        </span>
      </div>

      {/* Before: the photo, clipped to the left of the handle */}
      <div
        className="absolute inset-0 z-10"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={beforeSrc}
          alt=""
          aria-hidden="true"
          fill
          priority={priority}
          className={clsx("object-cover", stylize && "photo-look")}
          sizes={sizes}
          draggable={false}
        />
        <span className="absolute bottom-4 left-4 rounded-full bg-ink/55 px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">
          {beforeLabel}
        </span>
      </div>

      {/* Divider + handle */}
      <div
        className="absolute inset-y-0 z-20 w-px -translate-x-1/2 bg-white/85 shadow-[0_0_12px_rgba(0,0,0,0.45)]"
        style={{ left: `${position}%` }}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label={ariaLabel}
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={Math.round(position)}
          onKeyDown={onKeyDown}
          className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[#3a2a10] shadow-[0_4px_16px_rgba(0,0,0,0.45)] outline-none ring-offset-0 focus-visible:ring-2 focus-visible:ring-white"
          style={{
            background:
              "linear-gradient(135deg, #f0d99a 0%, #c39a4e 55%, #e3c277 100%)",
          }}
        >
          {!hasInteracted && (
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-gold-soft"
              style={{
                animation: "handle-pulse 1.8s ease-out infinite",
              }}
            />
          )}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="relative h-5 w-5"
          >
            <path d="M9 6L4 12l5 6" />
            <path d="M15 6l5 6-5 6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
