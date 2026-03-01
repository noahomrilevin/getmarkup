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
