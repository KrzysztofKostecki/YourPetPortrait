import { BeforeAfterSlider } from "components/ui/before-after";
import { OrnateFrame } from "components/ui/ornate-frame";
import { Link } from "i18n/navigation";
import Image from "next/image";
import { CUSTOM_PORTRAIT_HANDLE } from "lib/constants";
import { showcaseImages } from "lib/images";
import { getTranslations } from "next-intl/server";

export async function HomeHero() {
  const t = await getTranslations("Home.hero");

  const stats = [
    {
      label: t("stats.handPaintedLabel"),
      value: t("stats.handPaintedValue"),
    },
    {
      label: t("stats.previewLabel"),
      value: t("stats.previewValue"),
    },
    {
      label: t("stats.qualityLabel"),
      value: t("stats.qualityValue"),
    },
  ];

  return (
    <section className="relative overflow-hidden px-4 pb-14 pt-8 md:pb-16 md:pt-10 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 top-16 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
        <div className="max-w-2xl">
          <p className="animate-fade-up mb-4 flex items-center gap-4 opacity-0">
            <span className="h-px w-10 bg-accent/60 dark:bg-gold/60" />
            <span className="eyebrow">{t("eyebrow")}</span>
          </p>
          <h1 className="display-heading animate-fade-up animation-delay-100 mb-5 text-balance text-4xl leading-[1.04] opacity-0 sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
            {t.rich("title", {
              emphasis: (chunks) => (
                <em className="text-accent dark:text-gold">{chunks}</em>
              ),
            })}
          </h1>
          <p className="body-muted animate-fade-up animation-delay-200 mb-8 max-w-xl text-lg opacity-0">
            {t("description")}
          </p>
          <div className="animate-fade-up animation-delay-300 flex flex-wrap gap-4 opacity-0">
            <Link
              href={`/product/${CUSTOM_PORTRAIT_HANDLE}`}
              className="btn-primary btn-shine"
            >
              {t("ctaPrimary")}
            </Link>
            <Link href="/search" className="btn-secondary">
              {t("ctaSecondary")}
            </Link>
          </div>
          <dl className="animate-fade-up animation-delay-400 mt-8 grid grid-cols-3 gap-6 border-t border-line pt-6 opacity-0 dark:border-white/10">
            {stats.map((item) => (
              <div key={item.label}>
                <dt className="eyebrow mb-1 text-[0.62rem]">{item.label}</dt>
                <dd className="font-display text-lg font-medium italic text-ink dark:text-canvas">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-[26rem] xl:max-w-[29rem]">
          {/* Soft spotlight behind the frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-16 -top-20 bottom-0 bg-[radial-gradient(55%_45%_at_55%_28%,rgba(244,208,122,0.22),transparent_70%)]"
          />

          <div className="animate-fade-in animation-delay-200 relative opacity-0">
            <div className="relative">
              <OrnateFrame variant="gilt" className="relative z-10">
                <div className="relative aspect-[4/5]">
                  <BeforeAfterSlider
                    beforeSrc={showcaseImages.heroSlider}
                    afterSrc={showcaseImages.heroSlider}
                    alt={t("altPrimary")}
                    beforeLabel={t("slider.before")}
                    afterLabel={t("slider.after")}
                    ariaLabel={t("slider.aria")}
                    sizes="(max-width: 1024px) 90vw, 460px"
                    priority
                    stylize
                  />
                </div>
              </OrnateFrame>

              {/* Museum plaque overlapping the bottom rail of the frame */}
              <div className="absolute inset-x-0 -bottom-5 z-20 flex justify-center">
                <span className="plaque">
                  <span className="font-display text-base italic leading-tight">
                    {t("plaque.title")}
                  </span>
                  <span className="text-[0.58rem] font-medium uppercase tracking-[0.22em] opacity-80">
                    {t("plaque.subtitle")}
                  </span>
                </span>
              </div>
            </div>

            <p className="mt-9 text-center text-xs italic text-ink-faint dark:text-canvas/50">
              {t("slider.hint")}
            </p>

            {/* Companion frame hung behind, off the edge */}
            <div className="absolute -left-16 top-1/4 hidden w-40 -rotate-3 xl:block">
              <OrnateFrame variant="walnut" mat={false}>
                <div className="relative aspect-[3/4]">
                  <Image
                    src={showcaseImages.heroCompanion}
                    alt={t("altSecondary")}
                    fill
                    className="painting-look object-cover"
                    sizes="160px"
                  />
                  <div className="canvas-texture" />
                </div>
              </OrnateFrame>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
