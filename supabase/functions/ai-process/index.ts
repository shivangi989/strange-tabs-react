// supabase/functions/ai-process/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const BASE = 'https://generativelanguage.googleapis.com/v1beta'

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_ANON_KEY'),
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401, headers: corsHeaders })
  }

  // NOTE: still using shared GEMINI_API_KEY env var for now.
  // Per-user key system is the next milestone — see user_settings migration.
  const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY')

  try {
    const { action, content, title, url, text, titles } = await req.json()

    if (action === 'summarize') {
      const hasRealContent = content && content.trim().length >= 50
      const prompt = hasRealContent
        ? `Summarize this page in exactly 2 sentences. Never apologize or say you cannot summarize — if the content seems incomplete or noisy, summarize whatever real information is present and infer the rest from the title.
Title: ${title}
URL: ${url}
Content: ${content}`
        : `Based ONLY on this page's title and URL, write exactly 1 confident sentence describing what this page is likely about. Never say "I cannot" or apologize — always provide your best inference.
Title: ${title}
URL: ${url}`

      const res = await fetch(
        `${BASE}/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 150, temperature: 0.3 }
          })
        }
      )

      if (!res.ok) {
        const errText = await res.text()
        return new Response(
          JSON.stringify({ summary: `Saved tab: ${title}`, debug: errText }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const data = await res.json()
      const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      return new Response(
        JSON.stringify({ summary: summary ?? `Saved tab: ${title}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'embed') {
      const safeText = (text || '').slice(0, 2000)
      const res = await fetch(
        `${BASE}/models/gemini-embedding-001:embedContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: { parts: [{ text: safeText }] },
            outputDimensionality: 768
          })
        }
      )

      if (!res.ok) {
        const errText = await res.text()
        return new Response(
          JSON.stringify({ embedding: null, debug: errText }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const data = await res.json()
      return new Response(
        JSON.stringify({ embedding: data.embedding?.values ?? null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── NEW: AI workspace naming (generates a short name from tab titles) ──
    if (action === 'name_workspace') {
      const prompt = `Given these browser tab titles, generate a short 2-4 word workspace name that captures the common theme. Respond with ONLY the name, no quotes, no explanation.
Titles: ${(titles || []).join(', ')}`

      const res = await fetch(
        `${BASE}/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 20, temperature: 0.4 }
          })
        }
      )

      if (!res.ok) {
        return new Response(
          JSON.stringify({ name: null }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const data = await res.json()
      const name = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      return new Response(
        JSON.stringify({ name: name || null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: corsHeaders })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
})