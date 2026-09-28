import { createContext } from "react";
import type { UserInfo } from "@gameschedule/shared";

export interface AuthContext {
  user: UserInfo;
  pass: string;
  reset: () => void;
}

export const LoginContext = createContext<AuthContext | null>(null);
