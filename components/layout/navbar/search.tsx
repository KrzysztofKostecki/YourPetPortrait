"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Form from "next/form";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

export default function Search() {
  const t = useTranslations("Nav");
  const searchParams = useSearchParams();

  return (
    <Form action="/search" className="relative w-full max-w-sm">
      <input
        key={searchParams?.get("q")}
        type="text"
        name="q"
        placeholder={t("searchPlaceholder")}
        autoComplete="off"
        defaultValue={searchParams?.get("q") || ""}
        className="w-full rounded-full border border-line bg-white/70 py-2.5 pl-4 pr-10 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:bg-white focus:text-ink dark:border-white/10 dark:bg-white/5 dark:text-canvas dark:placeholder:text-canvas/40 dark:focus:border-gold-soft dark:focus:bg-white/10 dark:focus:text-canvas"
      />
      <div className="pointer-events-none absolute right-0 top-0 mr-3 flex h-full items-center text-ink-muted dark:text-canvas/50">
        <MagnifyingGlassIcon className="h-4 w-4" />
      </div>
    </Form>
  );
}

export function SearchSkeleton() {
  const t = useTranslations("Nav");

  return (
    <form className="relative w-full max-w-sm">
      <input
        placeholder={t("searchPlaceholder")}
        className="w-full rounded-full border border-line bg-white/70 py-2.5 pl-4 pr-10 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:bg-white focus:text-ink dark:border-white/10 dark:bg-white/5 dark:text-canvas dark:placeholder:text-canvas/40 dark:focus:border-gold-soft dark:focus:bg-white/10 dark:focus:text-canvas"
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
        <MagnifyingGlassIcon className="h-4 w-4" />
      </div>
    </form>
  );
}
