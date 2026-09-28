import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useUserSessions } from "../hooks/useSessions.ts";
import { useAuth } from "../hooks/useAuth.ts";
import * as api from "../services/api.ts";
import CalendarView from "../components/CalendarView.tsx";
import dayjs from "dayjs";

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user: self } = useAuth();

  const { data: profileUser, isLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: () => api.getUserByUsername(username!),
  });

  const { data: sessions } = useUserSessions(profileUser?.id ?? "");

  if (isLoading) return <p style={{ color: "#8b949e" }}>Loading profile...</p>;
  if (!profileUser) return <p style={{ color: "#f85149" }}>User not found.</p>;

  const isOwnProfile = self.username === username;

  const upcomingSessions = (sessions ?? [])
    .filter((s) => dayjs(s.scheduledAt).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.scheduledAt).diff(dayjs(b.scheduledAt)));

  return (
    <div>
      {/* Profile header */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          alignItems: "center",
          marginBottom: "2rem",
          padding: "1.5rem",
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "#0f3460",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.75rem",
            fontWeight: "bold",
            color: "#58a6ff",
            flexShrink: 0,
          }}
        >
          {profileUser.display[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{profileUser.display}</h1>
          <div style={{ color: "#8b949e", marginTop: "0.25rem" }}>@{profileUser.username}</div>
          {profileUser.bio && (
            <p style={{ marginTop: "0.5rem", color: "#c9d1d9", marginBottom: 0 }}>{profileUser.bio}</p>
          )}
          <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#8b949e" }}>
            Joined {dayjs(profileUser.createdAt).format("MMMM YYYY")}
          </div>
        </div>
        {isOwnProfile && (
          <div style={{ fontSize: "0.875rem", color: "#8b949e" }}>Your profile</div>
        )}
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard label="Total Sessions" value={(sessions ?? []).length} />
        <StatCard label="Upcoming" value={upcomingSessions.length} />
      </div>

      {/* Calendar */}
      <h2>
        {isOwnProfile ? "Your" : `${profileUser.display}'s`} Schedule
      </h2>
      <div
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "8px",
          padding: "1.5rem",
          marginTop: "1rem",
        }}
      >
        <CalendarView sessions={sessions ?? []} />
      </div>

      {/* Upcoming list */}
      {upcomingSessions.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Upcoming Sessions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {upcomingSessions.map((s) => (
              <Link
                key={s.id}
                to={`/sessions/${s.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 1rem",
                  background: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "white",
                  textDecoration: "none",
                }}
              >
                <div>
                  <strong>{s.title}</strong>
                  <span style={{ color: "#8b949e", marginLeft: "0.75rem", fontSize: "0.875rem" }}>
                    {s.game}
                  </span>
                </div>
                <div style={{ color: "#58a6ff", fontSize: "0.875rem" }}>
                  {dayjs(s.scheduledAt).format("MMM D [at] h:mm A")}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: "#161b22",
        border: "1px solid #30363d",
        borderRadius: "8px",
        padding: "1rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#58a6ff" }}>{value}</div>
      <div style={{ color: "#8b949e", fontSize: "0.8rem", marginTop: "0.25rem" }}>{label}</div>
    </div>
  );
}
