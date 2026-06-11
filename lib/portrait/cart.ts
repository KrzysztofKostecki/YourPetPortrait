import type { PortraitCartAttributeKey } from "lib/constants";
import type { CartLineAttribute } from "lib/shopify/types";
import { PORTRAIT_PROMPT_VERSION } from "./constants";
import type { StylePresetId } from "./constants";

export type PortraitCartPayload = {
  merchandiseId: string;
  petName: string;
  petType: string;
  background: string;
  artistNotes: string;
  sourcePhotoUrl: string;
  selectedPreviewUrl: string;
  previewSessionId: string;
  stylePreset: StylePresetId;
};

export function buildPortraitCartAttributes(
  payload: Omit<PortraitCartPayload, "merchandiseId">,
): CartLineAttribute[] {
  const entries: Record<PortraitCartAttributeKey, string> = {
    petName: payload.petName,
    petType: payload.petType,
    background: payload.background,
    artistNotes: payload.artistNotes,
    sourcePhotoUrl: payload.sourcePhotoUrl,
    selectedPreviewUrl: payload.selectedPreviewUrl,
    previewSessionId: payload.previewSessionId,
    stylePreset: payload.stylePreset,
    promptVersion: PORTRAIT_PROMPT_VERSION,
  };

  return Object.entries(entries).map(([key, value]) => ({
    key,
    value,
  }));
}

export function buildPortraitCartLine(payload: PortraitCartPayload) {
  return {
    merchandiseId: payload.merchandiseId,
    quantity: 1,
    attributes: buildPortraitCartAttributes(payload),
  };
}
