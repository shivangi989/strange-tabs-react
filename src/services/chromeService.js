/* global chrome */

export const chromeService = {
  // Query all non-pinned, non-grouped tabs safely
  getAvailableTabs: () => {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.tabs) return resolve([]);
      chrome.tabs.query({ currentWindow: true, pinned: false }, (tabs) => {
        const unmanagedTabs = tabs.filter(t => t.groupId === -1 || !t.groupId);
        resolve(unmanagedTabs);
      });
    });
  },

  // SMART RESTORATION: Groups existing tabs instead of duplicating them
restoreWorkspace: async (title, sessionTabs, color = "orange") => {
  if (typeof chrome === "undefined" || !chrome.tabs) return;

  const currentTabs = await new Promise((resolve) => {
    chrome.tabs.query({ currentWindow: true }, resolve);
  });

  const finalTabIds = [];

  for (const sTab of sessionTabs) {
    const existingTab = currentTabs.find(
      t => t.url === sTab.url && (t.groupId === -1 || !t.groupId)
    );

    if (existingTab) {
      finalTabIds.push(existingTab.id);
    } else {
      const newTab = await new Promise((resolve) => {
        chrome.tabs.create({ url: sTab.url, active: false }, resolve);
      });
      finalTabIds.push(newTab.id);
    }
  }

  return new Promise((resolve) => {
    chrome.tabs.group({ tabIds: finalTabIds }, (groupId) => {
      chrome.tabGroups.update(groupId, { title, color }, () => resolve(groupId));
    });
  });
},

  clearWorkspace: (tabIds) => {
    if (typeof chrome === "undefined" || !chrome.tabs) return;
    chrome.tabs.create({ url: "chrome://newtab" }, () => {
      chrome.tabs.remove(tabIds);
    });
  },

  manipulateNativeGroup: async (sessionUrls, action) => {
    return new Promise((resolve) => {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const structuralIds = tabs
          .filter(t => sessionUrls.includes(t.url))
          .map(t => t.id);

        if (!structuralIds.length) return resolve(false);

        if (action === 'ungroup') {
          chrome.tabs.ungroup(structuralIds, () => resolve(true));
        } else if (action === 'close') {
          chrome.tabs.remove(structuralIds, () => resolve(true));
        }
      });
    });
  }
};