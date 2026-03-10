import archiver from "archiver";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const projectsDir = path.resolve(rootDir, process.env.PROJECTS_DIR ?? "../projects");
const app = express();
const port = Number(process.env.PORT ?? 4000);
const groqApiKey = process.env.GROQ_API_KEY;
const groqModel = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

app.use(cors({ origin: frontendUrl }));
app.use(express.json({ limit: "2mb" }));

function createProjectId() {
  return `project-${Date.now()}`;
}

function sanitizeRelativePath(filePath) {
  const normalized = path.posix.normalize(filePath.replace(/\\/g, "/"));

  // Prevent writes outside the generated project folder.
  if (
    normalized.startsWith("../") ||
    normalized.includes("/../") ||
    normalized === ".." ||
    path.isAbsolute(normalized)
  ) {
    throw new Error("Invalid file path.");
  }

  return normalized;
}

function buildGenerationPrompt(userPrompt) {
  return `You are a senior web developer.
Generate a small website project.

Return output as JSON with files array.

Example format:
{
  "files": [
    { "name": "index.html", "content": "<!doctype html>..." },
    { "name": "style.css", "content": "..." },
    { "name": "script.js", "content": "..." }
  ]
}

Rules:
- use clean HTML
- use modern CSS
- keep project simple
- make files small
- always include index.html
- if you include assets, reference only generated files
- respond with valid JSON only

User request:
${userPrompt}`;
}

function buildEditPrompt(userPrompt, existingFiles) {
  const filesContext = existingFiles
    .map((file) => `File: ${file.name}\n\`\`\`\n${file.content}\n\`\`\``)
    .join("\n\n");

  return `You are a senior web developer.
You are editing an existing website project.

Current project files:
${filesContext}

Return output as JSON with files array containing ALL files (modified and unmodified).

Example format:
{
  "files": [
    { "name": "index.html", "content": "<!doctype html>..." },
    { "name": "style.css", "content": "..." },
    { "name": "script.js", "content": "..." }
  ]
}

Rules:
- return ALL files, not just changed ones
- apply the requested changes
- keep existing structure unless asked to change it
- use clean HTML and modern CSS
- respond with valid JSON only

User edit request:
${userPrompt}`;
}

function extractJson(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    // Some local models wrap JSON in markdown or extra prose; recover the object.
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Model did not return JSON.");
    }

    return JSON.parse(match[0]);
  }
}

function validateFiles(payload) {
  if (!payload || !Array.isArray(payload.files) || payload.files.length === 0) {
    throw new Error("Generated payload is missing files.");
  }

  return payload.files.map((file) => {
    if (!file || typeof file.name !== "string" || typeof file.content !== "string") {
      throw new Error("Generated payload contains an invalid file.");
    }

    return {
      name: sanitizeRelativePath(file.name),
      content: file.content,
    };
  });
}

async function ensureProjectsDir() {
  await fs.mkdir(projectsDir, { recursive: true });
}

async function writeProjectFiles(projectId, files) {
  const projectPath = path.join(projectsDir, projectId);
  await fs.mkdir(projectPath, { recursive: true });

  for (const file of files) {
    const filePath = path.join(projectPath, file.name);
    // Support nested output like assets/style.css if the model returns it.
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, file.content, "utf8");
  }

  return projectPath;
}

async function listProjectFiles(projectPath, currentDir = projectPath, prefix = "") {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absolutePath = path.join(currentDir, entry.name);
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      files.push(...(await listProjectFiles(projectPath, absolutePath, relativePath)));
      continue;
    }

    files.push(relativePath);
  }

  return files;
}

async function getProjectPath(projectId) {
  const safeId = sanitizeRelativePath(projectId);
  const projectPath = path.join(projectsDir, safeId);
  await fs.access(projectPath);
  return projectPath;
}

async function fetchGeneratedFiles(prompt) {
  if (!groqApiKey) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: groqModel,
      messages: [
        {
          role: "user",
          content: buildGenerationPrompt(prompt),
        },
      ],
      temperature: 0.2,
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API request failed with status ${response.status}: ${errorText}`);
  }

  const payload = await response.json();
  const parsed = extractJson(payload.choices?.[0]?.message?.content ?? "");
  return validateFiles(parsed);
}

async function fetchEditedFiles(prompt, existingFiles) {
  if (!groqApiKey) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: groqModel,
      messages: [
        {
          role: "user",
          content: buildEditPrompt(prompt, existingFiles),
        },
      ],
      temperature: 0.2,
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API request failed with status ${response.status}: ${errorText}`);
  }

  const payload = await response.json();
  const parsed = extractJson(payload.choices?.[0]?.message?.content ?? "");
  return validateFiles(parsed);
}

app.get("/api/health", async (_req, res) => {
  try {
    await ensureProjectsDir();
    res.json({ ok: true, model: groqModel, provider: "Groq" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/projects", async (req, res) => {
  const prompt = String(req.body?.prompt ?? "").trim();

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    await ensureProjectsDir();
    const files = await fetchGeneratedFiles(prompt);
    const projectId = createProjectId();
    await writeProjectFiles(projectId, files);

    res.status(201).json({
      projectId,
      files: files.map((file) => file.name),
      previewUrl: `/api/projects/${projectId}/preview/index.html`,
    });
  } catch (error) {
    const message =
      error.cause?.code === "ECONNREFUSED"
        ? "Could not reach Ollama. Start Ollama and try again."
        : error.message;

    res.status(500).json({ error: message });
  }
});

app.post("/api/projects/:projectId/edit", async (req, res) => {
  const prompt = String(req.body?.prompt ?? "").trim();

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    const projectPath = await getProjectPath(req.params.projectId);
    const fileList = await listProjectFiles(projectPath);
    
    // Read all existing files
    const existingFiles = await Promise.all(
      fileList.map(async (fileName) => {
        const filePath = path.join(projectPath, fileName);
        const content = await fs.readFile(filePath, "utf8");
        return { name: fileName, content };
      })
    );

    // Generate edited files
    const updatedFiles = await fetchEditedFiles(prompt, existingFiles);
    
    // Write updated files back
    await writeProjectFiles(req.params.projectId, updatedFiles);

    res.json({
      projectId: req.params.projectId,
      files: updatedFiles.map((file) => file.name),
      previewUrl: `/api/projects/${req.params.projectId}/preview/index.html`,
    });
  } catch (error) {
    const message =
      error.cause?.code === "ECONNREFUSED"
        ? "Could not reach AI service."
        : error.message;

    res.status(500).json({ error: message });
  }
});

app.get("/api/projects/:projectId", async (req, res) => {
  try {
    const projectPath = await getProjectPath(req.params.projectId);
    const files = await listProjectFiles(projectPath);
    res.json({ projectId: req.params.projectId, files });
  } catch {
    res.status(404).json({ error: "Project not found." });
  }
});

app.get("/api/projects/:projectId/file", async (req, res) => {
  const requestedPath = String(req.query.path ?? "");

  if (!requestedPath) {
    return res.status(400).json({ error: "File path is required." });
  }

  try {
    const projectPath = await getProjectPath(req.params.projectId);
    const safePath = sanitizeRelativePath(requestedPath);
    const filePath = path.join(projectPath, safePath);
    const content = await fs.readFile(filePath, "utf8");
    res.json({ path: safePath, content });
  } catch {
    res.status(404).json({ error: "File not found." });
  }
});

app.put("/api/projects/:projectId/file", async (req, res) => {
  const requestedPath = String(req.body?.path ?? "");
  const content = String(req.body?.content ?? "");

  if (!requestedPath) {
    return res.status(400).json({ error: "File path is required." });
  }

  try {
    const projectPath = await getProjectPath(req.params.projectId);
    const safePath = sanitizeRelativePath(requestedPath);
    const filePath = path.join(projectPath, safePath);
    await fs.writeFile(filePath, content, "utf8");
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Unable to save file." });
  }
});

app.get("/api/projects/:projectId/download", async (req, res) => {
  try {
    const projectPath = await getProjectPath(req.params.projectId);
    const archive = archiver("zip", { zlib: { level: 9 } });

    res.attachment(`${req.params.projectId}.zip`);
    archive.on("error", (error) => {
      console.error(error);

      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to create ZIP archive." });
      } else {
        res.end();
      }
    });

    archive.pipe(res);
    archive.directory(projectPath, false);
    await archive.finalize();
  } catch {
    res.status(404).json({ error: "Project not found." });
  }
});

app.get("/api/projects/:projectId/preview/*", async (req, res) => {
  try {
    const projectPath = await getProjectPath(req.params.projectId);
    const fileParam = req.params[0] || "index.html";
    const safePath = sanitizeRelativePath(fileParam);
    const filePath = path.join(projectPath, safePath);
    res.sendFile(filePath);
  } catch {
    res.status(404).send("Preview file not found.");
  }
});

app.listen(port, async () => {
  await ensureProjectsDir();
  console.log(`Server listening on http://localhost:${port}`);
});
