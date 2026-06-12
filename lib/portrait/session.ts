import { randomUUID } from "crypto";
import { getRedis } from "lib/redis/client";
import type { FidelityId, StylePresetId } from "./constants";

export type PreviewRecord = {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
};

export type PortraitSession = {
  id: string;
  userEmail: string;
  sourcePhotoUrl: string;
  petName: string;
  petType: string;
  stylePreset: StylePresetId;
  background: string;
  framing: string;
  fidelity?: FidelityId;
  artistNotes?: string;
  previews: PreviewRecord[];
  selectedPreviewId?: string;
  updatedAt: string;
};

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function sessionKey(sessionId: string): string {
  return `portrait:session:${sessionId}`;
}

export async function getPortraitSession(
  sessionId: string,
): Promise<PortraitSession | null> {
  const redis = getRedis();
  return (await redis.get<PortraitSession>(sessionKey(sessionId))) ?? null;
}

export async function savePortraitSession(
  session: PortraitSession,
): Promise<void> {
  const redis = getRedis();
  await redis.set(sessionKey(session.id), session, {
    ex: SESSION_TTL_SECONDS,
  });
}

export async function createOrUpdateSession(input: {
  sessionId?: string;
  userEmail: string;
  sourcePhotoUrl: string;
  petName: string;
  petType: string;
  stylePreset: StylePresetId;
  background: string;
  framing: string;
  fidelity?: FidelityId;
  artistNotes?: string;
}): Promise<PortraitSession> {
  const existing = input.sessionId
    ? await getPortraitSession(input.sessionId)
    : null;

  const session: PortraitSession = {
    id: existing?.id ?? input.sessionId ?? randomUUID(),
    userEmail: input.userEmail,
    sourcePhotoUrl: input.sourcePhotoUrl,
    petName: input.petName,
    petType: input.petType,
    stylePreset: input.stylePreset,
    background: input.background,
    framing: input.framing,
    fidelity: input.fidelity,
    artistNotes: input.artistNotes,
    previews: existing?.previews ?? [],
    selectedPreviewId: existing?.selectedPreviewId,
    updatedAt: new Date().toISOString(),
  };

  await savePortraitSession(session);
  return session;
}

export async function appendPreview(
  sessionId: string,
  preview: PreviewRecord,
): Promise<PortraitSession | null> {
  const session = await getPortraitSession(sessionId);
  if (!session) return null;

  session.previews = [...session.previews, preview];
  session.selectedPreviewId = preview.id;
  session.updatedAt = new Date().toISOString();
  await savePortraitSession(session);
  return session;
}

export async function removePreview(
  sessionId: string,
  previewId: string,
): Promise<{ session: PortraitSession; removed: PreviewRecord } | null> {
  const session = await getPortraitSession(sessionId);
  if (!session) return null;

  const removed = session.previews.find((entry) => entry.id === previewId);
  if (!removed) return null;

  session.previews = session.previews.filter((entry) => entry.id !== previewId);
  if (session.selectedPreviewId === previewId) {
    session.selectedPreviewId = session.previews.at(-1)?.id;
  }
  session.updatedAt = new Date().toISOString();
  await savePortraitSession(session);
  return { session, removed };
}

export async function updatePreviewUrl(
  sessionId: string,
  previewId: string,
  url: string,
): Promise<{ session: PortraitSession; previousUrl: string } | null> {
  const session = await getPortraitSession(sessionId);
  if (!session) return null;

  const preview = session.previews.find((entry) => entry.id === previewId);
  if (!preview) return null;

  const previousUrl = preview.url;
  preview.url = url;
  session.updatedAt = new Date().toISOString();
  await savePortraitSession(session);
  return { session, previousUrl };
}
