import { auth } from "auth";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { ALLOWED_UPLOAD_MIME_TYPES } from "lib/portrait/constants";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [...ALLOWED_UPLOAD_MIME_TYPES],
        maximumSizeInBytes: 15 * 1024 * 1024,
        tokenPayload: JSON.stringify({ email: session.user.email }),
      }),
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
