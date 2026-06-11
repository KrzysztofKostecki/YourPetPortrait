import { CartProvider } from "components/cart/cart-context";
import { AuthProvider } from "components/auth/session-provider";
import { Navbar } from "components/layout/navbar";
import { cormorant, dmSans } from "lib/fonts";
import { getCart } from "lib/shopify";
import { SITE_NAME } from "lib/site";
import { baseUrl } from "lib/utils";
import { routing, type Locale } from "i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const cart = getCart();

  return (
    <html lang={locale} className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="min-h-screen selection:bg-gold-soft selection:text-ink">
        <div aria-hidden="true" className="grain-overlay" />
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <CartProvider cartPromise={cart}>
              <Navbar />
              <main>{children}</main>
              <Toaster
                closeButton
                toastOptions={{
                  classNames: {
                    toast:
                      "surface-card !border-line !bg-white/95 !text-ink dark:!bg-canvas-dark dark:!text-canvas",
                  },
                }}
              />
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
