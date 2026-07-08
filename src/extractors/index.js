import { readabilityExtractor } from './readabilityExtractor'
import { semanticExtractor } from './semanticExtractor'
import { fallbackExtractor } from './fallbackExtractor'

const BLOCKED_PROTOCOLS = [
  'chrome://', 'chrome-extension://', 'about:', 'edge://', 'moz-extension://'
]

export function extractContent() {
  const url = location.href

  if (BLOCKED_PROTOCOLS.some(p => url.startsWith(p))) {
    return { content: '', method: 'blocked', title: document.title }
  }

  const result = readabilityExtractor()
    ?? semanticExtractor()
    ?? fallbackExtractor()
    ?? { content: '', method: 'failed', title: document.title }

  return {
    ...result,
    url,
    hostname: location.hostname,
    wordCount: result.content.split(/\s+/).filter(Boolean).length
  }
}