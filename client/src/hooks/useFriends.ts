import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io } from "socket.io-client";
import * as api from "../services/api.ts";
import { useAuth } from "./useAuth.ts";

const socket = io();

export function useFriends() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["friends", user.id],
    queryFn: () => api.getFriends(user.id),
  });
}

export function useFriendInbox() {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    socket.emit("userWatch", user.id);
    const handler = () => {
      qc.invalidateQueries({ queryKey: ["friend-inbox", user.id] });
    };
    socket.on("friendRequest", handler);
    return () => {
      socket.emit("userUnwatch", user.id);
      socket.off("friendRequest", handler);
    };
  }, [user.id, qc]);

  return useQuery({
    queryKey: ["friend-inbox", user.id],
    queryFn: () => api.getFriendInbox(user.id),
  });
}

export function useSendFriendRequest() {
  const { user, pass } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (toUsername: string) => api.sendFriendRequest(toUsername, user.username, pass),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friends", user.id] }),
  });
}

export function useRespondToRequest() {
  const { user, pass } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, action }: { requestId: string; action: "accept" | "reject" }) =>
      api.respondToFriendRequest(requestId, action, user.username, pass),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friend-inbox", user.id] });
      qc.invalidateQueries({ queryKey: ["friends", user.id] });
    },
  });
}

export function useRemoveFriend() {
  const { user, pass } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (friendId: string) => api.removeFriend(friendId, user.username, pass),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friends", user.id] }),
  });
}
