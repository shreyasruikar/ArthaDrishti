// src/lib/auth.ts
// Future-proof auth service used by UI components.
// - Default: mock auth (localStorage, good for demos)
// - Swap to real backend by setting VITE_USE_MOCK_AUTH=false and providing endpoints.
// - Uses import.meta.env.VITE_API_BASE (optional) as the API base URL.

export type User = {
  id?: string | number;
  name?: string;
  email?: string;
};

const STORAGE_KEY = "user";

// Toggle mock mode via Vite env. Default: true (mock).
const USE_MOCK = (import.meta.env.VITE_USE_MOCK_AUTH ?? "true") === "true";

// Optional API base (for real backend). e.g. VITE_API_BASE=https://api.example.com
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

/* ---------------------------
   LocalStorage helpers
   --------------------------- */
export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
}

/* ---------------------------
   Mock implementations (dev/demo)
   --------------------------- */
async function signupMock(name: string, email: string, password: string): Promise<User> {
  // simulate hashing/DB work
  await new Promise((r) => setTimeout(r, 400));
  const user: User = { id: Date.now(), name: name || "User", email };
  setStoredUser(user);
  return user;
}

async function loginMock(email: string, password: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 350));
  // In mock mode we accept any credentials.
  const user: User = { id: "demo", name: "Demo User", email };
  setStoredUser(user);
  return user;
}

async function logoutMock(): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));
  setStoredUser(null);
}

async function getCurrentUserMock(): Promise<User | null> {
  // immediate return — mimic network slight delay
  await new Promise((r) => setTimeout(r, 80));
  return getStoredUser();
}

/* ---------------------------
   Real API implementations
   (expects typical REST endpoints)
   --------------------------- */
async function signupApi(name: string, email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // include cookies if backend uses them
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Signup failed");
  }
  const data = await res.json();
  // Expecting backend to return { user } or user object
  const user = data.user ?? data;
  setStoredUser(user);
  return user;
}

async function loginApi(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Login failed");
  }
  const data = await res.json();
  const user = data.user ?? data;
  setStoredUser(user);
  return user;
}

async function logoutApi(): Promise<void> {
  // Call logout endpoint to clear server session if exists
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  // ignore body; still clear local cache
  setStoredUser(null);
  if (!res.ok) {
    // optional: throw or just warn
    console.warn("logout API responded with", res.status);
  }
}

async function getCurrentUserApi(): Promise<User | null> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    return null;
  }
  const data = await res.json();
  const user = data.user ?? data;
  setStoredUser(user);
  return user;
}

/* ---------------------------
   Public exported functions
   - UI code should call these and not worry about implementation.
   - When ready to switch to real backend: set VITE_USE_MOCK_AUTH=false and configure VITE_API_BASE
   --------------------------- */

export async function signup(name: string, email: string, password: string): Promise<User> {
  if (USE_MOCK) return signupMock(name, email, password);
  return signupApi(name, email, password);
}

export async function login(email: string, password: string): Promise<User> {
  if (USE_MOCK) return loginMock(email, password);
  return loginApi(email, password);
}

export async function logout(): Promise<void> {
  if (USE_MOCK) return logoutMock();
  return logoutApi();
}

export async function getCurrentUser(): Promise<User | null> {
  if (USE_MOCK) return getCurrentUserMock();
  return getCurrentUserApi();
}

/* ---------------------------
   Small convenience export
   --------------------------- */
export { STORAGE_KEY };
export default {
  signup,
  login,
  logout,
  getCurrentUser,
  getStoredUser,
  setStoredUser,
};
