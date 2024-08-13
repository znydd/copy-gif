document.addEventListener('DOMContentLoaded', () => {
    
    // Delay to ensure the document is focused
    setTimeout(async () => {
        try {
            // Every comments can be turned into console.log("comment") for debug

            // Ensuring document is focused
            if (!document.hasFocus()) {
                window.focus();
                // Document was not focused, focusing now
            }
            
            // Attempting to read clipboard
            const clipboardText = await navigator.clipboard.readText();
            const statusElement = document.getElementById('status');

            // Ensuring it is a link so starts with 'http'
            if (clipboardText.startsWith('http')) {
                const imgUrlStart = clipboardText.indexOf('imgurl=') + 7; // 7 is the length of 'imgurl='
                const imgRefUrlStart = clipboardText.indexOf('&imgrefurl=');
                
                // If google change the URL format 
                if (imgUrlStart === -1 || imgRefUrlStart === -1) {
                    console.log('URL format not recognized');
                    statusElement.textContent = 'URL format not recognized';
                    return;
                }

                // Decoding the URI basically
                // from this -> https%3A%2F%2Fi.pinimg.com%2Foriginals%2F0c%2F64%2F9a%2F0c649a17ec1e5f5ca340248b4ef4e4be.gif
                // to this -> https://i.pinimg.com/originals/0c/64/9a/0c649a17ec1e5f5ca340248b4ef4e4be.gif

                const download_link = decodeURIComponent(clipboardText.substring(imgUrlStart, imgRefUrlStart));
                statusElement.textContent = 'Captured link: ' + download_link;

                // Sending the URL to the background script to handle the download
                chrome.runtime.sendMessage({ action: 'downloadFile', url: download_link }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message:', chrome.runtime.lastError.message);
                        statusElement.textContent = 'Error: ' + chrome.runtime.lastError.message;
                        return;
                    }

                    statusElement.textContent = response.message;

                    // Close the popup automatically after capturing the link
                    setTimeout(() => {
                        window.close();
                    }, 2000);

                });
            } else {
                console.log('Clipboard does not contain a valid link:', clipboardText);
                statusElement.textContent = 'Clipboard does not contain a valid link.';
            }

        } catch (err) {
            console.error('Failed to read clipboard contents:', err);
            document.getElementById('status').textContent = 'Failed to read clipboard contents.';
        }
    }, 500);  // Adjust delay if not focusing
});
