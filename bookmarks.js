


    function renderBookmarks(bookmarks, bgColor){
      if (bookmarks !== undefined && bookmarks.length > 0){
        for (const bookmark of bookmarks){
          if (bookmark.children && bookmark.children.length >= 0){
            const bookmarksTitleContainer = document.getElementById('bookmarks-title-container');
            const titleBtn = document.createElement('button')
            const title = bookmark.title || 'root';
            titleBtn.textContent = title;
            if (titleBtn.textContent === 'root'){
              titleBtn.classList.add('rootBar')
            }

            bookmark.parentId === '0' ? titleBtn.style.order = 1 : 0
            if (bookmark.parentId === '1' || bookmark.parentId === '0') {
              // titleBtn.style.backgroundColor = getRandomAlphaMaterialColor('0.7')
              const dividerLine = document.createElement('div')
              dividerLine.innerHTML = `<svg height="210" width="500">
              <line x1="0" y1="0" x2="350" y2="0" style="stroke:rgba(255,255,255,0.5);stroke-width:0.5" />
            </svg>`
              dividerLine.classList.add('divider-line')
              bookmarksTitleContainer.insertAdjacentElement('beforeend', dividerLine)
            }
            
            titleBtn.style.backgroundColor = bgColor;
            bookmarksTitleContainer.appendChild(titleBtn);

            titleBtn.draggable= 'True';
            titleBtn.addEventListener('dragstart', (event) => {
              event.dataTransfer.setData('text/plain', bookmark.id);
          });

            titleBtn.addEventListener("contextmenu", function(event) {
              event.preventDefault();
              if (bookmark.children.length !== 0){
                titleBtn.contentEditable = 'True';
                titleBtn.focus();
                const range = document.createRange();
                range.selectNodeContents(titleBtn);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
              }
              else{
                const deleteTitle = document.createElement('button');
                deleteTitle.classList.add('delete-title-btn')
                deleteTitle.textContent = 'x'
                titleBtn.insertAdjacentElement('afterend', deleteTitle);
                deleteTitle.style.color = 'rgba(0,0,0,.8)'
                deleteTitle.addEventListener('click', ()=>{
                  const idTobeDeleted = bookmark.id
                  chrome.bookmarks.remove(idTobeDeleted, function() {
                    bookmarksTitleContainer.removeChild(titleBtn);
                    bookmarksTitleContainer.removeChild(deleteTitle);
                });
                });
              }
          
            });
            titleBtn.addEventListener("blur", function(event){
              titleBtn.contentEditable = 'False';
              titleBtn.textContent = title;
            });
            let TitleBtnFlow = true;
            titleBtn.addEventListener('keydown', (e)=>{
              TitleBtnFlow = false;
              titleBtn.style.minWidth = '100px';
              if (e.key === 'Enter'){
                  const bookmarkId = bookmark.id
                  const newTitle = titleBtn.textContent;
                  chrome.bookmarks.update(bookmarkId, { title: newTitle }, function(result) {
                    if (chrome.runtime.lastError) {
                      console.error(chrome.runtime.lastError);
                    } else {
                      console.log('Bookmark renamed successfully:', result);
                      titleBtn.contentEditable = 'False';
                      location.reload()
                    }
                  });
                }
              
            });

            titleBtn.addEventListener('dragover', (event) => {
              event.preventDefault();
            });

            titleBtn.addEventListener('drop', (event) => {
              event.preventDefault();
             
              const bookmarkId = event.dataTransfer.getData('text/plain');
              const parentId = bookmark.id;
              if (bookmarkId !== parentId) {
                chrome.bookmarks.move(bookmarkId, { parentId: parentId }, function () {
              });
              }
            
          });

            titleBtn.addEventListener('click',   () =>{
              if (TitleBtnFlow)
              {
              const bookmarksContainer = document.querySelector('.bookmarks-container');
              const getAllLiItems = document.querySelectorAll('.bookmarks-container li');
              const getAllBtnItems = document.querySelectorAll('.bookmarks-container button');
              bookmarksContainer.scrollTo({ top: 0, behavior: "smooth" });
              getAllLiItems.forEach((li) => {
                if (bookmarksContainer.contains(li)) {
                  bookmarksContainer.removeChild(li);
                }
              });
              
              getAllBtnItems.forEach((btn) => {
                if (bookmarksContainer.contains(btn)) {
                  bookmarksContainer.removeChild(btn);
                }
              });
               renderBookmarksHeadsandLinks(bookmark, bgColor)
          
              }
                })
            let bgColorNew = getRandomAlphaMaterialColor('.6');
            if (bgColorNew !== bgColor) {
              renderBookmarks(bookmark.children, bgColorNew)
            }
            else{
              bgColorNew = getRandomAlphaMaterialColor('.6');
              renderBookmarks(bookmark.children, bgColorNew)
            }
           
          }  
        }
      }
    }

    const bookmarksContainer = document.getElementById('bookmarks-container');
    function renderBookmarksHeadsandLinks(bookmark, bgColor) {
      if (bookmark.children) {
        for (let i = 0; i < bookmark.children.length; i++) {
          if (bookmark.children[i].url) {
            const li = document.createElement('li');
            li.style.backgroundColor = bgColor;
            const link = document.createElement('a');
            const title_raw = bookmark.children[i].title || '';
            const regexValPartOne = /(.*)[|:-](.*)/
            const regexedPartOne =  title_raw.replace(regexValPartOne, "$1")
            const regexedPartTwo =  title_raw.replace(regexValPartOne, "$2")
            link.href = bookmark.children[i].url;

            if (regexedPartTwo !== regexedPartOne){
              link.textContent = regexedPartOne;
              const spanText = document.createElement('span')
              spanText.textContent = ' | '+regexedPartTwo;
              link.appendChild(spanText)
            }

            else {
              link.textContent = title_raw;
            }
            
            link.target = "_blank";
            let testConsole = link.textContent
            testConsole = testConsole.toLowerCase();
            
        
           
            const imgHolder = document.createElement('div');
            imgHolder.classList.add('img-holder')
            li.appendChild(imgHolder)

            li.appendChild(link);
            link.draggable= 'True';
            link.addEventListener('dragstart', (event) => {
              event.dataTransfer.setData('text/plain', bookmark.children[i].id);
          });

          link.addEventListener('dragend', (event) => {
            if (event.dataTransfer.dropEffect !== "none") {
              link.parentElement.style.display = 'none';
          }
        });
          
            const bgImg = localStorage.getItem(link.hostname)
            if (bgImg) {
              imgHolder.style.backgroundImage = `url(${bgImg})`
            }
            else{
              imgHolder.textContent = title_raw[0]
            }
        

            link.addEventListener('click', function (e) {
              e.preventDefault();
              chrome.tabs.create({ url: link.href }, function (newTab) {
                const tabId = newTab.id;
                chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
                  if (changeInfo.status === 'complete') {
                    chrome.tabs.query({ active: true}, function (tabs) {
                      const activeTab = tabs[0];
                      if (activeTab && activeTab.id === tabId &&link.href === activeTab.url) {
                        const faviconUrl = activeTab.favIconUrl ? activeTab.favIconUrl : 'Not available';
                        imgHolder.style.backgroundImage = `url(${faviconUrl})`;
                        imgHolder.style.color = 'transparent';
                        try {
                          localStorage.setItem(link.hostname, faviconUrl);
                        } catch (error) {
                          console.error('Error storing favicon URL in local storage:', error);
                        }
                      }
                      else{
                        imgHolder.textContent = title_raw[0]
                      }
                    });
                  }
                });
              });
            });
            
            const deleteBookmarkBtn = document.createElement('button');
            deleteBookmarkBtn.textContent = "x";
            deleteBookmarkBtn.classList.add('del-btn');
            li.appendChild(deleteBookmarkBtn);
            deleteBookmarkBtn.addEventListener('click', ()=>{
              bookmarksContainer.scrollTo({ top: 0, behavior: "smooth" });
              const idTobeDeleted = bookmark.children[i].id
              li.classList.add('displaced-li');
              const deleteModal = document.createElement('div');
              deleteModal.classList.add('delete-modal')
              const isOK = document.createElement('button');
              isOK.classList.add('ok');
              isOK.textContent = 'Yes';
              const isNo = document.createElement('button');
              isNo.classList.add('No');
              isNo.textContent = 'No';
              const warningText = document.createElement('p');
              warningText.textContent = "Do you wish to remove this bookmark?"
              warningText.classList.add('warning-text');
           
              
              deleteModal.appendChild(warningText);
              deleteModal.appendChild(isOK);
              deleteModal.appendChild(isNo);
              li.appendChild(deleteModal)
              const intervalTimer = setInterval(() => {
                if (li && deleteModal) {
                  li.removeChild(deleteModal);
                if (li.classList.contains('displaced-li')){
                  li.classList.remove('displaced-li');
                }
                 clearInterval(intervalTimer); 
                }
              }, 5000 * 2);        
              isOK.addEventListener('click', ()=>{
                  chrome.bookmarks.remove(idTobeDeleted, function() {
                  bookmarksContainer.removeChild(li);
              });
              });
              isNo.addEventListener('click', ()=>{
              li.classList.remove('displaced-li');
              li.removeChild(deleteModal);
              clearInterval(intervalTimer);
              })
            
            })
           
            if (i === 0){
              const numOfBookmarks = bookmark.children.length
              const titleBtn = document.createElement('button');
              titleBtn.classList.add('dirBtn')
              const title = bookmark.title + ' | ' + numOfBookmarks;
              titleBtn.textContent = title;
              bookmarksContainer.appendChild(titleBtn)
            }
            bookmarksContainer.appendChild(li);
          } 
          
          else {
            renderBookmarksHeadsandLinks(bookmark.children[i], bgColor); // Recursively call for subdirectories
          }
        }
      }
    }

    const materialColors = ['#9c27b0','#673ab7','#3f51b5','#009688','#795548', '#335c67', '#bc4749', '#495057'];


    function getRandomAlphaMaterialColor(alpha) {
      const randomIndex = Math.floor(Math.random() * materialColors.length);
      const color = materialColors[randomIndex];
      const rgbaColor = hexToRgba(color, alpha);
      return rgbaColor;
  }
  
  function hexToRgba(hex, alpha) {
      hex = hex.replace(/^#/, '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }


  const searchBox = document.getElementById('search-box');

  searchBox.addEventListener('input', ()=>{
    const getTitleBtn = document.querySelector('.rootBar');
    getTitleBtn.click();
    const getAllLinkItems = document.querySelectorAll('.bookmarks-container li a');
    const searchText = (searchBox.value).toLowerCase();

    getAllLinkItems.forEach((a) =>{
      const liText = (a.textContent).toLowerCase();

      if (liText.includes(searchText)){
        a.parentElement.style.display = "flex";
      }
      else{
        a.parentElement.style.display = "none";
  
      }
    });
  

  });
  



  chrome.bookmarks.getTree(function(bookmarks) {
    const bgColor = '#1d1f1f';
    renderBookmarks(bookmarks, bgColor)
   });


   chrome.bookmarks.getTree(function(bookmarks) {
    renderSearch(bookmarks)
   });


   const newBookmarkBtn = document.getElementById('new-bookmark');
   newBookmarkBtn.addEventListener('click', ()=> {
    const newItemTitle = searchBox.value;
    if (newItemTitle !== ''){
      
     let newBookmark = {
        parentId:  '1', 
        title: newItemTitle,
      };

      chrome.bookmarks.create(newBookmark, function() {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          newBookmarkBtn.textContent = 'Success';
          newBookmarkBtn.style.backgroundColor = 'rgb(67, 160, 71)'
          newBookmarkBtn.style.color = 'rgba(0,0,0,.8)';
          setTimeout(() => {
            newBookmarkBtn.textContent = '+';
            newBookmarkBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'
            newBookmarkBtn.style.color = 'rgba(255,255,255,.8)';
          }, 1500)
          searchBox.value = '';
          location.reload();
        }
      });

    }
   })

document.addEventListener('contextmenu', (e)=>{
  e.preventDefault();
  
})


function  renderSearch(bookmarks){
  for (const bookmark of bookmarks) {
    console.log(bookmark)
  }
}