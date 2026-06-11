import { Link } from "i18n/navigation";

import FooterMenu from "components/layout/footer-menu";
import LogoSquare from "components/logo-square";
import { CUSTOM_PORTRAIT_HANDLE } from "lib/constants";
import { COMPANY_NAME, SITE_NAME } from "lib/site";
import { getMenu } from "lib/shopify";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export default async function Footer() {
  const t = await getTranslations("Footer");
  const currentYear = new Date().getFullYear();
  const menu = await getMenu("next-js-frontend-footer-menu");
  const copyrightName = COMPANY_NAME || SITE_NAME;

  return (
    <footer className="border-t border-line bg-canvas-deep/40 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 pt-16 lg:px-8">
        <p className="display-heading mx-auto max-w-3xl text-balance text-center text-3xl italic md:text-4xl">
          {t("tagline")}
        </p>
        <div className="divider-ornament mx-auto mt-10 max-w-xs">
          <span aria-hidden="true" className="text-gold">
            ✦
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <Link className="mb-5 flex items-center gap-3" href="/">
            <LogoSquare size="sm" />
            <span className="font-display text-xl text-ink dark:text-canvas">
              {SITE_NAME}
            </span>
          </Link>
          <p className="body-muted max-w-sm text-sm">{t("description")}</p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-4 w-24 animate-pulse rounded bg-line dark:bg-white/10"
                />
              ))}
            </div>
          }
        >
          <FooterMenu menu={menu} />
        </Suspense>

        <div>
          <p className="eyebrow mb-4">{t("studio")}</p>
          <ul className="space-y-3 text-sm text-ink-muted dark:text-canvas/70">
            <li>
              <Link
                href={`/product/${CUSTOM_PORTRAIT_HANDLE}`}
                className="hover:text-accent"
              >
                {t("createPortrait")}
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-accent">
                {t("browseGallery")}
              </Link>
            </li>
            <li>
              <Link href="/sign-in" className="hover:text-accent">
                {t("signInLink")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-ink-faint md:flex-row md:items-center md:justify-between lg:px-8 dark:text-canvas/50">
          <p>
            &copy; {currentYear} {copyrightName}. {t("rights")}
          </p>
          <p className="divider-ornament max-w-md text-center text-xs">
            {t("madeFor")}
          </p>
        </div>
      </div>
    </footer>
  );
}
