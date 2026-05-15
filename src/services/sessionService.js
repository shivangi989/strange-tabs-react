import { supabase } from '../lib/supabase'

// CREATE SESSION + TABS
export async function createSession(userId, session) {

  // 1. create session
  const { data: sessionData, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      title: session.title
    })
    .select()
    .single()

  if (sessionError) throw sessionError

  // 2. insert tabs
  const tabsPayload = session.tabs.map(tab => ({
    session_id: sessionData.id,
    url: tab.url,
    title: tab.title
  }))

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
      tabs (
        id,
        url,
        title
      )
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
  // delete old tabs
  await supabase
    .from('tabs')
    .delete()
    .eq('session_id', sessionId)

  // insert new
  const payload = tabs.map(t => ({
    session_id: sessionId,
    url: t.url,
    title: t.title
  }))

  const { error } = await supabase
    .from('tabs')
    .insert(payload)

  if (error) throw error
}