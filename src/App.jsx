import { useState,useEffect } from 'react'
import './App.css'
import Header from './components/Header';
import SessionItem from './components/SessionItem';

function App() { 
  //dummy data
  const [sessions, setSessions] = useState([
    { id: 1, title: "Morning Research", date: "Dec 30, 9:00 AM", tabCount: 5 },
    { id: 2, title: "React Tutorials", date: "Dec 29, 2:30 PM", tabCount: 12 },
    { id: 3, title: "Entertainment", date: "Dec 28, 8:15 PM", tabCount: 3 },
  ]);

  const handleDelete=(id)=>{
    console.log("delete clicked for, ",id);
    setSessions(sessions.filter(s=>s.id!==id));
  };
  const handleRestore = (id) => {
    console.log("Restore clicked for:", id);
  };
  return (
    <div className="w-[350px] min-h-[500px] bg-slate-950 text-white font-sans">
      <Header />
      <div className="flex-1 p-4 overflow-y-auto max-h-[440px]">
        <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-blue-900/20 transition mb-6 flex items-center justify-center gap-2 border border-blue-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save Current Session
        </button>

        <div className="space-y-1">
          {sessions.map((session) => (
            <SessionItem 
              key={session.id} 
              session={session} 
              onDelete={handleDelete}
              onRestore={handleRestore}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;