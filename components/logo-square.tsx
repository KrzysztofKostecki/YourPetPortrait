import clsx from "clsx";
import LogoIcon from "./icons/logo";

export default function LogoSquare({ size }: { size?: "sm" | undefined }) {
  const isSmall = size === "sm";

  return (
    <span
      className={clsx(
        "inline-flex flex-none items-center justify-center overflow-hidden rounded-lg bg-canvas/95 dark:bg-gold-soft/90",
        isSmall ? "size-[2.25rem]" : "size-[3.15rem]",
      )}
    >
      <LogoIcon
        className={clsx(
          "origin-center text-ink",
          isSmall
            ? "h-full w-full translate-y-1.5 scale-[1.35]"
            : "h-full w-full translate-y-2 scale-[1.4]",
        )}
        aria-hidden="true"
      />
    </span>
  );
}
