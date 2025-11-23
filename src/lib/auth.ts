// src/lib/auth.ts
import { supabase } from "@/integrations/supabase/client";

export type User = {
  id: string;
  email?: string | null;
  name?: string | null;
} | null;

const LOCAL_KEY = "user";

export function setStoredUser(u: User) {
  if (u) localStorage.setItem(LOCAL_KEY, JSON.stringify(u));
  else localStorage.removeItem(LOCAL_KEY);
}

export function getStoredUser(): User {
  try {
    const s = localStorage.getItem(LOCAL_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

/**
 * Sign up with email+password. Will attempt to create a profile row as well.
 * Returns the created user object (or null if signup requires email confirmation).
 */
export async function signup(name: string, email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (error) throw error;

  // if user exists immediately (no confirmation required), create profile row
  if (data?.user) {
    try {
      await supabase.from("profiles").insert([{ id: data.user.id, full_name: name }]);
    } catch (e) {
      // non-fatal: if profile row fails, still proceed
      console.warn("profile insert failed", e);
    }

    const user = { id: data.user.id, email: data.user.email, name };
    setStoredUser(user);
    return user;
  }

  // signup may require email confirmation — return null (UI should inform user)
  return null;
}

/** Login with email+password */
export async function login(email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const u = data.user;
  const user = u ? { id: u.id, email: u.email, name: (u.user_metadata as any)?.name } : null;
  setStoredUser(user);
  return user;
}

/** Logout */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) console.warn("Supabase logout error:", error);
  setStoredUser(null);
}

/** Get current user from Supabase session */
export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.warn("getCurrentUser error", error);
    return null;
  }
  if (!data?.user) return null;
  const u = data.user;
  const user = { id: u.id, email: u.email, name: (u.user_metadata as any)?.name };
  setStoredUser(user);
  return user;
}

/** Keep localStorage in sync with auth changes */
supabase.auth.onAuthStateChange((_event, session) => {
  if (!session?.user) {
    setStoredUser(null);
  } else {
    const u = session.user;
    setStoredUser({ id: u.id, email: u.email, name: (u.user_metadata as any)?.name });
  }
});

export { LOCAL_KEY as STORAGE_KEY };
export default { signup, login, logout, getCurrentUser, getStoredUser, setStoredUser };
