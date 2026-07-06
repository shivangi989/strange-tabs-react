// src/contentScript.js — now you can import Readability
import { Readability } from '@mozilla/readability'
(function () {
  if (!document.body) return

  const extractText = () => {
    if (
      location.href.startsWith('chrome://') ||
      location.href.startsWith('chrome-extension://') ||
      location.href.startsWith('about:')
    ) return ''

    try {
      const docClone = document.cloneNode(true)
      const reader = new Readability(docClone)
      const article = reader.parse()
      if (article?.textContent?.trim().length > 100) {
        return article.textContent.replace(/\s+/g, ' ').trim().slice(0, 1500)
      }
    } catch (e) {}

    // Semantic fallback
    for (const sel of ['article', 'main', '[role="main"]', '[itemprop="articleBody"]']) {
      const el = document.querySelector(sel)
      if (el?.innerText?.trim().length > 100) {
        return el.innerText.replace(/\s+/g, ' ').trim().slice(0, 1500)
      }
    }

    // Last resort
    const clone = document.body.cloneNode(true)
    ;['script','style','nav','footer','header','aside','iframe','noscript'].forEach(tag => {
      clone.querySelectorAll(tag).forEach(el => el.remove())
    })
    return (clone.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1500)
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type !== 'EXTRACT_CONTENT') return true

    const content = extractText()

    if (content.length < 50) {
      setTimeout(() => {
        sendResponse({ content: extractText(), url: location.href, title: document.title })
      }, 2000)
    } else {
      sendResponse({ content, url: location.href, title: document.title })
    }

    return true
  })
})()