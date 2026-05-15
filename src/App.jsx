import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import SessionItem from './components/SessionItem'
import AuthUI from './components/AuthUI' 
import { supabase } from './lib/supabase'
import {
  createSession,
  fetchSessions,
  renameSession,
  deleteSession,
  updateTabs
} from './services/sessionService'

function App(){
  
  const [sessions, setSessions] = useState([])
  const [cleanSlate, setCleanSlate] = useState(false)
  const [undoInfo, setUndoInfo] = useState(null)
  const [notification, setNotification] = useState("")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. AUTHENTICATION LISTENER (The Eye of Agamotto)
useEffect(() => {
  const initAuth = async () => {
    const { data } = await supabase.auth.getSession()
    setUser(data.session?.user ?? null)
    setLoading(false)
  }

  initAuth()

  const { data: { subscription } } =
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

  return () => subscription.unsubscribe()
}, [])

  // 2. LOAD SESSIONS FROM CHROME STORAGE
// 2. LOAD SESSIONS FROM SUPABASE (CLOUD SOURCE OF TRUTH)
useEffect(() => {
  if (!user) return

  const loadSessions = async () => {
    try {
      const data = await fetchSessions(user.id)

      const formatted = data.map(s => ({
        id: s.id,
        title: s.title,
        date: s.created_at,
        tabCount: s.tabs?.length || 0,
        tabs: s.tabs || []
      }))

      setSessions(formatted)
    } catch (err) {
      console.error("Failed to load sessions:", err.message)
    }
  }

  loadSessions()
}, [user])

  const triggerNotify = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(""), 3000)
  }

  // --- ACTIONS ---
const handleSave = (providedTabs = null) => {
  const processSave = async (tabs) => {
    if (!tabs || tabs.length === 0) return

    const newSession = {
      title: `Session ${sessions.length + 1}`,
      tabs: tabs.map(t => ({
        url: t.url,
        title: t.title
      }))
    }

    try {
      await createSession(user.id, newSession)

      triggerNotify("Session Conjured! ✨")

      // refresh from cloud (important for consistency)
      const data = await fetchSessions(user.id)

      const formatted = data.map(s => ({
        id: s.id,
        title: s.title,
        date: s.created_at,
        tabCount: s.tabs?.length || 0,
        tabs: s.tabs || []
      }))

      setSessions(formatted)

      if (cleanSlate) {
        chrome.tabs.create({ url: "chrome://newtab" }, () => {
          chrome.tabs.remove(tabs.map(t => t.id))
        })
      }

    } catch (err) {
      console.error("Save failed:", err.message)
    }
  }

  if (providedTabs) processSave(providedTabs)
  else chrome.tabs.query({ currentWindow: true, pinned: false }, processSave)
}

  const handleRestore = (id) => {
    const session = sessions.find(s => s.id === id)
    if (!session) return
    const tabPromises = session.tabs.map(t => chrome.tabs.create({ url: t.url, active: false }))
    Promise.all(tabPromises).then((newTabs) => {
      const tabIds = newTabs.map(t => t.id)
      chrome.tabs.group({ tabIds }, (groupId) => {
        chrome.tabGroups.update(groupId, { title: session.title, color: "blue" })
      })
      triggerNotify("Portals Opened! 🌀")
    })
  }

  const handleUngroup = (id) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const session = sessions.find(s => s.id === id)
      const urls = session.tabs.map(t => t.url)
      const tabsToUngroup = tabs.filter(t => urls.includes(t.url)).map(t => t.id)
      if (tabsToUngroup.length > 0) {
        chrome.tabs.ungroup(tabsToUngroup)
        triggerNotify("Magic Unbound! 🔓")
      }
    })
  }

  const handleCloseGroup = (id) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const session = sessions.find(s => s.id === id)
      const urls = session.tabs.map(t => t.url)
      const tabsToClose = tabs.filter(t => urls.includes(t.url)).map(t => t.id)
      if (tabsToClose.length > 0) {
        if (tabsToClose.length === tabs.length) {
          chrome.tabs.create({ url: "chrome://newtab" }, () => chrome.tabs.remove(tabsToClose))
        } else {
          chrome.tabs.remove(tabsToClose)
        }
        triggerNotify("Mirror Dimension Cleared! 🧹")
      }
    })
  }

const handleRename = async (id) => {
  const name = prompt("Rename this Portal:")
  if (!name) return

  try {
    await renameSession(id, name)

    setSessions(prev =>
      prev.map(s => s.id === id ? { ...s, title: name } : s)
    )

    triggerNotify("Renamed in the Multiverse ✨")

  } catch (err) {
    console.error(err.message)
  }
}

const handleDelete = async (id) => {
  if (!window.confirm("Banish this session forever?")) return

  try {
    await deleteSession(id)

    setSessions(prev => prev.filter(s => s.id !== id))

    triggerNotify("Erased from Reality! 🗑️")

  } catch (err) {
    console.error(err.message)
  }
}

const onRemoveTab = async (sessionId, url) => {
  const session = sessions.find(s => s.id === sessionId)
  const tab = session.tabs.find(t => t.url === url)

  setUndoInfo({ sessionId, tab })

  const updatedTabs = session.tabs.filter(t => t.url !== url)

  try {
    await updateTabs(sessionId, updatedTabs)

    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? { ...s, tabs: updatedTabs, tabCount: updatedTabs.length }
          : s
      )
    )

  } catch (err) {
    console.error(err.message)
  }

  setTimeout(() => setUndoInfo(null), 5000)
}

const handleUndo = async () => {
  if (!undoInfo) return

  const session = sessions.find(s => s.id === undoInfo.sessionId)

  const restoredTabs = [undoInfo.tab, ...session.tabs]

  try {
    await updateTabs(undoInfo.sessionId, restoredTabs)

    setSessions(prev =>
      prev.map(s =>
        s.id === undoInfo.sessionId
          ? { ...s, tabs: restoredTabs, tabCount: restoredTabs.length }
          : s
      )
    )

    setUndoInfo(null)
    triggerNotify("Time Reversed! 🪄")

  } catch (err) {
    console.error(err.message)
  }
}

  if (loading) return <div className="w-[350px] h-[500px] bg-slate-950 flex items-center justify-center text-blue-400">Consulting the Sanctum...</div>

  return (
    <div className="w-[350px] min-h-[500px] bg-slate-950 text-white font-sans flex flex-col relative overflow-hidden">
      <Header />

      {notification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-blue-600 text-[10px] px-3 py-1 rounded-full z-50 animate-bounce shadow-lg">
          {notification}
        </div>
      )}

      <div className="flex-1 p-4 overflow-y-auto">
        
        {/* --- AUTHENTICATION GATE --- */}
        {!user ? (
          <div className="flex flex-col items-center justify-center text-center py-10 animate-fade-in">
             <div className="w-16 h-16 border-2 border-orange-500 rounded-full flex items-center justify-center mb-4 animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.5)]">
               <span className="text-2xl">👁️</span>
             </div>
             <h2 className="text-lg font-bold text-orange-400 mb-2">Identify Yourself, Sorcerer</h2>
             <p className="text-[11px] text-slate-400 mb-6 px-4">
               Your digital relics cannot be synced across the multiverse without an established identity. Log in to bind your tabs to your spirit.
             </p>
             <AuthUI />
          </div>
        ) : (
          <>
            {/* USER PROFILE HEADER */}
            <div className="flex items-center justify-between mb-6 p-2 bg-slate-900/50 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {user.email[0].toUpperCase()}
                </div>
                <span className="text-[10px] text-slate-300 truncate w-24">{user.email}</span>
              </div>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="text-[9px] text-red-400 hover:underline uppercase tracking-widest font-bold"
              >
                Depart
              </button>
            </div>

            {/* SAVE BUTTON */}
            <button
              onClick={() => handleSave()}
              className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl mb-3 font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
              Conjure Current Workspace
            </button>

            {/* CLEAN SLATE */}
            <div className="flex items-center justify-between px-2 mb-6">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                Clean Slate Protocol
              </span>
              <button
                onClick={() => setCleanSlate(!cleanSlate)}
                className={`w-8 h-4 rounded-full transition-colors ${cleanSlate ? 'bg-blue-600' : 'bg-slate-800'} relative`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${cleanSlate ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* UNDO */}
            {undoInfo && (
              <div className="mb-4 p-2 bg-slate-900 border border-orange-900/30 rounded-lg flex justify-between items-center animate-pulse">
                <span className="text-[10px] text-slate-400">A relic was misplaced...</span>
                <button onClick={handleUndo} className="text-orange-400 text-[10px] font-bold">UNDO</button>
              </div>
            )}

            {/* SESSIONS LIST */}
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <div className="text-center py-10 text-slate-600 text-xs italic">
                  No portals have been established in this timeline.
                </div>
              ) : (
                sessions.map(s => (
                  <SessionItem
                    key={s.id}
                    session={s}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                    onRename={handleRename}
                    onRemoveTab={onRemoveTab}
                    onUngroup={handleUngroup}
                    onCloseGroup={handleCloseGroup}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App