import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header';
import SessionItem from './components/SessionItem';

function App() {
  const [sessions, setSessions] = useState([]);

  // Load from storage ONCE on mount
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(['savedSessions'], (result) => {
        if (result.savedSessions && Array.isArray(result.savedSessions)) {
          setSessions(result.savedSessions);
        }
      });
    }
  }, []);
  const handleRename = (id) => {
  const newTitle = prompt("Enter a new name for this session:");
  if (newTitle) {
    const updated = sessions.map(s => s.id === id ? { ...s, title: newTitle } : s);
    setSessions(updated);
    chrome.storage.local.set({ savedSessions: updated });
  }
  };

  const handleSave = () => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const tabData = (tabs || []).map(t => ({ 
          url: t.url || "No URL", 
          title: t.title || "Untitled Tab" 
        }));

        const newSession = {
          id: Date.now(),
          title: `Session ${sessions.length + 1}`,
          date: new Date().toLocaleString(),
          tabCount: tabData.length,
          tabs: tabData
        };

        const updated = [newSession, ...sessions];
        setSessions(updated);
        // Save immediately to storage
        chrome.storage.local.set({ savedSessions: updated });
      });
    } else {
      alert("Note: Use the extension icon in the toolbar, not a regular tab!");
    }
  };

  const handleDelete = (id) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    // MUST update storage so it doesn't come back on refresh
    chrome.storage.local.set({ savedSessions: updated });
  };

  const handleRestore = (id) => {
    const sessionToRestore = sessions.find(s => s.id === id);
    if (sessionToRestore && sessionToRestore.tabs) {
      sessionToRestore.tabs.forEach(tab => {
        chrome.tabs.create({ url: tab.url });
      });
    }
  };
  const onRemoveTab = (sessionId, tabUrl) => {
  const updatedSessions = sessions.map(session => {
    if (session.id === sessionId) {
      // Remove the specific tab by its URL
      const filteredTabs = session.tabs.filter(t => t.url !== tabUrl);
      return { 
        ...session, 
        tabs: filteredTabs, 
        tabCount: filteredTabs.length 
      };
    }
    return session;
  });
  
  setSessions(updatedSessions);
  // Immediate persistence
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.local.set({ savedSessions: updatedSessions });
  }
};

  return (
    <div className="w-[350px] min-h-[500px] bg-slate-950 text-white font-sans flex flex-col">
      <Header />
      <div className="flex-1 p-4 overflow-y-auto max-h-[440px]">
        <button onClick={handleSave} 
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-blue-900/20 transition mb-6 flex items-center justify-center gap-2 border border-blue-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save Current Session
        </button>

        <div className="space-y-1">
          {sessions.length === 0 ? (
            <p className="text-center text-slate-500 mt-10 text-sm">No saved sessions yet.</p>
          ) : (
            sessions.map((session) => (
              <SessionItem 
                key={session.id} 
                session={session} 
                onDelete={handleDelete}
                onRestore={handleRestore}
                onRename={handleRename}
                onRemoveTab={onRemoveTab}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;