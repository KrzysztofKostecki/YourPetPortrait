import { PORTRAIT_PROMPT_VERSION, type StylePresetId } from "./constants";

const STYLE_DESCRIPTIONS: Record<StylePresetId, string> = {
  "classic-oil":
    "classic hand-painted oil portrait with soft brushwork and timeless composition",
  "modern-realistic":
    "modern realistic oil portrait with crisp detail and natural proportions",
  "warm-vintage":
    "warm vintage oil portrait with amber tones and gentle painterly texture",
  "light-impressionist":
    "light impressionist oil portrait with luminous highlights and loose strokes",
};

export function buildPortraitPrompt(input: {
  petName: string;
  petType: string;
  stylePreset: StylePresetId;
  background: string;
  framing: string;
  revisionMessage?: string;
}): string {
  const style = STYLE_DESCRIPTIONS[input.stylePreset];
  const revision = input.revisionMessage?.trim()
    ? ` Apply this revision request: ${input.revisionMessage.trim()}.`
    : "";

  return [
    `Create an oil portrait preview of a ${input.petType.toLowerCase()} named ${input.petName}.`,
    `Composition: ${input.framing.toLowerCase()}.`,
    `Background: ${input.background}.`,
    `Art direction: ${style}.`,
    "Preserve the pet's distinctive markings, fur color, eye color, and expression from the reference photo.",
    "Output a single polished portrait image suitable as a reference for a hand-painted commission.",
    "Do not add text, watermarks, borders, or human figures.",
    revision,
    `Prompt version: ${PORTRAIT_PROMPT_VERSION}.`,
  ].join(" ");
}
