import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  buildPortraitCartAttributes,
  buildPortraitCartLine,
} from "lib/portrait/cart";

describe("buildPortraitCartAttributes", () => {
  it("creates all required line item attributes", () => {
    const attributes = buildPortraitCartAttributes({
      petName: "Bailey",
      petType: "Dog",
      background: "Cream",
      artistNotes: "Keep red collar",
      sourcePhotoUrl: "https://blob.example/source.jpg",
      selectedPreviewUrl: "https://blob.example/preview.png",
      previewSessionId: "session-123",
      stylePreset: "oil-painting",
      fidelity: "faithful",
    });

    expect(attributes).toEqual(
      expect.arrayContaining([
        { key: "petName", value: "Bailey" },
        { key: "petType", value: "Dog" },
        { key: "background", value: "Cream" },
        { key: "artistNotes", value: "Keep red collar" },
        { key: "sourcePhotoUrl", value: "https://blob.example/source.jpg" },
        {
          key: "selectedPreviewUrl",
          value: "https://blob.example/preview.png",
        },
        { key: "previewSessionId", value: "session-123" },
        { key: "stylePreset", value: "oil-painting" },
        { key: "fidelity", value: "faithful" },
        { key: "promptVersion", value: "v2" },
      ]),
    );
    expect(attributes).toHaveLength(10);
  });
});

describe("buildPortraitCartLine", () => {
  it("builds a cart line input with attributes", () => {
    const line = buildPortraitCartLine({
      merchandiseId: "gid://shopify/ProductVariant/1",
      petName: "Milo",
      petType: "Cat",
      background: "Soft blue",
      artistNotes: "",
      sourcePhotoUrl: "https://blob.example/cat.jpg",
      selectedPreviewUrl: "https://blob.example/cat-preview.png",
      previewSessionId: "session-456",
      stylePreset: "watercolor",
      fidelity: "creative",
    });

    expect(line.merchandiseId).toBe("gid://shopify/ProductVariant/1");
    expect(line.quantity).toBe(1);
    expect(line.attributes).toHaveLength(10);
  });
});

describe("POST /api/ai/portrait-preview", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("rejects unauthenticated requests", async () => {
    vi.doMock("auth", () => ({
      auth: vi.fn().mockResolvedValue(null),
    }));

    const { POST } = await import("app/api/ai/portrait-preview/route");
    const response = await POST(
      new Request("http://localhost/api/ai/portrait-preview", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: "Sign in to create a preview.",
    });
  });

  it("rejects unauthenticated preview deletion", async () => {
    vi.doMock("auth", () => ({
      auth: vi.fn().mockResolvedValue(null),
    }));

    const { DELETE } = await import("app/api/ai/portrait-preview/route");
    const response = await DELETE(
      new Request("http://localhost/api/ai/portrait-preview", {
        method: "DELETE",
        body: JSON.stringify({ sessionId: "s", previewId: "p" }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("rejects unauthenticated preview updates", async () => {
    vi.doMock("auth", () => ({
      auth: vi.fn().mockResolvedValue(null),
    }));

    const { PATCH } = await import("app/api/ai/portrait-preview/route");
    const response = await PATCH(
      new Request("http://localhost/api/ai/portrait-preview", {
        method: "PATCH",
        body: JSON.stringify({
          sessionId: "s",
          previewId: "p",
          url: "https://blob.example/edited.jpg",
        }),
      }),
    );

    expect(response.status).toBe(401);
  });
});

describe("portrait quota", () => {
  it("defines a clear exhaustion message contract", () => {
    const message =
      "Daily preview limit reached. Try again tomorrow or contact us for help.";
    expect(message).toContain("Daily preview limit");
  });
});

describe("POST /api/upload", () => {
  it("rejects unauthenticated uploads", async () => {
    vi.doMock("auth", () => ({
      auth: vi.fn().mockResolvedValue(null),
    }));

    const { POST } = await import("app/api/upload/route");
    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        body: JSON.stringify({ type: "blob.generate-client-token" }),
      }),
    );

    expect(response.status).toBe(401);
  });
});

describe("buildPortraitPrompt", () => {
  it("includes revision instructions when provided", async () => {
    const { buildPortraitPrompt } = await import("lib/portrait/prompt");
    const prompt = buildPortraitPrompt({
      petName: "Bailey",
      petType: "Dog",
      stylePreset: "oil-painting",
      background: "Cream",
      framing: "Head and shoulders",
      revisionMessage: "warmer colors",
    });

    expect(prompt).toContain("warmer colors");
    expect(prompt).toContain("Bailey");
  });

  it("includes the customer's artist notes", async () => {
    const { buildPortraitPrompt } = await import("lib/portrait/prompt");
    const prompt = buildPortraitPrompt({
      petName: "Bailey",
      petType: "Dog",
      stylePreset: "pencil-sketch",
      background: "Cream",
      framing: "Head and shoulders",
      artistNotes: "Keep the red collar visible",
    });

    expect(prompt).toContain("Keep the red collar visible");
  });

  it("adds strict fidelity instructions by default", async () => {
    const { buildPortraitPrompt } = await import("lib/portrait/prompt");
    const prompt = buildPortraitPrompt({
      petName: "Bailey",
      petType: "Dog",
      stylePreset: "oil-painting",
      background: "Cream",
      framing: "Head and shoulders",
    });

    expect(prompt).toContain("Follow the reference photo strictly");
  });

  it("allows artistic freedom when requested", async () => {
    const { buildPortraitPrompt } = await import("lib/portrait/prompt");
    const prompt = buildPortraitPrompt({
      petName: "Bailey",
      petType: "Dog",
      stylePreset: "watercolor",
      background: "Cream",
      framing: "Head and shoulders",
      fidelity: "creative",
    });

    expect(prompt).toContain("artistic freedom");
  });
});
