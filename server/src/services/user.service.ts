import { UserRepo } from "../repository.ts";
import type { UserRecord } from "../models.ts";
import type { UserInfo } from "@gameschedule/shared";

export async function createUser(id: string, username: string, display: string): Promise<void> {
  const record: UserRecord = {
    username,
    display,
    createdAt: new Date().toISOString(),
  };
  await UserRepo.set(id, record);
}

export async function getUserById(id: string): Promise<UserInfo | null> {
  const record = await UserRepo.find(id);
  if (!record) return null;
  return { id, ...record };
}

export async function updateUser(
  id: string,
  fields: Partial<Pick<UserRecord, "display" | "bio">>
): Promise<void> {
  const record = await UserRepo.get(id);
  await UserRepo.set(id, { ...record, ...fields });
}
