import { createRepo } from "./keyv.ts";
import type { AuthRecord, UserRecord, SessionRecord, GroupRecord, MessageRecord, FriendRecord } from "./models.ts";

export const AuthRepo = createRepo<AuthRecord>("auth");
export const UserRepo = createRepo<UserRecord>("user");
export const SessionRepo = createRepo<SessionRecord>("session");
export const GroupRepo = createRepo<GroupRecord>("group");
export const MessageRepo = createRepo<MessageRecord>("message");
export const FriendRepo = createRepo<FriendRecord>("friend");
