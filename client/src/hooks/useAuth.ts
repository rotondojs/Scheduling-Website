import { useContext } from "react";
import { LoginContext } from "../contexts/LoginContext.ts";

export function useAuth() {
  const ctx = useContext(LoginContext);
  if (!ctx) throw new Error("useAuth must be used inside LoginContext");
  return ctx;
}
