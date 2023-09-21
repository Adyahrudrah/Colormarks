
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
            const bgColor = getRandomAlphaMaterialColor('0.4');
            titleBtn.style.backgroundColor = bgColor;
            bookmarksTitleContainer.appendChild(titleBtn)

            titleBtn.addEventListener('dragover', (event) => {
              event.preventDefault();
            });

            titleBtn.addEventListener('drop', (event) => {
              event.preventDefault();
              const bookmarkId = event.dataTransfer.getData('text/plain');
              const parentId = bookmark.id;
              chrome.bookmarks.move(bookmarkId, { parentId: parentId }, function () {
                console.log('Bookmark moved successfully:');
            });
          });

            titleBtn.addEventListener('click',   () =>{
              const bookmarksContainer = document.querySelector('.bookmarks-container');
              const getAllLiItems = document.querySelectorAll('.bookmarks-container li');
              const getAllBtnItems = document.querySelectorAll('.bookmarks-container button');
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
            })
            renderBookmarks(bookmark.children)
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
           
         
            li.appendChild(link);
            link.draggable= 'True';
            link.addEventListener('dragstart', (event) => {
              event.dataTransfer.setData('text/plain', bookmark.children[i].id);
          });
            const deleteBookmarkBtn = document.createElement('button');
            deleteBookmarkBtn.textContent = "x";
            deleteBookmarkBtn.classList.add('del-btn');
            li.appendChild(deleteBookmarkBtn);
            deleteBookmarkBtn.addEventListener('click', ()=>{
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
           
              deleteModal.appendChild(isOK);
              deleteModal.appendChild(isNo);
              deleteModal.appendChild(warningText);
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
              const titleBtn = document.createElement('button');
              const title = bookmark.title || '';
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

    const materialColors = [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', // Primary Colors
      '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', // Primary Colors
      '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722', // Primary Colors
      '#795548', '#9E9E9E', '#607D8B' // Grey Colors
  ];


    function getRandomAlphaMaterialColor(alpha) {
      const randomIndex = Math.floor(Math.random() * materialColors.length);
      const color = materialColors[randomIndex];
      
      // Convert the hexadecimal color to rgba format with the specified alpha value
      const rgbaColor = hexToRgba(color, alpha);
      
      return rgbaColor;
  }
  
  // Function to convert hexadecimal color to rgba format
  function hexToRgba(hex, alpha) {
      hex = hex.replace(/^#/, '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }


  const searchBox = document.getElementById('search-box');
  searchBox.addEventListener('input', ()=>{
 
    const searchText = searchBox.value
    
    const getAllTitleBtns = document.querySelectorAll('.bookmarks-title-container button')
    getAllTitleBtns.forEach((btns) =>{
       if (btns.textContent === 'Favorites bar')
       {
        btns.click();
       }
      const getAllLiItems = document.querySelectorAll('.bookmarks-container li');
      const getAllBtnItems = document.querySelectorAll('.bookmarks-container button'); 
      getAllBtnItems.forEach((btns) =>{
        btns.style.display = 'none'
      })
      getAllLiItems.forEach((li) =>{
        const liText = (li.textContent).toLowerCase();
        if (liText.includes(searchText.toLowerCase())){
          li.style.display = "flex";
          if (li.previousElementSibling.tagName === 'BUTTON'){
            li.previousElementSibling.style.display = "flex";
          }
        }
        else{
          li.style.display = "none";
        }
      });
    })
  })




   