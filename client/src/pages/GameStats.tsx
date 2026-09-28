import { useState } from "react";
import {
  useGameStats,
  type GameKey,
  type FortniteData,
  type FortniteStatSet,
  type SteamData,
  type ApexData,
} from "../hooks/useGameStats.ts";

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

const GAMES: { key: GameKey; label: string; color: string }[] = [
  { key: "fortnite", label: "Fortnite", color: "#5865f2" },
  { key: "apex", label: "Apex Legends", color: "#e23b2e" },
  { key: "steam", label: "Steam", color: "#1b2838" },
];

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const cardStyle: React.CSSProperties = {
  background: "#161b22",
  border: "1px solid #30363d",
  borderRadius: "8px",
  padding: "1.25rem",
  textAlign: "center",
};

const inputStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  background: "#0d1117",
  border: "1px solid #30363d",
  borderRadius: "6px",
  color: "white",
  fontSize: "0.9rem",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

// ---------------------------------------------------------------------------
// Stat card component
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#58a6ff" }}>{value}</div>
      <div style={{ color: "#c9d1d9", fontSize: "0.875rem", marginTop: "0.25rem" }}>{label}</div>
      {sub && <div style={{ color: "#8b949e", fontSize: "0.75rem", marginTop: "0.125rem" }}>{sub}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mode breakdown table (Fortnite)
// ---------------------------------------------------------------------------

function ModeRow({ label, s }: { label: string; s?: FortniteStatSet }) {
  if (!s || s.matches === 0) return null;
  return (
    <tr>
      <td style={tdStyle}>{label}</td>
      <td style={tdStyle}>{s.matches.toLocaleString()}</td>
      <td style={tdStyle}>{s.wins.toLocaleString()}</td>
      <td style={tdStyle}>{s.winRate.toFixed(1)}%</td>
      <td style={tdStyle}>{s.kills.toLocaleString()}</td>
      <td style={tdStyle}>{s.kd.toFixed(2)}</td>
      <td style={tdStyle}>{s.killsPerMatch.toFixed(2)}</td>
    </tr>
  );
}

const thStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  textAlign: "left",
  color: "#8b949e",
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid #30363d",
};

const tdStyle: React.CSSProperties = {
  padding: "0.6rem 0.75rem",
  borderBottom: "1px solid #21262d",
  fontSize: "0.875rem",
  color: "#c9d1d9",
};

// ---------------------------------------------------------------------------
// Fortnite search + results
// ---------------------------------------------------------------------------

function FortniteSearch({ onSearch }: { onSearch: (p: Record<string, string>) => void }) {
  const [username, setUsername] = useState("");
  const [platform, setPlatform] = useState("epic");
  const [timeWindow, setTimeWindow] = useState("lifetime");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username.trim()) onSearch({ username: username.trim(), platform, timeWindow });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label style={{ fontSize: "0.8rem", color: "#8b949e" }}>Epic / PSN / Xbox Username</label>
        <input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. Ninja"
          style={{ ...inputStyle, width: "220px" }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label style={{ fontSize: "0.8rem", color: "#8b949e" }}>Platform</label>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={selectStyle}>
          <option value="epic">Epic Games</option>
          <option value="psn">PlayStation</option>
          <option value="xbl">Xbox</option>
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label style={{ fontSize: "0.8rem", color: "#8b949e" }}>Time Window</label>
        <select value={timeWindow} onChange={(e) => setTimeWindow(e.target.value)} style={selectStyle}>
          <option value="lifetime">Lifetime</option>
          <option value="season">This Season</option>
        </select>
      </div>
      <button
        type="submit"
        style={{
          padding: "0.5rem 1.25rem",
          background: "#5865f2",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "0.9rem",
        }}
      >
        Search
      </button>
    </form>
  );
}

function FortniteResults({ data }: { data: FortniteData }) {
  const overall = data.stats.all.overall;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2 style={{ marginTop: 0 }}>
        {data.account.name}
        <span style={{ color: "#8b949e", fontSize: "1rem", fontWeight: "normal", marginLeft: "0.75rem" }}>
          Fortnite
        </span>
      </h2>

      {/* Overall stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: "0.75rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard label="Wins" value={overall.wins.toLocaleString()} />
        <StatCard label="K/D Ratio" value={overall.kd.toFixed(2)} />
        <StatCard label="Win Rate" value={`${overall.winRate.toFixed(1)}%`} />
        <StatCard label="Matches" value={overall.matches.toLocaleString()} />
        <StatCard label="Kills" value={overall.kills.toLocaleString()} />
        <StatCard label="Kills/Match" value={overall.killsPerMatch.toFixed(2)} />
        <StatCard
          label="Hours Played"
          value={Math.round(overall.minutesPlayed / 60).toLocaleString()}
          sub="hours"
        />
        <StatCard label="Players Outlived" value={overall.playersOutlived.toLocaleString()} />
      </div>

      {/* Mode breakdown */}
      <h3>Mode Breakdown</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#161b22",
                        border: "1px solid #30363d", borderRadius: "8px" }}>
          <thead>
            <tr>
              {["Mode", "Matches", "Wins", "Win %", "Kills", "K/D", "K/Match"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <ModeRow label="Solo" s={data.stats.all.solo} />
            <ModeRow label="Duo" s={data.stats.all.duo} />
            <ModeRow label="Trio" s={data.stats.all.trio} />
            <ModeRow label="Squad" s={data.stats.all.squad} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Steam search + results
// ---------------------------------------------------------------------------

function SteamSearch({ onSearch }: { onSearch: (p: Record<string, string>) => void }) {
  const [steamId, setSteamId] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (steamId.trim()) onSearch({ steamId: steamId.trim() });
  }

  return (
    <div>
      <div
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1.25rem",
          fontSize: "0.875rem",
          color: "#8b949e",
        }}
      >
        <strong style={{ color: "#c9d1d9" }}>How to find your Steam ID64:</strong>
        <ol style={{ marginTop: "0.5rem", marginBottom: 0, paddingLeft: "1.25rem", lineHeight: 1.7 }}>
          <li>Go to your Steam profile page</li>
          <li>Click <strong style={{ color: "#c9d1d9" }}>Edit Profile</strong></li>
          <li>Your Steam ID64 is the long number in the URL (e.g. 76561198xxxxxxxxx)</li>
          <li>Or use a site like steamid.io to look it up by username</li>
        </ol>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.8rem", color: "#8b949e" }}>Steam ID64</label>
          <input
            required
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
            placeholder="e.g. 76561198xxxxxxxxx"
            style={{ ...inputStyle, width: "260px" }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "0.5rem 1.25rem",
            background: "#1b2838",
            color: "white",
            border: "1px solid #4c6b9b",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Search
        </button>
      </form>
    </div>
  );
}

const personaStates: Record<number, string> = {
  0: "Offline", 1: "Online", 2: "Busy", 3: "Away", 4: "Snooze",
  5: "Looking to trade", 6: "Looking to play",
};

function SteamResults({ data }: { data: SteamData }) {
  const players = data.response.players;
  if (players.length === 0) {
    return <p style={{ color: "#f85149", marginTop: "1.5rem" }}>Player not found or profile is private.</p>;
  }
  const player = players[0];
  const isOnline = player.personastate !== 0;

  return (
    <div style={{ marginTop: "2rem" }}>
      <div
        style={{
          display: "flex",
          gap: "1.25rem",
          alignItems: "center",
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "8px",
          padding: "1.25rem",
        }}
      >
        <img
          src={player.avatarmedium}
          alt={player.personaname}
          style={{ width: "64px", height: "64px", borderRadius: "6px" }}
        />
        <div>
          <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{player.personaname}</div>
          <div
            style={{
              marginTop: "0.25rem",
              fontSize: "0.875rem",
              color: isOnline ? "#3fb950" : "#8b949e",
            }}
          >
            {personaStates[player.personastate] ?? "Unknown"}
            {player.gameextrainfo && (
              <span style={{ color: "#58a6ff", marginLeft: "0.5rem" }}>
                playing {player.gameextrainfo}
              </span>
            )}
          </div>
          {player.loccountrycode && (
            <div style={{ fontSize: "0.8rem", color: "#8b949e", marginTop: "0.25rem" }}>
              {player.loccountrycode}
            </div>
          )}
          {player.timecreated && (
            <div style={{ fontSize: "0.8rem", color: "#8b949e", marginTop: "0.25rem" }}>
              Member since {new Date(player.timecreated * 1000).getFullYear()}
            </div>
          )}
        </div>
        <a
          href={player.profileurl}
          target="_blank"
          rel="noreferrer"
          style={{
            marginLeft: "auto",
            padding: "0.4rem 1rem",
            background: "#1b2838",
            color: "#66c0f4",
            border: "1px solid #4c6b9b",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "0.875rem",
          }}
        >
          View Profile
        </a>
      </div>
      <p style={{ color: "#8b949e", fontSize: "0.875rem", marginTop: "1rem" }}>
        Steam's public API returns basic profile info. For per-game stats, enable per-game API
        endpoints (e.g. <code>GetUserStatsForGame</code>) using the game's AppID.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Apex Legends search + results
// ---------------------------------------------------------------------------

function ApexSearch({ onSearch }: { onSearch: (p: Record<string, string>) => void }) {
  const [username, setUsername] = useState("");
  const [platform, setPlatform] = useState("PC");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username.trim()) onSearch({ username: username.trim(), platform });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label style={{ fontSize: "0.8rem", color: "#8b949e" }}>Username</label>
        <input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. Shroud"
          style={{ ...inputStyle, width: "220px" }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label style={{ fontSize: "0.8rem", color: "#8b949e" }}>Platform</label>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={selectStyle}>
          <option value="PC">PC (Origin/EA)</option>
          <option value="PS4">PlayStation</option>
          <option value="X1">Xbox</option>
          <option value="SWITCH">Switch</option>
        </select>
      </div>
      <button
        type="submit"
        style={{
          padding: "0.5rem 1.25rem",
          background: "#e23b2e",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "0.9rem",
        }}
      >
        Search
      </button>
    </form>
  );
}

function ApexResults({ data }: { data: ApexData }) {
  const g = data.global;
  const selected = data.legends.selected;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2 style={{ marginTop: 0 }}>
        {g.name}
        <span style={{ color: "#8b949e", fontSize: "1rem", fontWeight: "normal", marginLeft: "0.75rem" }}>
          {g.platform} — Level {g.level.value}
        </span>
      </h2>

      {/* Rank + Level */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: "0.75rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard label="Level" value={g.level.value.toLocaleString()} />
        <StatCard label="Rank" value={g.rank.rankName} sub={`Div ${g.rank.rankDiv}`} />
        <StatCard label="Rank Score" value={g.rank.rankScore.toLocaleString()} />
        <StatCard label="Battle Pass" value={`Level ${g.battlepass.level.value}`} />
        {data.total &&
          Object.entries(data.total)
            .slice(0, 4)
            .map(([key, stat]) => (
              <StatCard key={key} label={stat.name} value={stat.value.toLocaleString()} />
            ))}
      </div>

      {/* Selected legend */}
      {selected && (
        <div>
          <h3>Selected Legend: {selected.LegendName}</h3>
          {selected.data && selected.data.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {selected.data.map((stat) => (
                <StatCard key={stat.key} label={stat.name} value={stat.value.toLocaleString()} />
              ))}
            </div>
          ) : (
            <p style={{ color: "#8b949e" }}>No tracker data for this legend.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Setup notice for games that need an API key
// ---------------------------------------------------------------------------

function SetupNotice({ game, error }: { game: GameKey; error: string }) {
  const isKeyError = error.includes("not configured");
  if (!isKeyError) return null;

  const links: Record<GameKey, string> = {
    fortnite: "https://fortnite-api.com",
    steam: "https://steamcommunity.com/dev/apikey",
    apex: "https://apexlegendsapi.com",
  };

  return (
    <div
      style={{
        background: "#1a2332",
        border: "1px solid #58a6ff",
        borderRadius: "8px",
        padding: "1rem 1.25rem",
        marginTop: "1rem",
        fontSize: "0.875rem",
        color: "#c9d1d9",
        lineHeight: 1.7,
      }}
    >
      <strong style={{ color: "#58a6ff" }}>API Key Setup Required</strong>
      <ol style={{ marginTop: "0.5rem", marginBottom: 0, paddingLeft: "1.25rem" }}>
        <li>
          Get a free API key at{" "}
          <a href={links[game]} target="_blank" rel="noreferrer" style={{ color: "#58a6ff" }}>
            {links[game]}
          </a>
        </li>
        <li>
          Create or open <code style={{ color: "#f0883e" }}>server/.env</code>
        </li>
        <li>
          Add:{" "}
          <code style={{ color: "#3fb950" }}>
            {game.toUpperCase()}_API_KEY=your_key_here
          </code>
        </li>
        <li>Restart the server</li>
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function GameStats() {
  const { game, setGame, loading, error, data, searched, search } = useGameStats();

  const activeGame = GAMES.find((g) => g.key === game)!;

  return (
    <div style={{ maxWidth: "860px" }}>
      <h1 style={{ marginTop: 0 }}>Game Stats</h1>
      <p style={{ color: "#8b949e", marginBottom: "1.5rem" }}>
        Look up player stats across multiple games.
      </p>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid #30363d", paddingBottom: "0" }}>
        {GAMES.map((g) => (
          <button
            key={g.key}
            onClick={() => setGame(g.key)}
            style={{
              padding: "0.6rem 1.25rem",
              background: "transparent",
              color: game === g.key ? "white" : "#8b949e",
              border: "none",
              borderBottom: game === g.key ? `2px solid ${g.color}` : "2px solid transparent",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: game === g.key ? "bold" : "normal",
              marginBottom: "-1px",
              transition: "color 0.15s",
            }}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Search form */}
      <div
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "8px",
          padding: "1.25rem",
          marginBottom: "1rem",
        }}
      >
        {game === "fortnite" && <FortniteSearch onSearch={search} />}
        {game === "steam" && <SteamSearch onSearch={search} />}
        {game === "apex" && <ApexSearch onSearch={search} />}
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ color: "#8b949e" }}>Loading stats for {activeGame.label}...</p>
      )}

      {/* Error */}
      {error && !loading && (
        <div>
          <p style={{ color: "#f85149", margin: 0 }}>{error}</p>
          <SetupNotice game={game} error={error} />
        </div>
      )}

      {/* No results */}
      {searched && !loading && !error && !data && (
        <p style={{ color: "#8b949e" }}>No results found.</p>
      )}

      {/* Results */}
      {!loading && !error && data && (
        <>
          {game === "fortnite" && <FortniteResults data={data as FortniteData} />}
          {game === "steam" && <SteamResults data={data as import("../hooks/useGameStats.ts").SteamData} />}
          {game === "apex" && <ApexResults data={data as ApexData} />}
        </>
      )}
    </div>
  );
}
