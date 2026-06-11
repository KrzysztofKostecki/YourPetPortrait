import { getTranslations } from "next-intl/server";
import { isShopifyConfigured } from "lib/shopify";

export async function DevShopifyNotice() {
  if (isShopifyConfigured()) return null;

  const t = await getTranslations("Product");

  return (
    <p className="mb-4 rounded-xl border border-gold/25 bg-gold-soft/30 px-4 py-2.5 text-xs leading-relaxed text-ink-muted dark:border-gold/20 dark:bg-gold/10 dark:text-canvas/70">
      <strong className="font-medium text-ink dark:text-canvas">
        {t("devNoticeTitle")}.
      </strong>{" "}
      {t("devNoticeBody")}
    </p>
  );
}
