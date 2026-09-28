import { useNavigate } from "react-router-dom";
import type { AuthContext } from "../contexts/LoginContext.ts";
import { useLoginForm } from "../hooks/useLoginForm.ts";

interface Props {
  setAuth: (auth: AuthContext) => void;
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "0.5rem",
  marginTop: "0.25rem",
  background: "#0d1117",
  border: "1px solid #30363d",
  borderRadius: "6px",
  color: "white",
  fontSize: "1rem",
  boxSizing: "border-box",
};

export default function Login({ setAuth }: Props) {
  const navigate = useNavigate();

  function handleSetAuth(auth: AuthContext) {
    setAuth(auth);
    navigate("/");
  }

  const form = useLoginForm(handleSetAuth);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#0d1117",
      }}
    >
      <div
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
          padding: "2rem",
          borderRadius: "12px",
          width: "360px",
          color: "white",
        }}
      >
        <h1 style={{ textAlign: "center", marginTop: 0, marginBottom: "0.5rem" }}>GameSchedule</h1>
        <p style={{ textAlign: "center", color: "#8b949e", marginBottom: "1.5rem", marginTop: 0 }}>
          Schedule game sessions with friends
        </p>

        <h2 style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "1rem", color: "#c9d1d9" }}>
          {form.isSignup ? "Create an Account" : "Sign In"}
        </h2>

        {form.isSignup && (
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.875rem" }}>
              Display Name
              <input
                value={form.display}
                onChange={(e) => form.setDisplay(e.target.value)}
                style={inputStyle}
                placeholder="Your name"
              />
            </label>
          </div>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "0.875rem" }}>
            Username
            <input
              value={form.username}
              onChange={(e) => form.setUsername(e.target.value)}
              style={inputStyle}
              placeholder={form.isSignup ? "at least 3 characters" : "username"}
              autoComplete="username"
            />
          </label>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ fontSize: "0.875rem" }}>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => form.setPassword(e.target.value)}
              style={inputStyle}
              placeholder={form.isSignup ? "at least 6 characters" : "password"}
              autoComplete={form.isSignup ? "new-password" : "current-password"}
            />
          </label>
        </div>

        {form.error && (
          <p style={{ color: "#f85149", marginBottom: "1rem", fontSize: "0.875rem" }}>{form.error}</p>
        )}

        <button
          onClick={form.submit}
          disabled={form.loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: form.loading ? "#555" : "#238636",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: form.loading ? "not-allowed" : "pointer",
            fontSize: "1rem",
          }}
        >
          {form.loading ? "Loading..." : form.isSignup ? "Sign Up" : "Sign In"}
        </button>

        <button
          onClick={() => form.setIsSignup(!form.isSignup)}
          style={{
            width: "100%",
            marginTop: "0.75rem",
            background: "transparent",
            color: "#8b949e",
            border: "1px solid #30363d",
            borderRadius: "6px",
            padding: "0.5rem",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          {form.isSignup ? "Already have an account? Sign in" : "No account? Sign up"}
        </button>
      </div>
    </div>
  );
}
