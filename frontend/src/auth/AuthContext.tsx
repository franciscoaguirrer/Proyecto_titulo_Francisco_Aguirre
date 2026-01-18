import { createContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { loginApi, type LoginResponse } from "../api/auth.api";

export type AppUser = LoginResponse["user"];

type AuthContextValue = {
  user: AppUser | null;
  token: string | null;
  isAuthed: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("mt_token");
    const savedUser = localStorage.getItem("mt_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setReady(true);
  }, []);

  async function login(email: string, password: string) {
    const data = await loginApi(email, password);
    localStorage.setItem("mt_token", data.token);
    localStorage.setItem("mt_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("mt_token");
    localStorage.removeItem("mt_user");
    setToken(null);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthed: !!token && !!user,
      ready,
      login,
      logout,
    }),
    [user, token, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}