import CartModal from "components/cart/modal";
import { AuthButton } from "components/auth/auth-button";
import { LanguageSelector } from "components/layout/language-selector";
import LogoSquare from "components/logo-square";
import { CUSTOM_PORTRAIT_HANDLE } from "lib/constants";
import { SITE_NAME } from "lib/site";
import { getMenu } from "lib/shopify";
import { Menu } from "lib/shopify/types";
import { Link } from "i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";

export async function Navbar() {
  const t = await getTranslations("Nav");
  const menu = await getMenu("next-js-frontend-header-menu");
  const navItems: Menu[] = menu.length
    ? menu
    : [
        {
          title: t("createPortrait"),
          path: `/product/${CUSTOM_PORTRAIT_HANDLE}`,
        },
        { title: t("gallery"), path: "/search" },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/80 backdrop-blur-xl dark:border-white/10 dark:bg-canvas-dark/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div className="flex items-center gap-3 md:gap-8">
          <div className="md:hidden">
            <Suspense fallback={null}>
              <MobileMenu menu={navItems} />
            </Suspense>
          </div>
          <Link
            href="/"
            prefetch={true}
            className="group flex items-center gap-3"
          >
            <LogoSquare />
            <div className="hidden sm:block">
              <span className="block font-display text-xl leading-none tracking-wide text-ink dark:text-canvas">
                {SITE_NAME}
              </span>
              <span className="mt-0.5 block text-[0.65rem] uppercase tracking-[0.24em] text-ink-faint dark:text-canvas/50">
                {t("tagline")}
              </span>
            </div>
          </Link>
          <ul className="hidden items-center gap-8 md:flex">
            {navItems.map((item: Menu) => (
              <li key={item.title}>
                <Link
                  href={item.path}
                  prefetch={true}
                  className="nav-link text-sm text-ink-muted hover:text-accent dark:text-canvas/70 dark:hover:text-gold-soft"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSelector />
          <AuthButton />
          <Link
            href={`/product/${CUSTOM_PORTRAIT_HANDLE}`}
            className="btn-shine hidden rounded-full bg-ink px-4 py-2 text-xs font-medium tracking-wide text-canvas transition hover:bg-accent-dark sm:inline-flex dark:bg-gold dark:text-ink dark:hover:bg-gold-soft"
          >
            {t("startPortrait")}
          </Link>
          <CartModal />
        </div>
      </nav>
    </header>
  );
}
