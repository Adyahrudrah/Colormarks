
    const loginBtn = document.getElementById('logBookmarks');
    if (loginBtn){
        loginBtn.addEventListener('click', function () {
            // Send a message to the background script to open the new tab
            chrome.runtime.sendMessage({ openNewTab: true });
        });
    }


// Query and display favIconUrls of open tabs

  