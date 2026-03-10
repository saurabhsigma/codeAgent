# AI Website Builder

Minimal open-source AI website builder using:

- Next.js frontend
- Express backend
- Tailwind CSS
- Monaco Editor
- Groq API for cloud AI generation (free tier)
- Filesystem-based project storage

## Requirements

- Node.js 20+
- npm 10+
- Groq API key (free at https://console.groq.com)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Get your free Groq API key:
   - Visit https://console.groq.com
   - Sign up for a free account
   - Create an API key

3. Copy environment files and add your API key:

```bash
cp server/.env.example server/.env
cp web/.env.local.example web/.env.local
```

4. Run the apps:

```bash
npm run dev
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:4000`

Generated projects are written to `./projects/<project-id>`.

## Features

- Natural language prompt input
- Groq-powered file generation (fast & free)
- Filesystem project storage
- File explorer and Monaco code editor
- Live HTML preview in an iframe
- Project download as ZIP
- Dark UI with basic error handling
