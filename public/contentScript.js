(function () {
  if (!document.body) return;

  const extractText = () => {
    const clone = document.body.cloneNode(true);
    ['script','style','nav','footer','header','aside'].forEach(tag => {
      clone.querySelectorAll(tag).forEach(el => el.remove());
    });
    return (clone.innerText || clone.textContent || '')
      .replace(/\s+/g, ' ').trim().slice(0, 1000);
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXTRACT_CONTENT') {
      sendResponse({ 
        content: extractText(),
        url: window.location.href,
        title: document.title
      });
    }
    return true;
  });
})();