/**
 * One-off generator for the style preset thumbnails shown in the
 * portrait preview studio. Renders the hero dog photo in each style
 * using the same model + prompt pipeline as the live preview API.
 *
 * Run: node_modules/.bin/jiti scripts/generate-style-thumbs.ts
 */
import { createVertex } from "@ai-sdk/google-vertex";
import { generateText } from "ai";
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { STYLE_PRESETS } from "../lib/portrait/constants";
import { buildPortraitPrompt } from "../lib/portrait/prompt";

const root = join(__dirname, "..");

// Load .env.local (no dotenv dependency in this project)
for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
  const match = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (match && !process.env[match[1]!]) process.env[match[1]!] = match[2]!;
}

const vertex = createVertex({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});
const model = process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";

async function main() {
  const photo = readFileSync(join(root, "public/images/hero/photo.png"));
  const outDir = join(root, "public/images/styles");
  mkdirSync(outDir, { recursive: true });

  for (const preset of STYLE_PRESETS) {
    const outPath = join(outDir, `${preset.id}.png`);
    if (existsSync(outPath)) {
      console.log(`Skipping ${preset.id} (already exists)`);
      continue;
    }

    const prompt = buildPortraitPrompt({
      petName: "Bella",
      petType: "Dog",
      stylePreset: preset.id,
      background: "Neutral gray",
      framing: "Head and shoulders",
      fidelity: "faithful",
      // Without this, fur-color preservation overrides the monochrome medium.
      artistNotes:
        preset.id === "charcoal"
          ? "Render strictly in monochrome charcoal — black, white, and gray tones only, no color."
          : undefined,
    });

    process.stdout.write(`Generating ${preset.id}... `);
    const result = await generateText({
      model: vertex(model),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image", image: photo, mediaType: "image/png" },
          ],
        },
      ],
    });

    const file = result.files?.find((f) => f.mediaType.startsWith("image/"));
    if (!file?.uint8Array) {
      throw new Error(`No image returned for ${preset.id}`);
    }

    writeFileSync(outPath, Buffer.from(file.uint8Array));
    console.log(`saved ${outPath} (${file.uint8Array.length} bytes)`);
    await new Promise((resolve) => setTimeout(resolve, 30_000));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
