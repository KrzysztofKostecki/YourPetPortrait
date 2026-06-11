import Price from "components/price";
import { GridTileImage } from "components/grid/tile";
import Footer from "components/layout/footer";
import { Gallery } from "components/product/gallery";
import { PortraitPreviewStudio } from "components/product/portrait-preview-studio";
import { ProductDescription } from "components/product/product-description";
import { DevShopifyNotice } from "components/product/dev-shopify-notice";
import {
  CUSTOM_PORTRAIT_HANDLE,
  CUSTOM_PORTRAIT_TAG,
  HIDDEN_PRODUCT_TAG,
} from "lib/constants";
import { getProduct, getProductRecommendations } from "lib/shopify";
import type { Image, Product } from "lib/shopify/types";
import type { Metadata } from "next";
import { Link } from "i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export async function generateMetadata(props: {
  params: Promise<{ locale: string; handle: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  setRequestLocale(params.locale);
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const { url, width, height, altText: alt } = product.featuredImage || {};
  const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG);

  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
      },
    },
    openGraph: url
      ? {
          images: [
            {
              url,
              width,
              height,
              alt,
            },
          ],
        }
      : null,
  };
}

export default async function ProductPage(props: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featuredImage.url,
    offers: {
      "@type": "AggregateOffer",
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      highPrice: product.priceRange.maxVariantPrice.amount,
      lowPrice: product.priceRange.minVariantPrice.amount,
    },
  };

  const isCustomPortrait =
    product.tags.includes(CUSTOM_PORTRAIT_TAG) ||
    params.handle === CUSTOM_PORTRAIT_HANDLE;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      {isCustomPortrait ? (
        <StudioLayout product={product} />
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="surface-card flex flex-col overflow-hidden lg:flex-row lg:gap-0">
            <div className="h-full w-full basis-full bg-canvas-deep/40 p-4 lg:basis-3/5 lg:p-8 dark:bg-white/[0.03]">
              <Suspense
                fallback={
                  <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden" />
                }
              >
                <Gallery
                  images={product.images.slice(0, 5).map((image: Image) => ({
                    src: image.url,
                    altText: image.altText,
                  }))}
                />
              </Suspense>
            </div>

            <div className="basis-full p-6 md:p-10 lg:basis-2/5 lg:p-10">
              <Suspense fallback={null}>
                <ProductDescription product={product} />
              </Suspense>
            </div>
          </div>
          <RelatedProducts id={product.id} />
        </div>
      )}
      <Footer />
    </>
  );
}

async function StudioLayout({ product }: { product: Product }) {
  const t = await getTranslations("Product");

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-5 lg:px-8 lg:pb-20">
      <DevShopifyNotice />
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 dark:border-white/10">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="display-heading text-2xl md:text-3xl">
            {product.title}
          </h1>
          <p className="eyebrow text-[0.6rem]">{t("portraitStudio")}</p>
        </div>
        <div className="inline-flex rounded-full bg-ink px-3.5 py-1.5 text-xs text-canvas dark:bg-gold dark:text-ink">
          <Price
            amount={product.priceRange.maxVariantPrice.amount}
            currencyCode={product.priceRange.maxVariantPrice.currencyCode}
          />
        </div>
      </header>
      <Suspense fallback={null}>
        <PortraitPreviewStudio product={product} />
      </Suspense>
    </div>
  );
}

async function RelatedProducts({ id }: { id: string }) {
  const t = await getTranslations("Product");
  const relatedProducts = await getProductRecommendations(id);

  if (!relatedProducts.length) return null;

  return (
    <div className="py-12">
      <h2 className="display-heading mb-6 text-3xl">{t("related")}</h2>
      <ul className="flex w-full gap-4 overflow-x-auto pt-1">
        {relatedProducts.map((product) => (
          <li
            key={product.handle}
            className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
          >
            <Link
              className="relative h-full w-full"
              href={`/product/${product.handle}`}
              prefetch={true}
            >
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.title,
                  amount: product.priceRange.maxVariantPrice.amount,
                  currencyCode: product.priceRange.maxVariantPrice.currencyCode,
                }}
                src={product.featuredImage?.url}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
