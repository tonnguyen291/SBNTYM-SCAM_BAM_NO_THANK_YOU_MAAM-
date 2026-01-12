// Background service worker

// Handle messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "START_SNIP") {
        // Popup asked to start snipping
        handleStartSnip(msg.tabId);
    } else if (msg.type === "PROCESS_CROP") {
        // Content script sent crop coordinates
        handleProcessCrop(sender.tab.id, msg.area, msg.pageUrl);
    } else if (msg.type === "CAPTURE_AND_SCAN") {
        // Retro-compatibility (if we kept the button? but we are replacing it)
        // We can ignore or handle if needed.
    }
});

async function handleStartSnip(tabId) {
    // Send message to content script in the tab
    try {
        await chrome.tabs.sendMessage(tabId, { type: "START_SNIP" });
    } catch (e) {
        console.error("Failed to send message to tab", e);
    }
}

async function handleProcessCrop(tabId, area, pageUrl) {
    try {
        // 1. Capture visible tab
        // We need windowId. We can get it from the tab.
        const tab = await chrome.tabs.get(tabId);
        if (!tab) return;

        const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });

        // 2. Crop
        const croppedDataUrl = await cropImage(dataUrl, area);

        // 3. Send to backend
        const endpoint = "http://127.0.0.1:8787/scan";
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                page_url: pageUrl,
                screenshot_data_url: croppedDataUrl, // Send snipped image
                user_area: area
            })
        });

        if (!res.ok) throw new Error("Backend error " + res.status);

        const json = await res.json();

        // 4. Send results back to tab
        await chrome.tabs.sendMessage(tabId, {
            type: "SCAN_RESULT",
            data: json
        });

    } catch (error) {
        console.error("Error processing crop:", error);
        await chrome.tabs.sendMessage(tabId, {
            type: "SCAN_ERROR",
            error: "Backend not reachable. Is 'npm start' running?\nDetails: " + error.message
        });
    }
}

async function cropImage(dataUrl, area) {
    // Create an offscreen canvas
    // Needs 'offscreen' permission? No, OffscreenCanvas is available in SW in generic context?
    // Actually in Chrome Extensions MV3 service workers have OffscreenCanvas.

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    const { x, y, width, height, devicePixelRatio } = area;

    // Adjust for DPR if the screenshot is high res but coordinates are CSS pixels
    // captureVisibleTab returns the actual image pixels (which depends on screen DPI).
    // The coordinates from content script are CSS pixels.
    // Usually captureVisibleTab size == window.innerWidth * devicePixelRatio.

    const scale = devicePixelRatio || 1;
    const sx = x * scale;
    const sy = y * scale;
    const sWidth = width * scale;
    const sHeight = height * scale;

    const canvas = new OffscreenCanvas(sWidth, sHeight);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bitmap, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

    const blobResult = await canvas.convertToBlob({ type: "image/png" });
    const reader = new FileReader();
    return new Promise(resolve => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blobResult);
    });
}
