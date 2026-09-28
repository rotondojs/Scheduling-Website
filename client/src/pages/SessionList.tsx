import { useState } from "react";
import { Link } from "react-router-dom";
import { useSessions } from "../hooks/useSessions.ts";
import dayjs from "dayjs";

export default function SessionList() {
  const { data: sessions, isLoading } = useSessions();
  const [filter, setFilter] = useState("");
  const [showPast, setShowPast] = useState(false);

  const filtered = (sessions ?? [])
    .filter((s) => s?.title && s?.game)
    .filter((s) => {
      const matchesText =
        s.title.toLowerCase().includes(filter.toLowerCase()) ||
        s.game.toLowerCase().includes(filter.toLowerCase());
      const isFuture = dayjs(s.scheduledAt).isAfter(dayjs());
      return matchesText && (showPast || isFuture);
    })
    .sort((a, b) => dayjs(a.scheduledAt).diff(dayjs(b.scheduledAt)));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0 }}>Game Sessions</h1>
        <Link to="/sessions/new">
          <button
            style={{
              background: "#238636",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            + New Session
          </button>
        </Link>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center" }}>
        <input
          placeholder="Search by title or game..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            flex: 1,
            padding: "0.5rem 0.75rem",
            background: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: "6px",
            color: "white",
            fontSize: "0.9rem",
          }}
        />
        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.875rem", color: "#8b949e", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
          />
          Show past
        </label>
      </div>

      {isLoading && <p style={{ color: "#8b949e" }}>Loading sessions...</p>}

      {!isLoading && filtered.length === 0 && (
        <p style={{ color: "#8b949e" }}>
          No sessions found.{" "}
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
        }}
      >
        {filtered.map((s) => (
          <Link key={s.id} to={`/sessions/${s.id}`} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "8px",
                padding: "1rem",
                color: "white",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <strong>{s.title}</strong>
                <span
                  style={{
                    fontSize: "0.7rem",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    marginLeft: "0.5rem",
                    whiteSpace: "nowrap",
                    background: s.status === "open" ? "#1a4731" : s.status === "full" ? "#3d1f00" : "#333",
                    color: s.status === "open" ? "#3fb950" : s.status === "full" ? "#f0883e" : "#8b949e",
                  }}
                >
                  {s.status}
                </span>
              </div>
              <div style={{ color: "#8b949e", fontSize: "0.875rem", marginTop: "0.25rem" }}>{s.game}</div>
              <div style={{ color: "#58a6ff", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                {dayjs(s.scheduledAt).format("MMM D, YYYY [at] h:mm A")}
              </div>
              {s.description && (
                <div
                  style={{
                    color: "#8b949e",
                    fontSize: "0.8rem",
                    marginTop: "0.5rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {s.description}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "0.75rem",
                  fontSize: "0.8rem",
                  color: "#8b949e",
                }}
              >
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
