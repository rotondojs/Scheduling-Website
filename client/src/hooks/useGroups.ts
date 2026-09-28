import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io } from "socket.io-client";
import * as api from "../services/api.ts";
import { useAuth } from "./useAuth.ts";
import type { MessageInfo } from "@gameschedule/shared";

const socket = io();

export function useGroups() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["groups", user.id],
    queryFn: () => api.getUserGroups(user.id),
  });
}

export function useGroupMessages(groupId: string) {
  const qc = useQueryClient();

  useEffect(() => {
    socket.emit("groupWatch", groupId);
    const handler = (msg: MessageInfo) => {
      qc.setQueryData<MessageInfo[]>(["group-messages", groupId], (prev) =>
        prev ? [...prev, msg] : [msg]
      );
    };
    socket.on("groupMessage", handler);
    return () => {
      socket.emit("groupUnwatch", groupId);
      socket.off("groupMessage", handler);
    };
  }, [groupId, qc]);

  return useQuery({
    queryKey: ["group-messages", groupId],
    queryFn: () => api.getGroupMessages(groupId),
    enabled: !!groupId,
  });
}

export function useCreateGroup() {
  const { user, pass } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, memberUsernames }: { name: string; memberUsernames: string[] }) =>
      api.createGroup(name, memberUsernames, user.username, pass),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups", user.id] }),
  });
}

export function useSendMessage(groupId: string) {
  const { user, pass } = useAuth();
  return useMutation({
    mutationFn: ({
      content,
      type,
      sessionId,
    }: {
      content: string;
      type: "text" | "session_invite";
      sessionId?: string;
    }) => api.sendGroupMessage(groupId, content, type, user.username, pass, sessionId),
  });
}
