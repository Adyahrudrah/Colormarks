chrome.tabs.onCreated.addListener(function(tab) {
    if ((tab.url.trim().toLowerCase() === 'edge://newtab/')){
    chrome.tabs.update(tab.id, { url: chrome.runtime.getURL("bookmarks.html") });
    }
  });