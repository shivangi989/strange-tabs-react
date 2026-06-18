// import React from 'react';

// export default function Notification({ message, type, onUndo, visible }) {
//   if (!visible) return null;

//   // Determine if this notification uses the Time Stone (Cyan) or standard Magic (Orange)
//   const isTimeReversal = type === 'undo';

//   return (
//     <div 
//       className={`fixed bottom-4 right-4 bg-slate-950 p-3.5 rounded-xl border text-xs font-mono tracking-wide z-50 transition-all duration-300
//         ${isTimeReversal 
//           ? 'text-cyan-400 border-cyan-500/40 animate-agamotto' 
//           : 'text-orange-400 border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
//         }
//       `}
//     >
//       <div className="flex items-center gap-2">
//         <span>{message}</span>
//         {isTimeReversal && onUndo && (
//           <button 
//             onClick={onUndo} 
//             className="ml-2 px-2 py-0.5 bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/30 rounded text-[10px] uppercase transition-all font-bold"
//           >
//             [REVERSE]
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }
