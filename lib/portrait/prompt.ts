import {
  DEFAULT_FIDELITY,
  PORTRAIT_PROMPT_VERSION,
  type FidelityId,
  type StylePresetId,
} from "./constants";

const STYLE_DESCRIPTIONS: Record<StylePresetId, string> = {
  "oil-painting":
    "classic hand-painted oil portrait with soft brushwork, rich color, and timeless composition",
  watercolor:
    "watercolor portrait with delicate translucent washes, soft blended edges, and light paper texture",
  "pencil-sketch":
    "graphite pencil sketch portrait with fine linework, subtle shading, and visible paper grain",
  charcoal:
    "charcoal drawing portrait with bold expressive strokes, rich dark tones, and dramatic contrast",
};

const FIDELITY_INSTRUCTIONS: Record<FidelityId, string> = {
  faithful:
    "Follow the reference photo strictly: keep the exact pose, proportions, markings, fur color, and expression as photographed, changing only the artistic medium.",
  creative:
    "Take some artistic freedom with pose, lighting, and composition to create a flattering portrait, while keeping the pet clearly recognizable.",
};

export function buildPortraitPrompt(input: {
  petName: string;
  petType: string;
  stylePreset: StylePresetId;
  background: string;
  framing: string;
  fidelity?: FidelityId;
  artistNotes?: string;
  revisionMessage?: string;
}): string {
  const style = STYLE_DESCRIPTIONS[input.stylePreset];
  const fidelity = FIDELITY_INSTRUCTIONS[input.fidelity ?? DEFAULT_FIDELITY];
  const notes = input.artistNotes?.trim()
    ? ` Customer notes to honor: ${input.artistNotes.trim()}.`
    : "";
  const revision = input.revisionMessage?.trim()
    ? ` Apply this revision request: ${input.revisionMessage.trim()}.`
    : "";

  return [
    `Create a portrait preview of a ${input.petType.toLowerCase()} named ${input.petName}.`,
    `Composition: ${input.framing.toLowerCase()}.`,
    `Background: ${input.background}.`,
    `Art direction: ${style}.`,
    fidelity,
    "Preserve the pet's distinctive markings, fur color, eye color, and expression from the reference photo.",
    "Output a single polished portrait image suitable as a reference for a hand-crafted commission.",
    "Do not add text, watermarks, borders, or human figures.",
    notes,
    revision,
    `Prompt version: ${PORTRAIT_PROMPT_VERSION}.`,
  ].join(" ");
}
