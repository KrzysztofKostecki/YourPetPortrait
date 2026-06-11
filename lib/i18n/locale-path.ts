import { routing, type Locale } from "i18n/routing";

export function getLocalizedPath(path: string, locale: Locale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (locale === routing.defaultLocale) {
    return normalized;
  }

  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}
