import { useState, useRef, useEffect, useCallback } from "react";
import { useGroups, useGroupMessages, useCreateGroup, useSendMessage } from "../hooks/useGroups.ts";
import { useSessions } from "../hooks/useSessions.ts";
import { useFriends } from "../hooks/useFriends.ts";
import { useAuth } from "../hooks/useAuth.ts";
import * as api from "../services/api.ts";
import dayjs from "dayjs";
import type { GroupInfo, MessageInfo, UserInfo } from "@gameschedule/shared";

// ---------------------------------------------------------------------------
// Member search dropdown (friends first, then others)
// ---------------------------------------------------------------------------

function MemberSearchDropdown({
  selected,
  onAdd,
  onRemove,
}: {
  selected: UserInfo[];
  onAdd: (u: UserInfo) => void;
  onRemove: (id: string) => void;
}) {
  const { user } = useAuth();
  const { data: friends = [] } = useFriends();
  const friendIds = new Set(friends.map((f) => f.id));
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserInfo[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedIds = new Set(selected.map((u) => u.id));

  const doSearch = useCallback(async (q: string) => {
    const users = await api.searchUsers(q, user.id);
    setResults(users);
    setOpen(true);
  }, [user.id]);

  useEffect(() => {
    doSearch(query);
  }, [query, doSearch]);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Sort: friends first, then others, both alphabetically
  const sorted = [...results].sort((a, b) => {
    const aFriend = friendIds.has(a.id);
    const bFriend = friendIds.has(b.id);
    if (aFriend && !bFriend) return -1;
    if (!aFriend && bFriend) return 1;
    return a.username.localeCompare(b.username);
  });

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.5rem" }}>
          {selected.map((u) => (
            <span
              key={u.id}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.3rem",
                background: friendIds.has(u.id) ? "#0f3460" : "#21262d",
                border: `1px solid ${friendIds.has(u.id) ? "#58a6ff" : "#30363d"}`,
                borderRadius: "20px", padding: "2px 10px", fontSize: "0.8rem", color: "white",
              }}
            >
              {friendIds.has(u.id) && <span style={{ color: "#3fb950", fontSize: "0.7rem" }}>★</span>}
              {u.username}
              <button
                type="button"
                onClick={() => onRemove(u.id)}
                style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer", padding: 0, fontSize: "0.85rem", lineHeight: 1 }}
              >×</button>
            </span>
          ))}
        </div>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => doSearch(query)}
        placeholder="Search for friends or users to add..."
        style={inputStyle}
        autoComplete="off"
      />

      {open && sorted.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200,
          background: "#161b22", border: "1px solid #30363d", borderRadius: "8px",
          maxHeight: "220px", overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}>
          {sorted.filter((u) => !selectedIds.has(u.id)).map((u) => {
            const isFriend = friendIds.has(u.id);
            return (
              <div
                key={u.id}
                onMouseDown={(e) => { e.preventDefault(); onAdd(u); setQuery(""); }}
                style={{
                  padding: "0.6rem 1rem", cursor: "pointer",
                  borderBottom: "1px solid #21262d",
                  background: "transparent",
                  display: "flex", alignItems: "center", gap: "0.6rem",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#21262d")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {isFriend && (
                  <span style={{ color: "#3fb950", fontSize: "0.75rem", fontWeight: "bold" }}>★</span>
                )}
                <div>
                  <span style={{ fontWeight: isFriend ? "bold" : "normal", color: isFriend ? "#c9d1d9" : "#a0aec0" }}>
                    {u.username}
                  </span>
                  <span style={{ color: "#8b949e", fontSize: "0.8rem", marginLeft: "0.4rem" }}>{u.display}</span>
                  {isFriend && (
                    <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", color: "#3fb950", background: "#1a4731", padding: "1px 6px", borderRadius: "10px" }}>
                      Friend
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// New Group modal
// ---------------------------------------------------------------------------

function NewGroupModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [members, setMembers] = useState<UserInfo[]>([]);
  const createGroup = useCreateGroup();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createGroup.mutateAsync({ name, memberUsernames: members.map((m) => m.username) });
      onClose();
    } catch {
      // error shown below
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "12px", padding: "2rem", width: "440px" }}>
        <h2 style={{ marginTop: 0 }}>New Group Chat</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label style={labelStyle}>
            Group Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Friday Night Squad"
              style={inputStyle}
            />
          </label>
          <div style={labelStyle}>
            Add Members
            <div style={{ marginTop: "0.25rem" }}>
              <MemberSearchDropdown
                selected={members}
                onAdd={(u) => setMembers((prev) => [...prev, u])}
                onRemove={(id) => setMembers((prev) => prev.filter((m) => m.id !== id))}
              />
            </div>
            <div style={{ fontSize: "0.75rem", color: "#8b949e", marginTop: "0.3rem" }}>
              ★ = Friend · Friends appear at the top of results
            </div>
          </div>
          {createGroup.error && (
            <p style={{ color: "#f85149", margin: 0, fontSize: "0.875rem" }}>
              {createGroup.error.message}
            </p>
          )}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={createGroup.isPending} style={submitBtnStyle}>
              {createGroup.isPending ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Session picker modal
// ---------------------------------------------------------------------------

function SessionPickerModal({
  onPick,
  onClose,
}: {
  onPick: (sessionId: string, title: string) => void;
  onClose: () => void;
}) {
  const { data: sessions } = useSessions();
  const { user } = useAuth();
  const mine = (sessions ?? []).filter((s) => s.participants.includes(user.id));

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "12px", padding: "2rem", width: "420px", maxHeight: "60vh", overflowY: "auto" }}>
        <h2 style={{ marginTop: 0 }}>Share a Session</h2>
        {mine.length === 0 && (
          <p style={{ color: "#8b949e" }}>You haven't joined any sessions yet.</p>
        )}
        {mine.map((s) => (
          <div
            key={s.id}
            onClick={() => onPick(s.id, s.title)}
            style={{
              padding: "0.75rem 1rem",
              border: "1px solid #30363d",
              borderRadius: "8px",
              marginBottom: "0.5rem",
              cursor: "pointer",
              background: "#0d1117",
            }}
          >
            <div style={{ fontWeight: "bold" }}>{s.title}</div>
            <div style={{ color: "#8b949e", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              {s.game} · {dayjs(s.scheduledAt).format("MMM D [at] h:mm A")}
            </div>
          </div>
        ))}
        <button onClick={onClose} style={{ ...cancelBtnStyle, marginTop: "0.5rem" }}>Cancel</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single message bubble
// ---------------------------------------------------------------------------

function MessageBubble({ msg, isSelf }: { msg: MessageInfo; isSelf: boolean }) {
  if (msg.type === "session_invite") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: isSelf ? "flex-end" : "flex-start", marginBottom: "0.75rem" }}>
        {!isSelf && <div style={{ fontSize: "0.75rem", color: "#8b949e", marginBottom: "2px" }}>{msg.senderUsername}</div>}
        <div
          style={{
            background: isSelf ? "#0f3460" : "#1a2332",
            border: "1px solid #58a6ff",
            borderRadius: "10px",
            padding: "0.75rem 1rem",
            maxWidth: "320px",
          }}
        >
          <div style={{ fontSize: "0.7rem", color: "#58a6ff", fontWeight: "bold", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Session Invite
          </div>
          <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>{msg.sessionTitle}</div>
          {msg.sessionGame && <div style={{ color: "#8b949e", fontSize: "0.85rem" }}>{msg.sessionGame}</div>}
          {msg.sessionScheduledAt && (
            <div style={{ color: "#58a6ff", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              {dayjs(msg.sessionScheduledAt).format("MMM D [at] h:mm A")}
            </div>
          )}
          {msg.sessionId && (
            <a
              href={`/sessions/${msg.sessionId}`}
              style={{ display: "inline-block", marginTop: "0.5rem", fontSize: "0.8rem", color: "#3fb950", textDecoration: "none" }}
            >
              View Session →
            </a>
          )}
        </div>
        <div style={{ fontSize: "0.7rem", color: "#4a5568", marginTop: "2px" }}>
          {dayjs(msg.createdAt).format("h:mm A")}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isSelf ? "flex-end" : "flex-start", marginBottom: "0.75rem" }}>
      {!isSelf && <div style={{ fontSize: "0.75rem", color: "#8b949e", marginBottom: "2px" }}>{msg.senderUsername}</div>}
      <div
        style={{
          background: isSelf ? "#0f3460" : "#161b22",
          border: `1px solid ${isSelf ? "#1d4ed8" : "#30363d"}`,
          borderRadius: "10px",
          padding: "0.5rem 0.9rem",
          maxWidth: "320px",
          wordBreak: "break-word",
          lineHeight: 1.5,
        }}
      >
        {msg.content}
      </div>
      <div style={{ fontSize: "0.7rem", color: "#4a5568", marginTop: "2px" }}>
        {dayjs(msg.createdAt).format("h:mm A")}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chat panel
// ---------------------------------------------------------------------------

function ChatPanel({ group }: { group: GroupInfo }) {
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useGroupMessages(group.id);
  const sendMessage = useSendMessage(group.id);
  const [text, setText] = useState("");
  const [showSessionPicker, setShowSessionPicker] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text.trim();
    setText("");
    await sendMessage.mutateAsync({ content, type: "text" });
  }

  async function handleShareSession(sessionId: string, title: string) {
    setShowSessionPicker(false);
    await sendMessage.mutateAsync({ content: `Join my session: ${title}`, type: "session_invite", sessionId });
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* Header */}
      <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #30363d", background: "#161b22" }}>
        <div style={{ fontWeight: "bold", fontSize: "1rem" }}>{group.name}</div>
        <div style={{ fontSize: "0.75rem", color: "#8b949e", marginTop: "2px" }}>
          {group.memberUsernames.join(", ")}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
        {isLoading && <p style={{ color: "#8b949e" }}>Loading messages...</p>}
        {!isLoading && messages.length === 0 && (
          <p style={{ color: "#8b949e", textAlign: "center", marginTop: "3rem" }}>No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} isSelf={msg.senderId === user.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid #30363d", background: "#161b22" }}>
        <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, padding: "0.5rem 0.75rem", background: "#0d1117", border: "1px solid #30363d", borderRadius: "8px", color: "white", fontSize: "0.9rem" }}
          />
          <button
            type="button"
            title="Share a session invite"
            onClick={() => setShowSessionPicker(true)}
            style={{
              padding: "0.5rem 0.75rem",
              background: "#1a2332",
              border: "1px solid #58a6ff",
              borderRadius: "8px",
              color: "#58a6ff",
              cursor: "pointer",
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
            }}
          >
            📅 Share Session
          </button>
          <button
            type="submit"
            disabled={!text.trim() || sendMessage.isPending}
            style={{
              padding: "0.5rem 1rem",
              background: text.trim() ? "#238636" : "#333",
              border: "none",
              borderRadius: "8px",
              color: "white",
              cursor: text.trim() ? "pointer" : "not-allowed",
              fontSize: "0.9rem",
            }}
          >
            Send
          </button>
        </form>
        {sendMessage.error && (
          <p style={{ color: "#f85149", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>
            {sendMessage.error.message}
          </p>
        )}
      </div>

      {showSessionPicker && (
        <SessionPickerModal
          onPick={handleShareSession}
          onClose={() => setShowSessionPicker(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Groups page
// ---------------------------------------------------------------------------

export default function Groups() {
  const { data: groups = [], isLoading } = useGroups();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewGroup, setShowNewGroup] = useState(false);

  const selected = groups.find((g) => g.id === selectedId) ?? null;

  // Auto-select first group
  useEffect(() => {
    if (!selectedId && groups.length > 0) setSelectedId(groups[0].id);
  }, [groups, selectedId]);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 57px)", margin: "-1.5rem", overflow: "hidden" }}>
      {/* Group list */}
      <div style={{ width: "240px", minWidth: "240px", borderRight: "1px solid #30363d", display: "flex", flexDirection: "column", background: "#0d1117" }}>
        <div style={{ padding: "1rem", borderBottom: "1px solid #30363d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Group Chats</span>
          <button
            onClick={() => setShowNewGroup(true)}
            title="New group"
            style={{ background: "#238636", border: "none", borderRadius: "6px", color: "white", padding: "0.25rem 0.6rem", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1 }}
          >
            +
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {isLoading && <p style={{ color: "#8b949e", padding: "1rem", fontSize: "0.875rem" }}>Loading...</p>}
          {!isLoading && groups.length === 0 && (
            <p style={{ color: "#8b949e", padding: "1rem", fontSize: "0.875rem" }}>
              No groups yet. Create one!
            </p>
          )}
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedId(g.id)}
              style={{
                display: "block",
                width: "100%",
                padding: "0.75rem 1rem",
                background: selectedId === g.id ? "#161b22" : "transparent",
                border: "none",
                borderLeft: `3px solid ${selectedId === g.id ? "#238636" : "transparent"}`,
                color: selectedId === g.id ? "white" : "#a0aec0",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              <div style={{ fontWeight: selectedId === g.id ? "bold" : "normal" }}>{g.name}</div>
              <div style={{ fontSize: "0.75rem", color: "#4a5568", marginTop: "2px" }}>
                {g.memberUsernames.length} members
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {selected ? (
        <ChatPanel key={selected.id} group={selected} />
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "#8b949e" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💬</div>
            <p>Select a group or create a new one to start chatting.</p>
            <button onClick={() => setShowNewGroup(true)} style={submitBtnStyle}>
              + New Group
            </button>
          </div>
        </div>
      )}

      {showNewGroup && <NewGroupModal onClose={() => setShowNewGroup(false)} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: "0.25rem",
  padding: "0.5rem 0.75rem",
  background: "#0d1117",
  border: "1px solid #30363d",
  borderRadius: "6px",
  color: "white",
  fontSize: "0.9rem",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  fontSize: "0.875rem",
  color: "#c9d1d9",
};

const submitBtnStyle: React.CSSProperties = {
  background: "#238636",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "0.5rem 1.25rem",
  cursor: "pointer",
  fontSize: "0.9rem",
};

const cancelBtnStyle: React.CSSProperties = {
  background: "transparent",
  color: "#c9d1d9",
  border: "1px solid #30363d",
  borderRadius: "6px",
  padding: "0.5rem 1.25rem",
  cursor: "pointer",
  fontSize: "0.9rem",
};
