import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";

export default function Header() {
  const { user, reset } = useAuth();

  return (
    <header
      style={{
        background: "#1a1a2e",
        color: "white",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #30363d",
      }}
    >
      <Link to="/" style={{ color: "white", textDecoration: "none", fontSize: "1.25rem", fontWeight: "bold" }}>
        GameSchedule
      </Link>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link to={`/profile/${user.username}`} style={{ color: "#a0aec0", textDecoration: "none" }}>
          {user.display}
        </Link>
        <button
          onClick={reset}
          style={{
            background: "transparent",
            color: "#fc8181",
            border: "1px solid #fc8181",
            borderRadius: "4px",
            padding: "0.25rem 0.75rem",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
