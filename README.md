# Strange Tabs — Cloud-Synced Workspace Manager

A Chrome Extension built with React, Vite, and Tailwind CSS that helps users save browser workspaces as cloud-synchronized sessions and restore them instantly as native Chrome Tab Groups without creating duplicate tabs.

---

## 🚀 Features

### 📂 Workspace Saving
Save all active non-pinned tabs into a named workspace session with a single click.

### 🔄 Smart Restoration
Before restoring a session, Strange Tabs checks the current browser window. If a saved URL is already open, it reuses the existing tab and places it into the restored group instead of creating duplicates.

### 🧹 Clean Slate Protocol
Preserve the current browsing context while safely clearing active tabs. A fallback window is maintained to prevent accidental browser closure.

### ↩️ Temporal Undo Buffer
Accidentally removed tabs can be restored within a 5-second recovery window.

### ☁️ Relational Cloud Sync
Workspace data is synchronized across devices using Supabase Authentication and PostgreSQL, enabling seamless access from anywhere.

---

## 🏗️ Architecture

The application follows a decoupled service-based architecture to separate UI logic from browser and database operations.

### Core Modules

#### `App.jsx`
- Manages application state
- Handles authentication flow
- Controls user routing and interactions

#### `src/services/chromeService.js`
- Encapsulates Chrome Extension APIs
- Handles communication with:
  - `chrome.tabs`
  - `chrome.windows`
  - `chrome.tabGroups`

#### `src/services/sessionService.js`
- Manages Supabase interactions
- Performs database operations
- Handles session synchronization

#### `src/components/`
- Contains reusable UI components
- Receives data and actions through React props
- Keeps presentation separate from business logic

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS v4

### Backend & Cloud
- Supabase Authentication
- PostgreSQL Database

### Browser Integration
- Chrome Extensions Manifest V3 API

---

## 📦 Installation (Development Mode)

### 1. Clone the Repository

```bash
git clone https://github.com/shivangi989/strange-tabs-react.git
cd strange-tabs-react
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Build the Extension

```bash
npm run build
```

### 5. Load the Extension into Chrome

1. Open Chrome and navigate to:

```
chrome://extensions/
```

2. Enable **Developer Mode** (top-right corner).

3. Click **Load Unpacked**.

4. Select the generated `dist/` folder.

5. The extension is now ready for use.

---

## 🗺️ Roadmap

### Phase 2: AI-Powered Workspace Intelligence

- [ ] Enable `pgvector` in Supabase for vector storage.
- [ ] Extend the database schema with embedding columns.
- [ ] Build a content extraction pipeline using isolated content scripts.
- [ ] Collect and store meaningful page content from tabs.
- [ ] Integrate Gemini API for semantic summarization.
- [ ] Generate vector embeddings for saved workspaces.
- [ ] Implement semantic search using natural language queries.
- [ ] Enable retrieval of sessions based on conceptual similarity rather than exact keywords.

---

## 👤 Author

**Shivangi Singh**  
B.Tech, Engineering & Computational Mechanics  
MNNIT Allahabad (Class of 2028)

### Connect With Me

- GitHub: https://github.com/shivangi989
- LinkedIn: https://www.linkedin.com/

---

## 📄 License

This project is open-source and available under the MIT License.
