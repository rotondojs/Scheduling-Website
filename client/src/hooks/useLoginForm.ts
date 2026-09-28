import { useState } from "react";
import * as api from "../services/api.ts";
import type { AuthContext } from "../contexts/LoginContext.ts";

export function useLoginForm(setAuth: (auth: AuthContext) => void) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [display, setDisplay] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      let user;
      if (isSignup) {
        user = await api.signup(username, password, display);
      } else {
        user = await api.login(username, password);
      }
      setAuth({ user, pass: password, reset: () => {} });
    } catch {
      setError(isSignup ? "Signup failed. Username may be taken." : "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return {
    username, setUsername,
    password, setPassword,
    display, setDisplay,
    isSignup, setIsSignup,
    error, loading, submit,
  };
}
