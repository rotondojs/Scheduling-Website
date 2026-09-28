import type { Request, Response } from "express";
import { z } from "zod";
import * as sessionService from "../services/session.service.ts";
import * as authService from "../services/auth.service.ts";

const AuthSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const CreateSchema = z.object({
  auth: AuthSchema,
  title: z.string().min(1),
  game: z.string().min(1),
  description: z.string(),
  scheduledAt: z.string(),
  maxPlayers: z.number().int().min(2).max(64),
});

async function resolveUserId(auth: { username: string; password: string }): Promise<string | null> {
  return authService.checkAuth(auth.username, auth.password);
}

export async function postCreate(req: Request, res: Response) {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const userId = await resolveUserId(parsed.data.auth);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { auth: _a, ...sessionData } = parsed.data;
  const id = await sessionService.createSession(sessionData, userId);
  const session = await sessionService.getSessionById(id);
  res.status(201).json({ session });
}

export async function getList(_req: Request, res: Response) {
  const sessions = await sessionService.getSessions();
  res.json({ sessions });
}

export async function getById(req: Request, res: Response) {
  const session = await sessionService.getSessionById(req.params.id);
  if (!session) return res.status(404).json({ error: "Not found" });
  res.json({ session });
}

export async function postJoin(req: Request, res: Response) {
  const parsed = z.object({ auth: AuthSchema }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const userId = await resolveUserId(parsed.data.auth);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const session = await sessionService.joinSession(req.params.id, userId);
    res.json({ session });
  } catch (e: unknown) {
    if (e instanceof Error) res.status(400).json({ error: e.message });
    else res.status(500).json({ error: "Server error" });
  }
}

export async function postLeave(req: Request, res: Response) {
  const parsed = z.object({ auth: AuthSchema }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const userId = await resolveUserId(parsed.data.auth);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const session = await sessionService.leaveSession(req.params.id, userId);
    res.json({ session });
  } catch (e: unknown) {
    if (e instanceof Error) res.status(400).json({ error: e.message });
    else res.status(500).json({ error: "Server error" });
  }
}

export async function getUserSessions(req: Request, res: Response) {
  const { userId } = req.params;
  const sessions = await sessionService.getUserSessions(userId);
  res.json({ sessions });
}
