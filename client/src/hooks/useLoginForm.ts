import { useState } from "react";
import * as api from "../services/api.ts";
import type { AuthContext } from "../contexts/LoginContext.ts";

export function useLoginForm(setAuth: (auth: AuthContext) => void) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [display, setDisplay] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setSuccess(null);

    if (isSignup) {
      if (username.length < 3) return setError("Username must be at least 3 characters.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");
      if (!display.trim()) return setError("Display name is required.");
    }

    setLoading(true);
    try {
      if (isSignup) {
        await api.signup(username, password, display);
        setIsSignup(false);
        setDisplay("");
        setPassword("");
        setSuccess("Account created! Please sign in.");
      } else {
        const user = await api.login(username, password);
        setAuth({ user, pass: password, reset: () => {} });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return {
    username, setUsername,
    password, setPassword,
    display, setDisplay,
    isSignup, setIsSignup,
    error, success, loading, submit,
  };
}
