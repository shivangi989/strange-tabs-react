/* global chrome */

export const chromeService = {
  getAvailableTabs: () => {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.tabs) return resolve([]);
      chrome.tabs.query({ currentWindow: true, pinned: false }, (tabs) => {
        const unmanagedTabs = tabs.filter(t => t.groupId === -1 || !t.groupId);
        resolve(unmanagedTabs);
      });
    });
  },

  // Groups the CURRENT open tabs immediately (used right after Conjure Workspace)
  // Returns the chrome groupId so it can be persisted to Supabase
  groupCurrentTabs: async (tabIds, title, color = 'orange') => {
    if (typeof chrome === "undefined" || !chrome.tabs) return null;

    return new Promise((resolve) => {
      chrome.tabs.group({ tabIds }, (groupId) => {
        chrome.tabGroups.update(groupId, { title, color }, () => resolve(groupId));
      });
    });
  },

  // SMART RESTORATION: Groups existing tabs instead of duplicating them
  // Now also returns the groupId so it can be persisted/updated in Supabase
  restoreWorkspace: async (title, sessionTabs, color = "orange") => {
    if (typeof chrome === "undefined" || !chrome.tabs) return null;

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
  },

  // Fetch live state of a known chrome tab group (used for manual resync 
  // and as a one-time check when the popup opens)
  getGroupLiveState: (chromeGroupId) => {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.tabGroups || !chromeGroupId) {
        return resolve(null);
      }
      chrome.tabGroups.get(chromeGroupId, (group) => {
        if (chrome.runtime.lastError || !group) {
          // Group no longer exists (browser restarted, or group was closed)
          return resolve(null);
        }
        resolve({ title: group.title, color: group.color });
      });
    });
  },

  // ── LIVE SYNC LISTENER ──
  // Call this ONCE when the extension loads (e.g. in App.jsx's first useEffect)
  // Listens for native browser tab group renames/recolors and reports them
  // via the onSyncCallback so App.jsx can push the change to Supabase
  initGroupSyncListener: (onSyncCallback) => {
    if (typeof chrome === "undefined" || !chrome.tabGroups) return () => {};

    const listener = (group) => {
      onSyncCallback({
        chromeGroupId: group.id,
        title: group.title,
        color: group.color
      });
    };

    chrome.tabGroups.onUpdated.addListener(listener);

    // Return a cleanup function so App.jsx can remove the listener on unmount
    return () => chrome.tabGroups.onUpdated.removeListener(listener);
  },

  // Get all currently existing native Chrome tab groups (for "Import Existing Group")
  getExistingTabGroups: async () => {
    if (typeof chrome === "undefined" || !chrome.tabGroups) return [];

    const groups = await new Promise((resolve) => {
      chrome.tabGroups.query({}, resolve);
    });

    const groupsWithTabs = await Promise.all(
      groups.map(async (group) => {
        const tabs = await new Promise((resolve) => {
          chrome.tabs.query({ groupId: group.id }, resolve);
        });
        return {
          chromeGroupId: group.id,
          title: group.title || 'Untitled Group',
          color: group.color,
          tabs: tabs.map(t => ({ url: t.url, title: t.title, id: t.id }))
        };
      })
    );

    return groupsWithTabs;
  }
};