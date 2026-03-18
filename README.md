# ClaudeWork — AI-Powered Programming Assistant

<p align="center">
  <img src="public/logo.png" alt="ClaudeWork" width="120">
</p>

<p align="center">
  <strong>Your AI pair programmer — chat, code, run, and ship, all from one desktop app</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
  <br>
  <img src="https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux%20%7C%20Mobile-brightgreen?style=for-the-badge" alt="Platform">
  <br>
  <img src="https://img.shields.io/badge/Electron-40-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
</p>

<p align="center">
  English · <a href="README_zh.md">中文</a>
</p>

---

**ClaudeWork** is an AI-powered programming assistant built on the Claude Agent SDK. It provides an IDE-like environment — file explorer, code viewer, and embedded terminal — powered by an AI agent that can read files, write code, run commands, and explain results, all under your supervision.

At its core is **Cowork mode**: an AI working session where the agent can autonomously browse your project, edit source files, execute shell commands, run tests, search the web, and generate documents — pausing at every sensitive step to ask for your approval. The result is a coding workflow where you focus on what to build while the AI handles how.

Beyond coding, ClaudeWork ships with 20+ built-in skills (Office documents, video generation, web automation, email, and more) and can be triggered remotely from your phone via Telegram, Discord, DingTalk, or Feishu.

## Key Features

### 🖥️ IDE-Like Workspace
- **File Explorer** — Browse, search, and open files in your project with git branch awareness
- **Code Viewer** — Monaco Editor (the engine powering VS Code) with syntax highlighting for 30+ languages
- **Diff Viewer** — Side-by-side code diff for reviewing AI-generated changes before applying them
- **Embedded Terminal** — Full xterm.js terminal to run commands, tests, and scripts without leaving the app
- **Command Palette** — Quick keyboard-driven access to all features (`Cmd/Ctrl+Shift+P`)

### 🤖 AI Agent (Cowork Mode)
- **Conversational Coding** — Describe what you want in plain language; the agent reads your codebase and generates complete, context-aware solutions
- **Tool Execution** — The agent can run shell commands, edit files, call APIs, and chain multiple steps autonomously
- **Permission Gating** — Every file write, terminal command, and network call requires your explicit approval before execution
- **Streaming Results** — Watch the agent think and act in real time with live output streaming
- **Persistent Memory** — Automatically remembers your preferences, coding style, and project details across sessions

### ⚡ Execution Modes
- **Local Execution** — Run tasks directly on your machine at full speed
- **Sandbox Execution** — Isolated Alpine Linux VM for safe experimentation without touching your system

### 🛠️ Built-in Skills (20+)
- **Code & Automation** — Web automation (Playwright), web game development, frontend UI design, web search
- **Documents** — Word (docx), Excel (xlsx), PowerPoint (pptx), PDF processing
- **Creative** — AI video generation (Remotion / Seedance), AI image generation (Seedream), canvas design
- **Productivity** — Scheduled tasks, email (IMAP/SMTP), weather, news search, plan authoring

### 📱 Mobile Remote Control
- Control your desktop agent from your phone via **Telegram**, **Discord**, **DingTalk**, **Feishu**, or **NetEase IM**

### 🔒 Security & Privacy
- **Local Data** — All chat history and config stored in a local SQLite database, never uploaded
- **Workspace Boundaries** — File operations are scoped to your designated working directory
- **Process Isolation** — Electron context isolation enabled, node integration disabled

## How It Works

<p align="center">
  <img src="docs/res/architecture_en.png" alt="Architecture" width="500">
</p>

## Quick Start

### Prerequisites

- **Node.js** >= 24 < 25
- **npm**

### Install & Develop

```bash
# Clone the repository
git clone https://github.com/netease-youdao/ClaudeWork.git
cd claudework

# Install dependencies
npm install

# Start development (Vite dev server + Electron with hot reload)
npm run electron:dev
```

The dev server runs at `http://localhost:5175` by default.

### Production Build

```bash
# TypeScript compilation + Vite bundle
npm run build

# ESLint check
npm run lint
```

## Packaging & Distribution

Uses [electron-builder](https://www.electron.build/) to produce platform-specific installers. Output goes to `release/`.

```bash
# macOS (.dmg)
npm run dist:mac

# macOS - Intel only
npm run dist:mac:x64

# macOS - Apple Silicon only
npm run dist:mac:arm64

# macOS - Universal (both architectures)
npm run dist:mac:universal

# Windows (.exe NSIS installer)
npm run dist:win

# Linux (.AppImage & .deb)
npm run dist:linux
```

Windows builds bundle a portable Python runtime under `resources/python-win` (included as installer resource `python-win`), so end users do not need to install Python manually.
The bundled runtime is interpreter-focused and does not preinstall ClaudeWork skill Python packages; those can be installed at runtime on demand.
By default, packaging downloads the official Python embeddable runtime from python.org if no prebuilt archive is provided.
For offline/non-network builds, provide a prebuilt runtime archive explicitly.

Offline/runtime source options for packaging:
- `LOBSTERAI_PORTABLE_PYTHON_ARCHIVE`: Local prebuilt runtime archive path (recommended for offline CI/CD)
- `LOBSTERAI_PORTABLE_PYTHON_URL`: Download URL for the prebuilt runtime archive
- `LOBSTERAI_WINDOWS_EMBED_PYTHON_VERSION` / `LOBSTERAI_WINDOWS_EMBED_PYTHON_URL` / `LOBSTERAI_WINDOWS_GET_PIP_URL`: Optional overrides for Windows-host bootstrap sources

## Architecture

ClaudeWork uses Electron's strict process isolation. All cross-process communication goes through IPC.

### Process Model

**Main Process** (`src/main/main.ts`):
- Window lifecycle management
- SQLite persistence
- CoworkRunner — Claude Agent SDK execution engine
- IM Gateways — DingTalk, Feishu, Telegram, Discord remote access
- 40+ IPC channel handlers
- Security: context isolation enabled, node integration disabled, sandbox enabled

**Preload Script** (`src/main/preload.ts`):
- Exposes `window.electron` API via `contextBridge`
- Includes `cowork` namespace for session management and stream events

**Renderer Process** (`src/renderer/`):
- React 18 + Redux Toolkit + Tailwind CSS
- All UI and business logic
- Communicates with main process exclusively through IPC

### Directory Structure

```
src/
├── main/                           # Electron main process
│   ├── main.ts                     # Entry point, IPC handlers
│   ├── preload.ts                  # Security bridge
│   ├── sqliteStore.ts              # SQLite storage
│   ├── coworkStore.ts              # Session/message CRUD
│   ├── skillManager.ts             # Skill management
│   ├── im/                         # IM gateways (DingTalk/Feishu/Telegram/Discord)
│   └── libs/
│       ├── coworkRunner.ts         # Agent SDK executor
│       ├── coworkVmRunner.ts       # Sandbox VM execution
│       ├── coworkSandboxRuntime.ts # Sandbox lifecycle
│       └── coworkMemoryExtractor.ts # Memory extraction
│
├── renderer/                        # React frontend
│   ├── App.tsx                     # Root component
│   ├── types/                      # TypeScript definitions
│   ├── store/slices/               # Redux state slices
│   ├── services/                   # Business logic (API/IPC/i18n)
│   └── components/
│       ├── cowork/                 # Cowork UI components
│       ├── artifacts/              # Artifact renderers
│       ├── skills/                 # Skill management UI
│       ├── im/                     # IM integration UI
│       └── Settings.tsx            # Settings panel
│
SKILLs/                              # Skill definitions
├── skills.config.json              # Skill enable/disable and ordering
├── web-search/                     # Web search
├── docx/                           # Word document generation
├── xlsx/                           # Excel spreadsheets
├── pptx/                           # PowerPoint presentations
├── pdf/                            # PDF processing
├── remotion/                       # Video generation
├── playwright/                     # Web automation
└── ...                             # More skills
```

## Cowork System

Cowork is the core feature of ClaudeWork — an AI coding session built on the Claude Agent SDK. The agent understands your project structure, reads and writes source files, runs shell commands and tests, and streams every step back to you in real time.

### Execution Modes

| Mode | Description |
|------|-------------|
| `auto` | Automatically selects based on context |
| `local` | Direct local execution, full speed |
| `sandbox` | Isolated Alpine Linux VM, safety first |

### Stream Events

Cowork uses IPC events for real-time bidirectional communication:

- `message` — New message added to the session
- `messageUpdate` — Incremental streaming content update
- `permissionRequest` — Tool execution requires user approval
- `complete` — Session execution finished
- `error` — Execution error occurred

### Permission Control

All tool invocations involving file system access, terminal commands, or network requests require explicit user approval in the `CoworkPermissionModal`. Both single-use and session-level approvals are supported.

## Skills System

ClaudeWork ships with 16 built-in skills covering productivity, creative, and automation scenarios, configured via `SKILLs/skills.config.json`:

| Skill | Function | Typical Use Case |
|-------|----------|-----------------|
| web-search | Web search | Information retrieval, research |
| docx | Word document generation | Reports, proposals |
| xlsx | Excel spreadsheet generation | Data analysis, dashboards |
| pptx | PowerPoint creation | Presentations, business reviews |
| pdf | PDF processing | Document parsing, format conversion |
| remotion | Video generation (Remotion) | Promo videos, data visualization animations |
| playwright | Web automation | Browser tasks, automated testing |
| canvas-design | Canvas drawing and design | Posters, chart design |
| frontend-design | Frontend UI design | Prototyping, page design |
| develop-web-game | Web game development | Quick game prototypes |
| scheduled-task | Scheduled tasks | Periodic automated workflows |
| weather | Weather queries | Weather information |
| local-tools | Local system tools | File management, system operations |
| create-plan | Plan authoring | Project planning, task breakdown |
| skill-creator | Custom skill creation | Extend new capabilities |
| imap-smtp-email | Email send/receive | Email processing, auto-replies |

Custom skills can be created via `skill-creator` and hot-loaded at runtime.

## Scheduled Tasks

ClaudeWork supports scheduled tasks that let the Agent automatically execute recurring work on a set schedule.

### How to Create

- **Conversational** — Tell the Agent in natural language (e.g., "collect tech news for me every morning at 9 AM"), and it will create the scheduled task automatically
- **GUI** — Add tasks manually in the Scheduled Tasks management panel with a visual interface for configuring timing and task content

### Typical Scenarios

| Scenario | Example |
|----------|---------|
| News Collection | Automatically gather industry news and generate a summary every morning |
| Inbox Cleanup | Periodically check your inbox, categorize emails, and summarize important ones |
| Data Reports | Generate a weekly business data analysis report |
| Content Monitoring | Regularly check specific websites for changes and send notifications |
| Work Reminders | Generate to-do lists or meeting notes on a schedule |

Scheduled tasks are powered by Cron expressions, supporting minute, hourly, daily, weekly, and monthly intervals. When a task fires, it automatically starts a Cowork session. Results can be viewed on the desktop or pushed to your phone via IM.

## IM Integration — Mobile Remote Control

ClaudeWork can bridge the Agent to multiple IM platforms. Send a message from your phone via IM to remotely trigger the desktop Agent — command your personal assistant anytime, anywhere.

| Platform | Protocol | Description |
|----------|----------|-------------|
| DingTalk | DingTalk Stream | Enterprise robot bidirectional communication |
| Feishu | Lark SDK | Feishu app robot |
| Telegram | grammY | Bot API integration |
| Discord | discord.js | Discord bot integration |
| NetEase IM | node-nim V2 SDK | NetEase IM P2P messaging |
| NetEase Bee | node-nim V2 SDK | NetEase Bee Personal Digital Assistant |

Configure the corresponding platform Token/Secret in the Settings panel to enable. Once set up, you can send instructions directly to the Agent from your phone IM (e.g., "analyze this dataset", "make a weekly summary PPT"), and the Agent will execute on the desktop and return results.

## Persistent Memory

ClaudeWork has a built-in memory system that remembers your personal information and preferences across sessions, making the Agent more helpful the more you use it.

### How Memories Are Captured

- **Automatic Extraction** — During conversations, the system automatically identifies and stores your personal details (name, occupation), preferences (language, format, style), and personal facts (pets, tools you use) — no manual effort required
- **Explicit Requests** — Tell the Agent directly, e.g., "remember that I prefer Markdown format" or "note down that my project is called ClaudeWork," and it will store the memory with higher confidence
- **Manual Management** — Add, edit, or delete memory entries in the Memory management panel within Settings

### How It Works

After each conversation turn, the memory extractor analyzes the dialogue:

| Extraction Type | Example | Confidence |
|----------------|---------|------------|
| Personal Profile | "My name is Alex", "I'm a product manager" | High |
| Personal Ownership | "I have a cat", "I use a MacBook" | High |
| Personal Preferences | "I like a concise style", "I prefer English replies" | Medium-High |
| Assistant Preferences | "Don't use emojis in replies", "Write code in TypeScript" | Medium-High |
| Explicit Requests | "Remember this", "Please note that down" | Highest |

Extracted memories are automatically deduplicated and merged, then injected into the Agent's context in subsequent sessions — making responses more personalized and aligned with your needs.

### Memory Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Memory Toggle | Enable or disable the memory feature | On |
| Auto Capture | Whether to automatically extract memories from conversations | On |
| Capture Strictness | Strict / Standard / Relaxed — controls auto-extraction sensitivity | Standard |
| Max Injected Items | Maximum number of memories injected per session (1–60) | 12 |

## Data Storage

All data is stored in a local SQLite database (`lobsterai.sqlite` in the user data directory).

| Table | Purpose |
|-------|---------|
| `kv` | App configuration key-value pairs |
| `cowork_config` | Cowork settings (working directory, system prompt, execution mode) |
| `cowork_sessions` | Session metadata |
| `cowork_messages` | Message history |
| `scheduled_tasks` | Scheduled task definitions |

## Security Model

ClaudeWork enforces security at multiple layers:

- **Process Isolation** — Context isolation enabled, node integration disabled
- **Permission Gating** — Tool invocations require explicit user approval
- **Sandbox Execution** — Optional Alpine Linux VM for isolated execution
- **Content Security** — HTML sandbox, DOMPurify, Mermaid strict mode
- **Workspace Boundaries** — File operations restricted to the designated working directory
- **IPC Validation** — All cross-process calls are type-checked

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Electron 40 |
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| State | Redux Toolkit |
| AI Engine | Claude Agent SDK (Anthropic) |
| Storage | sql.js |
| Markdown | react-markdown + remark-gfm + rehype-katex |
| Diagrams | Mermaid |
| Security | DOMPurify |
| IM | dingtalk-stream · @larksuiteoapi/node-sdk · grammY · discord.js |

## Configuration

### App Configuration

App-level config is stored in the SQLite `kv` table, editable through the Settings panel.

### Cowork Configuration

Cowork session config includes:

- **Working Directory** — Root directory for Agent operations
- **System Prompt** — Customize Agent behavior
- **Execution Mode** — `auto` / `local` / `sandbox`

### Internationalization

Currently English and Chinese are supported. Switch languages in the Settings panel.

## Roadmap

ClaudeWork is evolving into a full-featured AI-native programming tool. Here is what is planned:

### 🔧 Deeper Code Intelligence
- **Inline AI Edits** — Select any code block and ask the AI to refactor, explain, or fix it in place
- **Multi-file Editing** — Let the agent plan and apply coordinated changes across many files in one session
- **Code Navigation** — Go-to-definition, find-all-references, and symbol search powered by Language Server Protocol (LSP)
- **Intelligent Autocomplete** — AI-assisted completions inline in the editor, similar to GitHub Copilot

### 🗂️ Git & Version Control
- **Commit Workflow** — Stage, commit, push, and pull changes directly from the UI
- **Merge Conflict Resolution** — AI-assisted three-way merge with explanations
- **Blame & History** — Line-by-line blame view and visual commit history timeline
- **PR Review Assistance** — Summarize pull requests, highlight risky changes, and suggest review comments

### 🧪 Testing & Quality
- **Test Runner Integration** — Run and display test results (Jest, pytest, Go test, etc.) inline next to the code
- **Coverage Visualization** — Highlight covered and uncovered lines in the editor
- **AI-Generated Tests** — Ask the agent to write unit tests for any function or module
- **Linter & Formatter** — Run ESLint, Prettier, Black, or other formatters on demand or automatically

### 🐛 Debugging
- **Integrated Debugger** — Set breakpoints, step through code, and inspect variables without leaving the app
- **AI-Assisted Error Diagnosis** — Paste a stack trace; the agent pinpoints the root cause and suggests a fix

### 🌐 Cloud & Team Collaboration
- **GitHub / GitLab Integration** — Browse issues and PRs, create branches, and push directly from the chat interface
- **Cloud Sync** — Optional encrypted sync of sessions and memories across devices
- **Team Workspaces** — Share sessions, prompts, and skill configurations with teammates

### 🔌 Extensibility
- **MCP (Model Context Protocol) Support** — Connect to any MCP-compatible server to extend agent capabilities
- **Plugin SDK** — Build and distribute custom skills with a documented API and marketplace
- **Custom AI Models** — Plug in any OpenAI-compatible or local model (Ollama, LM Studio) as the AI backend

### ☁️ Cloud-Native Execution
- **Remote Sandbox** — Execute heavy tasks in a cloud VM to keep your local machine free
- **CI/CD Pipeline Visualization** — Watch pipeline runs in real time and let the agent diagnose failures

---

## Development Guidelines

- TypeScript strict mode, functional components + Hooks
- 2-space indentation, single quotes, semicolons
- Components: `PascalCase`; functions/variables: `camelCase`; Redux slices: `*Slice.ts`
- Tailwind CSS preferred; avoid custom CSS
- Commit messages follow `type: short imperative summary` (e.g., `feat: add artifact toolbar`)

## Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add something'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please include in your PR description: a summary of changes, linked issue (if any), screenshots for UI changes, and notes on any Electron-specific behavior changes.

## License

[MIT License](LICENSE)


## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=netease-youdao/ClaudeWork&type=date&legend=top-left)](https://www.star-history.com/#netease-youdao/ClaudeWork&type=date&legend=top-left)

---

Built and maintained by [NetEase Youdao](https://www.youdao.com/).
