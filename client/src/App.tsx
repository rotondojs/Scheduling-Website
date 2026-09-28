import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AuthContext } from "./contexts/LoginContext.ts";
import LoggedInRoute from "./components/LoggedInRoute.tsx";
import Layout from "./components/Layout.tsx";
import Login from "./pages/Login.tsx";
import Home from "./pages/Home.tsx";
import SessionList from "./pages/SessionList.tsx";
import NewSession from "./pages/NewSession.tsx";
import SessionPage from "./pages/SessionPage.tsx";
import Profile from "./pages/Profile.tsx";
import GameStats from "./pages/GameStats.tsx";
import Groups from "./pages/Groups.tsx";

const STORAGE_KEY = "gameschedule-auth";
const queryClient = new QueryClient();

type PersistedAuth = Pick<AuthContext, "user" | "pass">;

export default function App() {
  const [authState, setAuthState] = useState<PersistedAuth | null>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw) as PersistedAuth;
      return p?.user?.username ? p : null;
    } catch {
      return null;
    }
  });

  const auth: AuthContext | null = authState
    ? { ...authState, reset: () => setAuthState(null) }
    : null;

  useEffect(() => {
    if (authState) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [authState]);

  const setAuth = (next: AuthContext | null) => {
    setAuthState(next ? { user: next.user, pass: next.pass } : null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route
            element={
              <LoggedInRoute auth={auth}>
                <Layout />
              </LoggedInRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/sessions" element={<SessionList />} />
            <Route path="/sessions/new" element={<NewSession />} />
            <Route path="/sessions/:id" element={<SessionPage />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/stats" element={<GameStats />} />
            <Route path="/groups" element={<Groups />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
