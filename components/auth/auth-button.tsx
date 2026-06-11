"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Link } from "i18n/navigation";
import { useTranslations } from "next-intl";

export function AuthButton() {
  const t = useTranslations("Nav");
  const tAuth = useTranslations("Auth");
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="text-sm text-ink-faint dark:text-canvas/50">···</span>
    );
  }

  if (!session?.user) {
    return (
      <Link href="/sign-in" className="btn-ghost hidden sm:inline-flex">
        {t("signIn")}
      </Link>
    );
  }

  return (
    <div className="hidden items-center gap-3 sm:flex">
      <span className="max-w-[140px] truncate text-xs text-ink-muted dark:text-canvas/60">
        {session.user.email}
      </span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="btn-ghost text-xs"
      >
        {t("signOut")}
      </button>
    </div>
  );
}

export function SignInPrompt({ message }: { message?: string }) {
  const t = useTranslations("Auth");

  return (
    <div className="surface-panel px-6 py-8 text-center md:px-10">
      <p className="eyebrow mb-3">{t("studioAccess")}</p>
      <p className="body-muted mb-6 text-sm">{message ?? t("signInPreview")}</p>
      <button
        type="button"
        onClick={() => signIn("google")}
        className="btn-primary"
      >
        {t("signInGoogle")}
      </button>
    </div>
  );
}
