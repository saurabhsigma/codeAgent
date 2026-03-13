import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { Project } from "./models/Project.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const groqApiKey = process.env.GROQ_API_KEY;
const groqModel = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
const mongodbUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/ai-website-builder";

app.use(cors({ origin: frontendUrl }));
app.use(express.json({ limit: "10mb" }));

// Connect to MongoDB
mongoose.connect(mongodbUri)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

function createProjectId() {
  return `project-${Date.now()}`;
}

function buildGenerationPrompt(userPrompt) {
  return `You are an expert senior web developer specializing in PREMIUM, accessible designs.

STEP 1: ANALYZE USER REQUEST FOR CONTEXT
Identify the website type and extract relevant keywords:
- Restaurant/Food → keywords: food, restaurant, dining, cuisine, chef
- Gym/Fitness → keywords: fitness, gym, workout, sports, training
- Tech/SaaS → keywords: technology, office, business, modern, digital
- Fashion → keywords: fashion, shopping, style, model, clothing
- Travel/Hotel → keywords: travel, hotel, vacation, resort, destination
- Real Estate → keywords: house, property, architecture, interior, home
- Portfolio → keywords: creative, art, design, workspace, studio
- Healthcare → keywords: medical, health, clinic, hospital, care
- Education → keywords: education, learning, school, students, campus

STEP 2: CONTEXT-AWARE IMAGES (MANDATORY!)
⚠️ USE RELEVANT IMAGES MATCHING THE BUSINESS TYPE!
Format: https://picsum.photos/seed/{relevant-keyword}{number}/{width}/{height}

EXAMPLES:
- GYM website → seed/fitness1, seed/workout2, seed/gym3, seed/sports4
- RESTAURANT → seed/food1, seed/restaurant2, seed/dining3, seed/cuisine4
- TECH startup → seed/technology1, seed/office2, seed/business3, seed/modern4

REQUIRED IMAGES (minimum 5-8 images):
1. Hero: <img src="https://picsum.photos/seed/{keyword}1/1920/1080" alt="..." class="absolute inset-0 w-full h-full object-cover">
2. Features (3-4): <img src="https://picsum.photos/seed/{keyword}2/600/400" alt="..." class="w-full rounded-2xl hover:scale-110 transition duration-500">
3. Gallery (4-6): <img src="https://picsum.photos/seed/{keyword}5/800/600" alt="..." class="rounded-xl shadow-2xl">

PREMIUM DESIGN - TAILWIND CSS:
- Use LARGE, BOLD typography: text-6xl md:text-8xl font-black
- Rounded buttons: px-10 py-4 rounded-full text-lg font-bold
- Generous spacing: py-24 md:py-32 for sections
- Glass morphism: backdrop-blur-xl bg-white/10 border border-white/20
- Premium shadows: shadow-2xl shadow-purple-500/30
- Smooth animations: hover:scale-105 hover:-translate-y-3 transition-all duration-500
- Sticky navbar: fixed top-0 backdrop-blur-md bg-white/80

CONTRAST RULES (CRITICAL):
- Dark backgrounds (bg-gray-900) → text-white
- Light backgrounds (bg-white, bg-gray-50) → text-gray-900
- Gradient overlays → text-white with text-shadow

PREMIUM HTML TEMPLATE:
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Title Here</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body class="antialiased">
  <!-- Sticky Navbar -->
  <nav class="fixed top-0 w-full z-50 backdrop-blur-md bg-white/90 border-b">
    <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <div class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Logo</div>
      <button class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition shadow-lg">Get Started</button>
    </div>
  </nav>
  
  <!-- Hero with Context Image -->
  <section class="relative h-screen flex items-center justify-center pt-16">
    <img src="https://picsum.photos/seed/{RELEVANT}1/1920/1080" alt="Hero" class="absolute inset-0 w-full h-full object-cover">
    <div class="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-pink-900/80"></div>
    <div class="relative z-10 text-center text-white max-w-6xl mx-auto px-6">
      <h1 class="text-6xl md:text-8xl font-black leading-tight animate-fade-in-up">
        Powerful Headline
      </h1>
      <p class="text-xl md:text-2xl mt-6 text-gray-200">Compelling subheadline</p>
      <div class="mt-12 flex gap-4 justify-center">
        <button class="bg-white text-gray-900 px-10 py-4 rounded-full text-lg font-bold hover:scale-105 transition shadow-2xl">Primary CTA</button>
        <button class="border-2 border-white text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-gray-900 transition">Secondary</button>
      </div>
    </div>
  </section>
  
  <!-- Features with Context Images -->
  <section class="py-32 bg-gradient-to-br from-white to-gray-50">
    <div class="max-w-7xl mx-auto px-6">
      <h2 class="text-5xl md:text-6xl font-black text-gray-900 text-center mb-20">Features</h2>
      <div class="grid md:grid-cols-3 gap-12">
        <div class="group">
          <div class="overflow-hidden rounded-2xl shadow-2xl">
            <img src="https://picsum.photos/seed/{RELEVANT}2/600/400" alt="Feature" class="w-full group-hover:scale-110 transition duration-500">
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mt-6">Feature Title</h3>
          <p class="text-gray-600 mt-3 text-lg">Description here</p>
        </div>
      </div>
    </div>
  </section>
  
  <script src="script.js"></script>
</body>
</html>

ANIMATIONS (style.css):
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }

JAVASCRIPT (script.js):
⚠️ CRITICAL: Check elements exist before adding event listeners!
Example:
const btn = document.querySelector('.menu-btn');
if (btn) { btn.addEventListener('click', () => {...}); }

Include:
- Intersection Observer for scroll fade-ins
- Smooth scroll to sections
- Navbar background change on scroll
- Mobile menu toggle (with null checks!)

⚠️ IMPORTANT FILE RULES:
1. Only reference files that you actually create (index.html, style.css, script.js)
2. Do NOT reference phantom files like "layout.css" that don't exist
3. If using CSS, include it as style.css and link properly
4. Check for null before addEventListener on ALL elements

⚠️ CRITICAL JSON FORMAT:
Return ONLY valid JSON, no markdown, no code blocks, no backticks in content!
Escape all special characters properly in strings.

Return JSON:
{
  "files": [
    { "name": "index.html", "content": "..." },
    { "name": "style.css", "content": "..." },
    { "name": "script.js", "content": "..." }
  ]
}

User request: ${userPrompt}

CREATE PREMIUM WEBSITE WITH:
1. CONTEXT-AWARE images (analyze request and use relevant keywords!)
2. BOLD, stunning design with Tailwind
3. PERFECT contrast
4. SMOOTH animations
5. PROFESSIONAL content`;
}

function extractJson(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Model returned empty response.");
  }

  try {
    return JSON.parse(rawText);
  } catch (firstError) {
    // Try to extract JSON from markdown code blocks
    const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {}
    }
    
    // Try to recover JSON object between first "{" and last "}"
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      console.error("Failed to extract JSON. Raw response:", rawText.substring(0, 500));
      throw new Error("Model did not return valid JSON. Check server logs for details.");
    }

    const candidate = rawText.slice(start, end + 1).trim();
    
    try {
      return JSON.parse(candidate);
    } catch (cleanError) {
      console.error("JSON parse error:", cleanError.message);
      console.error("Candidate JSON:", candidate.substring(0, 500));
      throw new Error(`Invalid JSON from model: ${cleanError.message}`);
    }
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
    return { name: file.name, content: file.content };
  });
}

async function fetchGeneratedFiles(prompt) {
  if (!groqApiKey) throw new Error("GROQ_API_KEY is not set.");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: groqModel,
      messages: [{ role: "user", content: buildGenerationPrompt(prompt) }],
      response_format: { type: "json_object" },
      temperature: 0.3,
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

// Health check
app.get("/api/health", async (_req, res) => {
  res.json({ ok: true, model: groqModel, provider: "Groq", database: "MongoDB" });
});

// Create new project
app.post("/api/projects", async (req, res) => {
  const prompt = String(req.body?.prompt ?? "").trim();
  const name = String(req.body?.name ?? "").trim() || "Untitled Project";

  if (!prompt) return res.status(400).json({ error: "Prompt is required." });

  try {
    console.log(`📝 Generating project: "${name}"`);
    const files = await fetchGeneratedFiles(prompt);
    console.log(`✅ Generated ${files.length} files`);
    
    const projectId = createProjectId();
    
    const project = new Project({
      projectId,
      name,
      prompt,
      files,
      previewUrl: `/api/projects/${projectId}/preview/index.html`,
    });

    await project.save();
    console.log(`💾 Saved project: ${projectId}`);

    res.status(201).json({
      projectId: project.projectId,
      name: project.name,
      files: project.files.map((f) => f.name),
      previewUrl: project.previewUrl,
      createdAt: project.createdAt,
    });
  } catch (error) {
    console.error("❌ Error creating project:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Get all projects
app.get("/api/projects", async (_req, res) => {
  try {
    const projects = await Project.find()
      .select("projectId name description prompt thumbnail createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();  // Return plain JS objects instead of Mongoose documents
    res.json({ projects });
  } catch (error) {
    console.error("❌ Error fetching projects:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get single project
app.get("/api/projects/:projectId", async (req, res) => {
  try {
    const project = await Project.findOne({ projectId: req.params.projectId });
    if (!project) return res.status(404).json({ error: "Project not found." });
    
    res.json({
      projectId: project.projectId,
      name: project.name,
      description: project.description,
      files: project.files.map((f) => f.name),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// AI Edit project
app.post("/api/projects/:projectId/edit", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required." });

  try {
    const project = await Project.findOne({ projectId: req.params.projectId });
    if (!project) return res.status(404).json({ error: "Project not found." });

    // Build edit prompt with current files
    const currentFiles = project.files.map(f => `${f.name}:\n${f.content}`).join("\n\n---\n\n");
    const editPrompt = `You are editing an existing website. Make the requested changes while keeping the design premium and professional.

CURRENT FILES:
${currentFiles}

USER REQUEST: ${prompt}

IMPORTANT RULES:
1. Return COMPLETE files (not just changes)
2. Keep existing images and design unless explicitly changing them
3. Maintain Tailwind CDN and responsive design
4. Fix any JavaScript errors (check for null elements before addEventListener)
5. Only include files that actually exist (no phantom CSS/JS references)
6. Use inline styles or Tailwind classes only (no separate CSS files unless needed)

Return JSON: { "files": [{"name": "...", "content": "..."}] }`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [{ role: "user", content: editPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content ?? "";
    const payload = extractJson(rawText);
    const files = validateFiles(payload);

    // Update project files
    project.files = files;
    await project.save();

    res.json({
      projectId: project.projectId,
      files: files.map((f) => f.name),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get project file
app.get("/api/projects/:projectId/file", async (req, res) => {
  const filePath = String(req.query.path ?? "");
  if (!filePath) return res.status(400).json({ error: "File path is required." });

  try {
    const project = await Project.findOne({ projectId: req.params.projectId });
    if (!project) return res.status(404).json({ error: "Project not found." });

    const file = project.files.find((f) => f.name === filePath);
    if (!file) return res.status(404).json({ error: "File not found." });

    res.json({ path: file.name, content: file.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project file
app.put("/api/projects/:projectId/file", async (req, res) => {
  const filePath = String(req.body?.path ?? "");
  const content = String(req.body?.content ?? "");

  if (!filePath) return res.status(400).json({ error: "File path is required." });

  try {
    const project = await Project.findOne({ projectId: req.params.projectId });
    if (!project) return res.status(404).json({ error: "Project not found." });

    const file = project.files.find((f) => f.name === filePath);
    if (!file) return res.status(404).json({ error: "File not found." });

    file.content = content;
    await project.save();

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project metadata
app.put("/api/projects/:projectId", async (req, res) => {
  const { name, description } = req.body;

  try {
    const project = await Project.findOne({ projectId: req.params.projectId });
    if (!project) return res.status(404).json({ error: "Project not found." });

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    
    await project.save();

    res.json({ ok: true, project: {
      projectId: project.projectId,
      name: project.name,
      description: project.description,
    }});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
app.delete("/api/projects/:projectId", async (req, res) => {
  try {
    const result = await Project.deleteOne({ projectId: req.params.projectId });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Project not found." });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Preview project files
app.get("/api/projects/:projectId/preview/*", async (req, res) => {
  try {
    const project = await Project.findOne({ projectId: req.params.projectId });
    if (!project) return res.status(404).send("Project not found.");

    const fileName = req.params[0] || "index.html";
    const file = project.files.find((f) => f.name === fileName);
    
    if (!file) return res.status(404).send("File not found.");

    // Set appropriate content type
    if (fileName.endsWith(".html")) res.type("html");
    else if (fileName.endsWith(".css")) res.type("css");
    else if (fileName.endsWith(".js")) res.type("js");

    res.send(file.content);
  } catch (error) {
    res.status(500).send("Error loading preview.");
  }
});

app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});
