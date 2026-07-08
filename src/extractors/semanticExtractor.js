export function semanticExtractor() {
  // Try semantic HTML elements first
  const selectors = [
    'article',
    'main',
    '[role="main"]',
    '[itemprop="articleBody"]',
    '.post-content',
    '.article-body',
    '.entry-content'
  ]

  for (const sel of selectors) {
    const el = document.querySelector(sel)
    if (el?.innerText?.trim().length > 100) {
      return {
        content: el.innerText.replace(/\s+/g, ' ').trim().slice(0, 1500),
        method: 'semantic',
        title: document.title
      }
    }
  }

  // Try meta tags — OpenGraph, Twitter, standard description
  const metaSelectors = [
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
    'meta[name="description"]'
  ]

  for (const sel of metaSelectors) {
    const meta = document.querySelector(sel)
    const content = meta?.getAttribute('content')
    if (content?.trim().length > 30) {
      return {
        content: content.trim(),
        method: 'meta',
        title: document.querySelector('meta[property="og:title"]')
               ?.getAttribute('content') || document.title
      }
    }
  }

  return null
}