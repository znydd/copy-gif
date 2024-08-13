chrome.runtime.onMessage.addListener((message, sendResponse) => {

    if (message.action === 'downloadFile' && message.url) {
        // Using chorme downloads api
        chrome.downloads.download({
            url: message.url,
            // Optional parameters can 
            // filename: 'downloaded_file.gif', // Specify a filename
            conflictAction: 'uniquify' // Handle filename conflicts
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                sendResponse({ message: 'Download failed: ' + chrome.runtime.lastError.message });
            } else {
                sendResponse({ message: 'Download started. ID: ' + downloadId });
            }
        });
        return true; // Indicates that the response will be sent asynchronously
    }
});
