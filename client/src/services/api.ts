import axios from "axios";
import type { UserInfo, SessionInfo, CreateSessionRequest } from "@gameschedule/shared";

const api = axios.create({ baseURL: "/api" });

function withAuth(username: string, password: string) {
  return { auth: { username, password } };
}

// --- User ---

export async function signup(username: string, password: string, display: string): Promise<UserInfo> {
  const { data } = await api.post("/user/signup", { username, password, display });
  return data.user;
}

export async function login(username: string, password: string): Promise<UserInfo> {
  const { data } = await api.post("/user/login", { username, password });
  return data.user;
}

export async function getUserByUsername(username: string): Promise<UserInfo> {
  const { data } = await api.get(`/user/${username}`);
  return data.user;
}

// --- Sessions ---

export async function getSessions(): Promise<SessionInfo[]> {
  const { data } = await api.get("/session/list");
  return data.sessions;
}

export async function getSession(id: string): Promise<SessionInfo> {
  const { data } = await api.get(`/session/${id}`);
  return data.session;
}

export async function createSession(
  req: CreateSessionRequest,
  username: string,
  password: string
): Promise<SessionInfo> {
  const { data } = await api.post("/session/create", {
    ...req,
    ...withAuth(username, password),
  });
  return data.session;
}

export async function joinSession(
  id: string,
  username: string,
  password: string
): Promise<SessionInfo> {
  const { data } = await api.post(`/session/${id}/join`, withAuth(username, password));
  return data.session;
}

export async function leaveSession(
  id: string,
  username: string,
  password: string
): Promise<SessionInfo> {
  const { data } = await api.post(`/session/${id}/leave`, withAuth(username, password));
  return data.session;
}

export async function getUserSessions(userId: string): Promise<SessionInfo[]> {
  const { data } = await api.get(`/session/user/${userId}`);
  return data.sessions;
}
