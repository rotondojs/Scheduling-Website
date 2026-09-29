import axios from "axios";
import type { UserInfo, SessionInfo, CreateSessionRequest, GroupInfo, MessageInfo, FriendInfo, FriendRequestInfo } from "@gameschedule/shared";

const api = axios.create({ baseURL: "/api" });

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "Cannot reach server. Make sure the server is running on port 3000.";
    return (error.response.data as { error?: string })?.error ?? `Server error (${error.response.status})`;
  }
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

function withAuth(username: string, password: string) {
  return { auth: { username, password } };
}

// --- User ---

export async function signup(username: string, password: string, display: string): Promise<UserInfo> {
  try {
    const { data } = await api.post("/user/signup", { username, password, display });
    return data.user;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

export async function login(username: string, password: string): Promise<UserInfo> {
  try {
    const { data } = await api.post("/user/login", { username, password });
    return data.user;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
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
  try {
    const { data } = await api.post("/session/create", {
      ...req,
      ...withAuth(username, password),
    });
    return data.session;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

export async function joinSession(
  id: string,
  username: string,
  password: string
): Promise<SessionInfo> {
  try {
    const { data } = await api.post(`/session/${id}/join`, withAuth(username, password));
    return data.session;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

export async function leaveSession(
  id: string,
  username: string,
  password: string
): Promise<SessionInfo> {
  try {
    const { data } = await api.post(`/session/${id}/leave`, withAuth(username, password));
    return data.session;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

export async function getUserSessions(userId: string): Promise<SessionInfo[]> {
  try {
    const { data } = await api.get(`/session/user/${userId}`);
    return data.sessions;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

// --- User search ---

export async function searchUsers(q: string, excludeId: string): Promise<UserInfo[]> {
  const { data } = await api.get("/user/search", { params: { q, excludeId } });
  return data.users;
}

// --- Friends ---

export async function sendFriendRequest(toUsername: string, username: string, password: string): Promise<void> {
  try {
    await api.post("/friend/request", { toUsername, ...withAuth(username, password) });
  } catch (e) { throw new Error(getErrorMessage(e)); }
}

export async function respondToFriendRequest(
  requestId: string, action: "accept" | "reject", username: string, password: string
): Promise<void> {
  try {
    await api.post("/friend/respond", { requestId, action, ...withAuth(username, password) });
  } catch (e) { throw new Error(getErrorMessage(e)); }
}

export async function removeFriend(friendId: string, username: string, password: string): Promise<void> {
  try {
    await api.post("/friend/remove", { friendId, ...withAuth(username, password) });
  } catch (e) { throw new Error(getErrorMessage(e)); }
}

export async function getFriends(userId: string): Promise<FriendInfo[]> {
  const { data } = await api.get("/friend/list", { params: { userId } });
  return data.friends;
}

export async function getFriendInbox(userId: string): Promise<FriendRequestInfo[]> {
  const { data } = await api.get("/friend/inbox", { params: { userId } });
  return data.requests;
}

// --- Groups ---

export async function createGroup(
  name: string,
  memberUsernames: string[],
  username: string,
  password: string
): Promise<GroupInfo> {
  try {
    const { data } = await api.post("/group/create", {
      name,
      memberUsernames,
      ...withAuth(username, password),
    });
    return data.group;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}

export async function getUserGroups(userId: string): Promise<GroupInfo[]> {
  const { data } = await api.get("/group/list", { params: { userId } });
  return data.groups;
}

export async function getGroupMessages(groupId: string): Promise<MessageInfo[]> {
  const { data } = await api.get(`/group/${groupId}/messages`);
  return data.messages;
}

export async function sendGroupMessage(
  groupId: string,
  content: string,
  type: "text" | "session_invite",
  username: string,
  password: string,
  sessionId?: string
): Promise<MessageInfo> {
  try {
    const { data } = await api.post(`/group/${groupId}/message`, {
      content,
      type,
      sessionId,
      ...withAuth(username, password),
    });
    return data.message;
  } catch (e) {
    throw new Error(getErrorMessage(e));
  }
}
