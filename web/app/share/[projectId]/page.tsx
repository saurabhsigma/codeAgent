"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { getPreviewUrl, getPublicProject, type ProjectResponse } from "@/lib/api";

export default function SharedProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const data = await getPublicProject(params.projectId);
        setProject(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load shared site.");
      }
    })();
  }, [params.projectId]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--page-bg)] px-6">
        <div className="rounded-[32px] border border-[var(--border-soft)] bg-[var(--surface)] p-10 text-center shadow-[var(--shadow-panel)]">
          <h1 className="font-display text-4xl text-[var(--text-primary)]">Link unavailable</h1>
          <p className="mt-3 text-[var(--text-secondary)]">{error}</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-contrast)]"
          >
            Open studio
          </Link>
        </div>
      </main>
    );
  }

  if (!project) {
    return <div className="min-h-screen bg-[var(--page-bg)]" />;
  }

  return (
    <main className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border-soft)] bg-[color:var(--header-bg)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">
              Shared Website
            </p>
            <h1 className="mt-2 font-display text-3xl">{project.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-4 py-2 text-sm"
            >
              Open studio
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[32px] border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[var(--shadow-panel)]">
            <p className="text-sm text-[var(--text-secondary)]">Overview</p>
            <h2 className="mt-3 font-display text-4xl text-[var(--text-primary)]">{project.name}</h2>
            <p className="mt-4 text-[var(--text-secondary)]">{project.description}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
              <span className="rounded-full border border-[var(--border-soft)] px-3 py-1">
                By {project.ownerName}
              </span>
              <span className="rounded-full border border-[var(--border-soft)] px-3 py-1">
                {project.files.length} files
              </span>
            </div>
            <a
              href={getPreviewUrl(project.projectId)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-contrast)]"
            >
              Open full preview
            </a>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[var(--shadow-panel)]">
            <iframe
              src={getPreviewUrl(project.projectId)}
              title={project.name}
              className="h-[78vh] min-h-[720px] w-full bg-white"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
