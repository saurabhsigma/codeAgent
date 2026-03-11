export function buildGenerationPrompt(userPrompt) {
  return `You are an expert senior web developer and UI/UX designer specializing in PREMIUM, accessible designs.

STEP 1: ANALYZE USER REQUEST FOR CONTEXT
Identify the website type:
- Restaurant/Food → keywords: food, restaurant, dining, cuisine
- Gym/Fitness → keywords: fitness, gym, workout, sports  
- Tech/SaaS → keywords: technology, office, business, modern
- Fashion → keywords: fashion, shopping, style, model
- Travel/Hotel → keywords: travel, hotel, vacation, resort
- Real Estate → keywords: house, property, architecture
- Portfolio → keywords: creative, art, design, workspace
- Healthcare → keywords: medical, health, clinic
- Education → keywords: education, learning, school

STEP 2: CONTEXT-AWARE IMAGES (MANDATORY!)
⚠️ USE RELEVANT IMAGES MATCHING THE BUSINESS TYPE!
Format: https://picsum.photos/seed/{relevant-keyword}/{width}/{height}

EXAMPLES:
GYM site → seed/fitness1, seed/workout1, seed/gym1, seed/sports1
RESTAURANT → seed/food1, seed/restaurant1, seed/dining1, seed/cuisine1
TECH → seed/technology1, seed/office1, seed/business1, seed/modern1

REQUIRED IMAGES:
1. Hero: <img src="https://picsum.photos/seed/{keyword}1/1920/1080" alt="..." class="absolute inset-0 w-full h-full object-cover">
2. Features (3-6 cards): <img src="https://picsum.photos/seed/{keyword}2/600/400" alt="..." class="w-full rounded-xl">
3. Gallery (4-8): <img src="https://picsum.photos/seed/{keyword}3/800/600" alt="..." class="rounded-lg shadow-xl">

PREMIUM DESIGN SYSTEM:
- Typography: text-6xl md:text-8xl font-black (bold headlines)
- Buttons: px-10 py-4 rounded-full text-lg font-bold
- Cards: rounded-2xl shadow-2xl backdrop-blur-xl
- Spacing: py-24 md:py-32 (generous padding)
- Animations: hover:scale-105 hover:-translate-y-3 transition-all duration-500

CONTRAST RULES:
- Dark bg → text-white
- Light bg → text-gray-900  
- Gradients → text-white with text-shadow

PREMIUM HTML TEMPLATE:
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Title</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body class="antialiased">
  <!-- Sticky Navbar -->
  <nav class="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 border-b">
    <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <div class="text-2xl font-bold">Logo</div>
      <button class="bg-gray-900 text-white px-6 py-2 rounded-full">CTA</button>
    </div>
  </nav>
  
  <!-- Hero with Context-Aware Image -->
  <section class="relative h-screen flex items-center justify-center pt-16">
    <img src="https://picsum.photos/seed/{RELEVANT}/1920/1080" alt="Hero" class="absolute inset-0 w-full h-full object-cover">
    <div class="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-pink-900/80"></div>
    <div class="relative z-10 text-center text-white max-w-5xl mx-auto px-6">
      <h1 class="text-6xl md:text-8xl font-black animate-fade-in-up">Headline</h1>
      <p class="text-xl mt-6">Description</p>
      <div class="mt-10 flex gap-4 justify-center">
        <button class="bg-white text-gray-900 px-10 py-4 rounded-full font-bold hover:scale-105 transition shadow-2xl">Get Started</button>
      </div>
    </div>
  </section>
  
  <!-- Features with Context-Aware Images -->
  <section class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-6">
      <h2 class="text-5xl font-black text-center mb-16">Features</h2>
      <div class="grid md:grid-cols-3 gap-10">
        <div class="group">
          <img src="https://picsum.photos/seed/{RELEVANT}2/600/400" alt="Feature" class="w-full rounded-2xl shadow-xl group-hover:scale-110 transition duration-500">
          <h3 class="text-2xl font-bold mt-6">Title</h3>
          <p class="text-gray-600 mt-3">Description</p>
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
- Intersection Observer for scroll animations
- Smooth scroll
- Navbar blur on scroll

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
1. CONTEXT-AWARE images matching business type
2. BOLD, stunning design
3. PERFECT contrast
4. SMOOTH animations`;
}

export function buildEditPrompt(userPrompt, existingFiles) {
  const filesContext = existingFiles
    .map((file) => `File: ${file.name}\n\`\`\`\n${file.content}\n\`\`\``)
    .join("\n\n");

  return `Edit existing website maintaining premium quality.

Current files:
${filesContext}

MAINTAIN:
- Context-aware images with relevant keywords
- Premium design with Tailwind
- Perfect contrast (white on dark, dark on light)
- Smooth animations
- Professional layout

APPLY CHANGES: ${userPrompt}

Return ALL files in JSON:
{
  "files": [
    { "name": "index.html", "content": "..." },
    { "name": "style.css", "content": "..." },
    { "name": "script.js", "content": "..." }
  ]
}`;
}
