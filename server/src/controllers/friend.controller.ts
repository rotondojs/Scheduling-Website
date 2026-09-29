import type { Request, Response } from "express";
import { z } from "zod";
import * as friendService from "../services/friend.service.ts";
import * as authService from "../services/auth.service.ts";
import { io } from "../app.ts";

const AuthSchema = z.object({ username: z.string(), password: z.string() });

async function resolveAuth(auth: { username: string; password: string }) {
  const userId = await authService.checkAuth(auth.username, auth.password);
  if (!userId) return null;
  return { userId, username: auth.username };
}

export async function postSendRequest(req: Request, res: Response) {
  const parsed = z.object({
    auth: AuthSchema,
    toUsername: z.string(),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const caller = await resolveAuth(parsed.data.auth);
  if (!caller) return res.status(401).json({ error: "Unauthorized" });

  // Get display name for caller
  const { UserRepo } = await import("../repository.ts");
  const callerUser = await UserRepo.find(caller.userId);
  const fromDisplay = callerUser?.display ?? caller.username;

  try {
    const { toId } = await friendService.sendRequest(caller.userId, caller.username, fromDisplay, parsed.data.toUsername);
    io.to(`user:${toId}`).emit("friendRequest", {
      fromUsername: caller.username,
      fromDisplay,
    });
    res.status(201).json({ ok: true });
  } catch (e: unknown) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Error" });
  }
}

export async function postRespond(req: Request, res: Response) {
  const parsed = z.object({
    auth: AuthSchema,
    requestId: z.string(),
    action: z.enum(["accept", "reject"]),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const caller = await resolveAuth(parsed.data.auth);
  if (!caller) return res.status(401).json({ error: "Unauthorized" });

  try {
    await friendService.respondToRequest(parsed.data.requestId, caller.userId, parsed.data.action);
    res.json({ ok: true });
  } catch (e: unknown) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Error" });
  }
}

export async function postRemove(req: Request, res: Response) {
  const parsed = z.object({
    auth: AuthSchema,
    friendId: z.string(),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const caller = await resolveAuth(parsed.data.auth);
  if (!caller) return res.status(401).json({ error: "Unauthorized" });

  try {
    await friendService.removeFriend(caller.userId, parsed.data.friendId);
    res.json({ ok: true });
  } catch (e: unknown) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Error" });
  }
}

export async function getFriends(req: Request, res: Response) {
  const { userId } = req.query as { userId?: string };
  if (!userId) return res.status(400).json({ error: "userId required" });
  const friends = await friendService.getFriends(userId);
  res.json({ friends });
}

export async function getInbox(req: Request, res: Response) {
  const { userId } = req.query as { userId?: string };
  if (!userId) return res.status(400).json({ error: "userId required" });
  const requests = await friendService.getInbox(userId);
  res.json({ requests });
}
