import { Readability } from '@mozilla/readability'

export function readabilityExtractor() {
  try {
    const clone = document.cloneNode(true)
    const reader = new Readability(clone)
    const article = reader.parse()

    if (!article?.textContent?.trim()) return null

    return {
      content: article.textContent.replace(/\s+/g, ' ').trim().slice(0, 1500),
      method: 'readability',
      title: article.title || document.title
    }
  } catch {
    return null
  }
}