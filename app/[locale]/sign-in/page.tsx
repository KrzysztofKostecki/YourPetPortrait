import { signIn } from "auth";
import Footer from "components/layout/footer";
import { CUSTOM_PORTRAIT_HANDLE } from "lib/constants";
import { showcaseImages } from "lib/images";
import { getLocalizedPath } from "lib/i18n/locale-path";
import { SITE_NAME } from "lib/site";
import type { Locale } from "i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("signInTitle"),
    description: t("signInDescription", { siteName: SITE_NAME }),
  };
}

export default async function SignInPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("SignIn");
  const redirectTo = getLocalizedPath(
    `/product/${CUSTOM_PORTRAIT_HANDLE}`,
    locale as Locale,
  );

  return (
    <>
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl lg:grid-cols-2">
        <div className="relative hidden overflow-hidden lg:block">
          <Image
            src={showcaseImages.signIn}
            alt={t("heroAlt")}
            fill
            className="object-cover"
            sizes="50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/20 to-ink/60" />
          <div className="absolute inset-x-0 bottom-0 p-12">
            <p className="eyebrow mb-3 text-gold-soft">{t("welcomeBack")}</p>
            <p className="font-display text-4xl leading-tight text-white">
              {t("heroTitle")}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center px-4 py-16 lg:px-16">
          <p className="eyebrow mb-4">{t("account")}</p>
          <h1 className="display-heading mb-4 text-4xl md:text-5xl">
            {t("title")}
          </h1>
          <p className="body-muted mb-10 max-w-md">{t("description")}</p>
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo });
            }}
          >
            <button type="submit" className="btn-primary w-full max-w-md">
              {t("continueGoogle")}
            </button>
          </form>
          <p className="body-muted mt-8 max-w-md text-xs">{t("privacy")}</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
