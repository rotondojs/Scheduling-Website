import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useFriendInbox } from "../hooks/useFriends.ts";
import { useAuth } from "../hooks/useAuth.ts";

const socket = io();

const links = [
  { to: "/", label: "Home" },
  { to: "/sessions", label: "Browse Sessions" },
  { to: "/sessions/new", label: "Create Session" },
  { to: "/groups", label: "Group Chats" },
  { to: "/friends", label: "Friends" },
  { to: "/stats", label: "Game Stats" },
];

export default function SideBarNav() {
  const { user } = useAuth();
  const { data: inbox = [] } = useFriendInbox();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const handler = ({ fromDisplay, fromUsername }: { fromDisplay: string; fromUsername: string }) => {
      const name = fromDisplay || fromUsername;
      setToast(`${name} sent you a friend request!`);
      setTimeout(() => setToast(null), 4000);
    };
    socket.on("friendRequest", handler);
    return () => { socket.off("friendRequest", handler); };
  }, [user.id]);

  return (
    <nav
      style={{
        width: "200px",
        minWidth: "200px",
        background: "#16213e",
        padding: "1.5rem 1rem",
        borderRight: "1px solid #30363d",
        position: "relative",
      }}
    >
      {toast && (
        <div style={{
          position: "fixed",
          bottom: "1.5rem",
          left: "220px",
          background: "#238636",
          color: "white",
          padding: "0.6rem 1rem",
          borderRadius: "8px",
          fontSize: "0.85rem",
          fontWeight: "bold",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          zIndex: 1000,
          animation: "fadeIn 0.2s ease",
        }}>
          {toast}
        </div>
      )}
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end
          style={({ isActive }) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
          {to === "/friends" && inbox.length > 0 && (
            <span style={{
              background: "#238636", borderRadius: "10px", padding: "1px 7px",
              fontSize: "0.7rem", color: "white", fontWeight: "bold",
            }}>
              {inbox.length}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
