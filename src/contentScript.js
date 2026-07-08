import { extractContent } from './extractors/index.js'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'EXTRACT_CONTENT') return true

  const result = extractContent()

  // If content is thin, wait for SPA rendering and retry once
  if (result.content.length < 50 && result.method !== 'blocked') {
    setTimeout(() => {
      sendResponse(extractContent())
    }, 2000)
  } else {
    sendResponse(result)
  }

  return true
})