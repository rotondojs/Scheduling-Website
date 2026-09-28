import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateSession } from "../hooks/useSessions.ts";

const GAMES = [
  "Minecraft",
  "Valorant",
  "League of Legends",
  "Among Us",
  "Fortnite",
  "Elden Ring",
  "Call of Duty",
  "Rocket League",
  "Overwatch 2",
  "Apex Legends",
  "Other",
];

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

export default function NewSession() {
  const navigate = useNavigate();
  const createSession = useCreateSession();

  const [title, setTitle] = useState("");
  const [game, setGame] = useState(GAMES[0]);
  const [customGame, setCustomGame] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const session = await createSession.mutateAsync({
      title,
      game: game === "Other" ? customGame : game,
      description,
      scheduledAt: new Date(scheduledAt).toISOString(),
      maxPlayers,
    });
    navigate(`/sessions/${session.id}`);
  }

  return (
    <div style={{ maxWidth: "560px" }}>
      <h1 style={{ marginTop: 0 }}>Create a Game Session</h1>
      <p style={{ color: "#8b949e", marginBottom: "1.5rem" }}>
        Set up a time to play and let others sign up to join you.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <label style={labelStyle}>
          Session Title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            placeholder="e.g. Friday Night Ranked"
          />
        </label>

        <label style={labelStyle}>
          Game
          <select value={game} onChange={(e) => setGame(e.target.value)} style={inputStyle}>
            {GAMES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        {game === "Other" && (
          <label style={labelStyle}>
            Game Name
            <input
              required
              value={customGame}
              onChange={(e) => setCustomGame(e.target.value)}
              style={inputStyle}
              placeholder="Enter game name"
            />
          </label>
        )}

        <label style={labelStyle}>
          Date & Time
          <input
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          Max Players
          <input
            type="number"
            min={2}
            max={64}
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Any details, requirements, or notes..."
          />
        </label>

        {createSession.error && (
          <p style={{ color: "#f85149", margin: 0 }}>Failed to create session. Try again.</p>
        )}

        <button
          type="submit"
          disabled={createSession.isPending}
          style={{
            background: createSession.isPending ? "#555" : "#238636",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "0.75rem",
            cursor: createSession.isPending ? "not-allowed" : "pointer",
            fontSize: "1rem",
          }}
        >
          {createSession.isPending ? "Creating..." : "Create Session"}
        </button>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  fontSize: "0.875rem",
  color: "#c9d1d9",
};
