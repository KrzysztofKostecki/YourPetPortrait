import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export default function OpenCart({
  className,
  quantity,
}: {
  className?: string;
  quantity?: number;
}) {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/70 text-ink transition hover:border-accent dark:border-white/10 dark:bg-white/5 dark:text-canvas dark:hover:border-gold-soft">
      <ShoppingCartIcon
        className={clsx(
          "h-4 transition-all ease-in-out hover:scale-110",
          className,
        )}
      />

      {quantity ? (
        <div className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-canvas dark:bg-gold dark:text-ink">
          {quantity}
        </div>
      ) : null}
    </div>
  );
}
