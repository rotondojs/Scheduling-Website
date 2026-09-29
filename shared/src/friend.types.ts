export interface FriendRequestInfo {
  id: string;
  fromId: string;
  fromUsername: string;
  fromDisplay: string;
  toId: string;
  toUsername: string;
  status: "pending" | "accepted";
  createdAt: string;
}

export interface FriendInfo {
  id: string;
  username: string;
  display: string;
}
