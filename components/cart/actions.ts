"use server";

import { TAGS } from "lib/constants";
import {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
} from "lib/shopify";
import { buildPortraitCartAttributes } from "lib/portrait/cart";
import type { FidelityId, StylePresetId } from "lib/portrait/constants";
import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function addItem(
  prevState: any,
  selectedVariantId: string | undefined,
) {
  if (!selectedVariantId) {
    return "Error adding item to cart";
  }

  try {
    await addToCart([{ merchandiseId: selectedVariantId, quantity: 1 }]);
    updateTag(TAGS.cart);
  } catch (e) {
    return "Error adding item to cart";
  }
}

export async function addPortraitItem(
  prevState: any,
  payload: {
    merchandiseId: string;
    petName: string;
    petType: string;
    background: string;
    artistNotes: string;
    sourcePhotoUrl: string;
    selectedPreviewUrl: string;
    previewSessionId: string;
    stylePreset: string;
    fidelity: string;
  },
) {
  if (!payload.merchandiseId) {
    return "Select size and finish options first";
  }

  if (!payload.selectedPreviewUrl || !payload.sourcePhotoUrl) {
    return "Generate and select a preview before adding to cart";
  }

  try {
    await addToCart([
      {
        merchandiseId: payload.merchandiseId,
        quantity: 1,
        attributes: buildPortraitCartAttributes({
          petName: payload.petName,
          petType: payload.petType,
          background: payload.background,
          artistNotes: payload.artistNotes,
          sourcePhotoUrl: payload.sourcePhotoUrl,
          selectedPreviewUrl: payload.selectedPreviewUrl,
          previewSessionId: payload.previewSessionId,
          stylePreset: payload.stylePreset as StylePresetId,
          fidelity: payload.fidelity as FidelityId,
        }),
      },
    ]);
    updateTag(TAGS.cart);
  } catch (e) {
    return "Error adding portrait to cart";
  }
}

export async function removeItem(prevState: any, merchandiseId: string) {
  try {
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId,
    );

    if (lineItem && lineItem.id) {
      await removeFromCart([lineItem.id]);
      updateTag(TAGS.cart);
    } else {
      return "Item not found in cart";
    }
  } catch (e) {
    return "Error removing item from cart";
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    merchandiseId: string;
    quantity: number;
  },
) {
  const { merchandiseId, quantity } = payload;

  try {
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId,
    );

    if (lineItem && lineItem.id) {
      if (quantity === 0) {
        await removeFromCart([lineItem.id]);
      } else {
        await updateCart([
          {
            id: lineItem.id,
            merchandiseId,
            quantity,
          },
        ]);
      }
    } else if (quantity > 0) {
      // If the item doesn't exist in the cart and quantity > 0, add it
      await addToCart([{ merchandiseId, quantity }]);
    }

    updateTag(TAGS.cart);
  } catch (e) {
    console.error(e);
    return "Error updating item quantity";
  }
}

export async function redirectToCheckout() {
  let cart = await getCart();
  redirect(cart!.checkoutUrl);
}

export async function createCartAndSetCookie() {
  let cart = await createCart();
  if (cart.id) {
    (await cookies()).set("cartId", cart.id);
  }
}
