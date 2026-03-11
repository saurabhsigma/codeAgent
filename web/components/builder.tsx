"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProject,
  editProject,
  getDownloadUrl,
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

  async function loadFile(project: string, filePath: string) {
    const file = await getProjectFile(project, filePath);
    setSelectedFile(file.path);
    setContent(file.content);
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

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-glow backdrop-blur">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
              Minimal Open-Source Builder
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Generate professional websites with AI
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Create stunning, modern websites with professional design, free Unsplash images,
              smooth animations, and production-ready code. Powered by Groq AI.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              {saving && (
                <svg className="h-4 w-4 animate-spin text-sky-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{status}</span>
            </div>
            {projectId ? (
              <div className="mt-1 text-xs text-slate-500">Project: {projectId}</div>
            ) : null}
          </div>
        </div>

        <div className="mb-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Project Name
            </span>
            <input
              type="text"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
              placeholder="My Awesome Website"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Website description
          </span>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="h-32 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
            placeholder="e.g., Modern restaurant website with image gallery, menu section, online reservation form, and contact details. Use warm orange and brown tones..."
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate project"}
          </button>

          {projectId ? (
            <a
              href={getDownloadUrl(projectId)}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-medium text-slate-100 transition hover:border-sky-400"
            >
              Download ZIP
            </a>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-900/60 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
      </section>

      {projectId ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-glow backdrop-blur">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">✨ AI Edit Mode</h2>
            <p className="mt-1 text-sm text-slate-300">
              Refine your website with natural language commands
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              What would you like to change?
            </span>
            <textarea
              value={editPrompt}
              onChange={(event) => setEditPrompt(event.target.value)}
              className="h-24 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
              placeholder="e.g., Add a blog section with 3 posts, change color scheme to purple and pink gradient, add animation to the hero section, make the font sizes bigger..."
            />
          </label>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleEdit}
              disabled={loading || !editPrompt.trim()}
              className="rounded-2xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Editing..." : "Apply AI Edit"}
            </button>
          </div>
        </section>
      ) : null}

      <section className="grid flex-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1.5fr)]">
        <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-4 text-sm font-semibold text-slate-200">Files</div>
          <div className="space-y-2">
            {files.length ? (
              files.map((filePath) => (
                <button
                  key={filePath}
                  type="button"
                  onClick={() => void handleSelectFile(filePath)}
                  className={`block w-full rounded-2xl px-3 py-2 text-left text-sm transition ${
                    selectedFile === filePath
                      ? "bg-sky-400/20 text-sky-300"
                      : "bg-slate-950/70 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {filePath}
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-800 px-3 py-6 text-sm text-slate-500">
                Generated files will appear here.
              </div>
            )}
          </div>
        </aside>

        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-slate-200">Editor</div>
              <div className="text-xs text-slate-500">
                {selectedFile || "Select a file to edit"}
              </div>
            </div>
          </div>

          <div className="h-[520px]">
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

        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-slate-200">Live preview</div>
              <div className="text-xs text-slate-500">Desktop view • 100% zoom</div>
            </div>
            {previewUrl ? (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:border-sky-400 hover:text-sky-300"
              >
                Open in New Tab ↗
              </a>
            ) : null}
          </div>

          {previewUrl ? (
            <div className="relative h-[calc(100vh-280px)] min-h-[600px] w-full overflow-auto bg-white">
              <iframe
                key={previewUrl}
                src={previewUrl}
                title="Website preview"
                className="h-full w-full border-0"
                style={{
                  transform: 'scale(1)',
                  transformOrigin: 'top left',
                }}
              />
            </div>
          ) : (
            <div className="flex h-[600px] items-center justify-center px-6 text-center text-sm text-slate-500">
              Generate a project to preview the output.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
