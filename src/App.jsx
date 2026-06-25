import { useState, useEffect } from 'react'
import './App.css'
import EyeOfAgamotto from './components/common/EyeOfAgamotto'
import Mandala from './components/common/Mandala'
import Header from './components/layout/Header'
import SessionList from './components/session/SessionList'
import AuthUI from './components/auth/AuthUI'
import TabSelector from './components/tabs/TabSelector'
import Mystics from './components/common/Mystics'
import { supabase } from './lib/supabase'
import { chromeService } from './services/chromeService'
import { useAnalytics } from './hooks/useAnalytics'
import {
  createSession,
  fetchSessions,
  renameSession,
  deleteSession,
  updateTabs,
  appendTabToSession
} from './services/sessionService'

function App() {
  // ---------------- STATE ----------------
  const [sessions, setSessions] = useState([])
  const [cleanSlate, setCleanSlate] = useState(false)
  const [undoInfo, setUndoInfo] = useState(null)
  const [notification, setNotification] = useState("")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const { stats, trackSave, trackRestore } = useAnalytics()
  const { sessionRestoreCounts } = stats

  const [showSelector, setShowSelector] = useState(false)
  const [availableTabs, setAvailableTabs] = useState([])
  const [selectedTabs, setSelectedTabs] = useState([])

  // ---------------- AUTH LISTENER ----------------
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
      setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // ---------------- CLOUD SYNC ENGINE ----------------
  const syncWorkspaces = async () => {
    if (!user) return
    try {
      const data = await fetchSessions(user.id)
      setSessions(
        data.map(s => ({
          id: s.id,
          title: s.title,
          date: new Date(s.created_at).toLocaleString(),
          tabCount: s.tabs?.length || 0,
          tabs: s.tabs || [],
          restoreCount: sessionRestoreCounts[s.id] || 0
        }))
      )
    } catch (err) {
      console.error("Multiverse Sync Failure:", err.message)
    }
  }

  useEffect(() => {
    if (user) syncWorkspaces()
  }, [user])

  const notify = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(""), 3000)
  }

  // ---------------- OPERATIONS ----------------
  const handleSave = async (tabs) => {
    if (!tabs || tabs.length === 0) return
    try {
      const targetIds = tabs.map(t => t.id)
      const sessionPayload = {
        title: `Timeline Workspace ${sessions.length + 1}`,
        tabs: tabs.map(t => ({ url: t.url, title: t.title }))
      }

      await createSession(user.id, sessionPayload)
      notify("Workspace Conjured! ✨")
      trackSave()
      await syncWorkspaces()

      if (cleanSlate) {
        chromeService.clearWorkspace(targetIds)
      }
    } catch (err) {
      console.error("Save Error:", err.message)
    }
  }

  const handleRestore = async (id) => {
    const session = sessions.find(s => s.id === id)
    if (!session) return
    await chromeService.restoreWorkspace(session.title, session.tabs)
    notify("Portals Opened! 🌀")
    trackRestore(id)
  }

  const handleUngroup = async (id) => {
    const session = sessions.find(s => s.id === id)
    if (!session) return
    const urls = session.tabs.map(t => t.url)
    const success = await chromeService.manipulateNativeGroup(urls, 'ungroup')
    if (success) notify("Magic Unbound! 🔓")
  }

  const handleCloseGroup = async (id) => {
    const session = sessions.find(s => s.id === id)
    if (!session) return
    const urls = session.tabs.map(t => t.url)
    const success = await chromeService.manipulateNativeGroup(urls, 'close')
    if (success) notify("Mirror Dimension Cleared! 🧹")
  }

  const handleRename = async (id) => {
    const name = prompt("Rename this Portal:")
    if (!name) return
    await renameSession(id, name)
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: name } : s))
    notify("Renamed in the Multiverse ✨")
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Banish this session forever?")) return
    await deleteSession(id)
    setSessions(prev => prev.filter(s => s.id !== id))
    notify("Erased from Reality! 🗑️")
  }

  const onRemoveTab = async (sessionId, url) => {
    const session = sessions.find(s => s.id === sessionId)
    if (!session) return
    const tab = session.tabs.find(t => t.url === url)
    
    setUndoInfo({ sessionId, tab })
    const updatedTabs = session.tabs.filter(t => t.url !== url)
    
    await updateTabs(sessionId, updatedTabs)
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, tabs: updatedTabs, tabCount: updatedTabs.length } : s))
    setTimeout(() => setUndoInfo(null), 5000)
  }

  const handleUndo = async () => {
    if (!undoInfo) return
    const session = sessions.find(s => s.id === undoInfo.sessionId)
    if (!session) return

    const restoredList = [undoInfo.tab, ...session.tabs]
    await updateTabs(undoInfo.sessionId, restoredList)
    setSessions(prev => prev.map(s => s.id === undoInfo.sessionId ? { ...s, tabs: restoredList, tabCount: restoredList.length } : s))
    setUndoInfo(null)
    notify("Time Reversed! 🪄")
  }

  const openSelector = async () => {
    const cleanTabs = await chromeService.getAvailableTabs()
    setAvailableTabs(cleanTabs)
    setSelectedTabs(cleanTabs.map(t => t.id))
    setShowSelector(true)
  }
  const handleAppendCurrentTab = async (sessionId) => {
    if (typeof chrome === "undefined" || !chrome.tabs) return;

    // Get the single active tab the user is currently looking at
    chrome.tabs.query({ currentWindow: true, active: true }, async (tabs) => {
      if (!tabs[0]) return;
      const activeTab = tabs[0];

      try {
        await appendTabToSession(sessionId, activeTab.title, activeTab.url);
        notify("Tab Binded to Portal! 📝");
        await syncWorkspaces(); // Refresh your UI state from Supabase
      } catch (err) {
        console.error("Append Error:", err.message);
      }
    });
  }

  if (loading) return (
    <div className="w-[350px] h-[550px] bg-slate-950 border border-orange-500/20 flex items-center justify-center text-orange-400 font-mono tracking-widest text-xs">
      CONSULTING THE SANCTUM...
    </div>
  )

  return (
    <div className="w-[350px] h-[550px] bg-slate-950 text-white font-sans flex flex-col relative overflow-hidden border border-orange-500/10">
      <Mystics />
      <Header />

      {/* Dynamic Notification Bar */}
      {notification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-linear-to-r from-orange-600 to-amber-600 text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full z-50 shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all sanctum-notify">
          {notification}
        </div>
      )}

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {!user ? (
          <div className="flex flex-col items-center justify-center text-center py-6">
          

    {/* Replace the old eye div with this */}
    <div className="relative flex items-center justify-center mb-6">
      {/* <div className="absolute" style={{top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}>
        <Mandala size={120} opacity={0.2} />
      </div> */}
      <EyeOfAgamotto onClick={() => {}} />
    </div>
            
            <h2 className="text-base font-bold text-orange-400 tracking-wider mb-2">Identify Yourself, Sorcerer</h2>
            <p className="text-[11px] text-slate-400 mb-6 px-2 leading-relaxed">
              Your digital relics cannot be synced across the multiverse without an established identity. Bind your tabs to your spirit.
            </p>
            <AuthUI />
          </div>
        ) : (
          <>
            {/* User Meta Data Control Bar */}
            <div className="flex items-center justify-between mb-4 p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 truncate w-40">{user.email}</span>
              <button onClick={() => supabase.auth.signOut()} className="text-[10px] text-red-400/80 hover:text-red-400 font-bold uppercase tracking-wider transition-colors">Banish Session</button>
            </div>

            {/* Core Action Trigger */}
            <button onClick={openSelector} className="w-full bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 py-3 rounded-xl mb-4 font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(249,115,22,0.15)] active:scale-[0.98] conjure-btn">
              Conjure Workspace
            </button>

            {/* ── TEMPORARY TEST BUTTON — remove after testing ── */}
            <button
              onClick={async () => {
                console.log("Testing Edge Function...")
                const { data, error } = await supabase.functions.invoke('ai-process', {
                  body: { action: 'embed', text: 'React hooks tutorial' }
                })
                console.log("Data:", data)
                console.log("Error:", error)
              }}
              className="w-full text-xs text-yellow-400 border border-yellow-400/30 p-2 rounded-xl mb-4"
            >
              TEST EDGE FUNCTION
            </button>
            {/* ── END TEMPORARY ── */}

            {/* Protocol Settings Switch */}
            <div className="flex items-center justify-between px-3 py-2.5 mb-4 bg-slate-900/20 rounded-xl border border-slate-800/50">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Clean Slate Protocol</span>
              <button onClick={() => setCleanSlate(!cleanSlate)} className={`w-8 h-4 rounded-full transition-colors ${cleanSlate ? 'bg-orange-500' : 'bg-slate-800'} relative`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${cleanSlate ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* In-Line Undo Trigger Container */}
            {undoInfo && (
              <div className="mb-4 p-2 bg-orange-950/20 border border-orange-500/20 rounded-xl flex justify-between items-center shadow-inner">
                <span className="text-[10px] text-slate-400 italic">A tab was banished from the scroll...</span>
                <button onClick={handleUndo} className="text-orange-400 text-[10px] font-bold tracking-wider hover:underline">REVERSE TIME</button>
              </div>
            )}

            {/* Render Presentational Component Grid List */}
            <SessionList
              sessions={sessions}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onRename={handleRename}
              onRemoveTab={onRemoveTab}
              onUngroup={handleUngroup}
              onCloseGroup={handleCloseGroup}
              onAppendTab={handleAppendCurrentTab}
            />

            {/* Presentational Modal Mount */}
            {showSelector && (
              <TabSelector
                tabs={availableTabs}
                selected={selectedTabs}
                setSelected={setSelectedTabs}
                onClose={() => setShowSelector(false)}
                onSave={() => {
                  const filtered = availableTabs.filter(t => selectedTabs.includes(t.id))
                  handleSave(filtered)
                  setShowSelector(false)
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App