chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.openNewTab) {
        // Open the new tab with the bookmarks.html page.
        chrome.tabs.create({ url: chrome.runtime.getURL('bookmarks.html') });
    }
});
