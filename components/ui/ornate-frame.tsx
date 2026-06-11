import clsx from "clsx";
import { ReactNode } from "react";

const frameVariants = {
  gilt: "frame-gilt",
  walnut: "frame-walnut",
  noir: "frame-noir",
} as const;

export type FrameVariant = keyof typeof frameVariants;

export function OrnateFrame({
  children,
  variant = "gilt",
  mat = true,
  className,
}: {
  children: ReactNode;
  variant?: FrameVariant;
  mat?: boolean;
  className?: string;
}) {
  const art = <div className="frame-art">{children}</div>;

  return (
    <div className={clsx("frame", frameVariants[variant], className)}>
      {mat ? <div className="frame-mat">{art}</div> : art}
    </div>
  );
}
