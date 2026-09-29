import { FriendRepo, UserRepo } from "../repository.ts";
import type { FriendRecord } from "../models.ts";
import type { FriendRequestInfo, FriendInfo } from "@gameschedule/shared";

async function allRecords(): Promise<Array<{ id: string; record: FriendRecord }>> {
  const keys = await FriendRepo.getAllKeys();
  const out: Array<{ id: string; record: FriendRecord }> = [];
  for (const id of keys) {
    const record = await FriendRepo.find(id);
    if (record) out.push({ id, record });
  }
  return out;
}

export async function sendRequest(
  fromId: string,
  fromUsername: string,
  fromDisplay: string,
  toUsername: string
): Promise<{ toId: string }> {
  // Resolve target user
  const keys = await FriendRepo.getAllKeys();
  // Find toId by username via UserRepo scan
  const userKeys = await (await import("../repository.ts")).UserRepo.getAllKeys();
  let toId: string | null = null;
  let toDisplay = "";
  for (const uid of userKeys) {
    const u = await UserRepo.find(uid);
    if (u?.username === toUsername) { toId = uid; toDisplay = u.display; break; }
  }
  if (!toId) throw new Error("User not found");
  if (toId === fromId) throw new Error("Cannot add yourself");

  // Check for existing relationship
  const records = await allRecords();
  for (const { record } of records) {
    const involves = (record.fromId === fromId && record.toId === toId) ||
                     (record.fromId === toId && record.toId === fromId);
    if (involves) {
      if (record.status === "accepted") throw new Error("Already friends");
      if (record.status === "pending") throw new Error("Request already sent");
    }
  }

  const newRecord: FriendRecord = {
    fromId, fromUsername, fromDisplay,
    toId, toUsername, status: "pending",
    createdAt: new Date().toISOString(),
  };
  await FriendRepo.add(newRecord);
  return { toId };
}

export async function respondToRequest(
  requestId: string,
  userId: string,
  action: "accept" | "reject"
): Promise<void> {
  const record = await FriendRepo.get(requestId);
  if (record.toId !== userId) throw new Error("Not authorized");
  if (record.status !== "pending") throw new Error("Request already resolved");
  if (action === "accept") {
    await FriendRepo.set(requestId, { ...record, status: "accepted" });
  } else {
    await FriendRepo.delete(requestId);
  }
}

export async function removeFriend(userId: string, friendId: string): Promise<void> {
  const records = await allRecords();
  for (const { id, record } of records) {
    const involves = (record.fromId === userId && record.toId === friendId) ||
                     (record.fromId === friendId && record.toId === userId);
    if (involves && record.status === "accepted") {
      await FriendRepo.delete(id);
      return;
    }
  }
  throw new Error("Not friends");
}

export async function getFriends(userId: string): Promise<FriendInfo[]> {
  const records = await allRecords();
  const result: FriendInfo[] = [];
  for (const { record } of records) {
    if (record.status !== "accepted") continue;
    let friendId: string;
    if (record.fromId === userId) friendId = record.toId;
    else if (record.toId === userId) friendId = record.fromId;
    else continue;
    const u = await UserRepo.find(friendId);
    if (u) result.push({ id: friendId, username: u.username, display: u.display });
  }
  return result.sort((a, b) => a.username.localeCompare(b.username));
}

export async function getInbox(userId: string): Promise<FriendRequestInfo[]> {
  const records = await allRecords();
  return records
    .filter(({ record }) => record.toId === userId && record.status === "pending")
    .map(({ id, record }) => ({ id, ...record, toDisplay: "" }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)) as FriendRequestInfo[];
}

export async function getFriendIds(userId: string): Promise<Set<string>> {
  const friends = await getFriends(userId);
  return new Set(friends.map((f) => f.id));
}
