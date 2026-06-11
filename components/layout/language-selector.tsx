"use client";

import clsx from "clsx";
import { locales, type Locale } from "i18n/routing";
import { usePathname, useRouter } from "i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  pl: "PL",
};

export function LanguageSelector() {
  const t = useTranslations("Nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 rounded-full border border-line bg-white/60 p-1 dark:border-white/10 dark:bg-white/5">
      <span className="sr-only">{t("language")}</span>
      {locales.map((nextLocale) => (
        <button
          key={nextLocale}
          type="button"
          aria-current={locale === nextLocale ? "true" : undefined}
          aria-label={nextLocale === "en" ? t("english") : t("polish")}
          onClick={() => router.replace(pathname, { locale: nextLocale })}
          className={clsx(
            "rounded-full px-2.5 py-1 text-[0.7rem] font-semibold tracking-[0.12em] transition",
            locale === nextLocale
              ? "bg-ink text-canvas dark:bg-gold dark:text-ink"
              : "text-ink-muted hover:text-accent dark:text-canvas/60 dark:hover:text-gold-soft",
          )}
        >
          {localeLabels[nextLocale]}
        </button>
      ))}
    </div>
  );
}
