// Markup — Background Service Worker

console.log("Markup loaded");

// Register the side panel for all tabs
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Markup: sidePanel.setPanelBehavior failed", error));

// Set the side panel path (satisfies the sidePanel.setOptions AC)
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({
    path: "sidebar/sidebar.html",
    enabled: true,
  });
  console.log("Markup: side panel registered");
});

// Fix 1: When the active tab navigates to a new URL, silently notify the sidebar
// so it refreshes to show the new page's notes. Notes are always safe — no overlay.
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!changeInfo.url) return;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id !== tabId) return; // only care about the visible tab
    chrome.runtime.sendMessage({ type: "TAB_URL_CHANGED", tabId })
      .catch(() => { /* sidebar not open */ });
  });
});
