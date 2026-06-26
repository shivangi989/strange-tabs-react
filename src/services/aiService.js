// src/services/aiService.js
import { supabase } from '../lib/supabase'

export const summarizeContent = async (content, title, url) => {
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
  // Skip AI entirely for blank/internal pages — nothing meaningful to embed
  const isJunkPage = !content || content.trim().length < 30 || url?.startsWith('chrome://')
  
  if (isJunkPage) {
    return {
      summary: `Saved tab: ${title || 'Untitled'}`,
      embedding: null,  // ← null means search_tabs SQL excludes it automatically
      raw_content: content || ''
    }
  }

  const textToEmbed = `${title} ${url} ${content}`.slice(0, 2000)
  try {
    const [summary, embedding] = await Promise.all([
      summarizeContent(content, title, url),
      generateEmbedding(textToEmbed)
    ])
    return { summary, embedding, raw_content: content }
  } catch (err) {
    console.error('[aiService] processTab failed:', err)
    return { summary: `Saved tab: ${title}`, embedding: null, raw_content: content }
  }
}