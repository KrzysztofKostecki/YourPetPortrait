import { createVertex } from "@ai-sdk/google-vertex";
import { del, put } from "@vercel/blob";
import { auth } from "auth";
import { generateText } from "ai";
import { randomUUID } from "crypto";
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  DEFAULT_FIDELITY,
  FIDELITY_OPTIONS,
  type FidelityId,
  type StylePresetId,
} from "lib/portrait/constants";
import { buildPortraitPrompt } from "lib/portrait/prompt";
import { consumeQuota, getRemainingQuota } from "lib/portrait/quota";
import {
  appendPreview,
  createOrUpdateSession,
  getPortraitSession,
  removePreview,
  updatePreviewUrl,
} from "lib/portrait/session";
import { NextResponse } from "next/server";

type PortraitPreviewRequest = {
  sessionId?: string;
  sourcePhotoUrl: string;
  previousPreviewUrl?: string;
  petName: string;
  petType: string;
  stylePreset: StylePresetId;
  background: string;
  framing: string;
  fidelity?: FidelityId;
  artistNotes?: string;
  revisionMessage?: string;
};

type PortraitPreviewDeleteRequest = {
  sessionId: string;
  previewId: string;
};

type PortraitPreviewUpdateRequest = {
  sessionId: string;
  previewId: string;
  url: string;
};

function normalizeFidelity(value: unknown): FidelityId {
  return FIDELITY_OPTIONS.some((option) => option.id === value)
    ? (value as FidelityId)
    : DEFAULT_FIDELITY;
}

function getModelName(): string {
  return process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";
}

const vertex = createVertex({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

async function loadImage(
  url: string,
): Promise<{ data: Uint8Array; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Unable to load reference image");
  }

  const mimeType =
    response.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
  if (
    !ALLOWED_UPLOAD_MIME_TYPES.includes(
      mimeType as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number],
    )
  ) {
    throw new Error("Unsupported image type");
  }

  const buffer = await response.arrayBuffer();
  return { data: new Uint8Array(buffer), mimeType };
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { error: "Sign in to create a preview." },
      { status: 401 },
    );
  }

  let body: PortraitPreviewRequest;
  try {
    body = (await request.json()) as PortraitPreviewRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const {
    sessionId,
    sourcePhotoUrl,
    previousPreviewUrl,
    petName,
    petType,
    stylePreset,
    background,
    framing,
    artistNotes,
    revisionMessage,
  } = body;
  const fidelity = normalizeFidelity(body.fidelity);

  if (
    !sourcePhotoUrl ||
    !petName ||
    !petType ||
    !stylePreset ||
    !background ||
    !framing
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  if (sessionId) {
    const existing = await getPortraitSession(sessionId);
    if (existing && existing.userEmail !== email) {
      return NextResponse.json(
        { error: "Invalid preview session" },
        { status: 403 },
      );
    }
  }

  const remainingBefore = await getRemainingQuota(email);
  if (remainingBefore <= 0) {
    return NextResponse.json(
      {
        error:
          "Daily preview limit reached. Try again tomorrow or contact us for help.",
        remainingQuota: 0,
      },
      { status: 429 },
    );
  }

  try {
    const referenceUrl = previousPreviewUrl || sourcePhotoUrl;
    const referenceImage = await loadImage(referenceUrl);
    const prompt = buildPortraitPrompt({
      petName,
      petType,
      stylePreset,
      background,
      framing,
      fidelity,
      artistNotes,
      revisionMessage,
    });

    const result = await generateText({
      model: vertex(getModelName()),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image",
              image: referenceImage.data,
              mediaType: referenceImage.mimeType,
            },
          ],
        },
      ],
    });

    const generatedFile = result.files?.find((file) =>
      file.mediaType.startsWith("image/"),
    );

    if (!generatedFile?.uint8Array) {
      throw new Error("Model did not return an image preview");
    }

    const previewId = randomUUID();
    const blob = await put(
      `previews/${email}/${previewId}.png`,
      Buffer.from(generatedFile.uint8Array),
      {
        access: "public",
        contentType: generatedFile.mediaType ?? "image/png",
      },
    );

    const portraitSession = await createOrUpdateSession({
      sessionId,
      userEmail: email,
      sourcePhotoUrl,
      petName,
      petType,
      stylePreset,
      background,
      framing,
      fidelity,
      artistNotes,
    });

    await appendPreview(portraitSession.id, {
      id: previewId,
      url: blob.url,
      prompt,
      createdAt: new Date().toISOString(),
    });

    const quota = await consumeQuota(email);

    return NextResponse.json({
      previewUrl: blob.url,
      previewId,
      sessionId: portraitSession.id,
      remainingQuota: quota.remaining,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Preview generation failed. Please try again.",
        remainingQuota: remainingBefore,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { error: "Sign in to manage previews." },
      { status: 401 },
    );
  }

  let body: PortraitPreviewDeleteRequest;
  try {
    body = (await request.json()) as PortraitPreviewDeleteRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { sessionId, previewId } = body;
  if (!sessionId || !previewId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const existing = await getPortraitSession(sessionId);
  if (!existing || existing.userEmail !== email) {
    return NextResponse.json(
      { error: "Invalid preview session" },
      { status: 403 },
    );
  }

  const result = await removePreview(sessionId, previewId);
  if (!result) {
    return NextResponse.json({ error: "Preview not found" }, { status: 404 });
  }

  try {
    await del(result.removed.url);
  } catch {
    // The session no longer references the preview; an orphaned blob is acceptable.
  }

  return NextResponse.json({
    deletedPreviewId: previewId,
    selectedPreviewId: result.session.selectedPreviewId ?? null,
  });
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { error: "Sign in to manage previews." },
      { status: 401 },
    );
  }

  let body: PortraitPreviewUpdateRequest;
  try {
    body = (await request.json()) as PortraitPreviewUpdateRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { sessionId, previewId, url } = body;
  if (!sessionId || !previewId || !url) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    if (new URL(url).protocol !== "https:") {
      throw new Error("Insecure URL");
    }
  } catch {
    return NextResponse.json({ error: "Invalid preview URL" }, { status: 400 });
  }

  const existing = await getPortraitSession(sessionId);
  if (!existing || existing.userEmail !== email) {
    return NextResponse.json(
      { error: "Invalid preview session" },
      { status: 403 },
    );
  }

  const result = await updatePreviewUrl(sessionId, previewId, url);
  if (!result) {
    return NextResponse.json({ error: "Preview not found" }, { status: 404 });
  }

  if (result.previousUrl !== url) {
    try {
      await del(result.previousUrl);
    } catch {
      // The session already points at the new image; an orphaned blob is acceptable.
    }
  }

  return NextResponse.json({ previewId, url });
}
