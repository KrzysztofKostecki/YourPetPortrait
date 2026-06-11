import clsx from "clsx";
import LogoIcon from "./icons/logo";

export default function LogoSquare({ size }: { size?: "sm" | undefined }) {
  return (
    <div
      className={clsx(
        "flex flex-none items-center justify-center rounded-2xl border border-line bg-white/80 text-accent shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/10 dark:text-gold-soft",
        {
          "h-11 w-11": !size,
          "h-8 w-8 rounded-xl": size === "sm",
        },
      )}
    >
      <LogoIcon
        className={clsx({
          "h-6 w-6": !size,
          "h-4 w-4": size === "sm",
        })}
      />
    </div>
  );
}
