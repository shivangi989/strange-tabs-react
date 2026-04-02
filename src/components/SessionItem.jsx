import React, { useState } from 'react';

const SessionItem = ({ session, onDelete, onRestore, onRename, onRemoveTab }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className='group relative bg-slate-800 rounded-xl p-4 mb-3 border border-slate-700 hover:border-blue-500 transition-all shadow-sm'>
            <div className='flex justify-between items-start mb-2'>
                <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer flex-1">
                    <h3 className='text-white font-medium text-sm truncate w-48'>
                        {session?.title || "Untitled Session"}
                    </h3>
                    <p className='text-slate-400 text-[10px] uppercase tracking-wider font-semibold'>
                        {session?.date}
                    </p>
                </div>
                
                <div className='flex gap-1'>
                    <button onClick={() => onRename(session.id)}
                        className='text-slate-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity p-1'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.67 2.61c-.81-.81-2.14-.81-2.95 0L3.38 15.95c-.13.13-.22.29-.26.46l-1.09 4.34c-.08.34.01.7.26.95.19.19.45.29.71.29.08 0 .16 0 .24-.03l4.34-1.09c.18-.04.34-.13.46-.26L21.38 7.27c.81-.81.81-2.14 0-2.95L19.66 2.6ZM6.83 19.01l-2.46.61.61-2.46 9.96-9.94 1.84 1.84zM19.98 5.86 18.2 7.64 16.36 5.8l1.78-1.78s.09-.03.12 0l1.72 1.72s.03.09 0 .12"></path>
                        </svg>
                    </button>
                    <button className='text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1'
                        onClick={() => onDelete(session.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-700 space-y-2">
                    {/* The loop ONLY contains the tab list items */}
                    {session.tabs.map((tab, index) => (
                        <div key={index} className="flex justify-between items-center group/tab">
                            <div className="flex items-center gap-2 text-[11px] text-slate-300 truncate max-w-[80%]">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span className="truncate">{tab.title}</span>
                            </div>
                            {/* Individual Tab Delete Button for "Ownership" */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveTab(session.id, tab.url);
                                }}
                                className="text-slate-600 hover:text-red-400 text-[10px] opacity-0 group-hover/tab:opacity-100 transition-opacity">
                                Remove
                            </button>
                        </div>
                    ))}
                    
                    {/* Restore button stays OUTSIDE the loop */}
                    <button
                        onClick={() => onRestore(session.id)}
                        className="w-full mt-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-xs hover:bg-blue-600/40 transition font-medium">
                        Restore All {session.tabCount} Tabs
                    </button>
                </div>
            )}
        </div>
    );
};

export default SessionItem;