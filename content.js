let lastHoveredUrl = '';

function trackHoveredLink(event) {
    const anchor = event.target.closest('a[href]');
    if (anchor) {
        lastHoveredUrl = anchor.href;
    }
}

document.addEventListener('mouseover', trackHoveredLink, true);
document.addEventListener('contextmenu', trackHoveredLink, true);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getLastHoveredUrl") {
        sendResponse({ url: lastHoveredUrl });
    }
    return true;
});

// Notify that the content script has loaded
// Content script is ready
chrome.runtime.sendMessage({action: 'createContextMenu'}, (response) => {
    if (chrome.runtime.lastError) {
        return;
    }
    console.log(response);  // contextMenuCreated
});
