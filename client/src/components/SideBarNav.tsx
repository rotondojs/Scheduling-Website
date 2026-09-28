import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/sessions", label: "Browse Sessions" },
  { to: "/sessions/new", label: "Create Session" },
];

export default function SideBarNav() {
  return (
    <nav
      style={{
        width: "200px",
        minWidth: "200px",
        background: "#16213e",
        padding: "1.5rem 1rem",
        borderRight: "1px solid #30363d",
      }}
    >
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          style={({ isActive }) => ({
            display: "block",
            padding: "0.6rem 0.75rem",
            marginBottom: "0.25rem",
            borderRadius: "6px",
            color: isActive ? "white" : "#a0aec0",
            background: isActive ? "#0f3460" : "transparent",
            textDecoration: "none",
            fontSize: "0.9rem",
          })}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
