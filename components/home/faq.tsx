import { Reveal } from "components/ui/reveal";
import { getTranslations } from "next-intl/server";

const faqKeys = ["preview", "photo", "revise", "afterOrder"] as const;

export async function HomeFaq() {
  const t = await getTranslations("Home.faq");

  return (
    <section className="border-t border-line px-4 py-24 dark:border-white/10 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h2 className="display-heading text-4xl md:text-5xl">{t("title")}</h2>
          <p className="body-muted mt-4 max-w-md">{t("description")}</p>
        </Reveal>

        <div className="space-y-4">
          {faqKeys.map((key, index) => (
            <Reveal key={key} delay={index * 100}>
              <details className="group surface-card overflow-hidden transition open:shadow-soft">
                <summary className="flex cursor-pointer list-none items-center gap-5 px-6 py-5 marker:content-none">
                  <span className="font-display text-lg italic text-accent/60 dark:text-gold/60">
                    0{index + 1}
                  </span>
                  <span className="flex-1 font-display text-xl font-medium text-ink dark:text-canvas">
                    {t(`items.${key}.q`)}
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-accent transition duration-300 group-open:rotate-45 dark:border-white/10 dark:text-gold">
                    +
                  </span>
                </summary>
                <div className="border-t border-line px-6 pb-5 pt-4 dark:border-white/10">
                  <p className="body-muted text-sm leading-relaxed">
                    {t(`items.${key}.a`)}
                  </p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
