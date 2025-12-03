import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X, Eye, EyeOff, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Props = { open: boolean; onClose: () => void };

function EmailValid(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function GetStartedModal({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { signUp, signIn, resetPassword } = useAuth();
  const [tab, setTab] = useState<"signup" | "login" | "guest">("signup");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

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
      setShowForgotPassword(false);
      setResetEmail("");
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

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
      const { error, message } = await signUp(form.email, form.password);

      if (error) {
        handleError(error.message);
      } else {
        toast.success(message || "Check your email for the verification link!");
        setForm({ name: "", email: "", password: "" });
        setTimeout(() => onClose(), 2000);
      }
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
      const { error } = await signIn(form.email, form.password);

      if (error) {
        handleError(error.message);
      } else {
        toast.success("Welcome back!");
        goToScreener();
      }
    } catch (err: any) {
      handleError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!EmailValid(resetEmail)) return handleError("Please enter a valid email.");

    try {
      setLoading(true);
      const { error, message } = await resetPassword(resetEmail);

      if (error) {
        handleError(error.message);
      } else {
        toast.success(message || "Password reset link sent!");
        setShowForgotPassword(false);
        setResetEmail("");
      }
    } catch (err: any) {
      handleError(err?.message ?? "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const continueGuest = () => goToScreener();

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-3xl rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(2,6,23,0.45)] bg-white"
        role="dialog"
        aria-modal="true"
        aria-label="Get Started"
      >

        {/* HEADER */}
        <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-400">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shadow-md">
              {/* FIXED SVG 1 */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="transform -rotate-12">
                <path d="M3 21s3-1 4-4 3-6 6-6 6 1 6 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10l5-5 3 3-5 5-3-3z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="5" cy="19" r="1.6" fill="white" />
              </svg>
            </div>

            <div>
              <h2 className="text-white text-lg font-semibold truncate">Welcome to ArthaDrishti</h2>
              <p className="text-white/90 text-sm truncate">Powerful screener, made friendly.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="ml-auto inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* BODY */}
        <div className="bg-white p-6 md:p-8 max-h-[82vh] overflow-auto">

          {/* TABS */}
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

            <button
              onClick={() => setTab("guest")}
              className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold transition ${tab === "guest" ? "bg-purple-600 text-white shadow" : "text-purple-600 border border-purple-100 bg-white"}`}
            >
              Continue as Guest
            </button>
          </div>

          {/* CONTENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* LEFT */}
            <div>
              {tab === "guest" ? (
                <div className="space-y-4">
                  <p className="text-gray-700">Try the screener with sample data. Save screens after creating an account.</p>
                  <Button onClick={continueGuest} className="w-full py-2.5 text-base">
                    Continue as Guest
                  </Button>
                  <div className="mt-2 text-center">
                    <button onClick={() => setTab("signup")} className="text-sm text-gray-600 hover:underline">
                      Create account
                    </button>
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </label>
                  )}

                  {/* EMAIL */}
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                    {!EmailValid(form.email) && form.email.length > 0 && (
                      <p className="text-xs text-rose-600 mt-1">Please enter a valid email.</p>
                    )}
                  </label>

                  {/* PASSWORD */}
                  <label className="block">
                    <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" viewBox="0 0 24 24" fill="none">
                          <path d="M12 9v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        Password
                      </div>
                      <span className="text-xs text-gray-500">min 6 chars</span>
                    </div>

                    <div className="relative">
                      <input
                        name="password"
                        type={showPwd ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Create a strong password"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                      >
                        {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {form.password.length > 0 && form.password.length < 6 && (
                      <p className="text-xs text-rose-600 mt-1">Password too short.</p>
                    )}
                  </label>

                  {tab === "login" && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-purple-600 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Button type="submit" className="flex-1 py-2.5" disabled={loading}>
                      {loading ? "Processing..." : tab === "signup" ? "Create account" : "Login"}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setForm({ name: "", email: "", password: "" })}
                      className="px-3 py-2 rounded-lg border text-sm"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="hidden md:block">
              <div className="h-full bg-gradient-to-b from-purple-50 to-white rounded-lg p-4 flex flex-col items-center justify-between border">
                <div className="w-full">
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <h4 className="text-lg font-semibold mb-1">Why create an account?</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Save your screens & filters</li>
                      <li>• Export results to CSV</li>
                      <li>• Personalized watchlists</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  {/* FIXED SVG 2 */}
                  <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
                    <rect x="6" y="20" width="148" height="84" rx="12" fill="#F3E8FF" />
                    <path
                      d="M22 84c18-24 48-24 66-6s44 12 56-6"
                      stroke="#A78BFA"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="132" cy="46" r="6" fill="#8B5CF6" />
                  </svg>

                  <p className="text-xs text-gray-500 mt-3">Fast, visual, and easy — built for retail investors.</p>
                </div>
              </div>
            </div>
          </div>

          {/* FORGOT PASSWORD */}
          {showForgotPassword && (
            <div className="mt-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
              <h3 className="font-semibold mb-2">Reset Password</h3>
              <p className="text-sm mb-3">Enter your email to receive a reset link</p>

              <input
                type="email"
                placeholder="your@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3"
              />

              <div className="flex gap-2">
                <Button onClick={handleForgotPassword} disabled={loading} className="flex-1">
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                  }}
                  className="px-4 py-2 rounded-lg border text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ERROR MSG */}
          {error && (
            <div className="mt-4 text-sm text-rose-600 font-medium flex items-center gap-2">
              {/* FIXED SVG 3 */}
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M12 9v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
              <span>{error}</span>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}
