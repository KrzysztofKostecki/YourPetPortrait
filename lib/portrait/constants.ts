export const PORTRAIT_PROMPT_VERSION = "v1";

export const STYLE_PRESETS = [
  {
    id: "classic-oil",
    label: "Classic oil",
    description: "Traditional hand-painted oil portrait with soft brushwork.",
  },
  {
    id: "modern-realistic",
    label: "Modern realistic",
    description: "Detailed, lifelike oil rendering with crisp features.",
  },
  {
    id: "warm-vintage",
    label: "Warm vintage",
    description: "Soft amber tones and gentle painterly texture.",
  },
  {
    id: "light-impressionist",
    label: "Light impressionist",
    description: "Looser strokes with luminous highlights.",
  },
] as const;

export type StylePresetId = (typeof STYLE_PRESETS)[number]["id"];

export const BACKGROUND_OPTIONS = [
  "Neutral gray",
  "Cream",
  "Soft blue",
  "Warm beige",
  "Dark charcoal",
  "Custom (describe in notes)",
] as const;

export const FRAMING_OPTIONS = [
  "Head and shoulders",
  "Chest up",
  "Full body",
] as const;

export const PET_TYPES = ["Dog", "Cat"] as const;

export type PetType = (typeof PET_TYPES)[number];

export const REVISION_CHIPS = [
  "Warmer colors",
  "Cream background",
  "More realistic",
  "Closer to original photo",
  "Softer brush strokes",
  "Brighter lighting",
] as const;

export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
