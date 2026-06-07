import React from 'react'

export default function TabSelector({ tabs, selected, setSelected, onSave, onClose }) {
  const toggleTab = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(x => x !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 p-4 flex flex-col justify-end animate-fade-in">
      <div className="bg-slate-950 border border-orange-500/20 rounded-2xl p-4 w-full max-h-[85%] flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <h2 className="text-xs font-black tracking-widest text-orange-400 uppercase font-mono mb-3 border-b border-slate-900 pb-2">
          Isolate Multiverse Cores
        </h2>

        <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar my-1">
          {tabs.length === 0 ? (
            <div className="text-[10px] text-slate-600 italic py-4 text-center">No stray timelines uncovered.</div>
          ) : (
            tabs.map(tab => (
              <label key={tab.id} className="flex items-start gap-3 p-2 rounded-xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 transition-colors cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selected.includes(tab.id)}
                  onChange={() => toggleTab(tab.id)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[11px] text-slate-300 truncate group-hover:text-slate-100 transition-colors leading-tight">
                  {tab.title || tab.url}
                </span>
              </label>
            ))
          )}
        </div>

        <div className="flex gap-2 mt-4 pt-2 border-t border-slate-900">
          <button onClick={onClose} className="flex-1 border border-slate-800 hover:border-slate-700 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-colors">
            Collapse
          </button>
          <button onClick={onSave} className="flex-1 bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-orange-950/20">
            Banish
          </button>
        </div>
      </div>
    </div>
  )
}