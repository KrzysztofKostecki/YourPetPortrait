import { CUSTOM_PORTRAIT_HANDLE, CUSTOM_PORTRAIT_TAG } from "lib/constants";
import { showcaseImages } from "lib/images";
import type { Product, ProductVariant } from "lib/shopify/types";

const sizes = ["8x10", "11x14", "16x20"] as const;
const petCounts = ["1 Pet", "2 Pets"] as const;
const finishes = ["Rolled Canvas", "Framed", "Gallery Wrap"] as const;

const basePrices: Record<(typeof sizes)[number], string> = {
  "8x10": "129.00",
  "11x14": "189.00",
  "16x20": "279.00",
};

const petCountMultiplier: Record<(typeof petCounts)[number], number> = {
  "1 Pet": 1,
  "2 Pets": 1.45,
};

const finishAddon: Record<(typeof finishes)[number], number> = {
  "Rolled Canvas": 0,
  "Gallery Wrap": 35,
  Framed: 75,
};

function buildVariants(): ProductVariant[] {
  const variants: ProductVariant[] = [];
  let index = 1;

  for (const size of sizes) {
    for (const petCount of petCounts) {
      for (const finish of finishes) {
        const amount = (
          Number(basePrices[size]) * petCountMultiplier[petCount] +
          finishAddon[finish]
        ).toFixed(2);

        variants.push({
          id: `gid://shopify/ProductVariant/mock-${index}`,
          title: `${size} / ${petCount} / ${finish}`,
          availableForSale: true,
          selectedOptions: [
            { name: "Size", value: size },
            { name: "Pet Count", value: petCount },
            { name: "Finish", value: finish },
          ],
          price: {
            amount,
            currencyCode: "USD",
          },
        });
        index += 1;
      }
    }
  }

  return variants;
}

const mockVariants = buildVariants();
const prices = mockVariants.map((variant) => Number(variant.price.amount));

export const mockPortraitProduct: Product = {
  id: "gid://shopify/Product/mock-custom-pet-oil-portrait",
  handle: CUSTOM_PORTRAIT_HANDLE,
  availableForSale: true,
  title: "Custom Pet Oil Portrait",
  description:
    "A hand-painted oil portrait of your dog or cat, created from your photo and AI preview selections.",
  descriptionHtml: `<p>A hand-painted oil portrait of your dog or cat, created from your photo and AI preview selections.</p><p>Upload a photo, generate previews in our studio, refine the look, then order with your chosen size and finish.</p>`,
  options: [
    { id: "size", name: "Size", values: [...sizes] },
    { id: "pet-count", name: "Pet Count", values: [...petCounts] },
    { id: "finish", name: "Finish", values: [...finishes] },
  ],
  priceRange: {
    minVariantPrice: {
      amount: Math.min(...prices).toFixed(2),
      currencyCode: "USD",
    },
    maxVariantPrice: {
      amount: Math.max(...prices).toFixed(2),
      currencyCode: "USD",
    },
  },
  variants: mockVariants,
  featuredImage: {
    url: showcaseImages.heroPainting,
    altText: "Custom pet oil portrait sample",
    width: 1200,
    height: 1500,
  },
  images: [
    {
      url: showcaseImages.heroPainting,
      altText: "Custom pet oil portrait sample",
      width: 1200,
      height: 1500,
    },
    {
      url: showcaseImages.heroCompanion,
      altText: "Cat portrait sample",
      width: 900,
      height: 1125,
    },
    {
      url: showcaseImages.gallery[0].src,
      altText: "Warm vintage portrait style",
      width: 800,
      height: 1000,
    },
  ],
  tags: [CUSTOM_PORTRAIT_TAG],
  seo: {
    title: "Custom Pet Oil Portrait",
    description:
      "Commission a hand-painted oil portrait of your dog or cat from your photo.",
  },
  updatedAt: new Date().toISOString(),
};

export function getMockPortraitProduct(handle: string): Product | undefined {
  return handle === CUSTOM_PORTRAIT_HANDLE ? mockPortraitProduct : undefined;
}
