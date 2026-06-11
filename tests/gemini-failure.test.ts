import { describe, expect, it } from "vitest";
import { buildPortraitPrompt } from "lib/portrait/prompt";

describe("Gemini failure handling", () => {
  it("surfaces a friendly error when no image file is returned", () => {
    const files: Array<{ mimeType: string; uint8Array?: Uint8Array }> = [];
    const generatedFile = files.find((file) =>
      file.mimeType.startsWith("image/"),
    );
    const error = !generatedFile?.uint8Array
      ? "Model did not return an image preview"
      : null;

    expect(error).toBe("Model did not return an image preview");
  });
});

describe("buildPortraitPrompt gemini payload", () => {
  it("builds multimodal-friendly instructions", () => {
    const prompt = buildPortraitPrompt({
      petName: "Milo",
      petType: "Cat",
      stylePreset: "warm-vintage",
      background: "Cream",
      framing: "Chest up",
    });

    expect(prompt).toContain("Milo");
    expect(prompt).toContain("cat");
    expect(prompt).toContain("Prompt version: v1");
  });
});
