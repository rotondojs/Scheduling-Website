import { GroupRepo, MessageRepo, UserRepo, AuthRepo, SessionRepo } from "../repository.ts";
import type { GroupRecord, MessageRecord } from "../models.ts";
import type { GroupInfo, MessageInfo } from "@gameschedule/shared";

async function resolveUsernames(memberIds: string[]): Promise<string[]> {
  const names: string[] = [];
  for (const id of memberIds) {
    const u = await UserRepo.find(id);
    names.push(u?.username ?? "unknown");
  }
  return names;
}

export async function createGroup(
  name: string,
  memberUsernames: string[],
  createdByUserId: string
): Promise<string> {
  // Resolve usernames to user IDs
  const memberIds: string[] = [createdByUserId];
  for (const username of memberUsernames) {
    const authRecord = await AuthRepo.find(username);
    if (authRecord) memberIds.push(authRecord.userId);
  }
  // Deduplicate
  const uniqueIds = [...new Set(memberIds)];

  const record: GroupRecord = {
    name,
    members: uniqueIds,
    createdBy: createdByUserId,
    createdAt: new Date().toISOString(),
  };
  return GroupRepo.add(record);
}

export async function getUserGroups(userId: string): Promise<GroupInfo[]> {
  const keys = await GroupRepo.getAllKeys();
  const result: GroupInfo[] = [];
  for (const key of keys) {
    const g = await GroupRepo.find(key);
    if (!g || !g.members.includes(userId)) continue;
    const memberUsernames = await resolveUsernames(g.members);
    result.push({ id: key, ...g, memberUsernames });
  }
  return result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getGroupById(id: string): Promise<GroupInfo | null> {
  const g = await GroupRepo.find(id);
  if (!g) return null;
  const memberUsernames = await resolveUsernames(g.members);
  return { id, ...g, memberUsernames };
}

export async function sendMessage(
  groupId: string,
  senderId: string,
  senderUsername: string,
  content: string,
  type: "text" | "session_invite",
  sessionId?: string
): Promise<MessageInfo> {
  let sessionTitle: string | undefined;
  let sessionGame: string | undefined;
  let sessionScheduledAt: string | undefined;

  if (type === "session_invite" && sessionId) {
    const session = await SessionRepo.find(sessionId);
    if (session) {
      sessionTitle = session.title;
      sessionGame = session.game;
      sessionScheduledAt = session.scheduledAt;
    }
  }

  const record: MessageRecord = {
    groupId,
    senderId,
    senderUsername,
    content,
    type,
    sessionId,
    sessionTitle,
    sessionGame,
    sessionScheduledAt,
    createdAt: new Date().toISOString(),
  };
  const id = await MessageRepo.add(record);
  return { id, ...record };
}

export async function getMessages(groupId: string): Promise<MessageInfo[]> {
  const keys = await MessageRepo.getAllKeys();
  const result: MessageInfo[] = [];
  for (const key of keys) {
    const m = await MessageRepo.find(key);
    if (!m || m.groupId !== groupId) continue;
    result.push({ id: key, ...m });
  }
  return result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
