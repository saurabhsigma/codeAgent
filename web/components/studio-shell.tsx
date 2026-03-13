"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useWorkspace } from "@/components/providers";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/builder", label: "Builder" },
];

export function StudioShell({
  title,
  eyebrow,
  description,
  children,
  actions,
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const pathname = usePathname();
  const { profile, signOut } = useWorkspace();

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,122,24,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(0,92,255,0.16),transparent_32%)]" />
      <header className="sticky top-0 z-40 border-b border-[var(--border-soft)] bg-[color:var(--header-bg)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-lg text-[var(--accent-contrast)] shadow-[var(--shadow-pill)]">
                S
              </div>
              <div>
                <div className="font-display text-xl leading-none">Studio Forge</div>
                <div className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
                  AI Website Builder
                </div>
              </div>
            </Link>
            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      active
                        ? "bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {profile ? (
              <div className="hidden items-center gap-2 lg:flex">
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-4 py-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-[var(--accent-contrast)]">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="leading-none">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{profile.name}</div>
                    {"email" in profile && (
                      <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                        {(profile as { email: string }).email}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:border-red-400/40 hover:text-red-300"
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-10">
        <section className="overflow-hidden rounded-[36px] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[var(--shadow-panel)]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">
                {eyebrow}
              </p>
              <h1 className="mt-4 font-display text-5xl leading-none text-[var(--text-primary)]">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-[var(--text-secondary)]">
                {description}
              </p>
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </section>

        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
