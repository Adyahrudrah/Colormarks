document.addEventListener('DOMContentLoaded', ()=>{
    document.getElementById('logBookmarks').addEventListener('click', function () {
        // Open the new tab with the bookmarks.html page.
        chrome.tabs.create({ url: chrome.runtime.getURL('bookmarks.html') });
    });
})
