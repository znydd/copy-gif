let lastHoveredUrl = '';

function setupLinkListeners() {
    var links = document.getElementsByTagName('a');

    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('mouseover', function () {
            lastHoveredUrl = this.href;
            // console.log('Hovered vai link URL:', lastHoveredUrl);
        });
    }
}

// Run the setup when the content script loads
setupLinkListeners();

// // Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getLastHoveredUrl") {
        console.log("from background "+lastHoveredUrl)
        sendResponse({ url: lastHoveredUrl });
    }
});



// Re-run the setup periodically to catch dynamically added links
setInterval(setupLinkListeners, 5000);

// Notify that the content script has loaded
// Content script is ready
chrome.runtime.sendMessage({action: 'createContextMenu'}, (response) => {
    console.log(response);  // contextMenuCreated
});
