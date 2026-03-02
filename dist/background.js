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

// ─── Sprint 8: Action badge ─────────────────────────────────────
// Sidebar sends SET_BADGE when note count changes.
// We set badge text + gold background on the specific tab.
chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== "SET_BADGE") return;
  const { count, tabId } = message;
  const text = count > 0 ? String(count) : "";
  const setBadge = (opts) => {
    chrome.action.setBadgeBackgroundColor({ color: "#C9A84C", ...opts });
    chrome.action.setBadgeTextColor({ color: "#FFFFFF", ...opts });
    chrome.action.setBadgeText({ text, ...opts });
  };
  if (tabId) {
    setBadge({ tabId });
  } else {
    setBadge({});
  }
});

// ─── Sprint 8: Alt+M keyboard shortcut ─────────────────────────
// Opens the side panel on the active tab when Alt+M is pressed.
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "open-markup") return;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (err) {
    console.error("Markup: failed to open side panel via shortcut", err);
  }
});
