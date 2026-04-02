import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header';
import SessionItem from './components/SessionItem';

function App() {
  const [sessions, setSessions] = useState([]);
  const [cleanSlate, setCleanSlate] = useState(false);
  const [undoInfo, setUndoInfo] = useState(null);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(['savedSessions'], (result) => {
        if (result.savedSessions && Array.isArray(result.savedSessions)) {
          setSessions(result.savedSessions);
        }
      });
    }
  }, []);

  const triggerNotify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const saveToStorage = (updated) => {
    setSessions(updated);
    if (typeof chrome !== "undefined") {
      chrome.storage.local.set({ savedSessions: updated });
    }
  };

  const handleSave = (providedTabs = null) => {
    const processSave = (tabs) => {
      if (!tabs || tabs.length === 0) return;
      const newSession = {
        id: Date.now(),
        title: `Session ${sessions.length + 1}`,
        date: new Date().toLocaleString(),
        tabCount: tabs.length,
        tabs: tabs.map(t => ({ url: t.url, title: t.title }))
      };
      saveToStorage([newSession, ...sessions]);
      triggerNotify("Session Saved! ✨");

      if (cleanSlate) {
        // FIX: Create new tab FIRST, then remove others in the callback
        chrome.tabs.create({ url: "chrome://newtab" }, () => {
          chrome.tabs.remove(tabs.map(t => t.id));
        });
      }
    };

    if (providedTabs) processSave(providedTabs);
    else chrome.tabs.query({ currentWindow: true, pinned: false }, processSave);
  };

  const handleRestore = (id) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    const tabPromises = session.tabs.map(t => chrome.tabs.create({ url: t.url, active: false }));
    Promise.all(tabPromises).then((newTabs) => {
      const tabIds = newTabs.map(t => t.id);
      chrome.tabs.group({ tabIds }, (groupId) => {
        chrome.tabGroups.update(groupId, { title: session.title, color: "blue" });
      });
      triggerNotify("Group Restored! 🌀");
    });
  };

  const handleUngroup = (id) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const session = sessions.find(s => s.id === id);
      const urls = session.tabs.map(t => t.url);
      const tabsToUngroup = tabs.filter(t => urls.includes(t.url)).map(t => t.id);
      if (tabsToUngroup.length > 0) {
        chrome.tabs.ungroup(tabsToUngroup);
        triggerNotify("Tabs Ungrouped! 🔓");
      }
    });
  };

  const handleCloseGroup = (id) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const session = sessions.find(s => s.id === id);
      const urls = session.tabs.map(t => t.url);
      const tabsToClose = tabs.filter(t => urls.includes(t.url)).map(t => t.id);
      
      if (tabsToClose.length > 0) {
        // FIX: If closing all tabs, open a safety tab first
        if (tabsToClose.length === tabs.length) {
          chrome.tabs.create({ url: "chrome://newtab" }, () => {
            chrome.tabs.remove(tabsToClose);
          });
        } else {
          chrome.tabs.remove(tabsToClose);
        }
        triggerNotify("Group Closed! 🧹");
      }
    });
  };

  const handleRename = (id) => {
    const name = prompt("Rename Session:");
    if (name) {
      saveToStorage(sessions.map(s => s.id === id ? { ...s, title: name } : s));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this entire session?")) {
      saveToStorage(sessions.filter(s => s.id !== id));
      triggerNotify("Session Deleted! 🗑️");
    }
  };

  const onRemoveTab = (sessionId, url) => {
    const session = sessions.find(s => s.id === sessionId);
    const tab = session.tabs.find(t => t.url === url);
    setUndoInfo({ sessionId, tab });
    
    const updated = sessions.map(s => {
      if (s.id === sessionId) {
        const remaining = s.tabs.filter(t => t.url !== url);
        return { ...s, tabs: remaining, tabCount: remaining.length };
      }
      return s;
    });
    saveToStorage(updated);
    setTimeout(() => setUndoInfo(null), 5000);
  };

  const handleUndo = () => {
    if (!undoInfo) return;
    const updated = sessions.map(s => {
      if (s.id === undoInfo.sessionId) {
        return { ...s, tabs: [undoInfo.tab, ...s.tabs], tabCount: s.tabs.length + 1 };
      }
      return s;
    });
    saveToStorage(updated);
    setUndoInfo(null);
    triggerNotify("Tab Restored! 🪄");
  };


 return (
    <div className="w-[350px] min-h-[500px] bg-slate-950 text-white font-sans flex flex-col relative overflow-hidden">
      <Header />
      {notification && <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-blue-600 text-[10px] px-3 py-1 rounded-full z-50 animate-fade-in-down shadow-lg">{notification}</div>}
      <div className="flex-1 p-4 overflow-y-auto">
        <button onClick={() => handleSave()} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl mb-3 font-bold transition-all shadow-lg shadow-blue-900/20">Save Current Session</button>
        <div className="flex items-center justify-between px-2 mb-6">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Clean Slate Mode</span>
          <button onClick={() => setCleanSlate(!cleanSlate)} className={`w-8 h-4 rounded-full transition-colors ${cleanSlate ? 'bg-blue-600' : 'bg-slate-800'} relative`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${cleanSlate ? 'left-4.5' : 'left-0.5'}`} />
          </button>
        </div>
        {undoInfo && <div className="mb-4 p-2 bg-slate-900 border border-slate-800 rounded-lg flex justify-between items-center"><span className="text-[10px] text-slate-400">Tab removed...</span><button onClick={handleUndo} className="text-blue-400 text-[10px] font-bold">UNDO</button></div>}
        <div className="space-y-3">
          {sessions.map(s => (
            <SessionItem 
              key={s.id} 
              session={s} 
              onDelete={handleDelete} 
              onRestore={handleRestore} 
              onRename={handleRename} 
              onRemoveTab={onRemoveTab}
              onUngroup={handleUngroup}
              onCloseGroup={handleCloseGroup} // PASSED CORRECTLY
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;