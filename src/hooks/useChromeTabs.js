export default function useChromeTabs() {

const getTabs = () => {

return new Promise(resolve => {

chrome.tabs.query(
{
currentWindow: true,
pinned: false
},
tabs => {

const filtered = tabs.filter(t => t.groupId === -1)
resolve(filtered)

}
)

})

}

const restoreTabs = async (tabs, title) => {

const created = await Promise.all(
tabs.map(t =>
chrome.tabs.create({
url: t.url,
active: false
})
)
)

const ids = created.map(t => t.id)

chrome.tabs.group(
{ tabIds: ids },
groupId => {

chrome.tabGroups.update(groupId, {
title,
color: "blue"
})

}
)

}

return { getTabs, restoreTabs }

}