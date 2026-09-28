import { createRepo } from "./keyv.ts";
import type { AuthRecord, UserRecord, SessionRecord, GroupRecord, MessageRecord } from "./models.ts";

export const AuthRepo = createRepo<AuthRecord>("auth");
export const UserRepo = createRepo<UserRecord>("user");
export const SessionRepo = createRepo<SessionRecord>("session");
export const GroupRepo = createRepo<GroupRecord>("group");
export const MessageRepo = createRepo<MessageRecord>("message");
