"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useWorkspace } from "@/components/providers";

export function WorkspaceGate({ children }: { children: ReactNode }) {
  const { ready, profile, login, signup } = useWorkspace();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)]">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (profile) {
    return <>{children}</>;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (!name.trim()) { setError("Please enter your name."); return; }
      if (!email.trim()) { setError("Please enter your email."); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
      if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--page-bg)] px-4 py-12">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[var(--accent)] opacity-[0.07] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-[var(--accent)] opacity-[0.05] blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl overflow-hidden rounded-[36px] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[var(--shadow-panel)] lg:grid lg:grid-cols-[1.1fr_0.9fr]">

        {/* ── Left panel: branding ── */}
        <section className="flex flex-col justify-between border-b border-[var(--border-soft)] p-10 lg:border-b-0 lg:border-r">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-xl font-bold text-[var(--accent-contrast)]">
              S
            </div>
            <h1 className="mt-6 font-display text-4xl leading-tight text-[var(--text-primary)] lg:text-5xl">
              Build websites that feel designed,<br className="hidden lg:block" /> not assembled.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
              Sign in to access your full project dashboard — available on any device, any time.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: "⚡", label: "AI generation" },
              { icon: "🎨", label: "Live editor" },
              { icon: "🔗", label: "Shareable previews" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] px-4 py-3 text-sm text-[var(--text-secondary)]"
              >
                <span className="mr-2">{item.icon}</span>{item.label}
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-[var(--text-muted)]">
            Your projects are tied to your account and accessible everywhere.
          </p>
        </section>

        {/* ── Right panel: form ── */}
        <section className="p-8 lg:p-10">
          {/* Tab switcher */}
          <div className="flex gap-1 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-1">
            {(["login", "signup"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => { setMode(tab); setError(""); }}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold capitalize transition-all duration-200 ${
                  mode === tab
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Saurabh Singh"
                  className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-highlight)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete={mode === "login" ? "username" : "email"}
                className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-highlight)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-highlight)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
              />
            </label>

            {mode === "signup" && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Confirm password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-highlight)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
                />
              </label>
            )}

            {error && (
              <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="mt-2 w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--accent-contrast)] transition hover:opacity-90 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? mode === "login" ? "Signing in…" : "Creating account…"
                : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              className="text-[var(--accent)] underline-offset-2 hover:underline"
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </section>
      </div>
    </main>
  );
}
