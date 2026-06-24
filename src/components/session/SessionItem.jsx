import React, { useState } from 'react';


const SessionItem = ({ restoreCount,session, onDelete, onRestore, onRename, onRemoveTab, onUngroup, onCloseGroup ,onAppendTab,}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    

    return (
        <div className='group bg-slate-900/40 border border-slate-900 hover:border-orange-500/20 rounded-xl p-3.5 transition-all shadow-sm'>
            <div className='flex justify-between items-center'>
                <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer flex-1 min-w-0 pr-2">
                    <h3 className='text-slate-200 font-bold text-xs truncate group-hover:text-orange-400/90 transition-colors tracking-wide'>{session?.title}</h3>
                    <p className='text-slate-600 font-mono text-[8px] mt-0.5 uppercase tracking-tighter'>{session?.date} • {session?.tabCount} Anchors</p>
                </div>
                <div className='flex gap-0.5'>
                    <button onClick={() => onRename(session.id)} className='text-slate-600 hover:text-orange-400 p-1 transition-colors'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M19.67 2.61c-.81-.81-2.14-.81-2.95 0L3.38 15.95c-.13.13-.22.29-.26.46l-1.09 4.34c-.08.34.01.7.26.95.19.19.45.29.71.29.08 0 .16 0 .24-.03l4.34-1.09c.18-.04.34-.13.46-.26L21.38 7.27c.81-.81.81-2.14 0-2.95L19.66 2.6ZM6.83 19.01l-2.46.61.61-2.46 9.96-9.94 1.84 1.84zM19.98 5.86 18.2 7.64 16.36 5.8l1.78-1.78s.09-.03.12 0l1.72 1.72s.03.09 0 .12"></path></svg>
                    </button>
                    <button onClick={() => onDelete(session.id)} className='text-slate-600 hover:text-red-400 p-1 transition-colors'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-900 space-y-1.5 animate-fade-in">
                    {session?.tabs?.map((tab, i) => (
                        <div key={i} className="flex justify-between items-center group/tab bg-slate-950/40 px-2 py-1 rounded-lg border border-transparent hover:border-slate-900">
                            <span className="text-[10px] text-slate-400 truncate max-w-[78%] font-sans tracking-tight">{tab.title || tab.url}</span>
                            <button onClick={(e) => { e.stopPropagation(); onRemoveTab(session.id, tab.url); }} className="text-red-400/70 hover:text-red-400 text-[9px] uppercase font-mono tracking-tighter opacity-0 group-hover/tab:opacity-100 transition-opacity">Banish</button>
                        </div>
                    ))}
                     
                        {restoreCount > 0 && (
                        <span className="text-[8px] text-amber-500/60 font-mono">
                            ⟳ {restoreCount}x restored
                        </span>
                        )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAppendTab(session.id); }}
                        className="text-[9px] text-amber-500 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500 hover:text-white transition-all py-1.5 rounded-lg font-mono font-bold tracking-wider uppercase mb-1"
                        >
                        + Append Active Tab to This Timeline
                        </button>
                    <div className="flex flex-col gap-1.5 mt-4">
                        <button onClick={() => onRestore(session.id)} className="text-[10px] bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-2 rounded-xl font-bold uppercase tracking-wider transition-all shadow-sm">Manifest Reality</button>
                        <div className="grid grid-cols-2 gap-1.5">
                            <button onClick={() => onUngroup(session.id)} className="text-[9px] bg-slate-900 border border-slate-800 text-slate-300 py-1.5 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors">Sever Group</button>
                            <button onClick={() => onCloseGroup(session.id)} className="text-[9px] bg-red-950/20 text-red-400 py-1.5 rounded-xl font-bold uppercase tracking-wider border border-red-900/30 hover:bg-red-950/40 transition-colors">Collapse Cores</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionItem;