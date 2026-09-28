export interface GroupInfo {
  id: string;
  name: string;
  members: string[];
  memberUsernames: string[];
  createdBy: string;
  createdAt: string;
}

export interface MessageInfo {
  id: string;
  groupId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  type: "text" | "session_invite";
  sessionId?: string;
  sessionTitle?: string;
  sessionGame?: string;
  sessionScheduledAt?: string;
  createdAt: string;
}

export interface CreateGroupRequest {
  name: string;
  memberUsernames: string[];
}

export interface SendMessageRequest {
  content: string;
  type: "text" | "session_invite";
  sessionId?: string;
}
