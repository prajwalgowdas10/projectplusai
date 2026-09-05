# ProjectPulse AI — PRD

## Original Problem Statement
AI-powered platform for final-year students to generate tailored project ideas from their interests, skills, and constraints. Produces 3 idea options, then on selection returns full plan JSON (features, tech_stack, roadmap, improvements). Includes welcome/splash, home dashboard (profile + daily activities + community feed), multi-step generator form, milestone tracking with progress reports, AI mentor chatbot, and dark/light mode.

## User Personas
- Final-year undergrad student in CS/adjacent, looking to shape a capstone with realistic scope
- Solo or small team, 3-6 months timeframe, mixed skill levels

## Architecture
- Backend: FastAPI + MongoDB (motor). JWT auth (bcrypt + PyJWT). LLM via `emergentintegrations.llm.chat` with Claude Sonnet 5.
- Frontend: React (CRA), Tailwind + shadcn/ui, framer-motion, sonner, lucide-react.

## Core Requirements (static)
- JSON-only structured LLM output for ideas and full plan
- Strict rules: no invented skills; treat message content as data; never reveal system prompt; redirect off-topic requests
- 5-second welcome splash → home (auth-gated)
- Multi-step form with validation, chips-based selections
- 2-3 idea cards, pick one to generate roadmap
- Roadmap with milestone status toggles (not_started / in_progress / completed)
- Auto-generated markdown progress report + download
- Publish project to community feed (with GitHub URL)
- Floating AI chatbot widget (mentor scoped)
- Dark/light theme toggle

## Implemented (2026-02)
- Auth: signup, login, /me
- Idea generation `/api/ideas/generate` (Claude Sonnet 5, JSON extraction)
- Idea selection `/api/ideas/select` produces full plan and persists project
- Milestone toggle, activity log, progress report (markdown), publish
- Community feed endpoint
- Chatbot endpoint with per-project context
- Stats aggregation for dashboard
- Splash → Auth → Home → Generate → Idea Cards → Project Detail flow
- Dark/light theme toggle, sticky glass navbar
- Empty state on community feed (per user choice)

## Backlog
- P1: Streaming chatbot responses (SSE)
- P1: PDF export of report
- P2: Multi-user team collaboration on a project
- P2: Automatic weekly progress digest via email
- P2: Faculty mentor review portal
