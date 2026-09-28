import { Navigate } from "react-router-dom";
import type { AuthContext } from "../contexts/LoginContext.ts";
import { LoginContext } from "../contexts/LoginContext.ts";

interface Props {
  auth: AuthContext | null;
  children: React.ReactNode;
}

export default function LoggedInRoute({ auth, children }: Props) {
  if (!auth) return <Navigate to="/login" replace />;
  return <LoginContext.Provider value={auth}>{children}</LoginContext.Provider>;
}
