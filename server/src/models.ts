export type RecordId = string;
export type DateISO = string;

export interface AuthRecord {
  userId: RecordId;
  password: string;
}

export interface UserRecord {
  username: string;
  display: string;
  bio?: string;
  picture?: string;
  createdAt: DateISO;
  lastLogin?: DateISO;
}

export interface SessionRecord {
  title: string;
  game: string;
  description: string;
  scheduledAt: DateISO;
  maxPlayers: number;
  participants: RecordId[];
  createdBy: RecordId;
  status: "open" | "full" | "cancelled" | "completed";
  createdAt: DateISO;
}
