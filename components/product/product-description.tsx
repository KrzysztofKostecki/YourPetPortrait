import { AddToCart } from "components/cart/add-to-cart";
import Price from "components/price";
import Prose from "components/prose";
import { Product } from "lib/shopify/types";
import { getTranslations } from "next-intl/server";
import { VariantSelector } from "./variant-selector";

export async function ProductDescription({ product }: { product: Product }) {
  const t = await getTranslations("Product");

  return (
    <>
      <div className="mb-8 border-b border-line pb-8 dark:border-white/10">
        <p className="eyebrow mb-3">{t("collection")}</p>
        <h1 className="display-heading mb-5 text-4xl leading-tight md:text-5xl">
          {product.title}
        </h1>
        <div className="inline-flex rounded-full bg-ink px-4 py-2 text-sm text-canvas dark:bg-gold dark:text-ink">
          <Price
            amount={product.priceRange.maxVariantPrice.amount}
            currencyCode={product.priceRange.maxVariantPrice.currencyCode}
          />
        </div>
      </div>
      {product.descriptionHtml ? (
        <Prose
          className="body-muted prose-headings:font-display prose-headings:font-medium prose-p:text-ink-muted mb-8 max-w-none text-sm leading-relaxed dark:prose-invert"
          html={product.descriptionHtml}
        />
      ) : null}
      <VariantSelector options={product.options} variants={product.variants} />
      <AddToCart product={product} />
    </>
  );
}
