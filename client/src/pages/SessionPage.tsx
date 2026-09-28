import { useParams, Link } from "react-router-dom";
import { useSession, useJoinSession, useLeaveSession } from "../hooks/useSessions.ts";
import { useAuth } from "../hooks/useAuth.ts";
import dayjs from "dayjs";

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: session, isLoading } = useSession(id!);
  const join = useJoinSession();
  const leave = useLeaveSession();

  if (isLoading) return <p style={{ color: "#8b949e" }}>Loading...</p>;
  if (!session) return <p style={{ color: "#f85149" }}>Session not found.</p>;

  const isParticipant = session.participants.includes(user.id);
  const isHost = session.createdBy === user.id;
  const isFull = session.participants.length >= session.maxPlayers;
  const isPast = dayjs(session.scheduledAt).isBefore(dayjs());

  return (
    <div style={{ maxWidth: "640px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>{session.title}</h1>
        <span
          style={{
            padding: "3px 12px",
            borderRadius: "12px",
            fontSize: "0.8rem",
            background: session.status === "open" ? "#1a4731" : session.status === "full" ? "#3d1f00" : "#333",
            color: session.status === "open" ? "#3fb950" : session.status === "full" ? "#f0883e" : "#8b949e",
          }}
        >
          {session.status}
        </span>
      </div>

      <div
        style={{
          marginTop: "1.5rem",
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "8px",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.25rem",
            marginBottom: session.description ? "1.25rem" : 0,
          }}
        >
          <div>
            <div style={labelStyle}>Game</div>
            <div style={{ marginTop: "0.25rem", fontSize: "1.05rem" }}>{session.game}</div>
          </div>
          <div>
            <div style={labelStyle}>When</div>
            <div style={{ color: "#58a6ff", marginTop: "0.25rem" }}>
              {dayjs(session.scheduledAt).format("MMM D, YYYY")}
              <br />
              {dayjs(session.scheduledAt).format("h:mm A")}
            </div>
          </div>
          <div>
            <div style={labelStyle}>Host</div>
            <Link
              to={`/profile/${session.createdByUsername}`}
              style={{ color: "#58a6ff", textDecoration: "none", marginTop: "0.25rem", display: "block" }}
            >
              {session.createdByUsername}
              {isHost && " (you)"}
            </Link>
          </div>
          <div>
            <div style={labelStyle}>Players</div>
            <div style={{ marginTop: "0.25rem" }}>
              {session.participants.length} / {session.maxPlayers}
            </div>
          </div>
        </div>

        {session.description && (
          <div style={{ borderTop: "1px solid #30363d", paddingTop: "1.25rem", color: "#c9d1d9", lineHeight: 1.6 }}>
            {session.description}
          </div>
        )}
      </div>

      {/* Join / Leave button */}
      {!isHost && !isPast && session.status !== "cancelled" && (
        <div style={{ marginTop: "1rem" }}>
          {isParticipant ? (
            <button
              onClick={() => leave.mutate(id!)}
              disabled={leave.isPending}
              style={{
                background: "#b91c1c",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "0.6rem 1.5rem",
                cursor: leave.isPending ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
              }}
            >
              {leave.isPending ? "Leaving..." : "Leave Session"}
            </button>
          ) : (
            <button
              onClick={() => join.mutate(id!)}
              disabled={join.isPending || isFull}
              style={{
                background: isFull ? "#333" : "#238636",
                color: isFull ? "#8b949e" : "white",
                border: "none",
                borderRadius: "6px",
                padding: "0.6rem 1.5rem",
                cursor: isFull || join.isPending ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
              }}
            >
              {isFull ? "Session Full" : join.isPending ? "Joining..." : "Join Session"}
            </button>
          )}
          {isParticipant && (
            <span style={{ marginLeft: "1rem", color: "#3fb950", fontSize: "0.875rem" }}>
              You're in!
            </span>
          )}
        </div>
      )}

      {isPast && (
        <p style={{ marginTop: "1rem", color: "#8b949e", fontSize: "0.875rem" }}>This session has already passed.</p>
      )}

      {/* Participants */}
      <div style={{ marginTop: "2rem" }}>
        <h2 style={{ marginBottom: "0.75rem" }}>
          Players ({session.participants.length}/{session.maxPlayers})
        </h2>
        {session.participants.length === 0 ? (
          <p style={{ color: "#8b949e" }}>No players yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "0.5rem",
            }}
          >
            {session.participants.map((pid) => (
              <div
                key={pid}
                style={{
                  background: pid === user.id ? "#0f3460" : "#161b22",
                  border: `1px solid ${pid === user.id ? "#58a6ff" : "#30363d"}`,
                  borderRadius: "6px",
                  padding: "0.5rem 0.75rem",
                  color: pid === user.id ? "#58a6ff" : "#c9d1d9",
                  fontSize: "0.875rem",
                }}
              >
                {pid === user.id ? "You" : pid.slice(0, 8) + "..."}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  color: "#8b949e",
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};
