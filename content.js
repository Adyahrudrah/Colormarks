
    chrome.bookmarks.getTree(function(bookmarks) {
     renderBookmarks(bookmarks[0].children)
    });

    function renderBookmarks(bookmarks){
      if (bookmarks !== undefined && bookmarks.length > 0){
        for (const bookmark of bookmarks){
          if (bookmark.children && bookmark.children.length > 0){
            const bookmarksTitleContainer = document.getElementById('bookmarks-title-container');
            const titleBtn = document.createElement('button')
            const title = bookmark.title || '';
            titleBtn.textContent = title;
            bookmarksTitleContainer.appendChild(titleBtn)
            titleBtn.addEventListener('click',  function (){
              const getAllLiItems = document.querySelectorAll('.bookmarks-container li');
              getAllLiItems.forEach((li) =>{
                  bookmarksContainer.removeChild(li)
              });
               renderBookmarksHeadsandLinks(bookmark)
            })
            renderBookmarks(bookmark.children)
          }  
        }
      }
    }

    const bookmarksContainer = document.getElementById('bookmarks-container');
    function renderBookmarksHeadsandLinks(bookmark) {
      if (bookmark.children) {
        for (let i = 0; i < bookmark.children.length; i++) {
          if (bookmark.children[i].url) {
            const li = document.createElement('li');
            const title = bookmark.children[i].title || '';
            li.textContent = title;
            bookmarksContainer.appendChild(li);
          } else {
            renderBookmarksHeadsandLinks(bookmark.children[i]); // Recursively call for subdirectories
          }
        }
      }
    }