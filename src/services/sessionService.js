import { supabase } from '../lib/supabase'

export async function createSession(userId, session) {
  // 1. Write Parent Record row
  const { data: sessionData, error: sessionError } = await supabase
    .from('sessions')
    .insert({ user_id: userId, title: session.title })
    .select()
    .single()

  if (sessionError) throw sessionError

  // 2. Format transactional relational payloads
  const tabsPayload = session.tabs.map(tab => ({
    session_id: sessionData.id,
    url: tab.url,
    title: tab.title
  }))

  // 3. Batch insert structural nodes
  const { error: tabsError } = await supabase
    .from('tabs')
    .insert(tabsPayload)

  if (tabsError) throw tabsError
  return sessionData
}

export async function fetchSessions(userId) {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id,
      title,
      created_at,
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