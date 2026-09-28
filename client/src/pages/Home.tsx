import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";
import { useSessions } from "../hooks/useSessions.ts";
import dayjs from "dayjs";

export default function Home() {
  const { user } = useAuth();
  const { data: sessions } = useSessions();

  const upcoming = (sessions ?? [])
    .filter((s) => dayjs(s.scheduledAt).isAfter(dayjs()) && s.status !== "cancelled")
    .sort((a, b) => dayjs(a.scheduledAt).diff(dayjs(b.scheduledAt)))
    .slice(0, 6);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Welcome back, {user.display}!</h1>
      <p style={{ color: "#8b949e", marginBottom: "2rem" }}>
        Find a game session or schedule your own.
      </p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <Link to="/sessions/new">
          <button style={primaryBtn}>Create Session</button>
        </Link>
        <Link to="/sessions">
          <button style={secondaryBtn}>Browse All Sessions</button>
        </Link>
        <Link to={`/profile/${user.username}`}>
          <button style={secondaryBtn}>My Calendar</button>
        </Link>
      </div>

      <h2>Upcoming Sessions</h2>
      {upcoming.length === 0 && (
        <p style={{ color: "#8b949e" }}>
          No upcoming sessions.{" "}
          <Link to="/sessions/new" style={{ color: "#58a6ff" }}>
            Create one!
          </Link>
        </p>
      )}

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          marginTop: "1rem",
        }}
      >
        {upcoming.map((s) => (
          <Link key={s.id} to={`/sessions/${s.id}`} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "8px",
                padding: "1rem",
                color: "white",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <strong style={{ fontSize: "1rem" }}>{s.title}</strong>
                <span
                  style={{
                    fontSize: "0.7rem",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    background: s.status === "open" ? "#1a4731" : "#3d1f00",
                    color: s.status === "open" ? "#3fb950" : "#f0883e",
                    whiteSpace: "nowrap",
                    marginLeft: "0.5rem",
                  }}
                >
                  {s.status}
                </span>
              </div>
              <div style={{ color: "#8b949e", fontSize: "0.875rem", marginTop: "0.25rem" }}>{s.game}</div>
              <div style={{ color: "#58a6ff", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                {dayjs(s.scheduledAt).format("MMM D [at] h:mm A")}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem", fontSize: "0.8rem", color: "#8b949e" }}>
                <span>By {s.createdByUsername}</span>
                <span>{s.participants.length}/{s.maxPlayers} players</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  background: "#238636",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "0.5rem 1.25rem",
  cursor: "pointer",
  fontSize: "0.9rem",
};

const secondaryBtn: React.CSSProperties = {
  background: "transparent",
  color: "#c9d1d9",
  border: "1px solid #30363d",
  borderRadius: "6px",
  padding: "0.5rem 1.25rem",
  cursor: "pointer",
  fontSize: "0.9rem",
};
