import { OrnateFrame } from "components/ui/ornate-frame";
import { Reveal } from "components/ui/reveal";
import { Link } from "i18n/navigation";
import Image from "next/image";
import { CUSTOM_PORTRAIT_HANDLE } from "lib/constants";
import { showcaseImages } from "lib/images";
import { getTranslations } from "next-intl/server";

export async function HomeCta() {
  const t = await getTranslations("Home.cta");

  return (
    <section className="relative overflow-hidden px-4 py-24 lg:px-8">
      <Reveal className="mx-auto max-w-7xl">
        <div className="museum-wall relative overflow-hidden rounded-[2.5rem] px-8 py-16 md:px-16 md:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,162,39,0.25),transparent_55%)]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="eyebrow mb-4 text-gold-soft">{t("eyebrow")}</p>
              <h2 className="display-heading max-w-2xl text-4xl text-canvas md:text-5xl lg:text-6xl">
                {t("title")}
              </h2>
              <p className="mt-5 max-w-xl leading-relaxed text-canvas/70">
                {t("description")}
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={`/product/${CUSTOM_PORTRAIT_HANDLE}`}
                  className="btn-shine inline-flex items-center justify-center rounded-full bg-gold px-8 py-4 text-sm font-semibold tracking-wide text-ink transition hover:-translate-y-0.5 hover:bg-gold-soft"
                >
                  {t("primary")}
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-8 py-4 text-sm font-medium text-canvas transition hover:bg-white/10"
                >
                  {t("secondary")}
                </Link>
              </div>
              <p className="mt-6 text-xs italic text-canvas/45">{t("note")}</p>
            </div>

            <div className="group relative mx-auto hidden w-full max-w-xs lg:block">
              <div className="picture-light relative">
                <OrnateFrame
                  variant="gilt"
                  className="rotate-2 transition-transform duration-500 group-hover:rotate-1"
                >
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={showcaseImages.cta}
                      alt={t("frameAlt")}
                      fill
                      className="painting-look object-cover"
                      sizes="320px"
                    />
                    <div className="canvas-texture" />
                    <div className="painting-vignette" />
                  </div>
                </OrnateFrame>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
