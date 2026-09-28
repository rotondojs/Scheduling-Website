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

export interface GroupRecord {
  name: string;
  members: RecordId[];
  createdBy: RecordId;
  createdAt: DateISO;
}

export interface MessageRecord {
  groupId: RecordId;
  senderId: RecordId;
  senderUsername: string;
  content: string;
  type: "text" | "session_invite";
  sessionId?: RecordId;
  sessionTitle?: string;
  sessionGame?: string;
  sessionScheduledAt?: string;
  createdAt: DateISO;
}
