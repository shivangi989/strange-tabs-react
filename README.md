# Strange Tabs — AI-Powered Cloud Workspace Manager

Strange Tabs is a browser extension that transforms browser tabs into intelligent, cloud-synchronized workspaces.

Instead of simply saving tabs, Strange Tabs organizes them into native browser Tab Groups, synchronizes them across devices using Supabase, and uses AI to summarize page content, generate vector embeddings, and enable semantic search across previously saved workspaces.

---

# ✨ Features

## 📂 Save Browser Workspaces

Save all active non-pinned tabs as a workspace with a single click.

Each workspace stores:

- Tab title
- URL
- AI summary
- Raw extracted page content
- Vector embedding

---

## 🧠 AI-Powered Workspace Intelligence

Every saved tab is automatically processed in the background.

The AI pipeline:

- Extracts readable page content
- Generates concise summaries using Gemini
- Creates semantic embeddings
- Stores embeddings in PostgreSQL using pgvector

This enables intelligent search instead of traditional keyword matching.

---

## 🔍 Semantic Search

Search using natural language.

Example searches:

- "React authentication"
- "LeetCode binary search"
- "Machine learning notes"
- "Vacation planning"

Instead of matching keywords, Strange Tabs finds conceptually similar workspaces using vector similarity search.

---

## 🔄 Smart Restoration

When restoring a workspace:

- Existing open tabs are reused
- Duplicate tabs are avoided
- Missing tabs are recreated automatically
- Tabs are restored as native browser Tab Groups

---

## ☁️ Cloud Synchronization

Workspaces are synchronized through Supabase.

Users can:

- Sign in once
- Access workspaces across browsers
- Restore sessions from any supported installation

(Currently tested on Chrome and Microsoft Edge.)

---

## 🔐 Secure Authentication

Authentication is handled by Supabase Auth.

Features include:

- Secure session management
- Protected Edge Functions
- Server-side AI requests
- No Gemini API key exposed to the client

---

## 🧹 Clean Slate Protocol

Optionally remove restored tabs after saving while keeping the browser alive with a safe fallback tab.

---

## ↩️ Temporal Undo Buffer

Accidentally remove a tab?

Restore it within a 5-second recovery window.

---

## 🎨 Native Tab Group Support

Each workspace restores as a real browser Tab Group.

Supports:

- Group restoration
- Group rename
- Color synchronization
- Ungroup
- Close group

---

## 🔄 Browser Sync

Changes made directly inside native browser Tab Groups (title/color) are synchronized back to the cloud automatically.

---

## 📑 Selective Workspace Saving

Before saving, users can:

- View all available tabs
- Ignore already-grouped tabs
- Select only desired tabs

---

# 🏗️ Architecture

The project follows a modular service-oriented architecture.

```
src
│
├── extractors
│   ├── fallbackExtractor.js
│   ├── index.js
│   ├── readabilityExtractor.js
│   ├── semanticExtractor.js
│  
├── components
│   ├── auth
│   ├── common
│   ├── layout
│   ├── search
│   ├── session
│   └── tabs
│
├── hooks
│   ├── useAnalytics.js
│   └── ...
│
├── services
│   ├── aiService.js
│   ├── chromeService.js
│   ├── sessionService.js
│   └── syncService.js
│
├── lib
│   └── supabase.js
│
└── App.jsx
```

### Responsibilities

### App.jsx

- Authentication flow
- State management
- UI orchestration
- Workspace lifecycle

### chromeService.js

Encapsulates all browser APIs.

Responsible for:

- chrome.tabs
- chrome.tabGroups
- chrome.windows
- native browser synchronization

---

### sessionService.js

Responsible for:

- CRUD operations
- Supabase communication
- pgvector queries
- Workspace synchronization

---

### aiService.js

Responsible for:

- Calling Supabase Edge Functions
- AI summarization
- Embedding generation
- Batch processing
- Retry handling

---

### Supabase Edge Function

Acts as the secure backend.

Responsibilities:

- User authentication verification
- Gemini API communication
- Summary generation
- Embedding generation
- AI workspace naming

No AI API keys are exposed to the browser.

---

# ⚙️ Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS v4

## Backend

- Supabase Edge Functions (Deno)

## Database

- PostgreSQL
- pgvector

## Authentication

- Supabase Auth

## AI

- Gemini 2.5 Flash
- Gemini Embedding Model

## Browser APIs

- Chrome Extensions Manifest V3
- chrome.tabs
- chrome.tabGroups
- chrome.storage

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/shivangi989/strange-tabs-react.git
cd strange-tabs-react
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file.

```env
VITE_SUPABASE_URL=YOUR_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Gemini API keys are stored securely inside Supabase Edge Functions and are **not** required in the frontend.

---

## Build

```bash
npm run build
```

---

## Load Extension

Open

```
chrome://extensions
```

Enable

- Developer Mode

Click

```
Load Unpacked
```

Select

```
dist/
```

---

# 📊 Current Capabilities

✅ Cloud-synchronized workspaces

✅ Native browser Tab Groups

✅ Smart restoration without duplicates

✅ AI-generated summaries

✅ Semantic search

✅ Vector embeddings

✅ Secure authentication

✅ Cross-browser support (Chrome & Microsoft Edge)

---

# 🛣️ Roadmap

### Phase 1

- [x] Workspace Manager
- [x] Cloud Synchronization
- [x] Authentication
- [x] Smart Restore
- [x] Native Tab Groups

---

### Phase 2

- [x] AI Summaries
- [x] Embeddings
- [x] Semantic Search
- [x] Edge Function Backend

---

### Phase 3

- [ ] AI-generated workspace names
- [ ] Workspace recommendations
- [ ] Similar workspace detection
- [ ] Automatic workspace clustering


---

# 👤 Author

**Shivangi Singh**

B.Tech — Engineering & Computational Mechanics

Motilal Nehru National Institute of Technology Allahabad

Class of 2028

GitHub:
https://github.com/shivangi989

LinkedIn:
https://www.linkedin.com/in/shivangisingh98/

---

# 📄 License

Licensed under the MIT License.
