// supabase/functions/ai-process/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY')
const BASE = 'https://generativelanguage.googleapis.com/v1beta'

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // ✅ MUST BE FIRST — before reading any headers or body
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Now safe to check auth — this is a real request, not preflight
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: corsHeaders }
    )
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_ANON_KEY'),
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Invalid session' }),
      { status: 401, headers: corsHeaders }
    )
  }

  try {
    const { action, content, title, url, text } = await req.json()

    if (action === 'summarize') {
      const prompt = `Summarize this page in 2 sentences.
Title: ${title}
URL: ${url}
Content: ${content}`

      const res = await fetch(
        `${BASE}/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 150, temperature: 0.2 }
          })
        }
      )

      if (!res.ok) {
        const errText = await res.text()
        console.error('Gemini summarize error:', res.status, errText)
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

if (action === "embed") {

  const safeText = (text || "").slice(0, 2000)

  const res = await fetch(
    `${BASE}/models/gemini-embedding-001:embedContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: { parts: [{text: safeText}]},
          outputDimensionality: 768
      })
    }
  )

  if (!res.ok) {
    const errText = await res.text()

    console.error(
      "Gemini embed error:",
      res.status,
      errText
    )

    return new Response(
      JSON.stringify({
        embedding: null,
        debug: errText
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    )
  }

  const data = await res.json()

  return new Response(
    JSON.stringify({
      embedding: data.embedding?.values ?? null
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  )
}

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: corsHeaders }
    )

  } catch (err) {
    console.error('Function error:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})