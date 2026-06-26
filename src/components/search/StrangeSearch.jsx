import { useState ,useEffect} from 'react'
import { searchTabsSemantically } from '../../services/sessionService'

export default function StrangeSearch({ userId }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)


    useEffect(() => {
    if (query.trim().length === 0) {
      setResults([])
      setSearched(false)
    }
  }, [query])

  
  const handleSearch = async () => {
    if (!query.trim() || query.length < 3) return
    setLoading(true)
    setSearched(true)
    try {
      const matches = await searchTabsSemantically(query, userId)
      setResults(matches)
    } catch (err) {
      console.error('[StrangeSearch]', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-2 mb-4">
        <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
                <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by meaning, not keywords..."
                className="w-full bg-slate-900/60 border border-orange-500/25 rounded-xl px-3 py-2.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/70 focus:shadow-[0_0_12px_rgba(249,115,22,0.25)] transition-all"
                />
            </div>
            <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2.5 bg-linear-to-r from-orange-600 to-amber-600 rounded-xl text-white text-xs font-bold disabled:opacity-40 shadow-[0_0_12px_rgba(249,115,22,0.2)]"
            >
                {loading ? '⟳' : '✦'}
            </button>
        </div>

      {searched && (
        <div className="space-y-1.5">
          {results.length === 0 && !loading && (
            <p className="text-slate-500 text-[10px] text-center py-2">No matches found.</p>
          )}
          {results.map((tab) => (
            <div
              key={tab.id}
              onClick={() => chrome.tabs.create({ url: tab.url })}
              className="p-2 bg-slate-900/40 border border-slate-800 rounded-lg hover:border-orange-500/30 cursor-pointer transition-all"
            >
              <p className="text-[11px] text-slate-200 truncate">{tab.title || tab.url}</p>
              {tab.summary && <p className="text-[9px] text-slate-500 line-clamp-2 leading-snug ">{tab.summary}</p>}
              <span className="text-[8px] text-orange-500/60">{Math.round(tab.similarity * 100)}% match</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}