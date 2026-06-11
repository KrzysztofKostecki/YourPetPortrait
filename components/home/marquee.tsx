import { getTranslations } from "next-intl/server";

const itemKeys = ["oil", "handPainted", "preview", "heirloom", "love"] as const;

export async function HomeMarquee() {
  const t = await getTranslations("Home.marquee");
  const items = itemKeys.map((key) => t(`items.${key}`));

  return (
    <section className="marquee overflow-hidden border-y border-line bg-canvas-deep/50 py-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="marquee-track flex w-max items-center">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center"
          >
            {items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-10 px-5 font-display text-xl italic text-ink/70 sm:text-2xl dark:text-canvas/60"
              >
                <span
                  aria-hidden="true"
                  className="text-sm not-italic text-gold"
                >
                  ✦
                </span>
                {item}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
