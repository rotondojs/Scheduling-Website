import type { Request, Response } from "express";
import { z } from "zod";
import * as groupService from "../services/group.service.ts";
import * as authService from "../services/auth.service.ts";
import { io } from "../app.ts";

const AuthSchema = z.object({ username: z.string(), password: z.string() });

async function resolveAuth(auth: { username: string; password: string }): Promise<{ userId: string; username: string } | null> {
  const userId = await authService.checkAuth(auth.username, auth.password);
  if (!userId) return null;
  return { userId, username: auth.username };
}

export async function postCreate(req: Request, res: Response) {
  const parsed = z.object({
    auth: AuthSchema,
    name: z.string().min(1).max(50),
    memberUsernames: z.array(z.string()).max(50),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const caller = await resolveAuth(parsed.data.auth);
  if (!caller) return res.status(401).json({ error: "Unauthorized" });

  const id = await groupService.createGroup(
    parsed.data.name,
    parsed.data.memberUsernames,
    caller.userId
  );
  const group = await groupService.getGroupById(id);
  res.status(201).json({ group });
}

export async function getList(req: Request, res: Response) {
  const { userId } = req.query as { userId?: string };
  if (!userId) return res.status(400).json({ error: "userId required" });
  const groups = await groupService.getUserGroups(userId);
  res.json({ groups });
}

export async function getMessages(req: Request, res: Response) {
  const { id } = req.params;
  const messages = await groupService.getMessages(id);
  res.json({ messages });
}

export async function postMessage(req: Request, res: Response) {
  const parsed = z.object({
    auth: AuthSchema,
    content: z.string().min(1).max(2000),
    type: z.enum(["text", "session_invite"]).default("text"),
    sessionId: z.string().optional(),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const caller = await resolveAuth(parsed.data.auth);
  if (!caller) return res.status(401).json({ error: "Unauthorized" });

  const group = await groupService.getGroupById(req.params.id);
  if (!group) return res.status(404).json({ error: "Group not found" });
  if (!group.members.includes(caller.userId)) return res.status(403).json({ error: "Not a member" });

  const message = await groupService.sendMessage(
    req.params.id,
    caller.userId,
    caller.username,
    parsed.data.content,
    parsed.data.type,
    parsed.data.sessionId
  );

  // Broadcast to all connected clients watching this group
  io.to(`group:${req.params.id}`).emit("groupMessage", message);

  res.status(201).json({ message });
}
