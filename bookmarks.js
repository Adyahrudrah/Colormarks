let MOST_VISITED_COUNT = JSON.parse(localStorage.getItem("mostVisitedCounter"));

if (!MOST_VISITED_COUNT || MOST_VISITED_COUNT.length < 0) {
  MOST_VISITED_COUNT = [];
}
let prevBtnColor;
function renderBookmarks(bookmarks, bgColor) {
  if (bookmarks !== undefined && bookmarks.length > 0) {
    for (const bookmark of bookmarks) {
      if (bookmark.children && bookmark.children.length >= 0) {
        const bookmarksTitleContainer = document.getElementById(
          "bookmarks-title-container"
        );
        const titleBtn = document.createElement("button");
        titleBtn.classList.add('titleBtn')
        const title = bookmark.title || "root";
        titleBtn.textContent = title;
        if (titleBtn.textContent === "root") {
          titleBtn.classList.add("rootBar");
        }
        if (bookmark.parentId === "0") {
          titleBtn.style.order = 1;
          createDividerLine();
        }

        function createDividerLine() {
          const dividerLine = document.createElement("div");
          dividerLine.innerHTML = `<svg height="210" width="500">
            <line x1="0" y1="0" x2="350" y2="0" style="stroke:rgba(255,255,255,0.5);stroke-width:0.5" />
          </svg>`;
          dividerLine.classList.add("divider-line");
          bookmarksTitleContainer.insertAdjacentElement(
            "beforeend",
            dividerLine
          );
        }
        let titleBtnBgColor;
        if (bookmark.parentId === "1") {
          createDividerLine();

          do {
            titleBtnBgColor = getRandomAlphaMaterialColor("0.5");
          } while (titleBtnBgColor === prevBtnColor);
        }

        if (titleBtnBgColor !== undefined) {
          prevBtnColor = titleBtnBgColor;
        }
        titleBtn.style.borderColor = prevBtnColor;
        titleBtn.style.color = prevBtnColor
        bookmarksTitleContainer.appendChild(titleBtn);

        titleBtn.draggable = "True";
        titleBtn.addEventListener("dragstart", (event) => {
          event.dataTransfer.setData("text/plain", bookmark.id);
        });

        titleBtn.addEventListener("contextmenu", function (event) {
          event.preventDefault();

          if (bookmark.children.length !== 0) {
            titleBtn.contentEditable = "True";
            titleBtn.focus();
            const range = document.createRange();
            range.selectNodeContents(titleBtn);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            const deleteTitle = document.createElement("button");
            deleteTitle.classList.add("delete-title-btn");
            deleteTitle.textContent = "x";
            titleBtn.insertAdjacentElement("afterend", deleteTitle);
            deleteTitle.style.backgroundColor = "tomato";

            deleteTitle.addEventListener("click", () => {
              const idTobeDeleted = bookmark.id;
              chrome.bookmarks.remove(idTobeDeleted, function () {
                bookmarksTitleContainer.removeChild(titleBtn);
                bookmarksTitleContainer.removeChild(deleteTitle);
              });
            });
          }
        });

        titleBtn.addEventListener("blur", function (event) {
          titleBtn.contentEditable = "False";
          titleBtn.textContent = title;
        });
        let TitleBtnFlow = true;
        titleBtn.addEventListener("keydown", (e) => {
          TitleBtnFlow = false;
          titleBtn.style.minWidth = "100px";
          if (e.key === "Enter") {
            const bookmarkId = bookmark.id;
            const newTitle = titleBtn.textContent;
            chrome.bookmarks.update(
              bookmarkId,
              { title: newTitle },
              function (result) {
                if (chrome.runtime.lastError) {
                  console.error(chrome.runtime.lastError);
                } else {
                  console.log("Bookmark renamed successfully:", result);
                  titleBtn.contentEditable = "False";
                  location.reload();
                }
              }
            );
          }
        });

        titleBtn.addEventListener("dragover", (event) => {
          event.preventDefault();
        });

        titleBtn.addEventListener("drop", (event) => {
          event.preventDefault();

          const bookmarkId = event.dataTransfer.getData("text/plain");
          const parentId = bookmark.id;
          if (bookmarkId !== parentId) {
            chrome.bookmarks.move(
              bookmarkId,
              { parentId: parentId },
              function () {}
            );
          }
        });

        titleBtn.addEventListener("click", () => {
          if (TitleBtnFlow) {
            clearExistingContents();
            renderBookmarksHeadsandLinks(bookmark, bgColor);
            bookmarksContainer.scrollTop = 0;
          }
        });
        let bgColorNew = getRandomAlphaMaterialColor("0.5");
        if (bgColorNew !== bgColor) {
          renderBookmarks(bookmark.children, bgColorNew);
        } else {
          bgColorNew = getRandomAlphaMaterialColor("0.5");
          renderBookmarks(bookmark.children, bgColorNew);
        }
      }
    }
  }
}

function clearExistingContents() {
  const bookmarksContainer = document.querySelector(".bookmarks-container");
  while (bookmarksContainer.firstChild) {
    bookmarksContainer.removeChild(bookmarksContainer.firstChild);
  }
}

const bookmarksContainer = document.getElementById("bookmarks-container");
function renderBookmarksHeadsandLinks(bookmark) {
  if (bookmark.children) {
    for (let i = 0; i < bookmark.children.length; i++) {
      if (bookmark.children[i].url || bookmark.url) {
        if (i === 0) {
          const numOfBookmarks = bookmark.children.length;
          const titleBtn = document.createElement("button");
          titleBtn.classList.add("dirBtn");
          const title = bookmark.title + " | " + numOfBookmarks;
          titleBtn.textContent = title;
          bookmarksContainer.appendChild(titleBtn);
        }
        createElements(bookmark.children[i], (removeBtns = false));
      } else {
        renderBookmarksHeadsandLinks(bookmark.children[i]); // Recursively call for subdirectories
      }
    }
  }
}

function createElements(bookmarkChildren, removeBtns = false) {
  const li = document.createElement("li");
  const link = document.createElement("a");
  const title_raw = bookmarkChildren.title || "";
  const regexValPartOne = /([^-/|:]+)[-/|:](.+)/;
  const regexedPartOne = title_raw.replace(regexValPartOne, (match, p1) => p1.charAt(0).toUpperCase() + p1.slice(1));
  const regexedPartTwo = title_raw.replace(regexValPartOne, "$2").replace(/https:.+/g, '').split(/[:]/).map(phrase => phrase).join(' ');
  link.href = bookmarkChildren.url;

  if (regexedPartTwo !== regexedPartOne) {
    link.textContent = regexedPartOne + " | " ;
    const spanText = document.createElement("span");
    spanText.textContent = regexedPartTwo;
    link.appendChild(spanText);
  } else {
    link.textContent = title_raw;
  }

  link.target = "_blank";
  let testConsole = link.textContent;
  testConsole = testConsole.toLowerCase();

  const imgHolder = document.createElement("div");
  imgHolder.classList.add("img-holder");
  li.appendChild(imgHolder);

  li.appendChild(link);

  link.draggable = "True";
  link.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", bookmarkChildren.id);
  });

  link.addEventListener("dragend", (event) => {
    if (event.dataTransfer.dropEffect !== "none") {
      link.parentElement.style.display = "none";
    }
  });

  const bgImg = localStorage.getItem(link.hostname);
  if (bgImg) {
    imgHolder.style.backgroundImage = `url(${bgImg})`;
  } else {
    typeof title_raw[0] === "string"
      ? (imgHolder.textContent = title_raw[0].toUpperCase())
      : title_raw[0];
  }
  let toggleBgImg = false;
  imgHolder.addEventListener("click", () => {
    toggleBgImg = !toggleBgImg;
    const bgImg = localStorage.getItem(link.hostname);
    if (toggleBgImg === true && bgImg) {
      imgHolder.style.backgroundImage = `url(${bgImg})`;
      imgHolder.textContent = "";
    } else {
      typeof title_raw[0] === "string"
        ? (imgHolder.textContent = title_raw[0].toUpperCase())
        : title_raw[0];
      imgHolder.style.backgroundImage = "none";
      localStorage.removeItem(link.hostname);
    }
  });

  let counter = 1;
  link.addEventListener("click", handlebookmark);

  function handlebookmark(e){
      if (MOST_VISITED_COUNT && MOST_VISITED_COUNT.length > 0) {
        const existingEntry = MOST_VISITED_COUNT.find(
          (countDetails) => link.href === countDetails.site
        );
  
        if (existingEntry) {
          existingEntry.counter += 1;
        } else {
          MOST_VISITED_COUNT.push({
            site: link.href,
            counter: 1,
            bookmark: bookmarkChildren,
          });
        }
  
        localStorage.setItem(
          "mostVisitedCounter",
          JSON.stringify(MOST_VISITED_COUNT)
        );
      } else {
        MOST_VISITED_COUNT.push({
          site: link.href,
          counter: counter,
          bookmark: bookmarkChildren,
        });
        localStorage.setItem(
          "mostVisitedCounter",
          JSON.stringify(MOST_VISITED_COUNT)
        );
      }
      e.preventDefault();
  
      chrome.tabs.create({ url: link.href }, function (newTab) {
        const bgImg = localStorage.getItem(link.hostname);
        if (bgImg) {
          return;
        } else {
          chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
            if (changeInfo.status === "complete") {
              chrome.tabs.query({ active: true }, function (tabs) {
                const activeTab = tabs[0];
                console.log(activeTab)
                if (
                  activeTab &&
                  activeTab.id === tabId &&
                  link.href === activeTab.url
                ) {
                  const faviconUrl = activeTab.favIconUrl
                    ? activeTab.favIconUrl
                    : null
                    fetch(faviconUrl)
                    .then(response => {
                      if (response.ok) {
                        console.log(response)
                      }
                    });
                    if (faviconUrl){
                      imgHolder.style.backgroundImage = `url(${faviconUrl})`;
                      imgHolder.style.color = "transparent";
                      try {
                        localStorage.setItem(link.hostname, faviconUrl);
                      } catch (error) {
                        console.error(
                          "Error storing favicon URL in local storage:",
                          error
                        );
                      }
                    }
                } else {
                  typeof title_raw[0] === "string"
                    ? (imgHolder.textContent = title_raw[0].toUpperCase())
                    : title_raw[0];
                }
              });
            }
          });
        }
      });
    }

  if (!removeBtns) {
    const deleteBookmarkBtn = document.createElement("button");
    deleteBookmarkBtn.textContent = "x";
    deleteBookmarkBtn.classList.add("del-btn");
    li.appendChild(deleteBookmarkBtn);
    deleteBookmarkBtn.addEventListener("click", () => {
      const idTobeDeleted = bookmarkChildren.id;
      li.classList.add("displaced-li");
      const deleteModal = document.createElement("div");
      deleteModal.classList.add("delete-modal");
      const isOK = document.createElement("button");
      isOK.classList.add("ok");
      isOK.textContent = "Yes";
      const isNo = document.createElement("button");
      isNo.classList.add("No");
      isNo.textContent = "No";
      const warningText = document.createElement("p");
      warningText.textContent = "Do you wish to remove this bookmark?";
      warningText.classList.add("warning-text");

      deleteModal.appendChild(warningText);
      deleteModal.appendChild(isOK);
      deleteModal.appendChild(isNo);
      li.appendChild(deleteModal);
      const intervalTimer = setInterval(() => {
        if (li && deleteModal) {
          li.removeChild(deleteModal);
          if (li.classList.contains("displaced-li")) {
            li.classList.remove("displaced-li");
          }
          clearInterval(intervalTimer);
        }
      }, 5000 * 2);
      isOK.addEventListener("click", () => {
        chrome.bookmarks.remove(idTobeDeleted, function () {
          bookmarksContainer.removeChild(li);
        });
      });
      isNo.addEventListener("click", () => {
        li.classList.remove("displaced-li");
        li.removeChild(deleteModal);
        clearInterval(intervalTimer);
      });
    });
  }

  bookmarksContainer.appendChild(li);
}

const materialColors = [
  "#f44336",
  "#e91e63",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffc107",
  "#ff9800",
  "#ff5722",
  "#FF6969",
];

function getRandomAlphaMaterialColor(alpha) {
  const randomIndex = Math.floor(Math.random() * materialColors.length);
  const color = materialColors[randomIndex];
  const rgbaColor = hexToRgba(color, alpha);
  return rgbaColor;
}

function hexToRgba(hex, alpha) {
  hex = hex.replace(/^#/, "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const newBookmarkBtn = document.getElementById("new-bookmark");
newBookmarkBtn.addEventListener("click", () => {
  const newItemTitle = searchBox.value;
  if (newItemTitle !== "") {
    let newBookmark = {
      parentId: "1",
      title: newItemTitle,
    };

    chrome.bookmarks.create(newBookmark, function () {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        newBookmarkBtn.textContent = "Success";
        newBookmarkBtn.style.backgroundColor = "rgb(67, 160, 71)";
        newBookmarkBtn.style.color = "rgba(255,255,255,.8)";
        setTimeout(() => {
          newBookmarkBtn.textContent = "+";
          newBookmarkBtn.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
          newBookmarkBtn.style.color = "rgba(255,255,255,.8)";
        }, 2500);
        searchBox.value = "";
        location.reload();
      }
    });
  } else {
    searchBox.placeholder = "Create a folder..";
    setTimeout(() => {
      searchBox.placeholder = "search | new_folder";
    }, 2000);
  }
});

// document.addEventListener("contextmenu", (e) => {
//   e.preventDefault();
// });

const mostVisited = document.getElementById("most-visited");
mostVisited.addEventListener("click", () => {
  clearExistingContents();
  let isClearHistoryBtnAdded = false;
  if (MOST_VISITED_COUNT.length > 0) {
    for (const countDetails of MOST_VISITED_COUNT) {
      if (countDetails.bookmark) {
        if (countDetails.counter > 2) {
          const clearBtn = document.createElement("button");
          clearBtn.textContent = "Clear History";
          clearBtn.classList.add("clear-mv-btn");
          clearBtn.addEventListener("click", () => {
            clearBtn.textContent = "Cleared";
            localStorage.removeItem("mostVisitedCounter");
            setTimeout(() => {
              clearExistingContents();
              location.reload();
            }, 1000);
          });
          if (isClearHistoryBtnAdded === false) {
            isClearHistoryBtnAdded = true;
            bookmarksContainer.appendChild(clearBtn);
          }
          createElements(
            countDetails.bookmark,
            getRandomAlphaMaterialColor("0.5"),
            (removeBtns = false)
          );
        }
      }
    }
  } else {
    createZeroDiv("You are not visiting anything often!");
  }
});

function createZeroDiv(comment) {
  const bookmarksContainer = document.querySelector(".bookmarks-container");
  const emptyDiv = document.createElement("div");
  emptyDiv.classList.add("empty-div");
  emptyDiv.textContent = comment;
  bookmarksContainer.appendChild(emptyDiv);
}

let bookmarksIndex = [];
function renderSearch(bookmarks) {
  for (const bookmark of bookmarks) {
    bookmarksIndex.push(bookmark);
    if (bookmark.children) {
      renderSearch(bookmark.children);
    }
  }
}

const searchBox = document.getElementById("search-box");
searchBox.addEventListener("input", () => {
  if (searchBox.value === "") {
    clearExistingContents();
    newBookmarkBtn.style.transform = "translateY(-250%)";
  } else {
    newBookmarkBtn.style.transform = "translateY(0%)";
    const searchText = searchBox.value.toLowerCase(); // Replace with the text you want to search for
    const regex = new RegExp(searchText, "i"); // 'i' flag for case-insensitive search
    const matchingTitleEntries = bookmarksIndex.filter((bookmarkDetails) => {
      return (
        regex.test(bookmarkDetails.title && bookmarkDetails.title !== "") ||
        regex.test(bookmarkDetails.url)
      );
    });

    clearExistingContents();
    for (const bookmark of matchingTitleEntries) {
      const bgColor = getRandomAlphaMaterialColor("0.5");
      createElements(bookmark, bgColor, (removeBtns = false));
    }

    if (matchingTitleEntries.length === 0) {
      createZeroDiv("No results");
    }
  }
});

chrome.bookmarks.getTree(function (bookmarks) {
  const bgColor = "#1d1f1f";
  renderBookmarks(bookmarks, bgColor);
  renderSearch(bookmarks);
});

chrome.history.search({ text: "", maxResults: 50 }, (historyItems) => {
  const recentHistory = document.createElement("button");
  recentHistory.textContent = "History | (Read-Only)";
  bookmarksContainer.appendChild(recentHistory);
  const sortedHistoryItems = historyItems.sort(
    (a, b) => b.visitCount - a.visitCount
  );
  for (const history of sortedHistoryItems) {
    createElements(history, (removeBtns = true));
  }
});
