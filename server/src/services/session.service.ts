import { SessionRepo, UserRepo } from "../repository.ts";
import type { SessionRecord } from "../models.ts";
import type { SessionInfo, CreateSessionRequest } from "@gameschedule/shared";

export async function createSession(
  req: CreateSessionRequest,
  createdByUserId: string
): Promise<string> {
  const record: SessionRecord = {
    ...req,
    participants: [createdByUserId],
    createdBy: createdByUserId,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  return SessionRepo.add(record);
}

export async function getSessions(): Promise<SessionInfo[]> {
  const keys = await SessionRepo.getAllKeys();
  if (keys.length === 0) return [];
  const records = await SessionRepo.getMany(keys);
  return Promise.all(
    records.map(async (r, i) => {
      const user = await UserRepo.find(r.createdBy);
      return {
        id: keys[i],
        ...r,
        createdByUsername: user?.username ?? "unknown",
      };
    })
  );
}

export async function getSessionById(id: string): Promise<SessionInfo | null> {
  const record = await SessionRepo.find(id);
  if (!record) return null;
  const user = await UserRepo.find(record.createdBy);
  return { id, ...record, createdByUsername: user?.username ?? "unknown" };
}

export async function joinSession(sessionId: string, userId: string): Promise<SessionInfo> {
  const record = await SessionRepo.get(sessionId);
  if (record.status !== "open") throw new Error("Session is not open");
  if (record.participants.includes(userId)) throw new Error("Already joined");
  if (record.participants.length >= record.maxPlayers) throw new Error("Session is full");

  const updated: SessionRecord = {
    ...record,
    participants: [...record.participants, userId],
    status: record.participants.length + 1 >= record.maxPlayers ? "full" : "open",
  };
  await SessionRepo.set(sessionId, updated);
  const user = await UserRepo.find(record.createdBy);
  return { id: sessionId, ...updated, createdByUsername: user?.username ?? "unknown" };
}

export async function leaveSession(sessionId: string, userId: string): Promise<SessionInfo> {
  const record = await SessionRepo.get(sessionId);
  if (!record.participants.includes(userId)) throw new Error("Not in session");

  const updated: SessionRecord = {
    ...record,
    participants: record.participants.filter((p) => p !== userId),
    status: "open",
  };
  await SessionRepo.set(sessionId, updated);
  const user = await UserRepo.find(record.createdBy);
  return { id: sessionId, ...updated, createdByUsername: user?.username ?? "unknown" };
}

export async function getUserSessions(userId: string): Promise<SessionInfo[]> {
  const all = await getSessions();
  return all.filter((s) => s.participants.includes(userId));
}
