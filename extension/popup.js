document.getElementById("snip").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    chrome.runtime.sendMessage({
        type: "START_SNIP",
        tabId: tab.id
    });

    window.close(); // Close popup so overlay can be seen
});
