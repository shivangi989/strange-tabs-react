// src/services/aiService.js
import { supabase } from '../lib/supabase'

export const summarizeContent = async (content, title, url) => {
    const hasRealContent = content && content.trim().length >= 50
    const prompt = hasRealContent
      ? `Summarize this page in exactly 2 sentences. Never apologize or say you cannot summarize — if the content seems incomplete, summarize whatever is present and infer the rest from the title.
    Title: ${title}
    URL: ${url}
    Content: ${content}`
      : `Based ONLY on this page's title and URL, write exactly 1 confident sentence describing what this page is likely about. Never say "I cannot" or apologize — always provide your best inference.
    Title: ${title}
    URL: ${url}`
  try {
    const { data, error } = await supabase.functions.invoke('ai-process', {
      body: { action: 'summarize', content, title, url }
    })
    if (error) throw error
    return data.summary ?? `Saved tab: ${title}`
  } catch (err) {
    console.error('[aiService] summarize failed:', err)
    return `Saved tab: ${title}`
  }
}

export const generateEmbedding = async (text) => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-process', {
      body: { action: 'embed', text }
    })
    if (error) throw error
    return data.embedding ?? null
  } catch (err) {
    console.error('[aiService] embed failed:', err)
    return null
  }
}

export const processTab = async ({ content, title, url }) => {
  console.log('[processTab] processing:', title?.slice(0, 40), '| content length:', content?.length)
  
  const isJunkPage = !title || url?.startsWith('chrome://')
  if (isJunkPage) {
    console.log('[processTab] junk page, skipping')
    return { summary: `Saved tab: ${title}`, embedding: null, raw_content: content || '' }
  }

  // ✅ Title + URL repeated for emphasis, content appended as supplementary context
  // This ensures even if content extraction is noisy/empty, 
  // the embedding still captures strong signal from title/url
  const cleanContent = (content || '').trim()
  const textToEmbed = `${title}. ${title}. ${url}. ${cleanContent}`.slice(0, 2000)

  try {
    const [summary, embedding] = await Promise.all([
      summarizeContent(cleanContent, title, url),
      generateEmbedding(textToEmbed)
    ])
    return { summary, embedding, raw_content: cleanContent }
  } catch (err) {
    console.error('[aiService] processTab failed:', err)
    // ✅ Even on total failure, still embed title+url alone as last resort
    const fallbackEmbedding = await generateEmbedding(`${title}. ${url}`).catch(() => null)
    return { 
      summary: `Saved tab: ${title}`, 
      embedding: fallbackEmbedding, 
      raw_content: cleanContent 
    }
  }
}

// src/services/aiService.js — add this batching utility

// Process tabs in small batches instead of all-at-once,
// to respect Gemini's rate limits and avoid silent mass-failure
export const processTabsBatched = async (tabsWithContent, batchSize = 3, delayMs = 1500) => {
  const results = []
  
  for (let i = 0; i < tabsWithContent.length; i += batchSize) {
    const batch = tabsWithContent.slice(i, i + batchSize)
    
    const batchResults = await Promise.all(
      batch.map(async (tab) => {
        const aiData = await processTabWithRetry(tab)
        return { ...tab, ...aiData }
      })
    )
    
    results.push(...batchResults)
    
    // Wait between batches so we don't hammer Gemini's rate limit
    if (i + batchSize < tabsWithContent.length) {
      await new Promise(r => setTimeout(r, delayMs))
    }
  }
  
  return results
}

// Single tab processing with one retry on failure
const processTabWithRetry = async (tab, attempt = 1) => {
  const result = await processTab(tab)
  
  // If embedding failed and we haven't retried yet, try once more after a short delay
  if (!result.embedding && attempt === 1) {
    await new Promise(r => setTimeout(r, 2000))
    return processTab(tab)
  }
  
  return result
}