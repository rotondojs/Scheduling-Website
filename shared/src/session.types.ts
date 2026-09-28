export type SessionStatus = "open" | "full" | "cancelled" | "completed";

export interface SessionInfo {
  id: string;
  title: string;
  game: string;
  description: string;
  scheduledAt: string;
  maxPlayers: number;
  participants: string[];
  createdBy: string;
  createdByUsername: string;
  status: SessionStatus;
  createdAt: string;
}

export interface CreateSessionRequest {
  title: string;
  game: string;
  description: string;
  scheduledAt: string;
  maxPlayers: number;
}
