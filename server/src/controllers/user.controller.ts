import type { Request, Response } from "express";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import * as authService from "../services/auth.service.ts";
import * as userService from "../services/user.service.ts";
import { UserRepo } from "../repository.ts";

const SignupSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6),
  display: z.string().min(1),
});

const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function postSignup(req: Request, res: Response) {
  const parsed = SignupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { username, password, display } = parsed.data;
  const userId = randomUUID();

  try {
    await authService.createAuth(username, password, userId);
    await userService.createUser(userId, username, display);
    const user = await userService.getUserById(userId);
    res.status(201).json({ user });
  } catch (e: unknown) {
    if (e instanceof Error) res.status(409).json({ error: e.message });
    else res.status(500).json({ error: "Server error" });
  }
}

export async function postLogin(req: Request, res: Response) {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { username, password } = parsed.data;
  const userId = await authService.checkAuth(username, password);
  if (!userId) return res.status(401).json({ error: "Invalid credentials" });

  const user = await userService.getUserById(userId);
  res.json({ user });
}

export async function getByUsername(req: Request, res: Response) {
  const { username } = req.params;
  const keys = await UserRepo.getAllKeys();
  for (const key of keys) {
    const u = await userService.getUserById(key);
    if (u?.username === username) return res.json({ user: u });
  }
  res.status(404).json({ error: "User not found" });
}

export async function searchUsers(req: Request, res: Response) {
  const q = ((req.query.q as string) ?? "").toLowerCase().trim();
  const excludeId = (req.query.excludeId as string) ?? "";
  const keys = await UserRepo.getAllKeys();
  const results = [];
  for (const key of keys) {
    if (key === excludeId) continue;
    const u = await userService.getUserById(key);
    if (!u) continue;
    if (!q || u.username.toLowerCase().includes(q) || u.display.toLowerCase().includes(q)) {
      results.push(u);
    }
  }
  results.sort((a, b) => a.username.localeCompare(b.username));
  res.json({ users: results.slice(0, 30) });
}
