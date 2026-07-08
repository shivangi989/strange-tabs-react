export function fallbackExtractor() {
  const clone = document.body.cloneNode(true)

  const noiseSelectors = [
    'script', 'style', 'nav', 'footer', 'header',
    'aside', 'iframe', 'noscript',
    '[role="navigation"]', '[role="banner"]', '[role="complementary"]',
    '[aria-hidden="true"]'
  ]

  noiseSelectors.forEach(sel => {
    clone.querySelectorAll(sel).forEach(el => el.remove())
  })

  const text = (clone.innerText || clone.textContent || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1500)

  if (!text) return null

  return {
    content: text,
    method: 'fallback',
    title: document.title
  }
}