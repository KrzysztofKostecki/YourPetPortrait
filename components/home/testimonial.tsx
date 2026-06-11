import { Reveal } from "components/ui/reveal";
import Image from "next/image";
import { showcaseImages } from "lib/images";
import { getTranslations } from "next-intl/server";

const testimonialKeys = ["t1", "t2", "t3"] as const;

function Stars() {
  return (
    <div aria-hidden="true" className="flex gap-1 text-gold">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path d="M10 1.5l2.47 5.36 5.86.64-4.36 3.96 1.18 5.78L10 14.3l-5.15 2.94 1.18-5.78L1.67 7.5l5.86-.64L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export async function HomeTestimonial() {
  const t = await getTranslations("Home.testimonials");

  return (
    <section className="px-4 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h2 className="display-heading text-4xl md:text-5xl">{t("title")}</h2>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-3">
          {testimonialKeys.map((key, index) => (
            <Reveal
              key={key}
              delay={index * 130}
              className={index === 1 ? "lg:-translate-y-4" : ""}
            >
              <figure className="surface-card relative flex h-full flex-col p-8 transition duration-500 hover:-translate-y-1 hover:shadow-soft">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute right-6 top-4 font-display text-7xl leading-none text-accent/10 dark:text-gold/10"
                >
                  &rdquo;
                </div>
                <Stars />
                <blockquote className="mt-5 flex-1">
                  <p className="font-display text-xl italic leading-snug text-ink dark:text-canvas">
                    {t(`items.${key}.quote`)}
                  </p>
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-4 border-t border-line pt-6 dark:border-white/10">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-gold-soft">
                    <Image
                      src={showcaseImages.testimonials[index] ?? ""}
                      alt=""
                      aria-hidden="true"
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-ink dark:text-canvas">
                      {t(`items.${key}.author`)}
                    </span>
                    <span className="body-muted block text-xs">
                      {t(`items.${key}.detail`)}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
