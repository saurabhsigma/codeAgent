import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,122,24,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(0,92,255,0.16),transparent_32%)]" />

      <header className="sticky top-0 z-40 border-b border-[var(--border-soft)] bg-[color:var(--header-bg)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Studio Forge</p>
            <h1 className="mt-2 font-display text-3xl">Modern AI Website Builder</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-contrast)]"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[36px] border border-[var(--border-soft)] bg-[var(--surface)] p-10 shadow-[var(--shadow-panel)]">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Ship better websites faster</p>
          <h2 className="mt-4 max-w-2xl font-display text-6xl leading-none">
            Generate premium, editable websites that look agency-made.
          </h2>
          <p className="mt-6 max-w-xl text-base text-[var(--text-secondary)]">
            Build multi-page projects, edit with AI prompts, refine in code, and share live previews.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-contrast)] transition hover:translate-y-[-1px] hover:shadow-[var(--shadow-pill)]"
            >
              Start in Dashboard
            </Link>
            <Link
              href="/builder"
              className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent)]"
            >
              Open Builder
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {[
            "Unified dashboard and builder UI",
            "Live preview + Monaco code editing",
            "AI generation tuned for modern Tailwind-style layouts",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-6 text-[var(--text-secondary)] shadow-[var(--shadow-panel)]"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
