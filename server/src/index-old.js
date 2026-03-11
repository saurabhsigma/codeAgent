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
  return `You are an expert senior web developer and UI/UX designer specializing in accessible, stunning designs.
Generate a BEAUTIFUL, professional website with PERFECT contrast and readability.

CRITICAL CONTRAST RULES:
- White/light text (text-white, text-gray-100) ONLY on dark backgrounds
- Dark text (text-gray-900, text-gray-800) ONLY on light backgrounds
- On gradient backgrounds, use text-white with text-shadow for readability
- Ensure minimum 4.5:1 contrast ratio for normal text, 3:1 for large text
- Test every text element for readability

COLOR SCHEME GUIDELINES:
- Dark sections: Use dark backgrounds (bg-gray-900, bg-slate-900) with text-white
- Light sections: Use light backgrounds (bg-white, bg-gray-50) with text-gray-900
- Gradient sections: Use text-white with text-shadow-lg for glow effect
- Cards on dark backgrounds: Use bg-white/10 backdrop-blur with text-white
- Cards on light backgrounds: Use bg-white with text-gray-900 and shadow
- Buttons: High contrast - dark buttons need text-white, light buttons need text-gray-900

TAILWIND DESIGN SYSTEM:
- Backgrounds:
  * Dark sections: bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900
  * Light sections: bg-gradient-to-br from-white to-gray-50
  * Glass cards: backdrop-blur-xl bg-white/10 border border-white/20 (on dark)
  * Solid cards: bg-white shadow-2xl shadow-purple-500/20 (on light)
  
- Typography:
  * Headlines on dark: text-white font-bold text-5xl
  * Headlines on light: text-gray-900 font-bold text-5xl
  * Gradient text: text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400
  * Body on dark: text-gray-300 text-lg
  * Body on light: text-gray-600 text-lg
  
- Buttons:
  * Primary: bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700
  * Secondary: border-2 border-white text-white hover:bg-white hover:text-gray-900
  * On light: bg-gray-900 text-white hover:bg-gray-800
  
- Shadows & Effects:
  * Cards: shadow-2xl shadow-purple-500/30
  * Hover: hover:shadow-3xl hover:-translate-y-2 transition-all duration-300
  * Glow: drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]

LAYOUT PATTERNS:
- Alternate dark and light sections for visual rhythm
- Hero: MUST have hero image (https://picsum.photos/seed/hero/1920/1080)
- Features: MUST have feature images on cards
- CTA sections: Dark gradient with white text
- Gallery/Portfolio: MUST have multiple images in grid
- About/Team: MUST have team/about images
- Footer: Dark background with light text
- Generous padding: py-20 px-8 for sections
- Every major section should have at least one image

IMAGES - MANDATORY REQUIREMENT:
⚠️ YOU MUST INCLUDE IMAGES IN THE HTML - DO NOT SKIP THIS!
- Use Picsum Photos API in <img> tags
- Format: <img src="https://picsum.photos/seed/{word}/{width}/{height}" alt="..." class="..." loading="lazy">
- REQUIRED images:
  1. Hero section: <img src="https://picsum.photos/seed/hero/1600/900" alt="Hero" class="w-full h-full object-cover rounded-xl">
  2. Feature cards (3+): 
     * <img src="https://picsum.photos/seed/feature1/600/400" alt="Feature 1" class="rounded-lg">
     * <img src="https://picsum.photos/seed/feature2/600/400" alt="Feature 2" class="rounded-lg">
     * <img src="https://picsum.photos/seed/feature3/600/400" alt="Feature 3" class="rounded-lg">
  3. About/Team section: <img src="https://picsum.photos/seed/team/800/600" alt="Team" class="rounded-xl shadow-xl">
  4. Gallery items: seed/gallery1, seed/gallery2, seed/gallery3
- Each seed word MUST be different
- Include 5-10 images throughout the page
- Example full tag: <img src="https://picsum.photos/seed/business/1200/800" alt="Business meeting" class="w-full h-64 object-cover rounded-xl shadow-lg" loading="lazy">

ANIMATIONS (add to style.css):
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
.animate-slide-in-left { animation: slideInLeft 0.8s ease-out forwards; }

CONTENT:
- Write compelling, professional, realistic content
- Powerful headlines with action verbs
- Clear value propositions
- Realistic pricing, testimonials, features
- Professional tone matching the industry

HTML STRUCTURE:
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Professional Title</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body class="antialiased">
  <!-- Navbar -->
  
  <!-- Hero with BACKGROUND IMAGE or IMG TAG -->
  <section class="relative h-screen">
    <img src="https://picsum.photos/seed/hero/1920/1080" alt="Hero" class="absolute inset-0 w-full h-full object-cover">
    <div class="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-pink-900/80"></div>
    <div class="relative z-10 flex items-center justify-center h-full text-center text-white">
      <div>
        <h1 class="text-6xl font-bold">Headline</h1>
        <p class="text-xl mt-4">Description</p>
      </div>
    </div>
  </section>
  
  <!-- Features with IMAGES -->
  <section class="py-20 px-8 bg-white">
    <div class="grid md:grid-cols-3 gap-8">
      <div class="bg-white rounded-xl shadow-xl">
        <img src="https://picsum.photos/seed/feature1/600/400" alt="Feature" class="w-full rounded-t-xl">
        <div class="p-6">
          <h3 class="text-2xl font-bold text-gray-900">Feature 1</h3>
          <p class="text-gray-600 mt-2">Description</p>
        </div>
      </div>
      <!-- MORE CARDS WITH IMAGES -->
    </div>
  </section>
  
  <script src="script.js"></script>
</body>
</html>

JAVASCRIPT FEATURES:
- Intersection Observer for scroll animations
- Smooth scroll navigation
- Navbar background change on scroll
- Mobile menu toggle
- Add 'active' class to fade in elements

REQUIRED FILES:
1. index.html - Full structure with Tailwind
2. style.css - Custom animations and utilities
3. script.js - Interactions and scroll effects

Return JSON format:
{
  "files": [
    { "name": "index.html", "content": "..." },
    { "name": "style.css", "content": "..." },
    { "name": "script.js", "content": "..." }
  ]
}

User request: ${userPrompt}

Create a STUNNING website with PERFECT contrast, readable text, and eye-catching modern design. Every text element must be easily readable.`;
}

function buildEditPrompt(userPrompt, existingFiles) {
  const filesContext = existingFiles
    .map((file) => `File: ${file.name}\n\`\`\`\n${file.content}\n\`\`\``)
    .join("\n\n");

  return `You are an expert senior web developer and UI/UX designer.
Edit the existing website to improve it based on the user's request.

Current project files:
${filesContext}

MAINTAIN PROFESSIONAL STANDARDS:
- CRITICAL: Maintain proper text/background contrast
- White text ONLY on dark backgrounds
- Dark text ONLY on light backgrounds
- Keep Tailwind CSS for stunning design
- Use Picsum Photos: https://picsum.photos/seed/{keyword}/{width}/{height}
- Different seed words for each image
- Maintain alternating dark/light sections
- Preserve glass morphism and modern effects
- Keep animations and smooth transitions
- Maintain accessibility and readability
- Keep semantic HTML5 structure
- Preserve CSS variables and modern patterns
- Keep smooth animations and transitions
- Maintain responsive design
- Keep professional content and realistic data

APPLY THE REQUESTED CHANGES:
- Make the specific modifications requested
- Enhance rather than simplify (unless asked)
- Add features professionally
- Maintain or improve code quality
- Keep consistent styling and design language

Return ALL files in JSON format (modified and unmodified):
{
  "files": [
    { "name": "index.html", "content": "..." },
    { "name": "style.css", "content": "..." },
    { "name": "script.js", "content": "..." }
  ]
}

User edit request: ${userPrompt}

Apply changes while maintaining professional quality.`;
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
      temperature: 0.3,
      max_tokens: 16000,
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
      temperature: 0.3,
      max_tokens: 16000,
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
