# Pet Portrait Studio

Headless Shopify storefront for custom dog and cat oil portraits, built on [Vercel Next.js Commerce](https://github.com/vercel/commerce).

Customers sign in with Google, upload a pet photo, generate AI portrait previews with Gemini, refine through conversational edits, and add the final selection to cart with line-item attributes for artist fulfillment.

## Stack

- **Next.js 15** (App Router, Server Actions, PPR)
- **Shopify** — products, cart, checkout, orders
- **Auth.js** — Google OAuth (JWT sessions)
- **Vercel Blob** — pet photo uploads and generated previews
- **Upstash Redis** — daily generation quotas and preview sessions
- **Vercel AI SDK + Gemini** — multimodal portrait preview generation

## Getting started

1. Copy `.env.example` to `.env.local` and fill in all values.
2. Seed Shopify using [docs/shopify-seed.md](docs/shopify-seed.md).
3. Install and run:

```bash
pnpm install
pnpm dev
```

## Scripts

| Command               | Description                 |
| --------------------- | --------------------------- |
| `pnpm dev`            | Start development server    |
| `pnpm build`          | Production build            |
| `pnpm test`           | Run Vitest unit/route tests |
| `pnpm prettier:check` | Format check                |

## Custom portrait product

Products tagged `custom-portrait` render the **Portrait Preview Studio** instead of the standard add-to-cart flow. The custom product handle should be `custom-pet-oil-portrait`.

Cart line attributes sent to Shopify:

`petName`, `petType`, `background`, `artistNotes`, `sourcePhotoUrl`, `selectedPreviewUrl`, `previewSessionId`, `stylePreset`, `promptVersion`

## API routes

| Route                           | Purpose                                         |
| ------------------------------- | ----------------------------------------------- |
| `POST /api/upload`              | Vercel Blob client upload token (auth required) |
| `POST /api/ai/portrait-preview` | Generate preview via Gemini (auth + quota)      |
| `/api/auth/[...nextauth]`       | Auth.js handlers                                |

## Environment variables

See `.env.example` for the full list. Key values:

- `AI_GENERATION_DAILY_LIMIT` — successful previews per user per day (default 5)
- `GEMINI_IMAGE_MODEL` — defaults to `gemini-2.5-flash-image`
- `NEXT_PUBLIC_SITE_NAME` — defaults to `Pet Portrait Studio`

# YourPetPortrait
