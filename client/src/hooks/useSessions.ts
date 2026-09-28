import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../services/api.ts";
import { useAuth } from "./useAuth.ts";
import type { CreateSessionRequest } from "@gameschedule/shared";

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: api.getSessions,
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ["session", id],
    queryFn: () => api.getSession(id),
  });
}

export function useUserSessions(userId: string) {
  return useQuery({
    queryKey: ["sessions", "user", userId],
    queryFn: () => api.getUserSessions(userId),
    enabled: !!userId,
  });
}

export function useCreateSession() {
  const { user, pass, reset } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateSessionRequest) => api.createSession(req, user.username, pass),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
    onError: (err: Error) => {
      // If the server says our credentials are invalid (e.g. server restarted and
      // lost in-memory data), log the user out so they can sign in again fresh.
      if (err.message === "Unauthorized") {
        reset();
      }
    },
  });
}

export function useJoinSession() {
  const { user, pass } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.joinSession(id, user.username, pass),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["session", id] });
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["sessions", "user", user.id] });
    },
  });
}

export function useLeaveSession() {
  const { user, pass } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.leaveSession(id, user.username, pass),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["session", id] });
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["sessions", "user", user.id] });
    },
  });
}
