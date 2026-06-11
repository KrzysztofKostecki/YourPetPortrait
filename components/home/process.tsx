import {
  CameraIcon,
  PaintBrushIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Reveal } from "components/ui/reveal";
import { getTranslations } from "next-intl/server";

const steps = [
  { key: "1", Icon: CameraIcon },
  { key: "2", Icon: SparklesIcon },
  { key: "3", Icon: PaintBrushIcon },
] as const;

export async function HomeProcess() {
  const t = await getTranslations("Home.process");

  return (
    <section className="px-4 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-16 max-w-2xl">
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h2 className="display-heading text-4xl md:text-5xl">
            {t.rich("title", {
              emphasis: (chunks) => (
                <em className="text-accent dark:text-gold">{chunks}</em>
              ),
            })}
          </h2>
        </Reveal>

        <ol className="relative grid gap-12 md:grid-cols-3 md:gap-8">
          {/* Connecting thread between the steps */}
          <div
            aria-hidden="true"
            className="absolute left-[16.6%] right-[16.6%] top-7 hidden border-t border-dashed border-line-strong md:block dark:border-white/15"
          />

          {steps.map(({ key, Icon }, index) => (
            <li key={key} className="group relative">
              <Reveal delay={index * 140}>
                <div className="relative mb-7 flex items-end gap-4">
                  <span className="relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-full border border-line-strong bg-canvas text-accent transition duration-500 group-hover:border-accent group-hover:shadow-soft dark:border-white/15 dark:bg-canvas-dark dark:text-gold dark:group-hover:border-gold">
                    <Icon className="h-6 w-6" strokeWidth={1.4} />
                  </span>
                  <span className="font-display text-6xl font-medium italic leading-none text-accent/25 transition duration-500 group-hover:text-accent/45 dark:text-gold/20 dark:group-hover:text-gold/40">
                    0{key}
                  </span>
                </div>
                <h3 className="display-heading mb-3 text-2xl">
                  {t(`steps.${key}.title`)}
                </h3>
                <p className="body-muted max-w-sm text-sm">
                  {t(`steps.${key}.copy`)}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
