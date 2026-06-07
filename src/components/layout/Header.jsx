import React from 'react';

const Header = () => {
    return (
        <div className='bg-slate-950 border-b border-orange-500/10 p-4 sticky top-0 z-10 shadow-lg shadow-black/40 backdrop-blur-md'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <h1 className='text-base font-black tracking-widest bg-linear-to-r from-orange-400 via-amber-500 to-purple-500 bg-clip-text text-transparent uppercase font-mono'>
                        STRANGE TABS
                    </h1>
                </div>
                <span className="text-[9px] bg-orange-950/30 text-orange-400 font-bold px-2 py-0.5 rounded-full border border-orange-500/20 font-mono tracking-tight">
                    SANCTUM v2.6
                </span>
            </div>
        </div>
    );
};
export default Header;