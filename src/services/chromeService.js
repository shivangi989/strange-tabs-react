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
  restoreWorkspace: async (title, sessionTabs) => {
    if (typeof chrome === "undefined" || !chrome.tabs) return;

    // 1. Get all currently open tabs in the window
    const currentTabs = await new Promise((resolve) => {
      chrome.tabs.query({ currentWindow: true }, resolve);
    });

    const finalTabIds = [];

    // 2. Loop through the session tabs we want to restore
    for (const sTab of sessionTabs) {
      // Check if this URL is already open in an UNGROUPED state
      const existingTab = currentTabs.find(
        t => t.url === sTab.url && (t.groupId === -1 || !t.groupId)
      );

      if (existingTab) {
        // Use the existing tab instead of creating a duplicate
        finalTabIds.push(existingTab.id);
      } else {
        // If it's not open, create a new one
        const newTab = await new Promise((resolve) => {
          chrome.tabs.create({ url: sTab.url, active: false }, resolve);
        });
        finalTabIds.push(newTab.id);
      }
    }

    // 3. Atomically group our clean list of IDs
    return new Promise((resolve) => {
      chrome.tabs.group({ tabIds: finalTabIds }, (groupId) => {
        chrome.tabGroups.update(groupId, { title, color: "orange" }, () => resolve(groupId));
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