import { createVertex } from "@ai-sdk/google-vertex";
import { put } from "@vercel/blob";
import { auth } from "auth";
import { generateText } from "ai";
import { randomUUID } from "crypto";
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  type StylePresetId,
} from "lib/portrait/constants";
import { buildPortraitPrompt } from "lib/portrait/prompt";
import { consumeQuota, getRemainingQuota } from "lib/portrait/quota";
import {
  appendPreview,
  createOrUpdateSession,
  getPortraitSession,
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
  revisionMessage?: string;
};

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
    revisionMessage,
  } = body;

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
