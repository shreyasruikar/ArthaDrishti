// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, login as loginFn, signup as signupFn, logout as logoutFn, getStoredUser } from "@/lib/auth";

type User = { id?: string | number; name?: string; email?: string } | null;
type Ctx = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<Ctx | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const u = await getCurrentUser();
      setUser(u);
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    await loginFn(email, password);
    const u = await getCurrentUser();
    setUser(u);
    setLoading(false);
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    await signupFn(name, email, password);
    const u = await getCurrentUser();
    setUser(u);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await logoutFn();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}
