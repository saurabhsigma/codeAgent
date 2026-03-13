"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StudioShell } from "@/components/studio-shell";
import { WorkspaceGate } from "@/components/workspace-gate";
import { deleteProject, getAllProjects, getPreviewUrl } from "@/lib/api";

type Project = {
  projectId: string;
  name: string;
  ownerName: string;
  description: string;
  prompt: string;
  previewUrl: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
};

function DashboardContent() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await getAllProjects();
      setProjects(data.projects);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(projectId: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    
    try {
      await deleteProject(projectId);
      setProjects(projects.filter((p) => p.projectId !== projectId));
    } catch (error) {
      alert("Failed to delete project");
    }
  }

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <StudioShell
      eyebrow="Workspace"
      title="Project Dashboard"
      description="Create, preview, and continue working on projects from one place."
      actions={
        <button
          type="button"
          onClick={() => router.push("/builder")}
          className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-contrast)] transition hover:translate-y-[-1px] hover:shadow-[var(--shadow-pill)]"
        >
          + New Project
        </button>
      }
    >
      <section className="rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[var(--shadow-panel)]">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-lg rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-highlight)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[var(--text-secondary)]">
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-display text-[var(--text-primary)] mb-2">
              {searchQuery ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-[var(--text-secondary)] mb-8">
              {searchQuery ? "Try a different search term" : "Create your first AI-generated website"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push("/builder")}
                className="rounded-full bg-[var(--accent)] px-8 py-4 font-semibold text-[var(--accent-contrast)] transition hover:translate-y-[-1px] hover:shadow-[var(--shadow-pill)]"
              >
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.projectId}
                className="group overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--border-strong)]"
              >
                <div className="relative h-48 overflow-hidden border-b border-[var(--border-soft)] bg-[var(--surface-highlight)]">
                  <iframe
                    src={getPreviewUrl(project.projectId)}
                    title={project.name}
                    className="w-full h-full pointer-events-none scale-50 origin-top-left transform"
                    style={{ width: "200%", height: "200%" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1 truncate">
                    {project.name}
                  </h3>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
                    {project.ownerName}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 min-h-[40px]">
                    {project.description || project.prompt}
                  </p>
                  <div className="text-xs text-[var(--text-muted)] mb-4">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/builder?project=${project.projectId}`)}
                      className="flex-1 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-highlight)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent)]"
                    >
                      Edit
                    </button>
                    <a
                      href={getPreviewUrl(project.projectId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-2 text-center text-sm font-medium text-[var(--accent-contrast)] transition hover:opacity-90"
                    >
                      Preview
                    </a>
                    <button
                      onClick={() => handleDelete(project.projectId)}
                      className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </StudioShell>
  );
}

export default function DashboardPage() {
  return (
    <WorkspaceGate>
      <DashboardContent />
    </WorkspaceGate>
  );
}
