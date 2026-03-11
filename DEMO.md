# HWL Assistant — Full Demo Script

> **Audience:** Stakeholders, developers, and reviewers.
> **Duration:** ~25–30 minutes.
> **Pre-requisite:** A laptop with Node.js (≥18) and Bun installed, internet for Google Fonts.

---

## Part 1 — The Big Picture (2 min)

Start by explaining **what this application is** and **why it was built**.

> _"This is HWL Assistant — an AI-powered chat application that answers questions about the HWL healthcare staffing platform. It turns structured JSON data from an LLM into rich, interactive components — step-by-step guides, choice cards, funnel charts, flowchart diagrams, checklists, and escalation prompts."_

### Core Architectural Principle

> _"The most important design decision we made: **the LLM only returns structured JSON — never prose, never HTML, never direct markdown.** The frontend owns all presentation. This means we can change how anything looks without retraining the model, and the LLM can never hallucinate layout bugs."_

**Pipeline in one sentence:**

```
User types → API/dummy returns LLMResponse JSON → jsonToMdx() converts to MDX string → useMDX() compiles → React renders interactive components
```

---

## Part 2 — How It Was Built From Scratch (10 min)

### Step 1: Project Bootstrap

The project was initialized using Vite with the React + TypeScript template:

```bash
# Create the project using Vite
npx create-vite@latest hwl-assistant --template react-ts

# Navigate into the project
cd hwl-assistant
```

**Why Vite?** Lightning-fast HMR (Hot Module Replacement) during development, optimized production builds, and first-class TypeScript support.

### Step 2: Package Manager — Bun

We use **Bun** as the package manager and runtime for speed:

```bash
bun install
```

### Step 3: Install Core Dependencies

Here are the packages that power the app, with the **why** for each:

| Package          | Version  | Why                                                                                     |
| ---------------- | -------- | --------------------------------------------------------------------------------------- |
| `react`          | ^19.2.0  | UI framework — latest React 19                                                          |
| `react-dom`      | ^19.2.0  | DOM rendering for React                                                                 |
| `@mdx-js/mdx`    | ^3.1.1   | **Runtime MDX compilation** — converts MDX strings into React components in the browser |
| `react-markdown` | ^9.0.1   | Fallback markdown renderer when MDX compilation fails                                   |
| `remark-gfm`     | ^4.0.0   | GitHub Flavored Markdown support (tables, strikethrough, etc.)                          |
| `jose`           | ^6.2.0   | JWT token generation & verification for authentication                                  |
| `mermaid`        | ^11.12.3 | Renders flowchart diagrams from Mermaid syntax                                          |

```bash
bun add react react-dom @mdx-js/mdx react-markdown remark-gfm jose mermaid
```

### Step 4: Install Dev Dependencies

| Package                                | Why                                               |
| -------------------------------------- | ------------------------------------------------- |
| `tailwindcss` ^4 + `@tailwindcss/vite` | Utility-first CSS framework (v4 with Vite plugin) |
| `@vitejs/plugin-react`                 | Babel-based React refresh for Vite                |
| `typescript` ~5.9                      | Type safety across the codebase                   |
| `eslint` + plugins                     | Code quality and React-specific lint rules        |

```bash
bun add -d tailwindcss @tailwindcss/vite @vitejs/plugin-react typescript eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals @types/react @types/react-dom @types/node
```

### Step 5: Configure Vite

Show `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, open: true },
});
```

**Key points:**

- Standard SPA build (not a library build)
- Tailwind v4 integration via Vite plugin (no `tailwind.config.js` needed)
- Auto-opens browser on `bun run dev`

### Step 6: Set Up the Font & Base CSS

Show `index.html` — loads **Inter** from Google Fonts:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
  rel="stylesheet"
/>
```

Show `index.css` — Tailwind import + theme override:

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

### Step 7: Environment Setup

Show `.env`:

```env
VITE_JWT_SECRET=zYYN5+uYgq4XWHekpa6/JL0HRmAQ589tA/KT+or0OaU=
VITE_API_URL=http://localhost:3000
```

> _"The JWT secret is used to generate demo tokens. In production, tokens come from the host application."_

---

## Part 3 — Architecture Walkthrough (8 min)

### The File Structure

```
src/
├── App.tsx                    # Entry point — auth gate → ChatPage
├── main.tsx                   # React DOM mount point
├── config.ts                  # APP_CONFIG — single source of truth
├── index.css                  # Tailwind + font setup
│
├── types/
│   ├── index.ts               # Message, Session, Citation, ApiResponse types
│   └── llmResponse.ts         # LLMResponse — the JSON contract with the LLM
│
├── hooks/
│   ├── useAuth.ts             # JWT auth: URL param → sessionStorage → demo token
│   ├── useSession.ts          # Session index + active session + localStorage
│   ├── useMessages.ts         # Per-session message CRUD + localStorage
│   └── useMDX.ts              # Runtime MDX string → React component compiler
│
├── services/
│   └── api.ts                 # sendMessage() — demo mode (dummy) & production (API)
│
├── lib/
│   ├── dummy.ts               # 15+ hardcoded LLMResponse entries + keyword scorer
│   ├── jsonToMdx.ts           # LLMResponse JSON → MDX string assembler
│   └── mdxComponents.ts       # Component registry (tag name → React component)
│
├── pages/
│   └── ChatPage.tsx           # Full-page chat layout with sidebar + message area
│
├── components/
│   ├── MessageList.tsx        # Scrollable list + welcome screen + typing indicator
│   ├── MessageBubble.tsx      # Single message — MDX compilation + component injection
│   ├── InputBar.tsx           # Text input + send button
│   └── Citations.tsx          # Source references under assistant messages
│
├── mdx-components/            # Interactive UI blocks rendered inside messages
│   ├── Alert.tsx              # Warning / info / danger banner
│   ├── Steps.tsx              # Numbered step-by-step instructions
│   ├── Checklist.tsx          # Interactive checkbox list
│   ├── Choices.tsx            # Clickable option cards (triggers follow-up)
│   ├── FunnelChart.tsx        # Visual pipeline funnel
│   ├── Mermaid.tsx            # Flowchart diagrams via mermaid.js
│   ├── Summary.tsx            # Completion/resolution card
│   └── Escalation.tsx         # Support escalation with ticket button
│
├── assets/
│   └── icons.tsx              # All SVG icons as typed React components
│
└── utils/
    └── generateDemoToken.ts   # jose-based HS256 JWT generator for demo mode
```

### The Data Flow

Walk through this diagram step by step:

```
User types "How do I add a candidate?"
       │
       ▼
ChatPage.send()
  │  Creates Message { role: "user", content: text }
  │  Saves to React state + localStorage
       │
       ▼
services/api.ts → sendMessage()
  │
  ├─ Demo Mode (demoMode=true):
  │    dummy.ts → getDummyResponse(text)    ← keyword scoring, returns LLMResponse JSON
  │    jsonToMdx(json)                       ← converts JSON → MDX string
  │    return MDX string
  │
  └─ Production Mode (demoMode=false):
       POST /answer { message, session_id }
       ← HTTP 200: LLMResponse JSON
       jsonToMdx(parsed)
       return MDX string
       │
       ▼
ChatPage receives MDX string
  addMessage({ role: "assistant", content: mdxString })
       │
       ▼
MessageBubble renders the message
  useMDX(content)     → compiles MDX → React component
  Injects mdxComponents (Alert, Steps, Choices, etc.)
  Renders interactive UI
```

### The LLM Response Contract

> _"Every response — from the LLM or from our demo data — follows this exact shape. This is the contract between backend and frontend."_

Show `types/llmResponse.ts` and explain each field:

| Field           | Type                                                    | Purpose                        |
| --------------- | ------------------------------------------------------- | ------------------------------ |
| `action`        | `clarify` / `respond` / `not_found` / `quota_exceeded`  | What the backend decided to do |
| `response_type` | `answer` / `options` / `mixed` / `clarify` / `notfound` | Frontend layout instruction    |
| `alert`         | `{ severity, title, body }` or `null`                   | Warning/info/danger banner     |
| `title`         | `string`                                                | Heading for the response       |
| `intro`         | `string` or `null`                                      | Introductory paragraph         |
| `steps`         | `[{ title, body }]` or `null`                           | Step-by-step instructions      |
| `items`         | `string[]` or `null`                                    | Checklist items                |
| `options`       | `[{ label, value, description }]` or `null`             | Clickable choice cards         |
| `summary`       | `{ title, body, actions }` or `null`                    | Summary/conclusion card        |
| `escalation`    | `{ title, message, reason }` or `null`                  | Support escalation             |
| `chart`         | Mermaid string or `null`                                | Flowchart diagram              |
| `stages`        | `[{ label, description }]` or `null`                    | Funnel chart stages            |
| `followUp`      | `string` or `null`                                      | Prompt to continue             |
| `citations`     | `[{ chunk_id, source }]`                                | Document source references     |

### Key Design Decisions to Highlight

1. **JSON → MDX → React** (not JSON → JSX directly)

   > _"MDX strings are serialisable. They go into localStorage, API responses, message history. They can be logged and replayed. Direct JSX cannot."_

2. **`jsonToMdx()` is the assembly layer**

   > _"One function turns structured data into renderable UI. Change the rendering order? Edit one function. Add a component? Add one block."_

3. **Choices create multi-turn flows**

   > _"When a user clicks a choice, the choice's `value` is sent as a new message. No state machine. No conversation graph. Just data."_

4. **Demo and production are identical pipelines**
   > _"Both produce an MDX string from an LLMResponse. The only difference: where the LLMResponse came from — dummy.ts or the network."_

---

## Part 4 — Running the App (2 min)

### Start the Dev Server

```bash
cd hwl-assistant
bun run dev
```

The app opens at `http://localhost:5173`. Point out:

- **Demo Mode badge** in the header and sidebar — this runs entirely client-side with `dummy.ts`
- **JWT auto-generation** — `useAuth` generates a demo HS256 token via jose on first load
- **User badge** shows "demo-user-001" in the sidebar

### The Config File

Show `config.ts` and explain that this is the **single source of truth**:

```ts
export const APP_CONFIG = {
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
  demoMode: true, // ← flip to false for production
  title: "HWL Assistant",
  subtitle: "Your intelligent guide",
  primaryColor: "#0052CC",
  placeholder: "Ask me anything…",
  quickReplies: [
    { icon: "people", text: "How do I propose a candidate?" },
    { icon: "doc", text: "How do I add a candidate to the Staff Pool?" },
    { icon: "clock", text: "How do I sign an assignment agreement?" },
  ],
};
```

> _"To switch to production: set `demoMode: false`, configure `VITE_API_URL`, and the app calls the real backend. Zero code changes."_

---

## Part 5 — Live Feature Demo (10 min)

### Welcome Screen

> _"When you open the app, you see a welcome screen with quick reply buttons. These are configurable via `config.ts`."_

Click the welcome screen's quick replies to start.

---

### Demo 1: Steps + Alert

**Type:** _"How do I add a candidate to the Staff Pool?"_

**What appears:**

- ⚠️ **Alert** (warning) — "Do not bypass the system"
- 📋 **Steps** — 5 numbered steps with bold highlights
- 📄 **Citations** — source document reference

> _"This is a `response_type: answer`. The JSON had an `alert` and `steps` array. `jsonToMdx()` assembled them into `<Alert />` and `<Steps />` MDX tags. `useMDX()` compiled them to React components."_

---

### Demo 2: Choices → Sub-flow (Branching)

**Type:** _"How do I deactivate or activate a candidate?"_

**What appears:**

- **Choices** — "Deactivate a candidate" / "Reactivate a candidate"

**Click "Deactivate a candidate":**

- Alert (info) + Steps (6 steps)

> _"This is the interactive flow. Clicking a choice sends `option.value` as a new user message. The dummy scorer matches it to the deactivate sub-flow entry. In production, the API handles the routing."_

---

### Demo 3: Multiple Choice Levels (Sign Agreement)

**Type:** _"How do I sign an agreement?"_

**What appears:**

- **Alert** (info) — Where to find pending agreements
- **Choices** — 4 routing options

**Click "Approve everything and send":**

- Steps (6 steps)
- **Mermaid flowchart** diagram

> _"This is `response_type: mixed` — a combination of Steps and a Mermaid diagram. The Mermaid string in the JSON becomes `<Mermaid chart={\`...\`} />` in MDX, which uses the mermaid.js library to render a real SVG flowchart."_

---

### Demo 4: Funnel Chart + Summary

**Type:** _"Show me the full assignment workflow"_

**What appears:**

- **FunnelChart** — 6-stage visual funnel narrowing from top to bottom
- **Summary** — Key Stages at a Glance with action items

> _"This is `response_type: mixed` with `stages` and `summary`. The FunnelChart calculates widths and opacity from the `primaryColor` automatically."_

---

### Demo 5: Checklist + Escalation

**Type:** _"I cannot see a candidate"_

**What appears:**

- **Checklist** — Interactive checkboxes (click to toggle ✓)
- **Escalation** — "Create Support Ticket" button

> _"The checklist is interactive — users can check items off. The escalation card provides a way to create a support ticket when documentation alone isn't enough."_

---

### Demo 6: Not Found + Fallback

**Type:** _"How do I process payroll?"_

**What appears:**

- **Alert** (warning) — Not found in knowledge base
- **Choices** — Suggested alternative topics
- **Escalation** — Contact support

> _"This is `action: not_found`. The response gracefully redirects the user to topics we can help with, and offers an escalation path."_

---

### Demo 7: Session Management

Demonstrate:

1. **New Conversation** button — creates a new session
2. **Session sidebar** — click between sessions to switch
3. **Session persistence** — refresh the page, all messages are still there (localStorage)
4. **Delete session** — hover a session, click ×

> _"Sessions are stored entirely in localStorage. Each session has its own message array. The session index caps at 20 entries."_

---

### Demo 8: Error Handling

> _"If the API is down, the app shows a connection error Alert — not a blank screen, not a crash. This is rendered as MDX too: `<Alert severity='danger' ... />`."_

---

## Part 6 — How to Add a New Component (2 min)

Walk through the 5-step process:

1. **Create** `mdx-components/MyComponent.tsx`
2. **Register** in `lib/mdxComponents.ts`
3. **Add fields** to `types/llmResponse.ts` (if needed)
4. **Handle** in `lib/jsonToMdx.ts`
5. **Tell the backend** to populate the new fields

> _"That's it. No other files change. The architecture is purely additive."_

---

## Part 7 — Production Readiness (1 min)

To move from demo to production:

| What               | Change                                                             |
| ------------------ | ------------------------------------------------------------------ |
| Switch to real API | Set `demoMode: false` in `config.ts`                               |
| Set API URL        | `VITE_API_URL=https://your-api.com` in `.env`                      |
| JWT auth           | Host app passes token via URL param `?token=...`                   |
| Branding           | Edit `primaryColor`, `title`, `subtitle`, `logoUrl` in `config.ts` |
| Build              | `bun run build` → outputs to `dist/`                               |

> _"The entire configuration lives in one file: `config.ts`. Zero code changes to go live."_

---

## Quick Reference — Demo Questions

Use these during the demo for maximum variety:

| #   | Question                                         | Components Shown                            |
| --- | ------------------------------------------------ | ------------------------------------------- |
| 1   | _"How do I add a candidate to the Staff Pool?"_  | Alert + Steps + Citations                   |
| 2   | _"How do I deactivate or activate a candidate?"_ | Choices → (click) → Alert + Steps           |
| 3   | _"How do I propose a candidate?"_                | Choices → (click) → Alert + Steps           |
| 4   | _"How do I sign an agreement?"_                  | Alert + Choices → (click) → Steps + Mermaid |
| 5   | _"Show me the full assignment workflow"_         | FunnelChart + Summary                       |
| 6   | _"I cannot see a candidate"_                     | Checklist + Escalation                      |
| 7   | _"How do I process payroll?"_                    | Alert + Choices + Escalation (not found)    |
| 8   | _"Hello"_                                        | Choices (greeting/clarification)            |

> **💡 Best first three questions for a demo:** #2, #4, and #5 — they showcase the most variety (branching, diagrams, and visual charts).

---

## Appendix — Technology Summary

| Layer               | Technology                  | Purpose                                               |
| ------------------- | --------------------------- | ----------------------------------------------------- |
| **Framework**       | React 19 + TypeScript 5.9   | Component-based UI with type safety                   |
| **Build Tool**      | Vite 7                      | Fast dev server with HMR                              |
| **Package Manager** | Bun                         | Fast installs and script execution                    |
| **Styling**         | Tailwind CSS v4             | Utility-first CSS (no config file needed in v4)       |
| **Font**            | Inter (Google Fonts)        | Modern, clean sans-serif typeface                     |
| **MDX**             | @mdx-js/mdx v3              | Runtime compilation of MDX strings → React components |
| **Markdown**        | react-markdown + remark-gfm | Fallback renderer and GFM support                     |
| **Auth**            | jose (HS256 JWT)            | Token generation/verification                         |
| **Diagrams**        | mermaid.js                  | Flowchart rendering from text syntax                  |
| **State**           | React hooks + localStorage  | No external state management library needed           |

---

_Last updated: March 2026_
