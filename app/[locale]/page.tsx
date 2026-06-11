import Footer from "components/layout/footer";
import { HomeCta } from "components/home/cta";
import { HomeFaq } from "components/home/faq";
import { HomeGallery } from "components/home/gallery";
import { HomeHero } from "components/home/hero";
import { HomeMarquee } from "components/home/marquee";
import { HomeProcess } from "components/home/process";
import { HomeTestimonial } from "components/home/testimonial";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    description: t("homeDescription"),
    openGraph: {
      type: "website",
    },
  };
}

export default async function HomePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <HomeHero />
      <HomeMarquee />
      <HomeProcess />
      <HomeGallery />
      <HomeTestimonial />
      <HomeFaq />
      <HomeCta />
      <Footer />
    </>
  );
}
