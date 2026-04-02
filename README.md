# 🔮 Strange Tabs | v2.6 Workspace Mastery

**Strange Tabs** is a high-performance Chrome Extension designed to turn browser clutter into organized, persistent workspaces. Built with **React** and **Tailwind CSS**, it allows power users to "snap" their current browser state into named sessions and restore them as native Chrome Tab Groups.

---

## 🚀 Key Features

* **Multiverse Saving:** Capture all active, non-pinned tabs into a single named session with one click.
* **Native Tab Grouping:** Restores sessions directly into **Chrome Tab Groups**, preserving the session name.
* **Clean Slate Mode:** Automates the transition between projects by saving the current context and clearing the browser state safely (preventing window closure).
* **Selective Pruning:** Total ownership of data—remove individual URLs from a saved session without deleting the entire group.
* **5-Second Undo Buffer:** A safety net for accidental tab removals, ensuring zero data loss during workspace cleanup.
* **Real-time Persistence:** Built-in sync with `chrome.storage` for instant data recovery after browser restarts.

---

## 🛠️ Tech Stack & Engineering Challenges

* **Frontend:** React.js (Hooks, State Lifting), Tailwind CSS, Vite.
* **APIs:** Chrome Extensions API (`tabs`, `storage`, `tabGroups`).
* **Challenge Solved:** Managed **Async Lifecycle Safety** to resolve race conditions during bulk tab removals, ensuring the browser process remains active by injecting safety tabs before "sweep" operations.
* **State Architecture:** Implemented a nested data structure to handle the relationship between sessions and individual tab metadata.

---

## 📦 Installation (Development Mode)

1.  Clone this repository: `git clone https://github.com/shivangi989/strange-tabs-react.git`
2.  Install dependencies: `npm install`
3.  Generate build: `npm run build`
4.  Open Chrome and navigate to `chrome://extensions`.
5.  Enable **Developer Mode** and click **Load Unpacked**.
6.  Select the **`dist`** folder from this project.

---

## 🗺️ Roadmap (Summer 2026)

* [ ] **Multiverse Sync:** Migrating local storage to **Supabase** for cross-device session synchronization and Google Auth integration.
* [ ] **Eye of Agamotto (AI):** Implementing Gemini API for auto-categorization and smart tagging of research sessions.
* [ ] **Mirror Dimension:** Adding "Tab Suspending" logic to discard inactive tabs from memory to boost system performance.

---

## 👤 Author

**Shivangi Singh** *B.Tech in Engineering & Computational Mechanics, MNNIT Allahabad (2028)* [LinkedIn](https://www.linkedin.com/in/shivangi-singh-574b89331) | [GitHub](https://github.com/shivangi989)
