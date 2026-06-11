# Shopify seed checklist

Configure your Shopify store before launching the portrait studio.

## Product: `custom-pet-oil-portrait`

- **Handle:** `custom-pet-oil-portrait`
- **Tag:** `custom-portrait` (required for the portrait studio UI)
- **Title:** Custom Pet Oil Portrait
- **Description:** Include process copy, turnaround expectations, and that AI previews are references only.

### Variants

Create three options:

| Option    | Example values                      |
| --------- | ----------------------------------- |
| Size      | 8x10, 11x14, 16x20                  |
| Pet Count | 1 Pet, 2 Pets                       |
| Finish    | Rolled Canvas, Framed, Gallery Wrap |

Ensure every variant combination you want to sell is created and available for sale.

## Collections

- `dog-portraits` — sample dog portrait products or the custom product
- `cat-portraits` — sample cat portrait products or the custom product

Link these from the homepage and navigation menu.

## Navigation menu (`next-js-frontend-header-menu`)

Suggested items:

- Create Portrait → `/product/custom-pet-oil-portrait`
- Dog Portraits → `/search/dog-portraits`
- Cat Portraits → `/search/cat-portraits`
- FAQ → `/pages/faq`

## Pages to create

### FAQ (`faq`)

Cover photo requirements, preview limits, revision policy, and shipping timelines.

### Shipping (`shipping-policy`)

Include made-to-order production time for custom artwork.

### Returns & cancellations (`returns-policy`)

Custom artwork is non-returnable except for damage or artist error. Allow cancellation before painting begins.

### Privacy (`privacy-policy`)

Disclose:

- Customers upload pet photos for portrait creation
- AI previews are generated from uploaded photos
- Photo and preview URLs are stored for order fulfillment
- Data retention aligned with order lifecycle

## Order fulfillment data

When a customer checks out, Shopify order line items should include these attributes:

- `petName`
- `petType`
- `background`
- `artistNotes`
- `sourcePhotoUrl`
- `selectedPreviewUrl`
- `previewSessionId`
- `stylePreset`
- `promptVersion`

Verify a test order in Shopify Admin → Orders → line item properties before going live.

## Webhooks

Point Shopify webhooks to:

`/api/revalidate?secret=YOUR_SHOPIFY_REVALIDATION_SECRET`

Topics: products and collections updates.
