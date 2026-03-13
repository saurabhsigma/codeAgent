"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StudioShell } from "@/components/studio-shell";
import {
  createProject,
  editProject,
  getDownloadUrl,
  getProject,
  getPreviewUrl,
  getProjectFile,
  saveProjectFile,
} from "@/lib/api";

const starterPrompt =
  "Build a stunning SaaS landing page with gradient hero section, animated feature cards with icons, glass morphism pricing cards, and testimonials. Use vibrant purple and pink gradients with modern animations.";

function languageFromPath(filePath: string) {
  if (filePath.endsWith(".html")) return "html";
  if (filePath.endsWith(".css")) return "css";
  if (filePath.endsWith(".js")) return "javascript";
  if (filePath.endsWith(".ts")) return "typescript";
  if (filePath.endsWith(".json")) return "json";
  return "plaintext";
}

export function Builder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState(starterPrompt);
  const [projectName, setProjectName] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [projectId, setProjectId] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Describe a website and generate it.");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const previewUrl = useMemo(
    () => (projectId ? `${getPreviewUrl(projectId)}?v=${previewKey}` : ""),
    [projectId, previewKey],
  );

  const existingProjectId = searchParams.get("project")?.trim() ?? "";

  async function loadFile(project: string, filePath: string) {
    const file = await getProjectFile(project, filePath);
    setSelectedFile(file.path);
    setContent(file.content);
  }

  async function loadProject(projectToLoad: string) {
    const project = await getProject(projectToLoad);

    setProjectId(project.projectId);
    setProjectName(project.name);
    setPrompt(project.prompt);
    setFiles(project.files);
    setStatus(`Loaded ${project.name}`);

    const preferredFile = project.files.includes("index.html")
      ? "index.html"
      : project.files[0] ?? "";

    if (preferredFile) {
      await loadFile(project.projectId, preferredFile);
    } else {
      setSelectedFile("");
      setContent("");
    }

    setPreviewKey((value) => value + 1);
  }

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setStatus("Generating professional website with AI...");

    try {
      const project = await createProject(prompt, projectName || "Untitled Project");
      setProjectId(project.projectId);
      setFiles(project.files);
      setStatus(`Generated ${project.files.length} files.`);
      setProjectName(project.name);
      router.replace(`/builder?project=${project.projectId}`);

      const initialFile = project.files[0] ?? "";
      if (initialFile) {
        await loadFile(project.projectId, initialFile);
      } else {
        setSelectedFile("");
        setContent("");
      }

      setPreviewKey((value) => value + 1);
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Failed to generate project.",
      );
      setStatus("Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit() {
    if (!projectId || !editPrompt.trim()) return;

    setLoading(true);
    setError("");
    setStatus("Editing project with AI...");

    try {
      const project = await editProject(projectId, editPrompt);
      setProjectId(project.projectId);
      setProjectName(project.name);
      setFiles(project.files);
      setStatus(`Updated ${project.files.length} files.`);
      setEditPrompt("");

      // Reload the currently selected file if it still exists
      if (selectedFile && project.files.includes(selectedFile)) {
        await loadFile(projectId, selectedFile);
      } else if (project.files.length > 0) {
        // Load first file if current file no longer exists
        await loadFile(projectId, project.files[0]);
      }

      setPreviewKey((value) => value + 1);
    } catch (editError) {
      setError(
        editError instanceof Error
          ? editError.message
          : "Failed to edit project.",
      );
      setStatus("Edit failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectFile(filePath: string) {
    if (!projectId) return;

    try {
      setError("");
      setStatus(`Opening ${filePath}...`);
      await loadFile(projectId, filePath);
      setStatus(`Editing ${filePath}`);
    } catch (fileError) {
      setError(
        fileError instanceof Error ? fileError.message : "Failed to open file.",
      );
    }
  }

  async function handleSave() {
    if (!projectId || !selectedFile) return;

    setSaving(true);
    setError("");
    setStatus(`Saving ${selectedFile}...`);

    try {
      await saveProjectFile(projectId, selectedFile, content);
      setStatus(`Saved ${selectedFile}`);

      if (selectedFile.endsWith(".html") || selectedFile.endsWith(".css") || selectedFile.endsWith(".js")) {
        setPreviewKey((value) => value + 1);
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save file.",
      );
      setStatus("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function handleEditorChange(value: string | undefined) {
    const newContent = value ?? "";
    setContent(newContent);

    // Clear any existing save timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Auto-save after 1 second of no typing
    const timeout = setTimeout(() => {
      if (projectId && selectedFile) {
        void (async () => {
          try {
            setSaving(true);
            await saveProjectFile(projectId, selectedFile, newContent);
            setStatus(`Auto-saved ${selectedFile}`);
            
            // Refresh preview for HTML/CSS/JS files
            if (selectedFile.endsWith(".html") || selectedFile.endsWith(".css") || selectedFile.endsWith(".js")) {
              setPreviewKey((value) => value + 1);
            }
          } catch (saveError) {
            setError(
              saveError instanceof Error ? saveError.message : "Auto-save failed.",
            );
          } finally {
            setSaving(false);
          }
        })();
      }
    }, 1000);

    setSaveTimeout(timeout);
  }

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  useEffect(() => {
    if (!files.length) {
      setSelectedFile("");
      setContent("");
    }
  }, [files]);

  useEffect(() => {
    if (!existingProjectId) return;

    void (async () => {
      setLoading(true);
      setError("");
      setStatus("Loading project...");

      try {
        await loadProject(existingProjectId);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load project.");
        setStatus("Unable to load project.");
      } finally {
        setLoading(false);
      }
    })();
  }, [existingProjectId]);

  function resetBuilder() {
    setProjectId("");
    setProjectName("");
    setPrompt(starterPrompt);
    setEditPrompt("");
    setFiles([]);
    setSelectedFile("");
    setContent("");
    setPreviewKey(0);
    setError("");
    setStatus("Describe a website and generate it.");
    router.replace("/builder");
  }

  return (
    <StudioShell
      eyebrow="Builder"
      title="AI Website Builder"
      description="Generate, edit, and ship production-ready multi-page websites with live code preview."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={resetBuilder}
            className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
          >
            New Session
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
          >
            Dashboard
          </button>
        </div>
      }
    >
      <section className="rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[var(--shadow-panel)]">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Project name
            </span>
            <input
              type="text"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-highlight)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
              placeholder="My Studio Site"
            />
          </label>
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            {saving ? "Saving changes..." : status}
            {projectId ? <div className="mt-1 text-xs text-[var(--text-muted)]">Project: {projectId}</div> : null}
          </div>
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Build prompt
          </span>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="h-32 w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-highlight)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
            placeholder="Describe layout style, brand mood, colors, sections, and conversion goals..."
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-contrast)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating..." : projectId ? "Generate New Project" : "Generate Project"}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !projectId || !selectedFile}
            className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-5 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save file
          </button>

          {projectId ? (
            <a
              href={getDownloadUrl(projectId)}
              className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-5 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent)]"
            >
              Download ZIP
            </a>
          ) : null}
        </div>

        {projectId ? (
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              AI edit instruction
            </span>
            <textarea
              value={editPrompt}
              onChange={(event) => setEditPrompt(event.target.value)}
              className="h-24 w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-highlight)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
              placeholder="Add pricing tiers, improve hero copy, update palette, add testimonials carousel..."
            />
            <button
              type="button"
              onClick={handleEdit}
              disabled={loading || !editPrompt.trim()}
              className="mt-3 rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-5 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Applying edits..." : "Apply AI edit to this project"}
            </button>
          </label>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)_minmax(0,1.25fr)]">
        <aside className="rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-[var(--shadow-panel)]">
          <div className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Files</div>
          <div className="space-y-2">
            {files.length ? (
              files.map((filePath) => (
                <button
                  key={filePath}
                  type="button"
                  onClick={() => void handleSelectFile(filePath)}
                  className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                    selectedFile === filePath
                      ? "border border-[var(--accent)] bg-[var(--surface-highlight)] text-[var(--text-primary)]"
                      : "border border-transparent bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  {filePath}
                </button>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border-soft)] px-3 py-6 text-sm text-[var(--text-muted)]">
                Files will appear after generation.
              </div>
            )}
          </div>
        </aside>

        <section className="overflow-hidden rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[var(--shadow-panel)]">
          <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Code Editor</div>
              <div className="text-xs text-[var(--text-muted)]">{selectedFile || "Select a file"}</div>
            </div>
          </div>
          <div className="h-[540px]">
            <Editor
              theme="vs-dark"
              path={selectedFile}
              language={languageFromPath(selectedFile)}
              value={content}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                automaticLayout: true,
              }}
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[var(--shadow-panel)]">
          <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Live Preview</div>
              <div className="text-xs text-[var(--text-muted)]">Real-time output from server</div>
            </div>
            {previewUrl ? (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition hover:border-[var(--accent)]"
              >
                Open ↗
              </a>
            ) : null}
          </div>

          {previewUrl ? (
            <div className="relative h-[calc(100vh-290px)] min-h-[620px] w-full overflow-auto bg-white">
              <iframe
                key={previewUrl}
                src={previewUrl}
                title="Website preview"
                className="h-full w-full border-0"
              />
            </div>
          ) : (
            <div className="flex h-[620px] items-center justify-center px-6 text-center text-sm text-[var(--text-muted)]">
              Generate or load a project to preview.
            </div>
          )}
        </section>
      </section>
    </StudioShell>
  );
}
