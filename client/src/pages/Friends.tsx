import { useState } from "react";
import { Link } from "react-router-dom";
import { useFriends, useFriendInbox, useSendFriendRequest, useRespondToRequest, useRemoveFriend } from "../hooks/useFriends.ts";
import type { FriendInfo, FriendRequestInfo } from "@gameschedule/shared";

// ---------------------------------------------------------------------------
// Friends list panel
// ---------------------------------------------------------------------------

function FriendRow({ friend, onRemove }: { friend: FriendInfo; onRemove: () => void }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.75rem 1rem", background: "#161b22", border: "1px solid #30363d",
        borderRadius: "8px", marginBottom: "0.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{
          width: "38px", height: "38px", borderRadius: "50%", background: "#0f3460",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1rem", fontWeight: "bold", color: "#58a6ff", flexShrink: 0,
        }}>
          {friend.display[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{friend.display}</div>
          <Link
            to={`/profile/${friend.username}`}
            style={{ color: "#8b949e", fontSize: "0.8rem", textDecoration: "none" }}
          >
            @{friend.username}
          </Link>
        </div>
      </div>
      <button
        onClick={onRemove}
        style={{
          background: "transparent", border: "1px solid #f85149", borderRadius: "6px",
          color: "#f85149", padding: "0.3rem 0.75rem", cursor: "pointer", fontSize: "0.8rem",
        }}
      >
        Remove
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inbox panel
// ---------------------------------------------------------------------------

function InboxRow({
  req,
  onAccept,
  onReject,
}: {
  req: FriendRequestInfo;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.75rem 1rem", background: "#161b22", border: "1px solid #30363d",
        borderRadius: "8px", marginBottom: "0.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{
          width: "38px", height: "38px", borderRadius: "50%", background: "#1a2332",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1rem", fontWeight: "bold", color: "#58a6ff", flexShrink: 0,
        }}>
          {(req.fromDisplay || req.fromUsername)[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{req.fromDisplay || req.fromUsername}</div>
          <div style={{ color: "#8b949e", fontSize: "0.8rem" }}>@{req.fromUsername}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={onAccept}
          style={{
            background: "#238636", border: "none", borderRadius: "6px",
            color: "white", padding: "0.3rem 0.75rem", cursor: "pointer", fontSize: "0.8rem",
          }}
        >
          Accept
        </button>
        <button
          onClick={onReject}
          style={{
            background: "transparent", border: "1px solid #30363d", borderRadius: "6px",
            color: "#8b949e", padding: "0.3rem 0.75rem", cursor: "pointer", fontSize: "0.8rem",
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add friend search
// ---------------------------------------------------------------------------

function AddFriend() {
  const [query, setQuery] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const sendRequest = useSendFriendRequest();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const username = query.trim();
    if (!username) return;
    try {
      await sendRequest.mutateAsync(username);
      setSent((prev) => [...prev, username]);
      setQuery("");
    } catch {
      // error shown below
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username..."
          style={{
            flex: 1, padding: "0.5rem 0.75rem", background: "#0d1117",
            border: "1px solid #30363d", borderRadius: "6px", color: "white", fontSize: "0.9rem",
          }}
        />
        <button
          type="submit"
          disabled={!query.trim() || sendRequest.isPending}
          style={{
            background: query.trim() ? "#238636" : "#333", border: "none", borderRadius: "6px",
            color: "white", padding: "0.5rem 1rem", cursor: query.trim() ? "pointer" : "not-allowed",
            fontSize: "0.9rem", whiteSpace: "nowrap",
          }}
        >
          {sendRequest.isPending ? "Sending..." : "Add Friend"}
        </button>
      </div>
      {sendRequest.error && (
        <p style={{ color: "#f85149", fontSize: "0.8rem", margin: "0.4rem 0 0" }}>
          {sendRequest.error.message}
        </p>
      )}
      {sent.length > 0 && (
        <p style={{ color: "#3fb950", fontSize: "0.8rem", margin: "0.4rem 0 0" }}>
          Request sent to: {sent.join(", ")}
        </p>
      )}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Friends() {
  const { data: friends = [], isLoading: loadingFriends } = useFriends();
  const { data: inbox = [], isLoading: loadingInbox } = useFriendInbox();
  const removeFriend = useRemoveFriend();
  const respond = useRespondToRequest();

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Friends</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>
        {/* Left: friends list */}
        <div>
          <AddFriend />
          <h2 style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "1rem", color: "#c9d1d9" }}>
            Your Friends ({friends.length})
          </h2>
          {loadingFriends && <p style={{ color: "#8b949e" }}>Loading...</p>}
          {!loadingFriends && friends.length === 0 && (
            <p style={{ color: "#8b949e" }}>No friends yet. Search for a username above to send a request.</p>
          )}
          {friends.map((f) => (
            <FriendRow
              key={f.id}
              friend={f}
              onRemove={() => removeFriend.mutate(f.id)}
            />
          ))}
        </div>

        {/* Right: inbox */}
        <div
          style={{
            background: "#161b22", border: "1px solid #30363d",
            borderRadius: "8px", padding: "1.25rem",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "1rem", color: "#c9d1d9" }}>
            Inbox
            {inbox.length > 0 && (
              <span style={{
                marginLeft: "0.5rem", background: "#238636", borderRadius: "12px",
                padding: "1px 8px", fontSize: "0.75rem", color: "white",
              }}>
                {inbox.length}
              </span>
            )}
          </h2>
          {loadingInbox && <p style={{ color: "#8b949e", fontSize: "0.875rem" }}>Loading...</p>}
          {!loadingInbox && inbox.length === 0 && (
            <p style={{ color: "#8b949e", fontSize: "0.875rem" }}>No pending requests.</p>
          )}
          {inbox.map((req) => (
            <InboxRow
              key={req.id}
              req={req}
              onAccept={() => respond.mutate({ requestId: req.id, action: "accept" })}
              onReject={() => respond.mutate({ requestId: req.id, action: "reject" })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
