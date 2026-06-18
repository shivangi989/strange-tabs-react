import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AuthUI() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  // 🛠️ FIX: Extension-Safe Google OAuth handling
const handleGoogleLogin = async () => {
  setLoading(true)
  try {
    const isExtension = typeof chrome !== "undefined" && chrome.identity

    if (!isExtension) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      })
      if (error) throw error
      return
    }

    const redirectURL = chrome.identity.getRedirectURL()
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectURL)}`




    // ✅ FIX: Wrap callback in a Promise so we can await it
    await new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        { url: authUrl, interactive: true },
        async (responseUrl) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
            return
          }

          if (!responseUrl) {
            reject(new Error("No response URL returned from Google"))
            return
          }

          try {
            const urlParams = new URLSearchParams(new URL(responseUrl).hash.substring(1))
            const accessToken = urlParams.get("access_token")
            const refreshToken = urlParams.get("refresh_token")

            if (!accessToken || !refreshToken) {
              reject(new Error("Tokens missing from redirect URL"))
              return
            }

            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })

            if (error) reject(error)
            else resolve()

          } catch (err) {
            reject(err)
          }
        }
      )
    })

  } catch (err) {
    alert("Portal collapse: " + err.message)
  } finally {
    setLoading(false) // ✅ Now this runs AFTER the callback completes
  }
}

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    if (!email || !password) return alert("Credentials required, sorcerer.")
    setLoading(true)
    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })

      if (error) throw error
      if (isSignUp) alert("Verification scroll dispatched to your coordinates!")
    } catch (err) {
      alert("Authentication failure: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-3.5 px-1">
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="group relative flex items-center justify-center gap-3 w-full bg-slate-900 border border-orange-500/30 hover:border-orange-500 text-white py-2.5 rounded-xl transition-all shadow-md text-xs font-bold uppercase tracking-wider"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-3.5 h-3.5" />
        <span>{loading ? "Invoking..." : "Identify with Google"}</span>
      </button>

      <div className="flex items-center gap-2 my-1">
        <div className="h-[1px] flex-1 bg-slate-800/60"></div>
        <span className="text-[8px] text-slate-600 font-mono tracking-widest">OR</span>
        <div className="h-[1px] flex-1 bg-slate-800/60"></div>
      </div>

      <form onSubmit={handleEmailAuth} className="flex flex-col gap-2">
        <input
          type="email"
          placeholder="SORCERER EMAIL"
          className="bg-slate-900 border border-slate-800/80 p-2.5 rounded-xl text-[10px] font-mono focus:border-orange-500 outline-none text-slate-200 transition-colors"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="SECRET PASSPHRASE"
          className="bg-slate-900 border border-slate-800/80 p-2.5 rounded-xl text-[10px] font-mono focus:border-orange-500 outline-none text-slate-200 transition-colors"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500/10 text-orange-400 border border-orange-500/30 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-sm"
        >
          {loading ? "Processing..." : isSignUp ? "Create Identity" : "Access Sanctum"}
        </button>
      </form>

      <button onClick={() => setIsSignUp(!isSignUp)} className="text-[9px] text-slate-500 hover:text-orange-400 transition-colors uppercase font-mono tracking-tight mt-1">
        {isSignUp ? "Already tracked in this timeline? Sign In" : "New configuration coordinates? Register"}
      </button>
    </div>
  )
}