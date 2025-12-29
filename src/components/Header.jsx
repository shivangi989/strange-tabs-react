import React from 'react';

const Header=()=>{
    return(
        <div className='bg-slate-900 border-b border-slate-700 p-4 sticky top-0 z-10 shadow-md'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <h1 className='text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent'>
                        Strange Tabs
                    </h1>
                </div>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full border border-slate-700 font-mono">
                    v2.0
                </span>
            </div>
        </div>

    );
};
export default Header;