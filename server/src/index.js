import archiver from "archiver";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Project } from "./models/Project.js";
import { User } from "./models/User.js";
import { buildEditPrompt, buildGenerationPrompt } from "./prompts.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const groqApiKey = process.env.GROQ_API_KEY;
const groqModel = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
const mongodbUri =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/ai-website-builder";
const jwtSecret = process.env.JWT_SECRET ?? "studio-forge-secret-change-in-prod";
const jwtExpiry = "30d";

app.use(cors({ origin: frontendUrl }));
app.use(express.json({ limit: "10mb" }));

mongoose
  .connect(mongodbUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

function createProjectId() {
  return `project-${Date.now()}`;
}

function extractJson(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Model returned empty response.");
  }

  try {
    return JSON.parse(rawText);
  } catch {
    const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1].trim());
    }

    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Model did not return valid JSON.");
    }

    return JSON.parse(rawText.slice(start, end + 1).trim());
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
      name: file.name,
      content: file.content,
    };
  });
}

function signToken(userId, name, email) {
  return jwt.sign({ userId, name, email }, jwtSecret, { expiresIn: jwtExpiry });
}

async function getWorkspace(req) {
  // JWT Bearer token (primary)
  const authHeader = req.header("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, jwtSecret);
      return { id: decoded.userId, name: decoded.name };
    } catch {
      return { id: "", name: "" };
    }
  }

  // Legacy x-user-id fallback (backward compat)
  const id = String(req.header("x-user-id") ?? "").trim();
  const name = String(req.header("x-user-name") ?? "").trim() || "Workspace Owner";
  return { id, name };
}

async function requireWorkspace(req, res) {
  const workspace = await getWorkspace(req);

  if (!workspace.id) {
    res.status(401).json({ error: "Authentication required. Please log in." });
    return null;
  }

  return workspace;
}

function ensureProjectAccess(project, workspaceId) {
  return project && (project.isPublic || (workspaceId && project.ownerId === workspaceId));
}

function buildProjectSummary(project) {
  return {
    projectId: project.projectId,
    name: project.name,
    ownerName: project.ownerName,
    description: project.description,
    prompt: project.prompt,
    thumbnail: project.thumbnail,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    isPublic: project.isPublic,
    previewUrl: project.previewUrl,
    sharePath: `/share/${project.projectId}`,
  };
}

async function fetchGeneratedFiles(prompt, mode = "generate", existingFiles = []) {
  if (!groqApiKey) {
    throw new Error("GROQ_API_KEY is not set.");
  }

  const content =
    mode === "edit"
      ? buildEditPrompt(prompt, existingFiles)
      : buildGenerationPrompt(prompt);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: groqModel,
      messages: [{ role: "user", content }],
      response_format: { type: "json_object" },
      temperature: 0.35,
      max_tokens: 16000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API failed: ${response.status} - ${errorText}`);
  }

  const payload = await response.json();
  const parsed = extractJson(payload.choices?.[0]?.message?.content ?? "");
  return validateFiles(parsed);
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, model: groqModel, provider: "Groq", database: "MongoDB" });
});

// ── Auth routes ─────────────────────────────────────────────────────────────

app.post("/api/auth/signup", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "").trim();

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({ name, email, passwordHash });
    await user.save();

    const token = signToken(String(user._id), user.name, user.email);
    res.status(201).json({
      token,
      user: { id: String(user._id), name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "").trim();

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken(String(user._id), user.name, user.email);
    res.json({
      token,
      user: { id: String(user._id), name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/me", async (req, res) => {
  const authHeader = req.header("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }
    res.json({ user: { id: String(user._id), name: user.name, email: user.email } });
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
});

// ── Project routes ───────────────────────────────────────────────────────────

app.get("/api/projects", async (req, res) => {
  const workspace = await requireWorkspace(req, res);
  if (!workspace) return;

  try {
    const projects = await Project.find({ ownerId: workspace.id })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ projects: projects.map(buildProjectSummary) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/public/projects/:projectId", async (req, res) => {
  try {
    const project = await Project.findOne({
      projectId: req.params.projectId,
      isPublic: true,
    }).lean();

    if (!project) {
      return res.status(404).json({ error: "Public project not found." });
    }

    res.json({
      ...buildProjectSummary(project),
      files: project.files.map((file) => file.name),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/projects", async (req, res) => {
  const workspace = await requireWorkspace(req, res);
  if (!workspace) return;

  const prompt = String(req.body?.prompt ?? "").trim();
  const name = String(req.body?.name ?? "").trim() || "Untitled Project";
  const description =
    String(req.body?.description ?? "").trim() ||
    prompt.slice(0, 180) ||
    "AI-generated premium website";

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    const files = await fetchGeneratedFiles(prompt);
    const projectId = createProjectId();
    const previewUrl = `/api/projects/${projectId}/preview/index.html`;

    const project = new Project({
      projectId,
      name,
      ownerId: workspace.id,
      ownerName: workspace.name,
      description,
      prompt,
      files,
      thumbnail: previewUrl,
      previewUrl,
    });

    await project.save();

    res.status(201).json({
      ...buildProjectSummary(project),
      files: project.files.map((file) => file.name),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/projects/:projectId", async (req, res) => {
  const workspaceId = (await getWorkspace(req)).id;

  try {
    const project = await Project.findOne({ projectId: req.params.projectId });

    if (!ensureProjectAccess(project, workspaceId)) {
      return res.status(404).json({ error: "Project not found." });
    }

    res.json({
      ...buildProjectSummary(project),
      files: project.files.map((file) => file.name),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/projects/:projectId", async (req, res) => {
  const workspace = await requireWorkspace(req, res);
  if (!workspace) return;

  try {
    const project = await Project.findOne({
      projectId: req.params.projectId,
      ownerId: workspace.id,
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    const name = String(req.body?.name ?? "").trim();
    const description = String(req.body?.description ?? "").trim();
    const isPublic = req.body?.isPublic;

    if (name) project.name = name;
    if (description || req.body?.description === "") project.description = description;
    if (typeof isPublic === "boolean") project.isPublic = isPublic;

    await project.save();

    res.json({
      ok: true,
      project: buildProjectSummary(project),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/projects/:projectId/share", async (req, res) => {
  const workspace = await requireWorkspace(req, res);
  if (!workspace) return;

  try {
    const project = await Project.findOne({
      projectId: req.params.projectId,
      ownerId: workspace.id,
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    project.isPublic = Boolean(req.body?.isPublic);
    await project.save();

    res.json({
      ok: true,
      project: buildProjectSummary(project),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/projects/:projectId", async (req, res) => {
  const workspace = await requireWorkspace(req, res);
  if (!workspace) return;

  try {
    const result = await Project.deleteOne({
      projectId: req.params.projectId,
      ownerId: workspace.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Project not found." });
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/projects/:projectId/edit", async (req, res) => {
  const workspace = await requireWorkspace(req, res);
  if (!workspace) return;

  const prompt = String(req.body?.prompt ?? "").trim();

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    const project = await Project.findOne({
      projectId: req.params.projectId,
      ownerId: workspace.id,
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    const files = await fetchGeneratedFiles(prompt, "edit", project.files);
    project.files = files;
    project.prompt = `${project.prompt}\n\nEdit request: ${prompt}`;
    project.thumbnail = project.previewUrl;
    await project.save();

    res.json({
      ...buildProjectSummary(project),
      files: project.files.map((file) => file.name),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/projects/:projectId/file", async (req, res) => {
  const workspaceId = (await getWorkspace(req)).id;
  const filePath = String(req.query.path ?? "").trim();

  if (!filePath) {
    return res.status(400).json({ error: "File path is required." });
  }

  try {
    const project = await Project.findOne({ projectId: req.params.projectId });

    if (!ensureProjectAccess(project, workspaceId)) {
      return res.status(404).json({ error: "Project not found." });
    }

    const file = project.files.find((entry) => entry.name === filePath);

    if (!file) {
      return res.status(404).json({ error: "File not found." });
    }

    res.json({ path: file.name, content: file.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/projects/:projectId/file", async (req, res) => {
  const workspace = await requireWorkspace(req, res);
  if (!workspace) return;

  const filePath = String(req.body?.path ?? "").trim();
  const content = String(req.body?.content ?? "");

  if (!filePath) {
    return res.status(400).json({ error: "File path is required." });
  }

  try {
    const project = await Project.findOne({
      projectId: req.params.projectId,
      ownerId: workspace.id,
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    const file = project.files.find((entry) => entry.name === filePath);

    if (!file) {
      return res.status(404).json({ error: "File not found." });
    }

    file.content = content;
    await project.save();

    res.json({ ok: true, updatedAt: project.updatedAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/projects/:projectId/download", async (req, res) => {
  const workspaceId = (await getWorkspace(req)).id;

  try {
    const project = await Project.findOne({ projectId: req.params.projectId });

    if (!ensureProjectAccess(project, workspaceId)) {
      return res.status(404).json({ error: "Project not found." });
    }

    res.attachment(`${project.name.replace(/\s+/g, "-").toLowerCase() || "website"}.zip`);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (error) => {
      throw error;
    });

    archive.pipe(res);
    project.files.forEach((file) => {
      archive.append(file.content, { name: file.name });
    });
    await archive.finalize();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/projects/:projectId/preview/*", async (req, res) => {
  try {
    const project = await Project.findOne({ projectId: req.params.projectId });

    if (!project) {
      return res.status(404).send("Project not found.");
    }

    const fileName = req.params[0] || "index.html";
    const file = project.files.find((entry) => entry.name === fileName);

    if (!file) {
      return res.status(404).send("File not found.");
    }

    if (fileName.endsWith(".html")) res.type("html");
    else if (fileName.endsWith(".css")) res.type("css");
    else if (fileName.endsWith(".js")) res.type("js");

    res.send(file.content);
  } catch {
    res.status(500).send("Error loading preview.");
  }
});

// When running locally start the HTTP server; on Vercel the app is exported
// below and invoked as a serverless function by @vercel/node.
if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

export default app;
