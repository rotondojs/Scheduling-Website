import { AuthRepo } from "../repository.ts";

export async function checkAuth(username: string, password: string): Promise<string | null> {
  const auth = await AuthRepo.find(username);
  if (!auth || auth.password !== password) return null;
  return auth.userId;
}

export async function createAuth(username: string, password: string, userId: string): Promise<void> {
  const existing = await AuthRepo.find(username);
  if (existing) throw new Error("Username already taken");
  await AuthRepo.set(username, { userId, password });
}
