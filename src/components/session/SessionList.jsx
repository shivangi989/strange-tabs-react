import React from 'react'
import SessionItem from "./SessionItem"

export default function SessionList({ sessions, onDelete, onRestore, onRename, onRemoveTab, onUngroup, onCloseGroup ,onAppendTab, onColorChange}) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-900/10 border border-dashed border-slate-900 rounded-2xl">
        <p className="text-slate-600 text-[11px] uppercase font-mono tracking-widest mb-1">No Portals Active</p>
        <p className="text-slate-700 text-[9px] px-6 leading-relaxed">No custom anchors have been configured in this segment of the timeline matrix.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 pr-0.5">
      {sessions.map(session => (
        <SessionItem
          key={session.id}
          session={session}
          onDelete={onDelete}
          onRestore={onRestore}
          onRename={onRename}
          onRemoveTab={onRemoveTab}
          onUngroup={onUngroup}
          onCloseGroup={onCloseGroup}
          onAppendTab={onAppendTab}
          restoreCount={session.restoreCount}
          onColorChange={onColorChange}
        />
      ))}
    </div>
  )
}