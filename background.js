const MENU_ID = "downloadLastHovered";

function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Download gif",
      contexts: ["link", "image", "page"]
    });
  });
}

chrome.runtime.onInstalled.addListener(createContextMenu);
chrome.runtime.onStartup.addListener(createContextMenu);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "createContextMenu") {
    createContextMenu();
    sendResponse({ status: "contextMenuCreated" });
  }
});

function extractGifUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return null;
  }

  try {
    const parsed = new URL(rawUrl);
    const imgUrl = parsed.searchParams.get("imgurl");

    if (imgUrl && imgUrl.startsWith("http")) {
      return decodeURIComponent(imgUrl);
    }

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return rawUrl;
    }
  } catch (error) {
    console.error("Unable to parse URL:", rawUrl, error);
  }

  return null;
}

function getHoveredLinkFromContentScript(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: "getLastHoveredUrl" }, (response) => {
      if (chrome.runtime.lastError) {
        resolve(null);
        return;
      }

      resolve(response?.url || null);
    });
  });
}

function downloadGif(url) {
  chrome.downloads.download(
    {
      url,
      conflictAction: "uniquify"
    },
    (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error("Download failed:", chrome.runtime.lastError.message);
        return;
      }

      console.log("Download started. ID:", downloadId);
    }
  );
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID) {
    return;
  }

  const directCandidate = extractGifUrl(info.linkUrl) || extractGifUrl(info.srcUrl);
  if (directCandidate) {
    downloadGif(directCandidate);
    return;
  }

  if (!tab?.id) {
    console.log("No active tab available to get fallback URL.");
    return;
  }

  const hoveredLink = await getHoveredLinkFromContentScript(tab.id);
  const fallbackCandidate = extractGifUrl(hoveredLink);

  if (!fallbackCandidate) {
    console.log("No downloadable GIF URL found.");
    return;
  }

  downloadGif(fallbackCandidate);
});
