import { OrnateFrame, type FrameVariant } from "components/ui/ornate-frame";
import { Reveal } from "components/ui/reveal";
import { Link } from "i18n/navigation";
import Image from "next/image";
import { showcaseImages } from "lib/images";
import { getTranslations } from "next-intl/server";

const frameVariants: FrameVariant[] = ["gilt", "walnut", "noir", "gilt"];

export async function HomeGallery() {
  const t = await getTranslations("Home.gallery");

  return (
    <section className="museum-wall relative overflow-hidden px-4 py-24 md:py-28 lg:px-8">
      {/* Vignette so the wall recedes at the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_90%_at_50%_50%,transparent_55%,rgba(0,0,0,0.45)_100%)]"
      />

      <div className="relative mx-auto max-w-7xl">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center md:mb-20">
          <p className="eyebrow mb-4 text-gold-soft">{t("eyebrow")}</p>
          <h2 className="display-heading text-4xl text-canvas md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 leading-relaxed text-canvas/60">
            {t("description")}
          </p>
        </Reveal>

        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {showcaseImages.gallery.map((item, index) => (
            <Reveal
              key={item.key}
              delay={index * 130}
              className={index % 2 === 1 ? "lg:mt-12" : ""}
            >
              <figure className="group">
                <div className="picture-light relative">
                  <OrnateFrame
                    variant={frameVariants[index] ?? "gilt"}
                    className="relative z-10 transition-transform duration-500 ease-out group-hover:-translate-y-2"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <Image
                        src={item.src}
                        alt={t(`items.${item.key}.label`)}
                        fill
                        className="painting-look object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 280px"
                      />
                      <div className="canvas-texture" />
                      <div className="painting-vignette" />
                    </div>
                  </OrnateFrame>
                </div>
                <figcaption className="mt-7 flex justify-center">
                  <span className="plaque">
                    <span className="font-display text-base italic leading-tight">
                      {t(`items.${item.key}.label`)}
                    </span>
                    <span className="text-[0.55rem] font-medium uppercase tracking-[0.2em] opacity-80">
                      {t(`items.${item.key}.style`)}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 text-center">
          <Link
            href="/search/dog-portraits"
            className="nav-link inline-flex items-center gap-2 text-sm font-medium tracking-wide text-gold-soft"
          >
            {t("viewAll")}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
