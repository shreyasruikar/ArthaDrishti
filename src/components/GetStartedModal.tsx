// src/components/GetStartedModal.tsx
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X, Eye, EyeOff, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signup, login as loginFn, getCurrentUser } from "@/lib/auth";

type Props = { open: boolean; onClose: () => void };

function EmailValid(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function GetStartedModal({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signup" | "login" | "guest">("signup");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // lock body scroll while modal open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setForm({ name: "", email: "", password: "" });
      setError(null);
      setShowPwd(false);
      setTab("signup");
    }
  }, [open]);

  // close on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const update = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const goToScreener = () => {
    onClose();
    navigate("/screener");
  };

  const handleError = (msg?: string) => {
    setError(msg ?? "Something went wrong. Try again.");
    setTimeout(() => setError(null), 3500);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EmailValid(form.email)) return handleError("Please enter a valid email.");
    if (form.password.length < 6) return handleError("Password must be at least 6 characters.");
    try {
      setLoading(true);
      await signup(form.name || "User", form.email, form.password);
      await getCurrentUser();
      goToScreener();
    } catch (err: any) {
      handleError(err?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EmailValid(form.email)) return handleError("Please enter a valid email.");
    try {
      setLoading(true);
      await loginFn(form.email, form.password);
      await getCurrentUser();
      goToScreener();
    } catch (err: any) {
      handleError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const continueGuest = () => {
    goToScreener();
  };

  // Portal markup: render to document.body so modal is outside of any parent stacking context
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* full-screen overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      {/* modal card: constrained height with scroll inside when content exceeds viewport */}
      <div
        className="relative z-10 w-full max-w-3xl rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(2,6,23,0.45)]"
        role="dialog"
        aria-modal="true"
        aria-label="Get Started"
      >
        {/* header */}
        <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-400">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shadow-md">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="transform -rotate-12">
                <path d="M3 21s3-1 4-4 3-6 6-6 6 1 6 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10l5-5 3 3-5 5-3-3z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="5" cy="19" r="1.6" fill="white" />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="text-white text-lg font-semibold truncate">Welcome to ArthaDrishti</h2>
              <p className="text-white/90 text-sm truncate">Powerful screener, made friendly.</p>
            </div>
          </div>

          <div className="ml-auto">
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* body with constrained height + internal scroll */}
        <div className="bg-white p-6 md:p-8 max-h-[82vh] overflow-auto">
          {/* tabs */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => setTab("signup")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${tab === "signup" ? "bg-white shadow text-gray-900" : "text-gray-600"}`}
              >
                Sign up
              </button>
              <button
                onClick={() => setTab("login")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${tab === "login" ? "bg-white shadow text-gray-900" : "text-gray-600"}`}
              >
                Login
              </button>
            </div>

            <div className="ml-auto">
              <button
                onClick={() => setTab("guest")}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition ${tab === "guest" ? "bg-blue-600 text-white shadow" : "text-blue-600 border border-blue-100 bg-white"}`}
              >
                Continue as Guest
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {tab === "guest" ? (
                <div className="space-y-4">
                  <p className="text-gray-700">Try the screener with sample data. Save screens after creating an account.</p>
                  <Button onClick={continueGuest} className="w-full py-2.5 text-base">Continue as Guest</Button>
                  <div className="mt-2 text-center">
                    <button onClick={() => setTab("signup")} className="text-sm text-gray-600 hover:underline">Create account</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={tab === "signup" ? handleSignup : handleLogin} className="space-y-4">
                  {tab === "signup" && (
                    <label className="block">
                      <div className="flex items-center text-sm text-gray-700 mb-2">
                        <User className="w-4 h-4 mr-2 text-gray-500" /> Full name
                      </div>
                      <input
                        name="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="How should we call you?"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                      />
                    </label>
                  )}

                  <label className="block">
                    <div className="flex items-center text-sm text-gray-700 mb-2">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" /> Email
                    </div>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@company.com"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                    {!EmailValid(form.email) && form.email.length > 0 && <p className="text-xs text-rose-600 mt-1">Please enter a valid email.</p>}
                  </label>

                  <label className="block">
                    <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" viewBox="0 0 24 24" fill="none"><path d="M12 15v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        Password
                      </div>
                      <div className="text-xs text-gray-500">min 6 chars</div>
                    </div>

                    <div className="relative">
                      <input
                        name="password"
                        type={showPwd ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Create a strong password"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-sky-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-600 hover:bg-gray-100"
                        aria-label={showPwd ? "Hide password" : "Show password"}
                      >
                        {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {form.password.length > 0 && form.password.length < 6 && <p className="text-xs text-rose-600 mt-1">Password too short.</p>}
                  </label>

                  <div className="flex items-center gap-3">
                    <Button type="submit" className="flex-1 py-2.5" disabled={loading}>
                      {loading ? "Processing..." : tab === "signup" ? "Create account" : "Login"}
                    </Button>

                    <button type="button" onClick={() => setForm({ name: "", email: "", password: "" })} className="px-3 py-2 rounded-lg border text-sm text-gray-700 hover:bg-gray-50">Reset</button>
                  </div>

                  <div className="pt-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <span className="flex-1 border-t" />
                      <span className="px-2">or continue with</span>
                      <span className="flex-1 border-t" />
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 hover:shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24"><path d="M21 8.5a8 8 0 1 1-15.9 2.7" stroke="#4285F4" strokeWidth="1.6" fill="none"/></svg>
                        <span className="text-sm">Google</span>
                      </button>
                      <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 hover:shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 3v5" stroke="#1DA1F2" strokeWidth="1.6" fill="none"/></svg>
                        <span className="text-sm">Twitter</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="hidden md:block">
              <div className="h-full bg-gradient-to-b from-sky-50 to-white rounded-lg p-4 flex flex-col items-center justify-between border border-gray-100">
                <div className="w-full">
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Why create an account?</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Save your screens & filters</li>
                      <li>• Export results to CSV</li>
                      <li>• Personalized watchlists</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <svg width="160" height="120" viewBox="0 0 160 120" fill="none" className="mx-auto">
                    <rect x="6" y="20" width="148" height="84" rx="12" fill="#E6F7FF"/>
                    <path d="M22 84c18-24 48-24 66-6s44 12 56-6" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="132" cy="46" r="6" fill="#06B6D4"/>
                  </svg>

                  <p className="text-xs text-gray-500 mt-3">Fast, visual, and easy — built for retail investors.</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 text-sm text-rose-600 font-medium flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" className="text-rose-600"><path d="M12 9v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
