import React from 'react';

const SessionItem=({session,onDelete,onRestore})=>{
    return(
        <div className='group relative bg-slate-800 rounded-xl p-4 mb-3 border border-slate-700 hover:border-blue-500 transition-all shadow-sm'>
            <div className='flex justify-between items-start mb-2'>
                <div>
                    <h3 className='text-white font-medium text-sm truncate w-48'>
                        {session.title||"Untitled Session"}
                    </h3>
                    <p className='text-slate-400 text-[10px] uppercase tracking-wider font-semibold'> 
                        {session.date}
                    </p>
                </div>
                <button className='text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1'
                onClick={()=>onDelete(session.id)}
                title='Delete Session'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>  
                </button>
            </div>

            <div className='flex items-center justify-between mt-3'>
                <div className='flex items-center gap-2'>
                    <span className='bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded border border-blue-800/50'>
                        {session.tabCount} Tabs
                    </span>
                </div>

                <button className='text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition font-medium shadow-lg shadow-blue-900/20'
                onClick={() => onRestore(session.id)}>
                    Restore
                </button>
            </div>
        </div>
    );

};

export default SessionItem;