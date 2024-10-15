
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'createContextMenu') {
        console.log("content.js loaded")
        chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "downloadLastHovered",
            title: "Download gif",
            contexts: ["all"]
          });
        sendResponse({status: 'contextMenuCreated'});
        });
    }
    return true;
});




  // Listen for clicks on our context menu item
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "downloadLastHovered") {
      chrome.tabs.sendMessage(tab.id, {action: "getLastHoveredUrl"}, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else if (response && response.url) {
          console.log(response)
          let link = response.url
          console.log(link)

          if (link.startsWith('http')) {
            const imgUrlStart = link.indexOf('imgurl=') + 7; // 7 is the length of 'imgurl='
            const imgRefUrlStart = link.indexOf('&imgrefurl=');

            // If google change the URL format 
            if (imgUrlStart === -1 || imgRefUrlStart === -1) {

                console.log('URL format not recognized');
                return false;
            }

            // Decoding the URI basically
            // from this -> https%3A%2F%2Fi.pinimg.com%2Foriginals%2F0c%2F64%2F9a%2F0c649a17ec1e5f5ca340248b4ef4e4be.gif
            // to this -> https://i.pinimg.com/originals/0c/64/9a/0c649a17ec1e5f5ca340248b4ef4e4be.gif

            const download_link = decodeURIComponent(link.substring(imgUrlStart, imgRefUrlStart));
            console.log(download_link)

            chrome.downloads.download({
                url: download_link,
                // Optional parameters can 
                // filename: 'downloaded_file.gif', // Specify a filename
                conflictAction: 'uniquify' // Handle filename conflicts
            }, (downloadId) => {
                if (chrome.runtime.lastError) {
                    console.error({ message: 'Download failed: ' + chrome.runtime.lastError.message });
           

                } else {
                    // Notify popup.js that download started successfully
    
                    console.log({ message: 'Download started. ID: ' + downloadId });
                }
            });


        } else {
          console.log("No URL to download");
        }
      }});
    }
  });
