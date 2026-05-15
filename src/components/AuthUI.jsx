import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthUI() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  // 1. OAUTH LOGIC (Google)
  const handleGoogleLogin = async () => {
    setLoading(true)

    try {
      // ✅ FIXED: always use web redirect for testing
      const redirectURL = "http://localhost:5173"

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectURL
        }
      })

      if (error) throw error

    } catch (err) {
      alert("Sanctum error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // 2. EMAIL/PASSWORD LOGIC
  const handleEmailAuth = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      return alert("Enter credentials, sorcerer.")
    }

    setLoading(true)

    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })

      if (error) throw error

      if (isSignUp) {
        alert("Check your email for the verification scroll!")
      }

    } catch (err) {
      alert("Banishment error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">

      {/* GOOGLE SECTION */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="group relative flex items-center justify-center gap-3 w-full bg-slate-900 border border-orange-500/30 hover:border-orange-500 text-white py-3 rounded-xl transition-all shadow-[0_0_10px_rgba(249,115,22,0.1)]"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="G"
          className="w-4 h-4"
        />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {loading ? "Invoking..." : "Identify with Google"}
        </span>
      </button>

      <div className="flex items-center gap-2">
        <div className="h-[1px] flex-1 bg-slate-800"></div>
        <span className="text-[9px] text-slate-600 uppercase">OR</span>
        <div className="h-[1px] flex-1 bg-slate-800"></div>
      </div>

      {/* MANUAL SECTION */}
      <form onSubmit={handleEmailAuth} className="flex flex-col gap-2">

        <input
          type="email"
          placeholder="SORCERER EMAIL"
          className="bg-slate-900 border border-slate-800 p-2 rounded text-[10px] focus:border-orange-500 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="SECRET PHRASE"
          className="bg-slate-900 border border-slate-800 p-2 rounded text-[10px] focus:border-orange-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-orange-600/10 text-orange-500 border border-orange-600/30 py-2 rounded text-[10px] font-bold uppercase hover:bg-orange-600 hover:text-white transition"
        >
          {loading ? "Processing..." : isSignUp ? "Create Identity" : "Access Sanctum"}
        </button>

      </form>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="text-[9px] text-slate-500 hover:text-blue-400"
      >
        {isSignUp
          ? "Already have an identity? Login"
          : "New to the timeline? Sign Up"}
      </button>

    </div>
  )
}