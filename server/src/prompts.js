function detectSiteType(userPrompt) {
  const prompt = userPrompt.toLowerCase();

  if (/(gym|fitness|workout|trainer|crossfit|boxing|wellness)/.test(prompt)) {
    return {
      label: "Gym / fitness studio",
      seeds: ["fitness","gym","workout","sport","athlete","training"],
      accent: "#a3e635",
      accentDark: "#84cc16",
      featurePage: "classes.html",
      featureLabel: "Classes",
      gradient: "from-zinc-950 via-lime-950 to-zinc-950",
    };
  }

  if (/(restaurant|food|cafe|dining|kitchen|chef|bakery|bar)/.test(prompt)) {
    return {
      label: "Restaurant / food brand",
      seeds: ["food","restaurant","kitchen","chef","dining","coffee"],
      accent: "#fb923c",
      accentDark: "#ea580c",
      featurePage: "menu.html",
      featureLabel: "Menu",
      gradient: "from-zinc-950 via-orange-950 to-zinc-950",
    };
  }

  if (/(hotel|travel|resort|villa|vacation|tourism)/.test(prompt)) {
    return {
      label: "Travel / hospitality brand",
      seeds: ["travel","landscape","hotel","beach","resort","luxury"],
      accent: "#38bdf8",
      accentDark: "#0284c7",
      featurePage: "experiences.html",
      featureLabel: "Experiences",
      gradient: "from-slate-950 via-sky-950 to-slate-950",
    };
  }

  if (/(fashion|beauty|cosmetic|style|clothing|jewelry)/.test(prompt)) {
    return {
      label: "Fashion / beauty brand",
      seeds: ["fashion","style","portrait","model","clothing","beauty"],
      accent: "#f472b6",
      accentDark: "#db2777",
      featurePage: "collections.html",
      featureLabel: "Collections",
      gradient: "from-zinc-950 via-pink-950 to-zinc-950",
    };
  }

  if (/(clinic|medical|health|doctor|dental|hospital)/.test(prompt)) {
    return {
      label: "Healthcare brand",
      seeds: ["medical","hospital","doctor","health","clinic","care"],
      accent: "#34d399",
      accentDark: "#059669",
      featurePage: "services.html",
      featureLabel: "Services",
      gradient: "from-slate-950 via-emerald-950 to-slate-950",
    };
  }

  if (/(school|education|academy|learning|course|student)/.test(prompt)) {
    return {
      label: "Education brand",
      seeds: ["education","students","library","university","learning","classroom"],
      accent: "#818cf8",
      accentDark: "#6366f1",
      featurePage: "programs.html",
      featureLabel: "Programs",
      gradient: "from-slate-950 via-indigo-950 to-slate-950",
    };
  }

  if (/(agency|portfolio|studio|creative|designer|photographer)/.test(prompt)) {
    return {
      label: "Creative agency / portfolio",
      seeds: ["creative","design","studio","architecture","art","workspace"],
      accent: "#c084fc",
      accentDark: "#9333ea",
      featurePage: "work.html",
      featureLabel: "Work",
      gradient: "from-zinc-950 via-purple-950 to-zinc-950",
    };
  }

  if (/(property|real estate|interior|architecture|homes|realtor)/.test(prompt)) {
    return {
      label: "Real estate brand",
      seeds: ["architecture","interior","property","building","home","house"],
      accent: "#fbbf24",
      accentDark: "#d97706",
      featurePage: "listings.html",
      featureLabel: "Listings",
      gradient: "from-zinc-950 via-amber-950 to-zinc-950",
    };
  }

  if (/(saas|software|app|startup|tech|ai|platform|tool)/.test(prompt)) {
    return {
      label: "SaaS / tech product",
      seeds: ["technology","computer","data","office","abstract","code"],
      accent: "#60a5fa",
      accentDark: "#2563eb",
      featurePage: "features.html",
      featureLabel: "Features",
      gradient: "from-slate-950 via-blue-950 to-slate-950",
    };
  }

  return {
    label: "Modern premium business",
    seeds: ["business","office","team","professional","work","corporate"],
    accent: "#a78bfa",
    accentDark: "#7c3aed",
    featurePage: "services.html",
    featureLabel: "Services",
    gradient: "from-zinc-950 via-violet-950 to-zinc-950",
  };
}

function picsum(seed, w, h) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

export function buildGenerationPrompt(userPrompt) {
  const siteType = detectSiteType(userPrompt);
  const seeds = siteType.seeds;

  // Pre-build 12 unique seeded image URLs so the model just pastes them directly
  const imgs = {
    hero:    picsum(seeds[0],         1920, 1080),
    hero2:   picsum(seeds[1] ?? seeds[0], 1920, 1080),
    wide:    picsum(seeds[2] ?? seeds[0], 1600, 900),
    feature1:picsum(seeds[3] ?? seeds[1] ?? seeds[0], 800, 600),
    feature2:picsum(seeds[0] + "2",   800, 600),
    feature3:picsum(seeds[1] + "3",   800, 600),
    card1:   picsum(seeds[0] + "a",   600, 400),
    card2:   picsum(seeds[1] + "b",   600, 400),
    card3:   picsum(seeds[2] + "c",   600, 400),
    card4:   picsum(seeds[3] + "d",   600, 400),
    square1: picsum(seeds[0] + "sq1", 600, 600),
    square2: picsum(seeds[1] + "sq2", 600, 600),
    avatar1: picsum("face1",          200, 200),
    avatar2: picsum("face2",          200, 200),
    avatar3: picsum("face3",          200, 200),
  };

  return `You are a world-class digital product designer, UI architect, and senior frontend engineer.

Your job is to create a BEAUTIFUL, MODERN, MULTI-PAGE marketing website for:

SITE TYPE: ${siteType.label}
USER REQUEST: ${userPrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT — RETURN ONLY THIS JSON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "files": [
    { "name": "index.html",             "content": "..." },
    { "name": "about.html",             "content": "..." },
    { "name": "${siteType.featurePage}", "content": "..." },
    { "name": "contact.html",           "content": "..." },
    { "name": "style.css",              "content": "..." },
    { "name": "script.js",              "content": "..." }
  ]
}

No explanations. No markdown. Only the JSON object above.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN SYSTEM — FOLLOW EXACTLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Base palette (dark theme):
  --bg-base:    #09090b          /* zinc-950 */
  --bg-surface: #18181b          /* zinc-900 */
  --bg-card:    #27272a          /* zinc-800 */
  --text-1:     #fafafa           /* zinc-50  */
  --text-2:     #a1a1aa           /* zinc-400 */
  --border:     rgba(255,255,255,0.08)
  --accent:     ${siteType.accent}
  --accent-dk:  ${siteType.accentDark}

Gradient background class on <body>:
  class="bg-zinc-950 ${siteType.gradient} bg-gradient-to-br"

All section and card styles must use these tokens via inline Tailwind classes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNOLOGY STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every HTML file <head> must contain exactly these two script/link tags:

<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: { accent: "${siteType.accent}", "accent-dk": "${siteType.accentDark}" },
        fontFamily: { sans: ["'Inter'","system-ui","sans-serif"], display: ["'Cal Sans'","'Inter'","sans-serif"] }
      }
    }
  }
</script>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMAGE RULES — CRITICAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use ONLY these pre-approved image URLs. Do NOT use loremflickr. Do NOT invent URLs.

Hero large:   ${imgs.hero}
Hero alt:     ${imgs.hero2}
Wide banner:  ${imgs.wide}
Feature 1:    ${imgs.feature1}
Feature 2:    ${imgs.feature2}
Feature 3:    ${imgs.feature3}
Card 1:       ${imgs.card1}
Card 2:       ${imgs.card2}
Card 3:       ${imgs.card3}
Card 4:       ${imgs.card4}
Square 1:     ${imgs.square1}
Square 2:     ${imgs.square2}
Avatar 1:     ${imgs.avatar1}
Avatar 2:     ${imgs.avatar2}
Avatar 3:     ${imgs.avatar3}

Every image container must use this pattern:
<div class="overflow-hidden rounded-2xl">
  <img src="URL" alt="description" class="w-full h-full object-cover" loading="lazy">
</div>

Hero images must have a fixed height: class="w-full h-[520px] object-cover"
Card images must have: class="w-full h-56 object-cover"
Never use inline width/height attributes. Never let an image overflow its container.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NAVIGATION — EXACT PATTERN REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use this exact nav structure (fill in links/labels):

<nav id="navbar" class="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
  <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="index.html" class="text-2xl font-bold text-white tracking-tight">BrandName</a>
    <div class="hidden md:flex items-center gap-8">
      <a href="index.html"   class="nav-link text-zinc-300 hover:text-white text-sm font-medium transition-colors">Home</a>
      <a href="about.html"   class="nav-link text-zinc-300 hover:text-white text-sm font-medium transition-colors">About</a>
      <a href="${siteType.featurePage}" class="nav-link text-zinc-300 hover:text-white text-sm font-medium transition-colors">${siteType.featureLabel}</a>
      <a href="contact.html" class="nav-link text-zinc-300 hover:text-white text-sm font-medium transition-colors">Contact</a>
    </div>
    <div class="flex items-center gap-3">
      <button id="theme-toggle" class="p-2 rounded-full border border-white/10 text-zinc-400 hover:text-white transition-colors" aria-label="Toggle theme">
        <svg id="sun-icon" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.22a1 1 0 011.42 1.42l-.71.7a1 1 0 11-1.41-1.41l.7-.71zm-9.85 0l.7.71A1 1 0 115.66 5.34l-.71-.7A1 1 0 014.37 3.22zM10 5a5 5 0 100 10A5 5 0 0010 5zm7 4a1 1 0 110 2h-1a1 1 0 110-2h1zm-13 0H3a1 1 0 110 2H3a1 1 0 110-2zm11.78 5.07l.7.71a1 1 0 01-1.41 1.41l-.71-.7a1 1 0 011.42-1.42zM5.64 15.36l-.71.71a1 1 0 01-1.41-1.41l.7-.71a1 1 0 011.42 1.41zM10 17a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z"/></svg>
        <svg id="moon-icon" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
      </button>
      <a href="contact.html" class="hidden md:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 text-zinc-950" style="background:${siteType.accent}">Get Started</a>
      <button id="mobile-toggle" class="md:hidden p-2 text-zinc-300" aria-label="Menu">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
  </div>
  <div id="mobile-menu" class="md:hidden hidden px-6 pb-4 bg-zinc-900/95 backdrop-blur-xl border-t border-white/5">
    <a href="index.html"   class="block py-3 text-zinc-300 hover:text-white text-sm font-medium border-b border-white/5">Home</a>
    <a href="about.html"   class="block py-3 text-zinc-300 hover:text-white text-sm font-medium border-b border-white/5">About</a>
    <a href="${siteType.featurePage}" class="block py-3 text-zinc-300 hover:text-white text-sm font-medium border-b border-white/5">${siteType.featureLabel}</a>
    <a href="contact.html" class="block py-3 text-zinc-300 hover:text-white text-sm font-medium">Contact</a>
  </div>
</nav>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HERO SECTION PATTERN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use this exact hero structure:

<section class="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
  <!-- background image layer -->
  <div class="absolute inset-0">
    <img src="${imgs.hero}" alt="hero" class="w-full h-full object-cover opacity-20">
    <div class="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/40 to-zinc-950"></div>
  </div>
  <!-- animated gradient orbs -->
  <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse" style="background:${siteType.accent}"></div>
  <div class="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15 animate-pulse" style="background:${siteType.accentDark};animation-delay:1s"></div>
  <!-- content -->
  <div class="relative z-10 max-w-6xl mx-auto px-6 text-center">
    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-zinc-300 mb-8">
      <span class="w-2 h-2 rounded-full animate-pulse" style="background:${siteType.accent}"></span>
      A short trust or category tagline here
    </div>
    <h1 class="text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-6">
      Powerful Headline<br><span class="bg-gradient-to-r from-[${siteType.accent}] to-[${siteType.accentDark}] bg-clip-text text-transparent">With Gradient Accent</span>
    </h1>
    <p class="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
      Compelling subtext that explains value proposition clearly and concisely.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="contact.html" class="px-8 py-4 rounded-full font-bold text-zinc-950 transition-all hover:scale-105 hover:shadow-lg" style="background:${siteType.accent}">Primary CTA</a>
      <a href="${siteType.featurePage}" class="px-8 py-4 rounded-full font-semibold text-white border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">Secondary CTA →</a>
    </div>
    <!-- trust metrics row -->
    <div class="mt-16 flex flex-wrap justify-center gap-8">
      <div class="text-center"><div class="text-3xl font-black text-white">500+</div><div class="text-zinc-400 text-sm mt-1">Metric Label</div></div>
      <div class="w-px bg-white/10 hidden sm:block"></div>
      <div class="text-center"><div class="text-3xl font-black text-white">98%</div><div class="text-zinc-400 text-sm mt-1">Metric Label</div></div>
      <div class="w-px bg-white/10 hidden sm:block"></div>
      <div class="text-center"><div class="text-3xl font-black text-white">12x</div><div class="text-zinc-400 text-sm mt-1">Metric Label</div></div>
    </div>
  </div>
</section>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT PATTERNS TO USE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FEATURE CARD:
<div class="group p-6 rounded-2xl bg-zinc-900 border border-white/8 hover:border-[${siteType.accent}]/30 hover:-translate-y-1 transition-all duration-300">
  <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-zinc-950 font-bold" style="background:${siteType.accent}">
    <!-- SVG icon or emoji -->
  </div>
  <h3 class="text-white font-bold text-lg mb-2">Feature Title</h3>
  <p class="text-zinc-400 text-sm leading-relaxed">Description text goes here.</p>
</div>

IMAGE CARD (for gallery/portfolio):
<div class="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/8 hover:-translate-y-1 transition-all duration-300">
  <div class="overflow-hidden">
    <img src="URL" alt="alt text" class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500">
  </div>
  <div class="p-5">
    <span class="text-xs font-semibold uppercase tracking-widest" style="color:${siteType.accent}">Category</span>
    <h3 class="text-white font-bold mt-1 mb-2">Card Title</h3>
    <p class="text-zinc-400 text-sm">Short description here.</p>
  </div>
</div>

TESTIMONIAL CARD:
<div class="p-6 rounded-2xl bg-zinc-900/60 border border-white/8 backdrop-blur-sm">
  <div class="flex gap-1 mb-4">
    ${[1,2,3,4,5].map(() => `<span style="color:${siteType.accent}">★</span>`).join("")}
  </div>
  <p class="text-zinc-300 text-sm leading-relaxed mb-4">"Testimonial quote goes here — make it specific and impactful."</p>
  <div class="flex items-center gap-3">
    <div class="overflow-hidden rounded-full w-10 h-10"><img src="AVATAR_URL" alt="Name" class="w-full h-full object-cover"></div>
    <div><div class="text-white text-sm font-semibold">Person Name</div><div class="text-zinc-500 text-xs">Title, Company</div></div>
  </div>
</div>

STAT BAND:
<section class="py-16 border-y border-white/8">
  <div class="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
    <div><div class="text-4xl font-black text-white counter" data-target="500">0</div><div class="text-zinc-400 text-sm mt-2">Label</div></div>
    <!-- repeat -->
  </div>
</section>

CTA BAND:
<section class="py-24 relative overflow-hidden">
  <div class="absolute inset-0 opacity-10" style="background:radial-gradient(circle at 50% 50%, ${siteType.accent}, transparent 70%)"></div>
  <div class="relative max-w-3xl mx-auto px-6 text-center">
    <h2 class="text-4xl md:text-5xl font-black text-white mb-6">Ready to get started?</h2>
    <p class="text-zinc-400 text-lg mb-8">Supporting line that builds urgency or trust.</p>
    <a href="contact.html" class="inline-flex px-8 py-4 rounded-full font-bold text-zinc-950 hover:scale-105 transition-all hover:shadow-lg" style="background:${siteType.accent}">Start Now →</a>
  </div>
</section>

FOOTER PATTERN:
<footer class="bg-zinc-950 border-t border-white/8 py-16">
  <div class="max-w-7xl mx-auto px-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
      <div class="md:col-span-2">
        <h3 class="text-2xl font-black text-white mb-3">BrandName</h3>
        <p class="text-zinc-400 text-sm max-w-xs leading-relaxed mb-4">Short compelling brand statement.</p>
        <div class="flex gap-3">
          <!-- Social icons as SVG -->
        </div>
      </div>
      <div>
        <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Company</h4>
        <ul class="space-y-3 text-zinc-400 text-sm">
          <li><a href="about.html" class="hover:text-white transition-colors">About</a></li>
          <li><a href="${siteType.featurePage}" class="hover:text-white transition-colors">${siteType.featureLabel}</a></li>
          <li><a href="contact.html" class="hover:text-white transition-colors">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Contact</h4>
        <ul class="space-y-3 text-zinc-400 text-sm">
          <li>hello@brand.com</li>
          <li>+1 (555) 000-0000</li>
          <li>City, Country</li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500 text-sm">
      <span>© 2026 BrandName. All rights reserved.</span>
      <div class="flex gap-6"><a href="#" class="hover:text-white transition-colors">Privacy</a><a href="#" class="hover:text-white transition-colors">Terms</a></div>
    </div>
  </div>
</footer>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
style.css — REQUIRED CONTENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

style.css must include ALL of these:

:root {
  --accent: ${siteType.accent};
  --accent-dk: ${siteType.accentDark};
  --bg-base: #09090b;
  --bg-surface: #18181b;
  --bg-card: #27272a;
  --text-1: #fafafa;
  --text-2: #a1a1aa;
  --border: rgba(255,255,255,0.08);
  --radius: 1rem;
  --font: "Inter", system-ui, sans-serif;
}

html.light-mode {
  --bg-base: #ffffff;
  --bg-surface: #f4f4f5;
  --bg-card: #e4e4e7;
  --text-1: #09090b;
  --text-2: #52525b;
  --border: rgba(0,0,0,0.08);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  font-family: var(--font);
  background: var(--bg-base);
  color: var(--text-1);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

img { display: block; max-width: 100%; }

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 3px; }

/* Navbar scroll effect */
#navbar.scrolled {
  background: rgba(9,9,11,0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}

html.light-mode #navbar.scrolled {
  background: rgba(255,255,255,0.85);
}

/* Reveal animation */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Counter number */
.counter { font-variant-numeric: tabular-nums; }

/* Gradient text utility */
.gradient-text {
  background: linear-gradient(135deg, var(--accent), var(--accent-dk));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glass panel */
.glass {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius);
}

/* Accent glow */
.glow {
  box-shadow: 0 0 40px rgba(${siteType.accent.replace("#","")},0.2);
}

/* Animate pulse slow */
@keyframes pulse-slow { 0%,100%{opacity:0.15} 50%{opacity:0.3} }
.pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
script.js — REQUIRED CONTENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

script.js must include ALL of these exact implementations:

// 1. Navbar scroll effect
const navbar = document.getElementById("navbar");
if (navbar) {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  });
}

// 2. Mobile menu
const mobileToggle = document.getElementById("mobile-toggle");
const mobileMenu = document.getElementById("mobile-menu");
if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}

// 3. Theme toggle
const themeToggle = document.getElementById("theme-toggle");
const sunIcon = document.getElementById("sun-icon");
const moonIcon = document.getElementById("moon-icon");
const html = document.documentElement;
let dark = localStorage.getItem("theme") !== "light";
function applyTheme() {
  if (dark) {
    html.classList.remove("light-mode");
    if (sunIcon) sunIcon.classList.add("hidden");
    if (moonIcon) moonIcon.classList.remove("hidden");
  } else {
    html.classList.add("light-mode");
    if (sunIcon) sunIcon.classList.remove("hidden");
    if (moonIcon) moonIcon.classList.add("hidden");
  }
}
applyTheme();
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    dark = !dark;
    localStorage.setItem("theme", dark ? "dark" : "light");
    applyTheme();
  });
}

// 4. Scroll reveal
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => observer.observe(el));
}

// 5. Counter animation
const counters = document.querySelectorAll(".counter");
if (counters.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target || "0", 10);
        let start = 0;
        const step = Math.ceil(target / 60);
        const tick = setInterval(() => {
          start += step;
          if (start >= target) { el.textContent = target.toLocaleString() + "+"; clearInterval(tick); }
          else { el.textContent = start.toLocaleString(); }
        }, 20);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach((el) => counterObserver.observe(el));
}

// 6. Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
  });
});

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE CONTENT REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

index.html — HOME
  1. Hero (use pattern above, bg image: ${imgs.hero})
  2. Trusted-by logo strip (fake logos as text)
  3. Feature grid — 6 feature cards with icons
  4. Stats band (4 metrics)
  5. Image showcase — 3 image cards side by side (${imgs.card1}, ${imgs.card2}, ${imgs.card3})
  6. Testimonials — 3 cards (${imgs.avatar1}, ${imgs.avatar2}, ${imgs.avatar3})
  7. CTA band
  8. Footer

about.html — ABOUT
  1. Page hero (bg: ${imgs.hero2}) — half-height with title overlay
  2. Mission statement — large text block
  3. Team section — 3 people with avatars (${imgs.avatar1}, ${imgs.avatar2}, ${imgs.avatar3})
  4. Side-by-side image + text story (${imgs.wide})
  5. Values grid — 4 value cards
  6. CTA band
  7. Footer

${siteType.featurePage} — ${siteType.featureLabel.toUpperCase()}
  1. Page hero (bg: ${imgs.feature1})
  2. 6 detailed feature/service/item cards with images (${imgs.feature1}, ${imgs.feature2}, ${imgs.feature3}, ${imgs.card1}, ${imgs.card2}, ${imgs.card3})
  3. Stats band
  4. CTA band
  5. Footer

contact.html — CONTACT
  1. Page hero — simple centered title
  2. Contact form in glass card — Name, Email, Message, Submit
  3. Contact info beside form — address, phone, email, map placeholder
  4. CTA band
  5. Footer

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COPY AND CONTENT QUALITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Write real, confident marketing copy tailored to the business type.
- Use strong action verbs in headlines.
- Include realistic pricing, testimonials, team names, and statistics.
- No lorem ipsum anywhere.
- Section headings must be clear and direct.
- Write in second person ("You", "Your").

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSIVENESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every section must use responsive Tailwind grid classes:
  grid-cols-1 md:grid-cols-2 lg:grid-cols-3

Padding must use px-4 sm:px-6 lg:px-8 patterns.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACCESSIBILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- All img tags must have descriptive alt text.
- All form inputs must have labels.
- Buttons must have aria-label when icon-only.
- Use semantic HTML: nav, main, section, article, header, footer, h1-h3.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add class="reveal" to every major section, card, and content block so they fade in on scroll.

Return ONLY the JSON. No explanation.
`;
}

export function buildEditPrompt(userPrompt, existingFiles) {
  const filesContext = existingFiles
    .map((file) => `=== ${file.name} ===\n${file.content}`)
    .join("\n\n");

  return `You are a senior frontend engineer upgrading a premium website.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT FILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${filesContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER CHANGE REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${userPrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EDIT RULES — FOLLOW STRICTLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Return COMPLETE updated files — never patches or diffs.
2. Apply the user's request precisely.
3. If a UI component exists and is good, keep it. Improve anything that looks dated.
4. All images must use picsum.photos URLs in this format:
   https://picsum.photos/seed/{keyword}/{width}/{height}
   e.g.  https://picsum.photos/seed/gym1/800/600
   Never use loremflickr. Never use placeholder.com. Never use via.placeholder.
5. Every image must sit inside: <div class="overflow-hidden rounded-2xl"> with <img class="w-full h-full object-cover">
6. Preserve existing nav, theme toggle, mobile menu, and script.js scroll reveal logic.
7. Maintain Tailwind CDN + custom style.css design token pattern.
8. Keep all page-to-page navigation links working.
9. Add class="reveal" to any new major sections or cards.
10. Upgrade any dated-looking sections (plain divs with raw borders, unstyled text, etc.) to use the card/glass/gradient patterns.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON:

{
  "files": [
    { "name": "index.html",    "content": "..." },
    { "name": "about.html",    "content": "..." },
    { "name": "contact.html",  "content": "..." },
    { "name": "style.css",     "content": "..." },
    { "name": "script.js",     "content": "..." }
  ]
}

No explanations. No markdown fences. Only the JSON.
`;
}