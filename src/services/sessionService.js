import { processTab ,generateEmbedding, processTabsBatched} from './aiService.js'
import { supabase } from '../lib/supabase'


export async function createSession(userId, session) {
  const { data: sessionData, error: sessionError } = await supabase
    .from('sessions')
    .insert({ user_id: userId, title: session.title })
    .select()
    .single()

  if (sessionError) throw sessionError

  const tabsPayload = session.tabs.map(tab => ({
    session_id: sessionData.id,
    url: tab.url,
    title: tab.title
  }))

  const { data: tabsData, error: tabsError } = await supabase
    .from('tabs')
    .insert(tabsPayload)
    .select()

  if (tabsError) throw tabsError

  return { ...sessionData, tabs: tabsData }
}


export async function fetchSessions(userId) {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id,
      title,
      created_at,
      color,
      chrome_group_id,
      tabs (id, url, title)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function renameSession(sessionId, title) {
  const { error } = await supabase
    .from('sessions')
    .update({ title })
    .eq('id', sessionId)
  if (error) throw error
}

export async function deleteSession(sessionId) {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId)
  if (error) throw error
}

export async function updateTabs(sessionId, tabs) {
  // Delete cascading records synchronously
  await supabase
    .from('tabs')
    .delete()
    .eq('session_id', sessionId)

  if (tabs.length === 0) return

  const payload = tabs.map(t => ({
    session_id: sessionId,
    url: t.url,
    title: t.title
  }))

  const { error } = await supabase.from('tabs').insert(payload)
  if (error) throw error
}

// Append a single new tab to an existing session
export async function appendTabToSession(sessionId, tabTitle, tabUrl) {
  const { data, error } = await supabase
    .from('tabs')
    .insert([{
      session_id: sessionId,
      url: tabUrl,
      title: tabTitle
    }])
    .select()

  if (error) throw error
  return data
}


export const enrichTabsWithAI = async (tabsWithContent) => {
  console.log('[enrichAI] called with', tabsWithContent.length, 'tabs')
  console.log('[enrichAI] first tab content preview:', tabsWithContent[0]?.content?.slice(0, 100))
  
  const enrichedTabs = await processTabsBatched(tabsWithContent, 3, 1500)

  const updatePromises = enrichedTabs.map(async (tab) => {
    console.log('[enrichAI] updating tab', tab.id, '— summary:', tab.summary?.slice(0, 50), '— hasEmbedding:', !!tab.embedding)
    
    const { error } = await supabase
      .from('tabs')
      .update({
        summary: tab.summary,
        embedding: tab.embedding,
        raw_content: tab.raw_content
      })
      .eq('id', tab.id)

    if (error) console.error('[enrichAI] supabase update error:', error)
  })

  return Promise.allSettled(updatePromises)
}


export const searchTabsSemantically = async (queryText, userId) => {
  
  const queryEmbedding = await generateEmbedding(queryText)
  if (!queryEmbedding) return []

  const { data, error } = await supabase.rpc('search_tabs', {
    query_embedding: queryEmbedding,
    match_user_id: userId,
    match_threshold: 0.45,
    match_count: 5
  })

  if (error) {
    console.error('[sessionService] search failed:', error)
    return []
  }
  return data ?? []
}

export async function updateSessionColor(sessionId, color) {
  const { error } = await supabase
    .from('sessions')
    .update({ color })
    .eq('id', sessionId)
  if (error) throw error
}

export async function updateSessionFromBrowser(sessionId, { title, color }) {
  const { error } = await supabase
    .from('sessions')
    .update({ title, color })
    .eq('id', sessionId)
  if (error) throw error
}

export async function updateSessionGroupId(sessionId, chromeGroupId) {
  const { error } = await supabase
    .from('sessions')
    .update({ chrome_group_id: chromeGroupId })
    .eq('id', sessionId)
  if (error) throw error
}
