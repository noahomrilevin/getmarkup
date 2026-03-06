// Markup — Sidebar Script — Sprint 8

console.log("Markup: sidebar ready");

// ─── Type config ───────────────────────────────────────────────
const TYPE_CONFIG = {
  bug:     { label: "Bug" },
  design:  { label: "Design" },
  copy:    { label: "Copy" },
  question:{ label: "?" },
  general: { label: "General" },
};

const TYPE_BRIEF = {
  bug:      { emoji: "🐛", label: "Bug",      field: "Issue" },
  design:   { emoji: "🎨", label: "Design",   field: "Issue" },
  copy:     { emoji: "✏️",  label: "Copy",     field: "Issue" },
  question: { emoji: "❓", label: "Question", field: "Question" },
  general:  { emoji: "📝", label: "General",  field: "Note" },
};

const TYPE_ORDER = ["bug", "design", "copy", "question", "general"];

// ─── Severity config ───────────────────────────────────────────
const SEVERITY_CONFIG = {
  critical: { label: "Critical", emoji: "🔴" },
  high:     { label: "High",     emoji: "🟠" },
  medium:   { label: "Medium",   emoji: "🟡" },
  low:      { label: "Low",      emoji: "⚪" },
};

const SEVERITY_ORDER = ["critical", "high", "medium", "low"];

// ─── Storage quota constants (Sprint 8 F4) ─────────────────────
const QUOTA_WARN_BYTES  = Math.round((chrome.storage.local.QUOTA_BYTES || 10 * 1024 * 1024) * 0.8);

// ─── Brief title ───────────────────────────────────────────────
function getBriefTitle() {
  return sessionTitle ? `Markup — ${sessionTitle}` : "Markup brief";
}

// ─── Brief archive constants ────────────────────────────────────
const BRIEFS_MAX  = 20;

function getBriefsKey() {
  try { return `markup_briefs_${new URL(currentNoteUrl).hostname}`; } catch { return "markup_briefs_unknown"; }
}

// ─── Sprint 9: Developer Mode storage key ──────────────────────
const DEV_MODE_KEY = "markup_dev_mode";

// ─── Sprint 10: Onboarding card storage key ─────────────────────
const ONBOARDING_KEY = "markup_onboarding_dismissed";

// ─── State ─────────────────────────────────────────────────────
let currentSelector       = null;
let currentElementLabel   = null; // Sprint 8 F5: human-readable label
let currentNoteId         = null;
let notes                 = [];
let allNotes              = []; // Pass 5: all notes across all URLs
let currentTabId          = null;
let currentWindowId       = null;
let currentTabUrl         = "";
let currentNoteUrl        = "";
let tabTitle              = "";
let sessionTitle          = "";
let markupActive          = false;
let isEditing             = false;
let editPrevSelector      = null;
let markupEverActivated   = false;
const undoStack           = [];
const redoStack           = [];
let toastTimeout          = null;
let activeFilter          = "all";
let ignoreNextDeselect    = false;
let pendingElementSelector = null;
let pendingElementLabel    = null; // Pass 12: label paired with pendingElementSelector
let pendingParentContext   = null; // Sprint 11 Pass 8
let pendingElementRole     = null; // Sprint 11 Pass 8
let currentParentContext   = null; // Sprint 11 Pass 8: parent element label
let currentElementRole     = null; // Sprint 11 Pass 8: computed semantic role
let briefSortMode         = "severity"; // "severity" | "chronological" — persisted
let briefReaderCurrentBrief = null; // brief object open in reader
let editingNoteUrl        = null; // Pass 7: URL of note being edited (may differ from currentNoteUrl)
let briefDomainGroups     = []; // Pass 8: domain-wide note groups collected at brief-generation time
let currentBriefText        = "";   // raw markdown for copy/download
let timestampInterval     = null; // Sprint 8 F7: interval for updating relative times
let devMode               = false; // Sprint 9: Developer Mode (false = Simple Mode)
let iframeNoticeDismissed = false; // Sprint 9: show iframe notice only once

// ─── Sprint 11 Pass 10: Image paste state ──────────────────────
let locationHoverPreview  = false; // true when location value is a hover preview, not confirmed
let imageDirHandle        = null;  // FileSystemDirectoryHandle (IndexedDB)
let currentImagePath      = null;  // filename for image on current note
let currentImageThumbnail = null;  // base64 JPEG data URL for display
let pendingImageBuffer    = null;  // ArrayBuffer held when no folder set yet
let pendingImageFilename  = null;  // filename paired with pendingImageBuffer

// ─── DOM refs ──────────────────────────────────────────────────
const toggleBtn          = document.getElementById("markup-toggle");
const activationHint     = document.getElementById("activation-hint");
const noteCountEl        = document.getElementById("note-count");
const notesList          = document.getElementById("notes-list");
const emptyState         = document.getElementById("empty-state");
const selectorDisplay    = document.getElementById("selector-display");
const selectorRow        = document.querySelector(".selector-row");
const clearSelectorBtn   = document.getElementById("clear-selector");
const noteInput          = document.getElementById("note-input");
const generateBtn        = document.getElementById("generate-brief");
const saveBtn            = document.getElementById("save-note");
const toastEl            = document.getElementById("toast");
const typeButtons        = document.querySelectorAll(".type-btn");
const severityButtons    = document.querySelectorAll(".severity-btn");
const filterTabEls       = document.querySelectorAll(".filter-tab");
const briefPanel         = document.getElementById("brief-output");
const briefContent       = document.getElementById("brief-content");
const briefGenerating    = document.getElementById("brief-generating");
const copyBriefBtn       = document.getElementById("copyBriefBtn");
const downloadZipBtn     = document.getElementById("downloadZipBtn");
const downloadHtmlBtn    = document.getElementById("downloadHtmlBtn");
const closeBriefBtn      = document.getElementById("close-brief");
const briefsArchiveBtn   = document.getElementById("briefs-archive-btn");
const briefsArchivePanelEl = document.getElementById("briefs-archive-panel");
const briefsArchiveList  = document.getElementById("briefs-archive-list");
const briefsArchiveCountEl = document.getElementById("briefs-archive-count");
const closeBriefArchiveBtn = document.getElementById("close-briefs-archive");
const briefReaderPanelEl = document.getElementById("brief-reader-panel");
const briefReaderContent = document.getElementById("brief-reader-content");
const briefReaderNameEl  = document.getElementById("brief-reader-name");
const closeBriefReaderBtn = document.getElementById("close-brief-reader");
const copyBriefReaderBtn = document.getElementById("copy-brief-reader");
const downloadBriefReaderBtn = document.getElementById("download-brief-reader");
const formArea           = document.querySelector(".markup-form-area");
const clearAllBtn        = document.getElementById("clear-all");
const clearConfirmEl     = document.getElementById("clear-confirm");
const clearConfirmMsgEl  = document.getElementById("clear-confirm-msg");
const clearConfirmYesBtn = document.getElementById("clear-confirm-yes");
const clearConfirmNoBtn  = document.getElementById("clear-confirm-no");
const sessionTitleInput  = document.getElementById("session-title");
const sessionTitleWrap   = document.getElementById("session-title-wrap");
const filterTabsEl       = document.getElementById("filter-tabs");
const notePendingPrompt  = document.getElementById("note-pending-prompt");
const notePendingSaveBtn = document.getElementById("note-pending-save");
const notePendingDiscardBtn = document.getElementById("note-pending-discard");
const viewingUrlText     = document.getElementById("viewing-url-text");
const storageQuotaWarning = document.getElementById("storage-quota-warning");
const markupActionsEl    = document.getElementById("markup-actions");
const toggleSectionEl    = document.getElementById("markup-toggle-section");
const settingsBtn        = document.getElementById("settings-btn");
const settingsPanel      = document.getElementById("settings-panel");
const closeSettingsBtn   = document.getElementById("close-settings");
const storageUsageText   = document.getElementById("storage-usage-text");
const storageUsageFill   = document.getElementById("storage-usage-fill");
const settingsClearAllBtn = document.getElementById("settings-clear-all");
const settingsVersionEl  = document.getElementById("settings-version");
const settingsFooterStorageEl = document.getElementById("settings-footer-storage");
const exportJsonBtn      = document.getElementById("export-json");
const exportCsvBtn       = document.getElementById("export-csv");
const briefSortBtns      = document.querySelectorAll(".brief-sort-btn");
const briefSortToggleEl  = document.getElementById("brief-sort-toggle");
const imgLightbox        = document.getElementById("img-lightbox");
const imgLightboxImg     = document.getElementById("img-lightbox-img");
const imgLightboxClose   = document.getElementById("img-lightbox-close");
const briefSortDescEl    = document.getElementById("brief-sort-desc");
const saveHintEl         = document.querySelector(".save-hint");
// Sprint 9 new DOM refs
const devBadgeEl         = document.getElementById("dev-badge");
const devModeToggle      = document.getElementById("dev-mode-toggle");
const iframeNoticeEl     = document.getElementById("iframe-notice");
const reloadBtn          = document.getElementById("reload-btn");
const noteTypesRow       = document.querySelector(".note-form__types");
const noteSeveritiesRow  = document.querySelector(".note-form__severities");
const escSelectHintEl    = document.getElementById("esc-select-hint");
// Sprint 11 Pass 5: Simple Mode location field
const locationInput      = document.getElementById("note-location");
const locationRow        = document.getElementById("note-location-row");
// Hide at startup — applyDevMode() will set correct visibility based on stored mode
if (locationRow) locationRow.hidden = true;
// Sprint 11 Pass 15: Screenshot button
const screenshotBtn         = document.getElementById("screenshot-btn");
// Sprint 11 Pass 10: Image paste DOM refs
const imageFolderBannerEl   = document.getElementById("image-folder-banner");
const imageFolderChooseBtn  = document.getElementById("image-folder-choose");
const imagePreviewWrap      = document.getElementById("image-preview-wrap");
const imagePreviewThumb     = document.getElementById("image-preview-thumb");
const imagePreviewRemoveBtn = document.getElementById("image-preview-remove");
const settingsImagesFolderNameEl = document.getElementById("settings-images-folder-name");
const settingsChangeFolderBtn    = document.getElementById("settings-change-folder");

// Bug 5: hide selector row at startup — only shown when Markup is ON
selectorRow.hidden = true;

// Pass 12 fix: reposition note-pending-prompt to just above the textarea
noteInput.before(notePendingPrompt);

// ─── URL normalization ─────────────────────────────────────────
function normalizeUrl(url) {
  return url.split("#")[0].replace(/\/$/, "");
}

// ─── Sprint 8 F9: Safe storage wrappers ────────────────────────
async function safeGet(keyOrNull, fallback = null) {
  try {
    return await new Promise((resolve, reject) => {
      chrome.storage.local.get(keyOrNull, (data) => {
        if (chrome.runtime.lastError) { reject(chrome.runtime.lastError); return; }
        if (typeof keyOrNull === "string") resolve(data[keyOrNull] ?? fallback);
        else resolve(data ?? fallback);
      });
    });
  } catch (err) {
    console.error("Markup: storage.get failed", { keyOrNull, err });
    showToast("Storage error — data may be incomplete.");
    return fallback;
  }
}

async function safeSet(data) {
  try {
    await new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) { reject(chrome.runtime.lastError); return; }
        resolve();
      });
    });
  } catch (err) {
    console.error("Markup: storage.set failed", { err });
    showToast("Something went wrong — your notes are safe.");
  }
}

// ─── Sprint 11 Pass 10: IndexedDB helpers for image folder handle ─
// chrome.storage.local only supports JSON; FileSystemDirectoryHandle
// must be stored in IndexedDB which supports structured-clone objects.
const _IDB_NAME  = "markup_img_db";
const _IDB_STORE = "handles";
const _IDB_KEY   = "dir";

function _openImageDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(_IDB_NAME, 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(_IDB_STORE);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

async function getStoredImageDirHandle() {
  try {
    const db = await _openImageDb();
    return new Promise((resolve) => {
      const tx = db.transaction(_IDB_STORE, "readonly");
      const req = tx.objectStore(_IDB_STORE).get(_IDB_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror  = () => resolve(null);
    });
  } catch { return null; }
}

async function storeImageDirHandle(handle) {
  try {
    const db = await _openImageDb();
    return new Promise((resolve) => {
      const tx = db.transaction(_IDB_STORE, "readwrite");
      tx.objectStore(_IDB_STORE).put(handle, _IDB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => resolve();
    });
  } catch { /* ignore */ }
}

async function loadImageDirHandle() {
  imageDirHandle = await getStoredImageDirHandle();
  updateSettingsImagesFolderName();
}

async function ensureImageDirPermission() {
  if (!imageDirHandle) return false;
  try {
    const perm = await imageDirHandle.queryPermission({ mode: "readwrite" });
    if (perm === "granted") return true;
    const req = await imageDirHandle.requestPermission({ mode: "readwrite" });
    return req === "granted";
  } catch { return false; }
}

// ─── Sprint 11 Pass 10: Image utilities ────────────────────────
async function saveImageToFolder(dirHandle, filename, buffer) {
  const fh = await dirHandle.getFileHandle(filename, { create: true });
  const w  = await fh.createWritable();
  await w.write(buffer);
  await w.close();
}

// Returns a full-resolution base64 data URL directly from an ArrayBuffer.
// No canvas resize — display size is handled by CSS (max-height: 80px, object-fit: cover).
function readArrayBufferAsDataUrl(arrayBuffer, mimeType) {
  return new Promise((resolve) => {
    const blob = new Blob([arrayBuffer], { type: mimeType || "image/png" });
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

// Reads a saved image file as a base64 data URL for HTML export.
async function readImageAsBase64(filename) {
  if (!imageDirHandle || !filename) return null;
  try {
    const ok = await ensureImageDirPermission();
    if (!ok) return null;
    const fh   = await imageDirHandle.getFileHandle(filename);
    const file = await fh.getFile();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload  = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  } catch { return null; }
}

function showImagePreview(dataUrl) {
  if (!dataUrl || !imagePreviewWrap || !imagePreviewThumb) return;
  imagePreviewThumb.src = dataUrl;
  imagePreviewWrap.hidden = false;
}

function hideImagePreview() {
  if (imagePreviewWrap) { imagePreviewWrap.hidden = true; }
  if (imagePreviewThumb) { imagePreviewThumb.src = ""; }
}

function updateSettingsImagesFolderName() {
  if (settingsImagesFolderNameEl) {
    settingsImagesFolderNameEl.textContent = imageDirHandle ? imageDirHandle.name : "No folder set";
  }
}

// ─── Sprint 9: Developer Mode ──────────────────────────────────
function applyDevMode(enabled) {
  devMode = enabled;
  // Mode chip: DEV when dev mode, SIMPLE when simple mode
  if (devBadgeEl) {
    devBadgeEl.textContent = enabled ? "DEV MODE" : "SIMPLE MODE";
    devBadgeEl.hidden = false;
    devBadgeEl.classList.toggle("mode-chip--dev", enabled);
  }
  if (locationInput) {
    locationInput.placeholder = enabled
      ? "e.g. .hero-section, #checkout-btn"
      : "e.g. Hero section, checkout button";
  }
  // Selector chip row is always hidden — location field is the single field
  selectorRow.hidden = true;
  // Show/hide sort toggle (only meaningful in Developer Mode)
  if (briefSortToggleEl) briefSortToggleEl.hidden = !enabled;
  // Show/hide type and severity pickers
  if (noteTypesRow) noteTypesRow.classList.toggle("dev-mode-hidden", !enabled);
  if (noteSeveritiesRow) noteSeveritiesRow.classList.toggle("dev-mode-hidden", !enabled);
  // Filter tabs only visible in Developer Mode
  if (filterTabsEl) filterTabsEl.hidden = !enabled;
  // Location field visible in both modes
  if (locationRow) locationRow.hidden = false;
  // Note input placeholder
  if (noteInput) {
    noteInput.placeholder = enabled
      ? "Describe the issue… or speak via Wispr Flow"
      : "What do you notice?";
  }
  // Hide SELECT ELEMENT toggle in Simple Mode — Dev Mode only control
  if (toggleBtn) toggleBtn.hidden = !enabled;
  // Simple Mode: SCREENSHOT + GENERATE BRIEF side by side (no SELECT ELEMENT)
  const bottomRow = document.querySelector(".bottom-btn-row");
  if (bottomRow) bottomRow.classList.toggle("bottom-btn-row--simple", !enabled);
  // In simple mode, clear any active selector state.
  if (!enabled) {
    currentSelector = null;
    currentElementLabel = null;
    updateClearSelectorVisibility();
  }
  // Re-render notes to show/hide type/severity badges
  renderNotesList();
}

async function loadDevMode() {
  const stored = await safeGet(DEV_MODE_KEY, null);
  if (stored === null) {
    // New install: default to Simple Mode
    await safeSet({ [DEV_MODE_KEY]: false });
    devMode = false;
    if (devModeToggle) devModeToggle.checked = false;
    applyDevMode(false);
  } else {
    devMode = !!stored;
    if (devModeToggle) devModeToggle.checked = devMode;
    applyDevMode(devMode);
  }
}

async function setDevMode(enabled) {
  devMode = enabled;
  await safeSet({ [DEV_MODE_KEY]: enabled });
  if (devModeToggle) devModeToggle.checked = enabled;
  applyDevMode(enabled);
}

function showDevModeToast() {
  const existing = document.getElementById("dev-mode-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "dev-mode-toast";
  toast.className = "dev-mode-toast";
  toast.innerHTML = `
    <div class="dev-mode-toast__body">
      <strong>Developer Mode on</strong>
      <span>Selectors, type &amp; severity pickers are now visible. Toggle off via the chip at the top or in Settings.</span>
    </div>
    <button class="dev-mode-toast__close" aria-label="Dismiss">✕</button>
  `;
  toast.querySelector(".dev-mode-toast__close").addEventListener("click", () => toast.remove());
  const mainView = document.getElementById("main-view");
  if (mainView) mainView.prepend(toast);
  setTimeout(() => {
    toast.style.transition = "opacity 400ms ease";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ─── Sprint 11 Pass 11: Onboarding card (all installs, both modes) ──
async function showOnboardingCardIfNeeded() {
  const dismissed = await safeGet(ONBOARDING_KEY, false);
  if (dismissed) return;
  if (document.getElementById("onboarding-card")) return; // already shown

  const card = document.createElement("div");
  card.id = "onboarding-card";
  card.className = "onboarding-card";
  card.innerHTML = `
    <button class="onboarding-card__dismiss" id="onboarding-close" aria-label="Dismiss">✕</button>
    <p class="onboarding-card__text">Welcome to Markup. Select elements, paste screenshots with Cmd+V, and generate a brief when you're done.</p>
    <div class="onboarding-card__folder-section">
      <p class="onboarding-card__folder-title">📁 Choose an images folder</p>
      <p class="onboarding-card__folder-desc">Pick once — all pasted images save there automatically.</p>
      <button class="onboarding-card__folder-btn" id="onboarding-folder">CHOOSE FOLDER →</button>
    </div>
    <button class="onboarding-card__settings-link" id="onboarding-settings">OPEN SETTINGS →</button>
  `;
  notesList.prepend(card);

  async function dismissCard() {
    await safeSet({ [ONBOARDING_KEY]: true });
    card.remove();
  }

  document.getElementById("onboarding-close").addEventListener("click", () => dismissCard());

  document.getElementById("onboarding-folder").addEventListener("click", async () => {
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      imageDirHandle = handle;
      await storeImageDirHandle(handle);
      updateSettingsImagesFolderName();
      showToast(`Images folder set: ${handle.name}`);
      await dismissCard();
    } catch (err) {
      if (err.name !== "AbortError") {
        console.warn("Markup: folder picker failed", err);
        showToast("Couldn't open folder picker.");
      }
      // AbortError = user cancelled — keep card open
    }
  });

  document.getElementById("onboarding-settings").addEventListener("click", async () => {
    await dismissCard();
    showSettings();
    setTimeout(() => { if (devModeToggle) devModeToggle.focus(); }, 100);
  });
}

// ─── Sprint 9: Toggle state ──────────────────────────────────────
function setToggleState(active) {
  markupActive = active;
  if (active) {
    toggleBtn.textContent = "STOP SELECTING";
    toggleBtn.classList.add("toggle-btn--on");
    toggleBtn.setAttribute("aria-pressed", "true");
    toggleBtn.setAttribute("aria-label", "STOP SELECTING — deactivate element selection");
    if (escSelectHintEl) escSelectHintEl.hidden = false;
  } else {
    toggleBtn.textContent = "SELECT ELEMENT";
    toggleBtn.classList.remove("toggle-btn--on");
    toggleBtn.setAttribute("aria-pressed", "false");
    toggleBtn.setAttribute("aria-label", "SELECT ELEMENT — activate element selection");
    if (escSelectHintEl) escSelectHintEl.hidden = true;
    deactivateReset();
  }
  updateEmptyState();
}

// ─── Toggle send ───────────────────────────────────────────────
async function sendToggle() {
  const tabs = await new Promise((resolve) =>
    chrome.tabs.query({ active: true, currentWindow: true }, resolve)
  );
  const tab = tabs[0];
  if (!tab?.id) return;

  const url = tab.url || "";
  activationHint.hidden = true;

  const isRestricted =
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("about:") ||
    url.startsWith("edge://");

  if (isRestricted) {
    activationHint.textContent = "Markup can't run on this page.";
    activationHint.hidden = false;
    return;
  }

  const isNormalPage =
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("file://");

  let ready = false;
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (extId) => window["__mkp_" + extId + "_ready"] === true,
      args: [chrome.runtime.id],
    });
    ready = results?.[0]?.result === true;
  } catch (err) {
    ready = false;
  }

  if (!ready && isNormalPage) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content/content.js"],
      });
      await new Promise((r) => setTimeout(r, 500));
      chrome.tabs.sendMessage(tab.id, { type: "MARKUP_ACTIVATE" });
    } catch (injErr) {
      activationHint.textContent = "Try refreshing the page.";
      activationHint.hidden = false;
    }
    return;
  }

  if (!ready) return;

  markupEverActivated = true;
  const msgType = markupActive ? "MARKUP_DEACTIVATE" : "MARKUP_ACTIVATE";
  // Suppress the ELEMENT_DESELECTED that deactivate() fires via clearSelection()
  // so flushSave() is not called when the user clicks SELECT ELEMENT to turn off.
  if (markupActive) ignoreNextDeselect = true;
  // Fix 1A: cancel active screenshot mode when turning element select ON
  if (!markupActive && screenshotBtn && screenshotBtn.classList.contains("btn-screenshot--active")) {
    chrome.tabs.sendMessage(tab.id, { type: "EXIT_SCREENSHOT_MODE" }).catch(() => {});
    screenshotBtn.classList.remove("btn-screenshot--active");
    screenshotBtn.textContent = "SCREENSHOT";
  }
  chrome.tabs.sendMessage(tab.id, { type: msgType });
}

toggleBtn.addEventListener("click", sendToggle);

// ─── Close button ──────────────────────────────────────────────
// ─── Empty state (Sprint 9 — 2e) ───────────────────────────────
function updateEmptyState() {
  emptyState.innerHTML = "";
  // Pass 8: hide empty state if ANY note exists on this domain (not just current URL)
  const domainTotal = notes.length + allNotes.length;
  if (domainTotal > 0) {
    emptyState.style.display = "none";
    return;
  }
  emptyState.style.display = "";

  if (!devMode) {
    // Simple Mode empty state
    const text = document.createElement("p");
    text.className = "empty-state__body";
    text.textContent = "Take a screenshot or type a note below to get started.";
    emptyState.append(text);
    return;
  }

  // Developer Mode — three states
  if (!markupActive) {
    // No notes, Elements OFF
    const heading = document.createElement("p");
    heading.className = "empty-state__heading";
    heading.textContent = "Ready to annotate?";
    const body = document.createElement("p");
    body.className = "empty-state__body";
    body.textContent = "Click Select Element to start selecting, or type a general note below.";
    emptyState.append(heading, body);
  } else {
    // No notes, Elements ON
    const hint = document.createElement("p");
    hint.className = "empty-state__hint";
    hint.textContent = "Hover an element to preview its selector";
    emptyState.append(hint);
  }
}

// ─── Type picker ───────────────────────────────────────────────
typeButtons.forEach((btn) => {
  btn.addEventListener("click", () => { setTypePicker(btn.dataset.type); });
});

// ─── Severity picker ───────────────────────────────────────────
severityButtons.forEach((btn) => {
  btn.addEventListener("click", () => { setSeverityPicker(btn.dataset.severity); });
});

// ─── Filter tabs ───────────────────────────────────────────────
filterTabEls.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeFilter = tab.dataset.filter;
    filterTabEls.forEach((t) => {
      t.classList.toggle("filter-tab--active", t.dataset.filter === activeFilter);
      t.setAttribute("aria-selected", t.dataset.filter === activeFilter ? "true" : "false"); // Sprint 9 (3c)
    });
    renderNotesList();
  });
});


// ─── Helpers ───────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getActiveType() {
  return document.querySelector(".type-btn--active")?.dataset.type || "general";
}

function setTypePicker(type) {
  typeButtons.forEach((b) => {
    const active = b.dataset.type === type;
    b.classList.toggle("type-btn--active", active);
    b.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function resetTypePicker() { setTypePicker("general"); }

function getActiveSeverity() {
  return document.querySelector(".severity-btn--active")?.dataset.severity || "medium";
}

function setSeverityPicker(severity) {
  severityButtons.forEach((b) => {
    const active = b.dataset.severity === severity;
    b.classList.toggle("severity-btn--active", active);
    b.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function resetSeverityPicker() { setSeverityPicker("medium"); }

// ─── Sprint 8 F7: Relative timestamps ─────────────────────────
function getRelativeTime(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  if (diff < 60000)      return "just now";
  if (diff < 3600000)    return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000)   return `${Math.floor(diff / 3600000)}h ago`;
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function refreshTimestamps() {
  document.querySelectorAll(".note-card__timestamp[data-ts]").forEach((el) => {
    el.textContent = getRelativeTime(Number(el.dataset.ts));
  });
}

// ─── Clear selector/all visibility ────────────────────────────
function updateClearSelectorVisibility() {
  clearSelectorBtn.hidden = !currentSelector;
}

function updateClearAllVisibility() {
  const header = document.getElementById("notes-list-header");
  const hasNotes = notes.length > 0;
  if (header) header.hidden = !hasNotes;
  if (clearAllBtn) clearAllBtn.hidden = !hasNotes;
}

// ─── Storage — notes ──────────────────────────────────────────
function loadNotes() {
  const key = `markup_notes_${currentNoteUrl}`;
  return safeGet(key, []);
}

// Pass 7: Scan all markup_notes_* keys that share the same hostname
async function loadAllDomainNotes(pageUrl) {
  if (!pageUrl) return [];
  let hostname;
  try { hostname = new URL(pageUrl).hostname; } catch { return []; }
  if (!hostname) return [];
  const all = await safeGet(null, {});
  const result = [];
  for (const [key, val] of Object.entries(all)) {
    if (!key.startsWith("markup_notes_")) continue;
    const storedUrl = key.slice("markup_notes_".length);
    if (storedUrl === currentNoteUrl) continue; // current URL loaded separately
    let storedHostname;
    try { storedHostname = new URL(storedUrl).hostname; } catch { continue; }
    if (storedHostname !== hostname) continue;
    if (Array.isArray(val)) {
      val.forEach((n) => result.push({ ...n, url: storedUrl }));
    }
  }
  return result;
}

// Pass 8: Fresh domain-wide scan at brief-generation time.
// Returns [{url, notes[]}] — current URL first, others sorted.
async function collectDomainNotes() {
  if (!currentNoteUrl) return notes.length > 0 ? [{ url: currentNoteUrl, notes }] : [];
  let hostname;
  try { hostname = new URL(currentNoteUrl).hostname; } catch { return notes.length > 0 ? [{ url: currentNoteUrl, notes }] : []; }

  const all = await safeGet(null, {});
  const groupMap = {};

  for (const [key, val] of Object.entries(all)) {
    if (!key.startsWith("markup_notes_")) continue;
    const storedUrl = key.slice("markup_notes_".length);
    if (!storedUrl) continue;
    let storedHostname;
    try { storedHostname = new URL(storedUrl).hostname; } catch { continue; }
    if (storedHostname !== hostname) continue;
    if (!Array.isArray(val) || val.length === 0) continue;
    // For current URL, use in-memory notes (most up-to-date)
    groupMap[storedUrl] = storedUrl === currentNoteUrl
      ? notes.map((n) => ({ ...n, url: currentNoteUrl }))
      : val.map((n) => ({ ...n, url: storedUrl }));
  }
  // Ensure current URL is included if it has in-memory notes not yet persisted
  if (notes.length > 0 && !groupMap[currentNoteUrl]) {
    groupMap[currentNoteUrl] = notes.map((n) => ({ ...n, url: currentNoteUrl }));
  }

  const urls = Object.keys(groupMap);
  const sorted = [
    ...urls.filter((u) => u === currentNoteUrl),
    ...urls.filter((u) => u !== currentNoteUrl).sort(),
  ];
  return sorted.map((url) => ({ url, notes: groupMap[url] }));
}

function getBriefPathLabel(url) {
  try {
    const u = new URL(url);
    const pq = u.pathname + u.search;
    return (pq === "/" || pq === "") ? "Home" : pq;
  } catch { return url; }
}

async function persistNotes() {
  if (!currentNoteUrl) return;
  const key = `markup_notes_${currentNoteUrl}`;
  await safeSet({ [key]: notes });
  updateBadge();     // Sprint 8 F2: sync badge count
  await checkStorageQuota(); // Sprint 8 F4: check quota after every write
}

// ─── Storage — session title ───────────────────────────────────
function loadSessionTitle() {
  const key = `markup_session_${currentNoteUrl}`;
  return safeGet(key, null);
}

function persistSessionTitle(title) {
  if (!currentNoteUrl) return;
  safeSet({ [`markup_session_${currentNoteUrl}`]: title });
}

sessionTitleInput.addEventListener("input", () => {
  sessionTitle = sessionTitleInput.value;
  persistSessionTitle(sessionTitle);
});

// ─── Storage — backup ─────────────────────────────────────────
async function writeBackup() {
  if (!currentNoteUrl || notes.length === 0) return;
  const backupKey = `markup_backup_${currentNoteUrl}`;
  const existing = await safeGet(backupKey, []);
  const backup = { timestamp: Date.now(), notes: JSON.parse(JSON.stringify(notes)) };
  const updated = [...existing, backup].slice(-3);
  await safeSet({ [backupKey]: updated });
  console.log(`Markup: backup written (${updated.length}/3 for ${currentNoteUrl})`);
}

// ─── Brief archive storage ─────────────────────────────────────
function loadAllBriefs() {
  return safeGet(getBriefsKey(), []);
}

async function saveBrief(markdown) {
  const existing = await loadAllBriefs();

  // Auto-name: "[pageName or domain] · [date]"
  let autoName = "Brief";
  try {
    const domain = new URL(currentNoteUrl).hostname;
    const pageName = sessionTitle || tabTitle || domain;
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
    autoName = `${pageName} · ${dateStr}`;
  } catch { /* keep default */ }

  // Pass 8: use domain-wide notes for counts
  const allBriefNotes = briefDomainGroups.flatMap((g) => g.notes);
  const severitySummary = {
    critical: allBriefNotes.filter((n) => (n.severity || "medium") === "critical").length,
    high:     allBriefNotes.filter((n) => (n.severity || "medium") === "high").length,
    medium:   allBriefNotes.filter((n) => (n.severity || "medium") === "medium").length,
    low:      allBriefNotes.filter((n) => (n.severity || "medium") === "low").length,
  };

  const entry = {
    id: generateId(),
    name: autoName,
    url: currentNoteUrl,
    pageTitle: sessionTitle || tabTitle || "",
    timestamp: Date.now(),
    noteCount: allBriefNotes.length,
    severitySummary,
    markdown,
  };

  const updated = [...existing, entry].slice(-BRIEFS_MAX);
  await safeSet({ [getBriefsKey()]: updated });
}

async function deleteBriefEntry(id) {
  const existing = await loadAllBriefs();
  const updated = existing.filter((b) => b.id !== id);
  await safeSet({ [getBriefsKey()]: updated });
  await renderBriefsArchiveList();
}

async function renameBriefEntry(id, name) {
  const existing = await loadAllBriefs();
  const updated = existing.map((b) => b.id === id ? { ...b, name } : b);
  await safeSet({ [getBriefsKey()]: updated });
}

// ─── Briefs Archive view ───────────────────────────────────────
function showBriefsArchive() {
  closeAllOverlayPanels();
  notesList.hidden = true;
  sessionTitleWrap.hidden = true;
  filterTabsEl.hidden = true;
  clearConfirmEl.hidden = true;
  formArea.hidden = true;
  markupActionsEl.hidden = true;
  toggleSectionEl.hidden = true;
  storageQuotaWarning.hidden = true;
  briefsArchivePanelEl.hidden = false;
  renderBriefsArchiveList();
}

function hideBriefsArchive() {
  briefsArchivePanelEl.hidden = true;
  notesList.hidden = false;
  sessionTitleWrap.hidden = false;
  filterTabsEl.hidden = !devMode;
  formArea.hidden = false;
  markupActionsEl.hidden = false;
  toggleSectionEl.hidden = false;
  checkStorageQuota();
}

async function renderBriefsArchiveList() {
  const briefs = await loadAllBriefs();

  if (briefsArchiveCountEl) {
    briefsArchiveCountEl.textContent = briefs.length > 0
      ? `${briefs.length} brief${briefs.length === 1 ? "" : "s"}`
      : "";
  }

  briefsArchiveList.innerHTML = "";

  if (briefs.length === 0) {
    // Sprint 9 (2e): redesigned empty state with Playfair heading
    const empty = document.createElement("div");
    empty.className = "briefs-archive__empty";
    const heading = document.createElement("p");
    heading.className = "empty-state__heading";
    heading.textContent = "No briefs saved yet.";
    const body = document.createElement("p");
    body.className = "empty-state__body";
    body.textContent = "Generate your first brief to save it here.";
    empty.append(heading, body);
    briefsArchiveList.appendChild(empty);
    return;
  }

  // Newest first
  const reversed = [...briefs].reverse();
  reversed.forEach((brief, idx) => {
    const item = document.createElement("div");
    item.className = "brief-entry";
    // Pass 5: gold dot for most recent
    if (idx === 0) item.classList.add("brief-entry--latest");

    const d = new Date(brief.timestamp);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      + " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    // Severity chips
    const sev = brief.severitySummary || {};
    const sevChips = SEVERITY_ORDER
      .filter((s) => (sev[s] || 0) > 0)
      .map((s) => `<span class="brief-entry__chip brief-entry__chip--${s}">${Number(sev[s])|0} ${SEVERITY_CONFIG[s].label}</span>`)
      .join("");

    let domain = brief.url || "";
    try { domain = new URL(brief.url).hostname; } catch { /* */ }

    const noteCount = Number(brief.noteCount) | 0;

    item.innerHTML = `
      <div class="brief-entry__body">
        <div class="brief-entry__name-wrap">
          <span class="brief-entry__name" title="Click to rename">${escapeHtml(brief.name || "Untitled")}</span>
          <input class="brief-entry__name-input" type="text" value="${escapeHtml(brief.name || "Untitled")}" hidden />
        </div>
        <span class="brief-entry__url">${escapeHtml(domain)}</span>
        <div class="brief-entry__meta">
          <span class="brief-entry__date">${escapeHtml(dateStr)} · ${noteCount} note${noteCount === 1 ? "" : "s"}</span>
        </div>
        ${sevChips ? `<div class="brief-entry__chips">${sevChips}</div>` : ""}
      </div>
      <div class="brief-entry__actions">
        <button class="btn-brief-open">Open →</button>
        <button class="icon-btn btn-brief-delete" aria-label="Delete">✕</button>
      </div>
    `;

    // Inline name editing
    const nameEl = item.querySelector(".brief-entry__name");
    const nameInput = item.querySelector(".brief-entry__name-input");
    nameEl.addEventListener("click", () => {
      nameEl.hidden = true;
      nameInput.hidden = false;
      nameInput.focus();
      nameInput.select();
    });
    nameInput.addEventListener("blur", async () => {
      const newName = nameInput.value.trim() || (brief.name || "Untitled");
      await renameBriefEntry(brief.id, newName);
      brief.name = newName;
      nameEl.textContent = newName;
      nameEl.hidden = false;
      nameInput.hidden = true;
    });
    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") nameInput.blur();
      if (e.key === "Escape") {
        nameInput.value = brief.name || "Untitled";
        nameEl.hidden = false;
        nameInput.hidden = true;
      }
    });

    item.querySelector(".btn-brief-open").addEventListener("click", () => {
      showBriefReader(brief);
    });

    item.querySelector(".btn-brief-delete").addEventListener("click", async () => {
      await deleteBriefEntry(brief.id);
      showToast("Brief deleted.");
    });

    briefsArchiveList.appendChild(item);
  });

  // Pass 5: footer text
  const footer = document.createElement("p");
  footer.className = "briefs-archive__footer";
  footer.textContent = "Last 20 briefs · Sorted newest first";
  briefsArchiveList.appendChild(footer);
}

// ─── Simple markdown renderer (Brief Reader only) ──────────────
function applyInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function renderMarkdown(md) {
  const lines = md.split("\n");
  let html = "";
  let inP = false;
  const closeP = () => { if (inP) { html += "</p>"; inP = false; } };

  for (const rawLine of lines) {
    const line = rawLine
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    if (/^-{3,}$/.test(line.trim())) {
      closeP();
      html += "<hr>";
      continue;
    }
    const h1 = line.match(/^# (.+)/);
    if (h1) { closeP(); html += `<h1>${applyInline(h1[1])}</h1>`; continue; }
    const h2 = line.match(/^## (.+)/);
    if (h2) { closeP(); html += `<h2>${applyInline(h2[1])}</h2>`; continue; }
    const h3 = line.match(/^### (.+)/);
    if (h3) { closeP(); html += `<h3>${applyInline(h3[1])}</h3>`; continue; }
    if (line.trim() === "") { closeP(); continue; }
    if (!inP) { html += "<p>"; inP = true; } else { html += "<br>"; }
    html += applyInline(line);
  }
  closeP();
  return html;
}

// ─── Brief Reader view ─────────────────────────────────────────
function showBriefReader(brief) {
  briefsArchivePanelEl.hidden = true;
  briefReaderPanelEl.hidden = false;
  briefReaderContent.innerHTML = renderMarkdown(brief.markdown || "");
  if (briefReaderNameEl) briefReaderNameEl.textContent = brief.name || "Brief";
  briefReaderCurrentBrief = brief;
}

function hideBriefReader() {
  briefReaderPanelEl.hidden = true;
  briefsArchivePanelEl.hidden = false;
}

// ─── Sprint 8 F2: Action badge ─────────────────────────────────
function updateBadge() {
  const count = notes.length;
  chrome.runtime.sendMessage({
    type: "SET_BADGE",
    count,
    tabId: currentTabId,
  }).catch(() => {}); // background may be sleeping
}

// ─── Thumbnail downscaler (Pass 22b) ───────────────────────────
function downscaleThumbnail(dataUrl, maxWidth = 400) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ─── Sprint 8 F4: Storage quota check ─────────────────────────
async function checkStorageQuota() {
  try {
    const bytesUsed = await new Promise((resolve) =>
      chrome.storage.local.getBytesInUse(null, resolve)
    );
    if (bytesUsed >= QUOTA_WARN_BYTES) {
      storageQuotaWarning.className = "storage-quota-warning storage-quota-warning--warn";
      storageQuotaWarning.textContent = "Storage almost full — export your notes or clear old sessions.";
      storageQuotaWarning.hidden = false;
    } else {
      storageQuotaWarning.hidden = true;
    }
    return bytesUsed;
  } catch {
    return 0;
  }
}

// ─── Filter tab count badges ───────────────────────────────────
function updateFilterTabCounts(notesArray) {
  const arr = notesArray || notes;
  const counts = {
    all:      arr.length,
    critical: arr.filter((n) => (n.severity || "medium") === "critical").length,
    high:     arr.filter((n) => (n.severity || "medium") === "high").length,
    medium:   arr.filter((n) => (n.severity || "medium") === "medium").length,
    low:      arr.filter((n) => (n.severity || "medium") === "low").length,
  };
  const LABELS = { all: "ALL", critical: "CRIT", high: "HIGH", medium: "MED", low: "LOW" };
  filterTabEls.forEach((tab) => {
    const f = tab.dataset.filter;
    const n = counts[f] ?? 0;
    const label = LABELS[f] || f.toUpperCase();
    // ALL tab always shows count; other tabs only show count when > 0
    tab.textContent = (f === "all" || n > 0) ? `${label} (${n})` : label;
  });
}

// ─── Sprint 8 F6: Send notes to content script for badges ─────
function sendNotesToContentScript() {
  if (!currentTabId) return;
  const annotated = notes
    .filter((n) => n.selector)
    .map((n, i) => ({ id: n.id, selector: n.selector, index: i }));
  chrome.tabs.sendMessage(currentTabId, {
    type: "NOTES_UPDATED",
    notes: annotated,
  }).catch(() => {}); // content script may not be ready
}

// ─── Render ────────────────────────────────────────────────────
function renderNotesList() {
  notesList.querySelectorAll(".note-card, .url-group").forEach((c) => c.remove());

  // Pass 8: enable generate button based on domain-wide total
  const combined = [
    ...allNotes.filter((n) => (n.url || "") !== currentNoteUrl),
    ...notes.map((n) => ({ ...n, url: currentNoteUrl })),
  ];
  generateBtn.disabled = combined.length === 0;
  generateBtn.setAttribute("aria-disabled", combined.length === 0 ? "true" : "false");

  // Check if notes exist for more than one URL
  const urlSet = new Set(combined.map((n) => n.url || currentNoteUrl));
  const isMultiPage = urlSet.size > 1;

  // Note count: always domain-wide total
  noteCountEl.textContent = `${combined.length} notes`;

  updateFilterTabCounts(combined);
  updateEmptyState();
  updateClearAllVisibility();
  sendNotesToContentScript(); // Sprint 8 F6: update in-page badges

  if (!isMultiPage) {
    // Single URL (or all domain notes on one URL): flat list, render from combined
    const visible = activeFilter === "all"
      ? combined
      : combined.filter((n) => (n.severity || "medium") === activeFilter);

    visible.forEach((note) => {
      notesList.appendChild(createNoteCard(note));
    });
  } else {
    // Multi-page: grouped by URL — current URL first
    const urls = [currentNoteUrl, ...[...urlSet].filter((u) => u !== currentNoteUrl)];

    urls.forEach((url) => {
      const groupNotes = combined.filter((n) => (n.url || currentNoteUrl) === url);
      const visibleNotes = activeFilter === "all"
        ? groupNotes
        : groupNotes.filter((n) => (n.severity || "medium") === activeFilter);

      if (visibleNotes.length === 0) return; // skip empty groups after filter

      let pathLabel = url;
      try {
        const u = new URL(url);
        const pq = u.pathname + u.search;
        pathLabel = (pq === "/" || pq === "") ? "Home" : pq;
      } catch { /* */ }

      const isCurrentPage = url === currentNoteUrl;

      const group = document.createElement("div");
      group.className = "url-group" + (isCurrentPage ? " url-group--current" : "");

      const header = document.createElement("div");
      header.className = "url-group__header" + (isCurrentPage ? " url-group__header--current" : "");
      header.innerHTML = isCurrentPage
        ? `<span class="url-group__url">${escapeHtml(pathLabel)}</span><span class="url-group__chip">current page</span>`
        : `<span class="url-group__url">${escapeHtml(pathLabel)}</span>`;

      group.appendChild(header);

      visibleNotes.forEach((note) => {
        group.appendChild(createNoteCard(note));
      });

      notesList.appendChild(group);
    });
  }
}

function createNoteCard(note) {
  const config = TYPE_CONFIG[note.type] || TYPE_CONFIG.general;
  const severity = note.severity || "medium";
  const sevConfig = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium;
  const card = document.createElement("div");

  // Sprint 9 (3e): role="article" + accessible label
  const textPreview = (note.text || "").slice(0, 60);
  const ariaLabel = devMode
    ? `${config.label} note, ${sevConfig.label} severity: ${textPreview}`
    : `Note: ${textPreview}`;
  // Simple Mode: no severity border — don't apply severity class
  card.className = devMode ? `note-card note-card--${severity}` : "note-card";
  card.setAttribute("role", "article");
  card.setAttribute("aria-label", ariaLabel);
  card.dataset.noteId = note.id;

  // Sprint 8 F7: relative timestamp
  const tsStr = getRelativeTime(note.createdAt);
  const tsHtml = note.createdAt
    ? `<span class="note-card__timestamp" data-ts="${Number(note.createdAt)||0}">${escapeHtml(tsStr)}</span>`
    : "";

  if (!devMode) {
    // Simple Mode: text + timestamp only, no type/severity badges, no selector
    card.classList.add("note-card--simple");
    const locationHtml = note.location
      ? `<p class="note-card__location">${escapeHtml(note.location)}</p>`
      : "";
    const imageHtml = note.imageThumbnail
      ? `<div class="note-card__image-wrap"><img class="note-card__image" src="${note.imageThumbnail}" alt="Screenshot" loading="lazy" /></div>`
      : "";
    card.innerHTML = `
      <div class="note-card__header">
        <div class="note-card__meta-right">
          ${tsHtml}
          <div class="note-card__actions">
            <button class="icon-btn edit-btn" aria-label="Edit note">✎</button>
            <button class="icon-btn delete-btn" aria-label="Delete note">✕</button>
          </div>
        </div>
      </div>
      <p class="note-card__text">${escapeHtml(note.text)}</p>
      ${locationHtml}
      ${imageHtml}
    `;
  } else {
    // Developer Mode: full card with type/severity/location
    let locationLine = "";
    if (note.location) {
      locationLine = `<p class="note-card__location-label">${escapeHtml(note.location)}</p>`;
      if (note.selector) {
        locationLine += `<p class="note-card__selector-ref">Technical ref: <code>${escapeHtml(note.selector)}</code></p>`;
      }
    } else if (note.selector) {
      locationLine = `<code class="selector-chip selector-chip--filled">${escapeHtml(note.selector)}</code>`;
    } else if (note.type === "general") {
      locationLine = `<span class="general-note-label">General note</span>`;
    }

    // Sprint 8 F5: element label row — only when no location override
    const labelChip = (!note.location && note.elementLabel)
      ? `<span class="note-element-label">${escapeHtml(note.elementLabel)}</span>`
      : "";

    const devImageHtml = note.imageThumbnail
      ? `<div class="note-card__image-wrap"><img class="note-card__image" src="${note.imageThumbnail}" alt="Screenshot" loading="lazy" /></div>`
      : "";
    card.innerHTML = `
      <div class="note-card__header">
        <div class="note-card__tags">
          <span class="note-severity-badge note-severity-badge--${escapeHtml(severity)}">${sevConfig.label}</span>
          <span class="note-type-tag note-type-tag--${escapeHtml(note.type)}">${config.label}</span>
        </div>
        <div class="note-card__meta-right">
          ${tsHtml}
          <div class="note-card__actions">
            <button class="icon-btn edit-btn" aria-label="Edit note">✎</button>
            <button class="icon-btn delete-btn" aria-label="Delete note">✕</button>
          </div>
        </div>
      </div>
      ${locationLine}
      ${labelChip}
      <p class="note-card__text">${escapeHtml(note.text)}</p>
      ${devImageHtml}
    `;
  }

  card.querySelector(".edit-btn").addEventListener("click", () => { enterEditMode(note); });
  card.querySelector(".delete-btn").addEventListener("click", () => { deleteNote(note.id, note.url); });

  // Sprint 8 F8: hover note card → temporarily highlight element in page
  if (note.selector) {
    card.addEventListener("mouseenter", () => {
      if (!markupActive || !currentTabId) return;
      chrome.tabs.sendMessage(currentTabId, {
        type: "HIGHLIGHT_ELEMENT",
        selector: note.selector,
      }).catch(() => {});
    });
    card.addEventListener("mouseleave", () => {
      if (!markupActive || !currentTabId) return;
      chrome.tabs.sendMessage(currentTabId, { type: "HIGHLIGHT_ELEMENT_END" }).catch(() => {});
    });
  }

  return card;
}

// ─── Undo / Redo ───────────────────────────────────────────────
function pushUndo(label) {
  undoStack.push({ snapshot: JSON.parse(JSON.stringify(notes)), label });
  if (undoStack.length > 20) undoStack.shift();
  redoStack.length = 0;
}

async function undo() {
  if (undoStack.length === 0) return;
  if (isEditing) exitEditMode();
  const { snapshot, label } = undoStack.pop();
  redoStack.push({ snapshot: JSON.parse(JSON.stringify(notes)), label });
  notes = snapshot;
  await persistNotes();
  renderNotesList();
  showToast(label);
}

async function redo() {
  if (redoStack.length === 0) return;
  if (isEditing) exitEditMode();
  const { snapshot, label } = redoStack.pop();
  undoStack.push({ snapshot: JSON.parse(JSON.stringify(notes)), label });
  notes = snapshot;
  await persistNotes();
  renderNotesList();
  showToast("Redo applied");
}

// ─── Toast ─────────────────────────────────────────────────────
function showToast(message) {
  if (toastTimeout) clearTimeout(toastTimeout);
  toastEl.textContent = message;
  toastEl.hidden = false;
  toastTimeout = setTimeout(() => {
    toastEl.hidden = true;
    toastTimeout = null;
  }, 2000);
}

// ─── Thumbnail lightbox ────────────────────────────────────────
function openLightbox(src) {
  imgLightboxImg.src = src;
  imgLightbox.hidden = false;
}

function closeLightbox() {
  imgLightbox.hidden = true;
  imgLightboxImg.src = "";
}

imgLightboxClose.addEventListener("click", closeLightbox);

imgLightbox.addEventListener("click", (e) => {
  if (e.target === imgLightbox) closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !imgLightbox.hidden) closeLightbox();
});

document.querySelector(".markup-sidebar").addEventListener("click", (e) => {
  const img = e.target.closest(".note-card__image, .brief-note-image");
  if (img) openLightbox(img.src);
});

// ─── Save ──────────────────────────────────────────────────────
async function flushSave() {
  const text = noteInput.value.trim();
  if (!text) return;

  checkStorageQuota(); // Sprint 8 F4: update warning strip (non-blocking)

  // Sprint 9 (F1): In simple mode, always use defaults (pickers are hidden)
  const type     = devMode ? getActiveType()     : "general";
  const severity = devMode ? getActiveSeverity() : "medium";
  // Sprint 11 Pass 11: location field — both modes
  const location = locationInput ? (locationInput.value.trim() || null) : null;

  if (currentNoteId) {
    if (editingNoteUrl && editingNoteUrl !== currentNoteUrl) {
      // Pass 7: editing a note from another URL — save to that URL's storage key
      const storageKey = `markup_notes_${editingNoteUrl}`;
      const otherNotes = await safeGet(storageKey, []);
      const idx = otherNotes.findIndex((n) => n.id === currentNoteId);
      if (idx >= 0) {
        pushUndo("Edit undone");
        otherNotes[idx] = {
          ...otherNotes[idx],
          type, severity, text, location,
          selector: currentSelector,
          elementLabel: currentSelector ? (currentElementLabel || otherNotes[idx].elementLabel) : null,
          elementRole: currentSelector ? (currentElementRole || otherNotes[idx].elementRole || null) : null,
          parentContext: currentSelector ? (currentParentContext || otherNotes[idx].parentContext || null) : null,
          elementName: currentSelector ? null : "General note",
          imagePath:      currentImagePath      || otherNotes[idx].imagePath      || null, // Sprint 11 Pass 10
          imageThumbnail: currentImageThumbnail || otherNotes[idx].imageThumbnail || null, // Sprint 11 Pass 10
        };
        await safeSet({ [storageKey]: otherNotes });
        // Update in-memory allNotes so re-render reflects the change immediately
        const aNoteIdx = allNotes.findIndex((n) => n.id === currentNoteId);
        if (aNoteIdx >= 0) {
          allNotes[aNoteIdx] = { ...allNotes[aNoteIdx], type, severity, text, location, selector: currentSelector };
        }
      }
      renderNotesList();
      return;
    }
    const idx = notes.findIndex((n) => n.id === currentNoteId);
    if (idx >= 0) {
      pushUndo("Edit undone");
      notes[idx] = {
        ...notes[idx],
        type,
        severity,
        text,
        location,
        selector: currentSelector,
        elementLabel: currentSelector ? (currentElementLabel || notes[idx].elementLabel) : null,
        elementRole: currentSelector ? (currentElementRole || notes[idx].elementRole || null) : null,
        parentContext: currentSelector ? (currentParentContext || notes[idx].parentContext || null) : null,
        elementName: currentSelector ? null : "General note",
        imagePath:      currentImagePath      || notes[idx].imagePath      || null, // Sprint 11 Pass 10
        imageThumbnail: currentImageThumbnail || notes[idx].imageThumbnail || null, // Sprint 11 Pass 10
      };
    }
  } else {
    const note = {
      id: generateId(),
      url: currentNoteUrl,
      selector: currentSelector,
      elementLabel: currentSelector ? currentElementLabel : null, // Sprint 8 F5
      elementRole: currentSelector ? (currentElementRole || null) : null,  // Sprint 11 Pass 8
      parentContext: currentSelector ? (currentParentContext || null) : null, // Sprint 11 Pass 8
      elementName: currentSelector ? null : "General note",
      type,
      severity,
      text,
      location,         // Sprint 11 Pass 5: optional location string (Simple Mode only)
      imagePath:      currentImagePath      || null, // Sprint 11 Pass 10
      imageThumbnail: currentImageThumbnail || null, // Sprint 11 Pass 10
      createdAt: Date.now(), // Sprint 8 F7
    };
    currentNoteId = note.id;
    notes.push(note);
  }

  await persistNotes();
  renderNotesList();
}

// ─── Form resets ───────────────────────────────────────────────
function resetForm() {
  currentSelector     = null;
  currentElementLabel = null;
  currentParentContext = null;
  currentElementRole  = null;
  currentNoteId       = null;
  isEditing           = false;
  editPrevSelector    = null;
  noteInput.value     = "";
  if (locationInput) {
    locationInput.value = "";
    locationInput.classList.remove("location-input--preview");
  }
  locationHoverPreview = false;
  selectorRow.hidden  = true;
  saveBtn.textContent = "SAVE NOTE";
  resetTypePicker();
  resetSeverityPicker();
  updateClearSelectorVisibility();
  // Sprint 11 Pass 10: clear image state
  currentImagePath      = null;
  currentImageThumbnail = null;
  pendingImageBuffer    = null;
  pendingImageFilename  = null;
  hideImagePreview();
  if (imageFolderBannerEl) imageFolderBannerEl.hidden = true;
}

function deactivateReset() {
  currentSelector     = null;
  currentElementLabel = null;
  currentParentContext = null;
  currentElementRole  = null;
  currentNoteId       = null;
  isEditing           = false;
  editPrevSelector    = null;
  if (locationInput) locationInput.classList.remove("location-input--preview");
  locationHoverPreview = false;
  selectorRow.hidden  = true;
  saveBtn.textContent = "SAVE NOTE";
  // Intentionally NOT resetting type/severity pickers — user's choice is preserved across deactivation.
  updateClearSelectorVisibility();
  // Sprint 11 Pass 10: clear image state (preserve pending image across deactivation)
  currentImagePath      = null;
  currentImageThumbnail = null;
  pendingImageBuffer    = null;
  pendingImageFilename  = null;
  hideImagePreview();
  if (imageFolderBannerEl) imageFolderBannerEl.hidden = true;
}

function softReset() {
  currentNoteId       = null;
  currentElementLabel = null;
  noteInput.value     = "";
  if (locationInput) locationInput.value = "";
  resetTypePicker();
  resetSeverityPicker();
  // Sprint 11 Pass 10: clear image state
  currentImagePath      = null;
  currentImageThumbnail = null;
  pendingImageBuffer    = null;
  pendingImageFilename  = null;
  hideImagePreview();
  if (imageFolderBannerEl) imageFolderBannerEl.hidden = true;
  noteInput.focus();
}

// ─── Edit mode ─────────────────────────────────────────────────
function enterEditMode(note) {
  isEditing        = true;
  editPrevSelector = currentSelector;
  currentNoteId    = note.id;
  editingNoteUrl   = note.url || currentNoteUrl; // Pass 7: track which URL this note belongs to
  currentSelector      = note.selector;
  currentElementLabel  = note.elementLabel  || null;
  currentParentContext = note.parentContext  || null;
  currentElementRole   = note.elementRole   || null;
  noteInput.value      = note.text;
  if (locationInput) locationInput.value = note.location || "";
  setTypePicker(note.type);
  setSeverityPicker(note.severity || "medium");
  saveBtn.textContent = "UPDATE NOTE";
  if (saveHintEl) saveHintEl.textContent = "Cmd+Enter to update · Esc to cancel";
  updateClearSelectorVisibility();
  // Sprint 11 Pass 10: restore image state from note
  currentImagePath      = note.imagePath      || null;
  currentImageThumbnail = note.imageThumbnail || null;
  if (currentImageThumbnail) showImagePreview(currentImageThumbnail);
  else hideImagePreview();
  // Dim other cards, mark active card
  const notesList = document.getElementById("notes-list");
  if (notesList) notesList.classList.add("is-editing-mode");
  const activeCard = document.querySelector(`.note-card[data-note-id="${note.id}"]`);
  if (activeCard) activeCard.classList.add("note-card--editing");
  // Center the Update Note button
  const saveRow = saveBtn?.closest(".save-row");
  if (saveRow) saveRow.classList.add("is-editing");
  noteInput.focus();
}

function exitEditMode() {
  isEditing        = false;
  currentNoteId    = null;
  editingNoteUrl   = null; // Pass 7
  currentSelector      = editPrevSelector;
  currentElementLabel  = null;
  currentParentContext = null;
  currentElementRole   = null;
  editPrevSelector     = null;
  noteInput.value  = "";
  if (locationInput) locationInput.value = "";
  resetTypePicker();
  resetSeverityPicker();
  saveBtn.textContent = "SAVE NOTE";
  if (saveHintEl) saveHintEl.textContent = "Cmd+Enter to save";
  updateClearSelectorVisibility();
  // Sprint 11 Pass 10: clear image state on exit edit
  currentImagePath      = null;
  currentImageThumbnail = null;
  pendingImageBuffer    = null;
  pendingImageFilename  = null;
  hideImagePreview();
  if (imageFolderBannerEl) imageFolderBannerEl.hidden = true;
  // Restore card opacity
  const notesList = document.getElementById("notes-list");
  if (notesList) notesList.classList.remove("is-editing-mode");
  document.querySelectorAll(".note-card--editing").forEach((c) => c.classList.remove("note-card--editing"));
  // Restore save row layout
  const saveRow = saveBtn?.closest(".save-row");
  if (saveRow) saveRow.classList.remove("is-editing");
}

// ─── Delete note ───────────────────────────────────────────────
async function deleteNote(id, noteUrl) {
  // Sprint 9 (2j): exit animation before removal
  const card = document.querySelector(`.note-card[data-note-id="${id}"]`);
  if (card) {
    card.classList.add("note-card--exiting");
    await new Promise((r) => setTimeout(r, 200));
  }
  const targetUrl = noteUrl || currentNoteUrl;
  if (targetUrl !== currentNoteUrl) {
    // Pass 7: delete from another URL's storage key
    const storageKey = `markup_notes_${targetUrl}`;
    const otherNotes = await safeGet(storageKey, []);
    await safeSet({ [storageKey]: otherNotes.filter((n) => n.id !== id) });
    allNotes = allNotes.filter((n) => !(n.id === id && (n.url || "") === targetUrl));
  } else {
    pushUndo("Note restored");
    notes = notes.filter((n) => n.id !== id);
    await persistNotes();
  }
  renderNotesList();
}

// ─── Save button ───────────────────────────────────────────────
saveBtn.addEventListener("click", async () => {
  await flushSave();
  if (isEditing) exitEditMode();
  else softReset();
});

// ─── Keyboard shortcuts ────────────────────────────────────────
noteInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    flushSave().then(() => {
      if (isEditing) exitEditMode();
      else softReset();
    });
  }
  if (e.key === "Escape" && isEditing) {
    exitEditMode();
  }
});

// Clear hover preview when user edits location field
if (locationInput) {
  locationInput.addEventListener("input", () => {
    locationHoverPreview = false;
  });
}

// Cmd+Enter / Ctrl+Enter from location field also saves
if (locationInput) {
  locationInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      flushSave().then(() => {
        if (isEditing) exitEditMode();
        else softReset();
      });
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (document.activeElement === noteInput) return;
  if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "z") {
    e.preventDefault();
    undo();
  }
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") {
    e.preventDefault();
    redo();
  }
  if (e.ctrlKey && !e.metaKey && e.key === "y") {
    e.preventDefault();
    redo();
  }
});

// ─── Clear selector ────────────────────────────────────────────
clearSelectorBtn.addEventListener("click", async () => {
  const tabs = await new Promise((resolve) =>
    chrome.tabs.query({ active: true, currentWindow: true }, resolve)
  );
  const tab = tabs[0];
  if (tab?.id) {
    ignoreNextDeselect = true;
    chrome.tabs.sendMessage(tab.id, { type: "MARKUP_DESELECT" });
  }
  currentSelector      = null;
  currentElementLabel  = null;
  currentParentContext = null;
  currentElementRole   = null;
  if (locationInput) locationInput.value = "";
  updateClearSelectorVisibility();
});

// ─── Sprint 11 Pass 10: Image paste ────────────────────────────
noteInput.addEventListener("paste", async (e) => {
  const files = Array.from(e.clipboardData?.files || []);
  const imageFile = files.find((f) => f.type.startsWith("image/"));
  if (!imageFile) return; // no image — let normal text paste proceed

  e.preventDefault(); // suppress binary data being inserted as text

  const arrayBuffer = await imageFile.arrayBuffer();
  let hostname = "markup";
  try { hostname = new URL(currentNoteUrl).hostname.replace(/[^a-z0-9-]/gi, "-") || "markup"; } catch { /* */ }
  const filename = `markup-${hostname}-${Date.now()}.png`;

  // Read full-resolution data URL directly — no canvas resize (task 1: image quality)
  const fullUrl = await readArrayBufferAsDataUrl(arrayBuffer, imageFile.type);
  const thumbUrl = await downscaleThumbnail(fullUrl);
  currentImageThumbnail = thumbUrl;

  if (!imageDirHandle) {
    // Hold in memory; show folder picker banner and preview
    pendingImageBuffer   = arrayBuffer;
    pendingImageFilename = filename;
    if (imageFolderBannerEl) imageFolderBannerEl.hidden = false;
    showImagePreview(thumbUrl);
    return;
  }

  const ok = await ensureImageDirPermission();
  if (!ok) {
    showToast("Image not saved — folder permission denied.");
    return;
  }
  try {
    await saveImageToFolder(imageDirHandle, filename, arrayBuffer);
    currentImagePath = filename;
    showImagePreview(thumbUrl);
  } catch (err) {
    console.error("Markup: image save failed", err);
    showToast("Image save failed.");
  }
});

// Folder chooser — CHOOSE FOLDER → button on banner
if (imageFolderChooseBtn) {
  imageFolderChooseBtn.addEventListener("click", async () => {
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      imageDirHandle = handle;
      await storeImageDirHandle(handle);
      if (imageFolderBannerEl) imageFolderBannerEl.hidden = true;
      updateSettingsImagesFolderName();

      // Save pending image now that folder is available
      if (pendingImageBuffer && pendingImageFilename) {
        const ok = await ensureImageDirPermission();
        if (ok) {
          try {
            await saveImageToFolder(handle, pendingImageFilename, pendingImageBuffer);
            currentImagePath = pendingImageFilename;
            showImagePreview(currentImageThumbnail);
          } catch (err) {
            console.error("Markup: pending image save failed", err);
          }
        }
        pendingImageBuffer   = null;
        pendingImageFilename = null;
      }
    } catch { /* user cancelled picker */ }
  });
}

// Settings: change folder button
if (settingsChangeFolderBtn) {
  settingsChangeFolderBtn.addEventListener("click", async () => {
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      imageDirHandle = handle;
      await storeImageDirHandle(handle);
      updateSettingsImagesFolderName();
      showToast("Images folder updated.");
    } catch { /* user cancelled */ }
  });
}

// ─── Sprint 11 Pass 15: Screenshot capture ────────────────────
// Helper: data URL → ArrayBuffer (for disk storage)
function dataUrlToArrayBuffer(dataUrl) {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes  = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return buffer;
}

// Screenshot button: inject content script if needed, then enter screenshot mode
if (screenshotBtn) {
  screenshotBtn.addEventListener("click", async () => {
    if (!currentTabId) return;

    // If already active — cancel screenshot mode
    if (screenshotBtn.classList.contains("btn-screenshot--active")) {
      chrome.tabs.sendMessage(currentTabId, { type: "EXIT_SCREENSHOT_MODE" }).catch(() => {});
      screenshotBtn.classList.remove("btn-screenshot--active");
      screenshotBtn.textContent = "SCREENSHOT";
      return;
    }

    const tab = await chrome.tabs.get(currentTabId).catch(() => null);
    if (!tab) return;
    const url = tab.url || "";
    const isNormalPage = url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file://");
    if (!isNormalPage) return;

    let ready = false;
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: currentTabId },
        func: (extId) => window["__mkp_" + extId + "_ready"] === true,
        args: [chrome.runtime.id],
      });
      ready = results?.[0]?.result === true;
    } catch { ready = false; }

    if (!ready) {
      try {
        await chrome.scripting.executeScript({ target: { tabId: currentTabId }, files: ["content/content.js"] });
        await new Promise(r => setTimeout(r, 400));
      } catch { return; }
    }

    // Fix 1B: cancel active element selection when entering screenshot mode
    if (markupActive) {
      ignoreNextDeselect = true;
      chrome.tabs.sendMessage(currentTabId, { type: "MARKUP_DEACTIVATE" }).catch(() => {});
      markupActive = false;
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-pressed", "false");
        toggleBtn.classList.remove("toggle-btn--on");
      }
    }
    screenshotBtn.classList.add("btn-screenshot--active");
    screenshotBtn.textContent = "CANCEL";
    chrome.tabs.sendMessage(currentTabId, { type: "ENTER_SCREENSHOT_MODE" }).catch(() => {});
  });
}

// Fix 1B + Fix 2: Esc from sidebar panel exits screenshot mode or deactivates element selection
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!currentTabId) return;
  if (screenshotBtn && screenshotBtn.classList.contains("btn-screenshot--active")) {
    chrome.tabs.sendMessage(currentTabId, { type: "EXIT_SCREENSHOT_MODE" }).catch(() => {});
    screenshotBtn.classList.remove("btn-screenshot--active");
    screenshotBtn.textContent = "SCREENSHOT";
  } else if (markupActive) {
    chrome.tabs.sendMessage(currentTabId, { type: "MARKUP_DEACTIVATE" }).catch(() => {});
    markupActive = false;
    if (toggleBtn) toggleBtn.setAttribute("aria-pressed", "false");
    if (toggleBtn) toggleBtn.classList.remove("toggle-btn--on");
    if (escSelectHintEl) escSelectHintEl.hidden = true;
    selectorRow.hidden = true;
    updateClearSelectorVisibility();
  }
});

// Remove image preview × button
if (imagePreviewRemoveBtn) {
  imagePreviewRemoveBtn.addEventListener("click", () => {
    currentImagePath      = null;
    currentImageThumbnail = null;
    pendingImageBuffer    = null;
    pendingImageFilename  = null;
    hideImagePreview();
  });
}

// ─── Clear all ─────────────────────────────────────────────────
if (clearAllBtn) {
  clearAllBtn.addEventListener("click", () => {
    const n = notes.length;
    clearConfirmMsgEl.textContent = `Delete all ${n} note${n === 1 ? "" : "s"}?`;
    clearConfirmEl.hidden = false;
    clearAllBtn.hidden = true;
  });
}

clearConfirmYesBtn.addEventListener("click", async () => {
  await writeBackup();
  pushUndo("Clear all undone");
  notes = [];
  await persistNotes();
  clearConfirmEl.hidden = true;
  renderNotesList();
});

clearConfirmNoBtn.addEventListener("click", () => {
  clearConfirmEl.hidden = true;
  updateClearAllVisibility();
});

// ─── Note pending prompt ───────────────────────────────────────
notePendingSaveBtn.addEventListener("click", async () => {
  notePendingPrompt.hidden = true;
  const sel         = pendingElementSelector;
  const label       = pendingElementLabel;
  const parentCtx   = pendingParentContext;
  const elemRole    = pendingElementRole;
  pendingElementSelector = null;
  pendingElementLabel    = null;
  pendingParentContext   = null;
  pendingElementRole     = null;
  await flushSave();
  softReset();
  if (sel) {
    currentSelector      = sel;
    currentElementLabel  = label;
    currentParentContext = parentCtx;
    currentElementRole   = elemRole;
    currentNoteId        = null;
    if (locationInput && !locationInput.value.trim()) {
      locationInput.value = devMode ? (sel || "") : (label || "");
    }
    updateClearSelectorVisibility();
    noteInput.focus();
  }
});

notePendingDiscardBtn.addEventListener("click", () => {
  notePendingPrompt.hidden = true;
  const sel       = pendingElementSelector;
  const label     = pendingElementLabel;
  const parentCtx = pendingParentContext;
  const elemRole  = pendingElementRole;
  pendingElementSelector = null;
  pendingElementLabel    = null;
  pendingParentContext   = null;
  pendingElementRole     = null;
  noteInput.value = "";
  resetTypePicker();
  resetSeverityPicker();
  currentNoteId = null;
  if (sel) {
    currentSelector      = sel;
    currentElementLabel  = label;
    currentParentContext = parentCtx;
    currentElementRole   = elemRole;
    if (locationInput && !locationInput.value.trim()) {
      locationInput.value = devMode ? (sel || "") : (label || "");
    }
    updateClearSelectorVisibility();
    noteInput.focus();
  }
});

// ─── Brief panel ───────────────────────────────────────────────

// Sprint 9 (F1): Simple Mode brief — plain prose, no selectors, no emoji headers, chronological
// Pass 8: domain-wide — uses briefDomainGroups, grouped by URL if multi-page
function buildSimpleBriefText() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit",
  });
  const project = sessionTitle || tabTitle || "Unknown";

  const allBriefNotes = briefDomainGroups.flatMap((g) => g.notes);

  let domainName = currentNoteUrl;
  try { domainName = new URL(currentNoteUrl).hostname; } catch { /* */ }

  const lines = [
    `# ${getBriefTitle()}`,
    ``,
    `**Project:** ${project}`,
    `**Domain:** ${domainName}`,
    `**Date:** ${dateStr} at ${timeStr}`,
    `**Notes:** ${allBriefNotes.length}`,
    ``,
    `---`,
    ``,
  ];

  for (const group of briefDomainGroups) {
    const pathLabel = getBriefPathLabel(group.url);
    lines.push(`## ${pathLabel}`);
    lines.push(``);
    const sorted = [...group.notes].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    sorted.forEach((note, i) => {
      if (i > 0) lines.push(``);
      const label = note.location || note.elementLabel || null;
      if (label) lines.push(label);
      lines.push(note.text);
      if (note.imagePath) lines.push(`[image: ${note.imagePath}]`); // Sprint 11 Pass 10
    });
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }

  return lines.join("\n");
}

// Pass 8: domain-wide — uses briefDomainGroups, grouped by URL if multi-page
function buildBriefText() {
  // Sprint 9 (F1): delegate to simple brief in simple mode
  if (!devMode) return buildSimpleBriefText();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit",
  });

  const project = sessionTitle || tabTitle || "Unknown";
  const allBriefNotes = briefDomainGroups.flatMap((g) => g.notes);

  let domainName = currentNoteUrl;
  try { domainName = new URL(currentNoteUrl).hostname; } catch { /* */ }

  // Severity summary counts — domain-wide
  const sevCounts = {};
  for (const s of SEVERITY_ORDER) {
    sevCounts[s] = allBriefNotes.filter((n) => (n.severity || "medium") === s).length;
  }
  const sevSummary = SEVERITY_ORDER
    .map((s) => `${sevCounts[s]} ${SEVERITY_CONFIG[s].label}`)
    .join(" · ");

  const lines = [
    `# ${getBriefTitle()}`,
    ``,
    `**Project:** ${project}`,
    `**Domain:** ${domainName}`,
    `**Reviewed:** ${dateStr} at ${timeStr}`,
    `**Mode:** Self Review`,
    `**Total Issues:** ${allBriefNotes.length}`,
    `**Severity:** ${sevSummary}`,
    ``,
    `---`,
  ];

  function appendNotesGroup(notesArr, headingLevel) {
    const h = "#".repeat(headingLevel);
    function formatNoteEntry(note) {
      const typeCfg = TYPE_BRIEF[note.type] || TYPE_BRIEF.general;
      const sev     = note.severity || "medium";
      const sevCfg  = SEVERITY_CONFIG[sev];
      // Build chip line: [location | role | TYPE | SEVERITY]
      const chipParts = [];
      if (note.location) chipParts.push(note.location);
      else if (note.selector) chipParts.push(note.selector);
      if (note.elementRole) chipParts.push(note.elementRole);
      chipParts.push(typeCfg.label.toUpperCase());
      chipParts.push(sevCfg.label.toUpperCase());
      lines.push(`[${chipParts.join(" | ")}]`);
      // Technical ref: raw selector as secondary line when location field is used
      if (note.location && note.selector) lines.push(`Technical ref: \`${note.selector}\``);
      if (note.elementLabel) lines.push(`element: "${note.elementLabel}"`);
      if (note.parentContext) lines.push(`↳ inside [${note.parentContext}]`);
      lines.push(note.text);
      if (note.imagePath) lines.push(`[image: ${note.imagePath}]`); // Sprint 11 Pass 10
    }
    if (briefSortMode === "chronological") {
      lines.push(``);
      const sorted = [...notesArr].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      sorted.forEach((note, i) => {
        if (i > 0) lines.push(``);
        formatNoteEntry(note);
      });
      lines.push(``);
      lines.push(`---`);
    } else {
      for (const sev of SEVERITY_ORDER) {
        const sevNotes = notesArr.filter((n) => (n.severity || "medium") === sev);
        if (sevNotes.length === 0) continue;
        const cfg = SEVERITY_CONFIG[sev];
        lines.push(``);
        lines.push(`${h} ${cfg.emoji} ${cfg.label} (${sevNotes.length})`);
        const sorted = [...sevNotes].sort(
          (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
        );
        sorted.forEach((note, i) => {
          if (i > 0) lines.push(``);
          formatNoteEntry(note);
        });
        lines.push(``);
        lines.push(`---`);
      }
    }
  }

  for (const group of briefDomainGroups) {
    const pathLabel = getBriefPathLabel(group.url);
    lines.push(``);
    lines.push(`## ${pathLabel}`);
    appendNotesGroup(group.notes, 3);
  }

  return lines.join("\n");
}

// ─── Brief panel HTML renderer ─────────────────────────────────
// Renders a single note as a styled entry card (Dev Mode).
function renderBriefEntryHtml(note) {
  const sev = note.severity || "medium";
  const sevCfg = SEVERITY_CONFIG[sev];
  const typeCfg = TYPE_BRIEF[note.type] || TYPE_BRIEF.general;
  let html = `<div class="brief-entry-card">`;
  html += `<div class="brief-entry-chips">`;
  html += `<span class="brief-severity-chip brief-severity-chip--${escapeHtml(sev)}">${escapeHtml(sevCfg.label)}</span>`;
  html += `<span class="brief-type-chip">${escapeHtml(typeCfg.label)}</span>`;
  if (note.elementRole) {
    html += `<span class="brief-role-chip">${escapeHtml(note.elementRole)}</span>`;
  }
  html += `</div>`;
  if (note.location) {
    html += `<p class="brief-location-label">${escapeHtml(note.location)}</p>`;
    if (note.selector) {
      html += `<p class="brief-selector-ref">Technical ref: <code>${escapeHtml(note.selector)}</code></p>`;
    }
  } else if (note.selector) {
    html += `<code class="brief-selector-text">${escapeHtml(note.selector)}</code>`;
  }
  if (note.elementLabel) {
    html += `<p class="brief-element-label"><span class="brief-element-label__key">element:</span> &ldquo;${escapeHtml(note.elementLabel)}&rdquo;</p>`;
  }
  if (note.parentContext) {
    html += `<p class="brief-parent-context">↳ inside ${escapeHtml(note.parentContext)}</p>`;
  }
  html += `<p class="brief-note-body">${escapeHtml(note.text)}</p>`;
  if (note.imageThumbnail) { // Sprint 11 Pass 10
    html += `<img class="brief-note-image" src="${note.imageThumbnail}" alt="Screenshot" loading="lazy" />`;
  }
  html += `</div>`;
  return html;
}

// Builds styled HTML for the brief panel — Dev Mode.
// Pass 8: domain-wide — uses briefDomainGroups, grouped by URL if multi-page
function buildBriefPanelHtml() {
  if (!devMode) return buildSimpleBriefPanelHtml();

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const project = sessionTitle || tabTitle || "Unknown";

  const allBriefNotes = briefDomainGroups.flatMap((g) => g.notes);

  let domainName = currentNoteUrl;
  try { domainName = new URL(currentNoteUrl).hostname; } catch { /* */ }

  const sevCounts = {};
  for (const s of SEVERITY_ORDER) {
    sevCounts[s] = allBriefNotes.filter((n) => (n.severity || "medium") === s).length;
  }
  const sevSummary = SEVERITY_ORDER.map((s) => `${sevCounts[s]} ${SEVERITY_CONFIG[s].label}`).join(" · ");

  let html = `<h1>${escapeHtml(getBriefTitle())}</h1>`;
  html += `<p class="brief-meta-line"><strong>Project:</strong> <span class="brief-inline-edit" id="brief-edit-project" contenteditable="plaintext-only" spellcheck="false" data-placeholder="Session name">${escapeHtml(project)}</span></p>`;
  html += `<p class="brief-meta-line"><strong>Domain:</strong> <span class="brief-inline-edit" id="brief-edit-domain" contenteditable="plaintext-only" spellcheck="false" data-placeholder="Domain">${escapeHtml(domainName)}</span></p>`;
  html += `<p class="brief-meta-line"><strong>Reviewed:</strong> ${escapeHtml(dateStr)} at ${escapeHtml(timeStr)}</p>`;
  html += `<p class="brief-meta-line"><strong>Total Issues:</strong> ${allBriefNotes.length}</p>`;
  html += `<p class="brief-meta-line"><strong>Severity:</strong> ${escapeHtml(sevSummary)}</p>`;
  html += `<hr>`;

  function appendPanelGroup(notesArr) {
    if (briefSortMode === "chronological") {
      const sorted = [...notesArr].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      sorted.forEach((note) => { html += renderBriefEntryHtml(note); });
    } else {
      for (const sev of SEVERITY_ORDER) {
        const sevNotes = notesArr.filter((n) => (n.severity || "medium") === sev);
        if (sevNotes.length === 0) continue;
        const cfg = SEVERITY_CONFIG[sev];
        html += `<h3>${cfg.label} (${sevNotes.length})</h3>`;
        const sorted = [...sevNotes].sort(
          (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
        );
        sorted.forEach((note) => { html += renderBriefEntryHtml(note); });
      }
    }
  }

  for (const group of briefDomainGroups) {
    const pathLabel = getBriefPathLabel(group.url);
    html += `<h2 class="brief-url-header">${escapeHtml(pathLabel)}</h2>`;
    appendPanelGroup(group.notes);
    html += `<hr>`;
  }
  return html;
}

// Builds styled HTML for the brief panel — Simple Mode.
// Pass 8: domain-wide — uses briefDomainGroups, grouped by URL if multi-page
function buildSimpleBriefPanelHtml() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const project = sessionTitle || tabTitle || "Unknown";

  const allBriefNotes = briefDomainGroups.flatMap((g) => g.notes);

  let domainName = currentNoteUrl;
  try { domainName = new URL(currentNoteUrl).hostname; } catch { /* */ }

  let html = `<h1>${escapeHtml(getBriefTitle())}</h1>`;
  html += `<p class="brief-meta-line"><strong>Project:</strong> <span class="brief-inline-edit" id="brief-edit-project" contenteditable="plaintext-only" spellcheck="false" data-placeholder="Session name">${escapeHtml(project)}</span></p>`;
  html += `<p class="brief-meta-line"><strong>Domain:</strong> <span class="brief-inline-edit" id="brief-edit-domain" contenteditable="plaintext-only" spellcheck="false" data-placeholder="Domain">${escapeHtml(domainName)}</span></p>`;
  html += `<p class="brief-meta-line"><strong>Date:</strong> ${escapeHtml(dateStr)} at ${escapeHtml(timeStr)}</p>`;
  html += `<p class="brief-meta-line"><strong>Notes:</strong> ${allBriefNotes.length}</p>`;
  html += `<hr>`;

  function renderSimpleEntries(notesArr) {
    notesArr.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)).forEach((note) => {
      const label = note.location || note.elementLabel || null;
      html += `<div class="brief-simple-entry">`;
      if (label) {
        html += `<p class="brief-simple-location">${escapeHtml(label)}</p>`;
      }
      html += `<p class="brief-note-body">${escapeHtml(note.text)}</p>`;
      if (note.imageThumbnail) { // Sprint 11 Pass 10
        html += `<img class="brief-note-image" src="${note.imageThumbnail}" alt="Screenshot" loading="lazy" />`;
      }
      html += `</div>`;
    });
  }

  for (const group of briefDomainGroups) {
    const pathLabel = getBriefPathLabel(group.url);
    html += `<h2 class="brief-url-header">${escapeHtml(pathLabel)}</h2>`;
    renderSimpleEntries([...group.notes]);
    html += `<hr>`;
  }
  return html;
}

async function showBrief() {
  // Pass 8: collect domain-wide notes fresh at generation time
  briefDomainGroups = await collectDomainNotes();

  notesList.hidden = true;
  sessionTitleWrap.hidden = true;
  clearConfirmEl.hidden = true;
  formArea.hidden = true;
  filterTabsEl.hidden = true;
  markupActionsEl.hidden = true;
  toggleSectionEl.hidden = true;
  storageQuotaWarning.hidden = true;

  briefContent.hidden = true;
  briefGenerating.hidden = false;
  briefPanel.hidden = false;

  setTimeout(() => {
    const briefText = buildBriefText();
    currentBriefText = briefText;
    briefContent.innerHTML = buildBriefPanelHtml();
    briefGenerating.hidden = true;
    briefContent.hidden = false;
    saveBrief(briefText); // Sprint 11: fire-and-forget after render
  }, 400);
}

function hideBrief() {
  briefPanel.hidden = true;
  briefContent.hidden = false;
  briefGenerating.hidden = true;

  notesList.hidden = false;
  sessionTitleWrap.hidden = false;
  formArea.hidden = false;
  filterTabsEl.hidden = !devMode;
  markupActionsEl.hidden = false;
  toggleSectionEl.hidden = false;
  checkStorageQuota(); // restore quota warning if needed
}

generateBtn.addEventListener("click", () => {
  // Pass 8: check domain-wide total
  const domainTotal = notes.length + allNotes.length;
  if (domainTotal === 0) {
    showToast("No notes to generate a brief from.");
    return;
  }
  showBrief();
});

copyBriefBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(currentBriefText);
    copyBriefBtn.textContent = "Copied!";
    setTimeout(() => { copyBriefBtn.textContent = "Copy to Clipboard"; }, 2000);
  } catch {
    showToast("Copy failed — try again.");
  }
});

// ─── Download .zip — JSZip (Sprint 11 Pass 11) ────────────────
downloadZipBtn.addEventListener("click", async () => {
  const dateStr = new Date().toISOString().slice(0, 10);
  let domain = currentTabUrl;
  try { domain = new URL(currentTabUrl).hostname; } catch { /* use full url */ }
  const filename = `markup-brief-${domain}-${dateStr}`;

  function fallbackMd() {
    const blob = new Blob([currentBriefText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (typeof JSZip === "undefined") {
    console.warn("Markup: JSZip not loaded — falling back to .md download.");
    fallbackMd();
    return;
  }

  try {
    const zip = new JSZip();
    let md = currentBriefText;

    // Collect notes that have images
    const notesWithImages = briefDomainGroups.flatMap((g) => g.notes).filter((n) => n.imagePath);

    if (notesWithImages.length > 0 && imageDirHandle) {
      const ok = await ensureImageDirPermission();
      if (ok) {
        const imgFolder = zip.folder("images");
        for (const note of notesWithImages) {
          try {
            const fh   = await imageDirHandle.getFileHandle(note.imagePath);
            const file = await fh.getFile();
            const buf  = await file.arrayBuffer();
            imgFolder.file(note.imagePath, buf);
            // Replace plain-text image ref in markdown with relative path
            md = md.split(`[image: ${note.imagePath}]`).join(`![image](images/${note.imagePath})`);
          } catch { /* skip missing files */ }
        }
      }
    }

    zip.file("brief.md", md);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("ZIP exported.");
  } catch (err) {
    console.warn("Markup: ZIP generation failed", err);
    fallbackMd();
    showToast("ZIP failed — exported as .md.");
  }
});

// ─── generateHtmlReport — full HTML page for PDF rendering ───────
function generateHtmlReport() {
  // Use the currently rendered brief content (captures any inline edits)
  const content = document.getElementById("brief-content")?.innerHTML || buildBriefPanelHtml();

  // Resolve self-hosted font URLs for PDF
  const fontDmSans400    = chrome.runtime.getURL("fonts/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K6z9mXg.woff2");
  const fontPlayfair400i = chrome.runtime.getURL("fonts/nuFkD-vYSZviVYUb_rj3ij__anPXDTnogkk7yRZrPA.woff2");
  const fontDmMono400    = chrome.runtime.getURL("fonts/aFTU7PB1QTsUX8KYthqQBK6PYK0.woff2");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 400;
  src: url('${fontDmSans400}') format('woff2');
}
@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 600;
  src: url('${fontDmSans400}') format('woff2');
}
@font-face {
  font-family: 'Playfair Display';
  font-style: italic;
  font-weight: 400;
  src: url('${fontPlayfair400i}') format('woff2');
}
@font-face {
  font-family: 'DM Mono';
  font-style: normal;
  font-weight: 400;
  src: url('${fontDmMono400}') format('woff2');
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #0D0D0D;
  background: #FFFEF9;
  padding: 32px 40px;
}
.pdf-logotype {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-weight: 400;
  font-size: 22px;
  color: #c9a84c;
  margin-bottom: 24px;
  letter-spacing: 0.01em;
}
code, .brief-selector-ref, .brief-selector-ref code, .brief-selector-text, .brief-meta-line, .brief-url-header, .brief-severity-chip, .brief-type-chip, .brief-role-chip, .brief-parent-context, .brief-element-label__key {
  font-family: 'DM Mono', monospace;
}
h1 { font-size: 22px; font-weight: 700; color: #1A2744; margin-bottom: 12px; }
h2 { font-size: 13px; font-weight: 600; color: #2D4A8A; margin: 20px 0 6px; letter-spacing: 0.06em; text-transform: uppercase; font-family: monospace; }
h3 { font-size: 13px; font-weight: 600; color: #1A2744; margin: 16px 0 6px; }
hr { border: none; border-top: 1px solid rgba(201,168,76,0.3); margin: 12px 0; }
.brief-meta-line { font-size: 11px; color: #6B7A99; font-family: monospace; line-height: 1.8; }
.brief-url-header { font-family: monospace; font-size: 11px; font-weight: 600; color: #1A2744; text-transform: uppercase; letter-spacing: 0.06em; margin: 16px 0 4px; }
.brief-entry-card { margin: 8px 0; padding: 8px 0; border-bottom: 1px solid rgba(201,168,76,0.15); }
.brief-entry-chips { display: flex; align-items: center; gap: 4px; margin-bottom: 6px; flex-wrap: wrap; }
.brief-severity-chip { display: inline-flex; align-items: center; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
.brief-severity-chip--critical { background: #B91C1C; color: #fff; }
.brief-severity-chip--high     { background: #C2410C; color: #fff; }
.brief-severity-chip--medium   { background: #1A2744; color: #fff; }
.brief-severity-chip--low      { background: transparent; border: 1px solid #6B7A99; color: #6B7A99; }
.brief-type-chip { display: inline-flex; align-items: center; padding: 2px 6px; border: 1px solid rgba(201,168,76,0.3); border-radius: 3px; font-family: monospace; font-size: 10px; text-transform: uppercase; color: #6B7A99; }
.brief-role-chip { display: inline-flex; align-items: center; padding: 2px 6px; border: 1px solid rgba(107,122,153,0.3); border-radius: 3px; font-family: monospace; font-size: 10px; color: #9AA3B8; }
.brief-location-label { font-size: 13px; font-weight: 500; color: #0D0D0D; margin: 4px 0 2px; }
.brief-selector-ref { font-family: monospace; font-size: 11px; color: #6B7A99; margin: 1px 0 4px; }
.brief-selector-ref code { font-family: monospace; font-size: 11px; color: #6B7A99; }
.brief-selector-text { display: block; font-family: monospace; font-size: 11px; color: #6B7A99; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.brief-element-label { font-size: 11px; font-style: italic; color: #6B7A99; margin-bottom: 2px; }
.brief-element-label__key { font-style: normal; font-family: monospace; font-size: 10px; opacity: 0.6; margin-right: 2px; }
.brief-parent-context { font-family: monospace; font-size: 10px; color: #9AA3B8; margin-bottom: 4px; }
.brief-note-body { font-size: 13px; color: #0D0D0D; line-height: 1.5; margin-top: 4px; }
.brief-note-image { display: block; width: 85%; max-width: 85%; height: auto; margin-top: 12px; border-radius: 4px; border: 1px solid rgba(201,168,76,0.2); }
.brief-simple-entry { margin: 8px 0; padding: 8px 0; border-bottom: 1px solid rgba(201,168,76,0.15); }
.brief-simple-location { font-family: monospace; font-size: 11px; color: #6B7A99; margin-bottom: 4px; }
</style>
</head>
<body>
<div class="pdf-logotype">Markup</div>
${content}
<p style="font-family:'DM Mono',monospace;font-size:10px;color:#9AA3B8;margin-top:32px;">Generated by Markup · getmarkup.dev</p>
</body>
</html>`;
}

// ─── Export as PDF via html2canvas + jsPDF (Pass 20) ─────────────
downloadHtmlBtn.addEventListener("click", async () => {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast("PDF unavailable — try Export MD + Images instead");
    return;
  }
  if (!window.html2canvas) {
    showToast("PDF renderer not loaded — try Export MD + Images instead");
    return;
  }

  const allDomainNotes = briefDomainGroups.flatMap((g) => g.notes);
  if (allDomainNotes.length === 0) {
    showToast("No notes to export");
    return;
  }

  const html = generateHtmlReport();

  // Create hidden iframe to render the report at a wider width
  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, {
    position: "fixed",
    top: "-9999px",
    left: "-9999px",
    width: "900px",
    height: "1px",
    border: "none",
    visibility: "hidden",
  });
  document.body.appendChild(iframe);

  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  // Wait for images to load
  await new Promise((resolve) => {
    const imgs = iframe.contentDocument.querySelectorAll("img");
    if (!imgs.length) { resolve(); return; }
    let loaded = 0;
    const done = () => { if (++loaded === imgs.length) resolve(); };
    imgs.forEach((img) => {
      if (img.complete) done();
      else { img.onload = done; img.onerror = done; }
    });
    setTimeout(resolve, 3000); // fallback
  });

  // Adjust iframe height to full content
  const body = iframe.contentDocument.body;
  iframe.style.height = body.scrollHeight + "px";
  await new Promise((r) => setTimeout(r, 100)); // allow reflow

  try {
    const canvas = await window.html2canvas(body, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#FFFEF9",
      width: 900,
      windowWidth: 900,
    });

    document.body.removeChild(iframe);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const imgW = canvas.width;
    const imgH = canvas.height;
    const ratio = pageW / imgW;
    const scaledH = imgH * ratio;

    let yOffset = 0;
    let pagesAdded = 0;

    while (yOffset < scaledH) {
      if (pagesAdded > 0) doc.addPage();
      const srcY = yOffset / ratio;
      const srcH = Math.min(pageH / ratio, imgH - srcY);
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = imgW;
      pageCanvas.height = Math.ceil(srcH);
      const ctx = pageCanvas.getContext("2d");
      ctx.drawImage(canvas, 0, Math.floor(srcY), imgW, Math.ceil(srcH), 0, 0, imgW, Math.ceil(srcH));
      const imgData = pageCanvas.toDataURL("image/jpeg", 0.92);
      const sliceH = Math.ceil(srcH) * ratio;
      doc.addImage(imgData, "JPEG", 0, 0, pageW, sliceH);
      yOffset += pageH;
      pagesAdded++;
    }

    const briefDomain = document.getElementById("brief-edit-domain")?.textContent?.trim() || (() => {
      try { return new URL(currentNoteUrl).hostname; } catch { return "brief"; }
    })();
    const today = new Date().toISOString().split("T")[0];
    doc.save(`markup-brief-${briefDomain}-${today}.pdf`);

  } catch (err) {
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
    console.error("Markup: PDF export failed", err);
    showToast("PDF export failed — try Export MD + Images instead");
  }
});

closeBriefBtn.addEventListener("click", hideBrief);

// ─── Panel mutual exclusion ────────────────────────────────────
function closeAllOverlayPanels() {
  if (settingsPanel) settingsPanel.hidden = true;
  if (briefsArchivePanelEl) briefsArchivePanelEl.hidden = true;
}

// ─── Sprint 8 F10: Settings panel ─────────────────────────────
function showSettings() {
  closeAllOverlayPanels();
  notesList.hidden = true;
  sessionTitleWrap.hidden = true;
  filterTabsEl.hidden = true;
  clearConfirmEl.hidden = true;
  formArea.hidden = true;
  markupActionsEl.hidden = true;
  toggleSectionEl.hidden = true;
  storageQuotaWarning.hidden = true;
  settingsPanel.hidden = false;
  loadSettingsPanel();
}

function hideSettings() {
  settingsPanel.hidden = true;
  notesList.hidden = false;
  sessionTitleWrap.hidden = false;
  filterTabsEl.hidden = !devMode;
  formArea.hidden = false;
  markupActionsEl.hidden = false;
  toggleSectionEl.hidden = false;
  checkStorageQuota();
}

async function loadSettingsPanel() {
  // Version
  try {
    const manifest = chrome.runtime.getManifest();
    if (settingsVersionEl) settingsVersionEl.textContent = `getmarkup.dev · v${manifest.version}`;
  } catch { /* */ }

  // Storage usage
  try {
    const bytesUsed = await new Promise((resolve) =>
      chrome.storage.local.getBytesInUse(null, resolve)
    );
    const kb = Math.round(bytesUsed / 1024);
    const kbDecimal = (bytesUsed / 1024).toFixed(1);
    const pct = Math.min(100, (bytesUsed / (5 * 1024 * 1024)) * 100);
    if (storageUsageText) storageUsageText.textContent = `${kb} KB used of 5120 KB`;
    if (settingsFooterStorageEl) settingsFooterStorageEl.textContent = `Storage: ${kbDecimal} KB used`;
    if (storageUsageFill) {
      storageUsageFill.style.width = pct + "%";
      storageUsageFill.className = "storage-usage__fill" +
        (pct >= 96 ? " storage-usage__fill--critical" :
         pct >= 80 ? " storage-usage__fill--warn" : "");
    }
  } catch { /* */ }

  // Sprint 9 (F1): Sync developer mode toggle to current state
  if (devModeToggle) devModeToggle.checked = devMode;

  // Sprint 11 Pass 10: sync images folder name
  updateSettingsImagesFolderName();
}

settingsBtn.addEventListener("click", showSettings);
closeSettingsBtn.addEventListener("click", hideSettings);

// ─── Voice notes hint → settings highlight ─────────────────────
const voiceNotesLinkEl = document.getElementById("voice-notes-settings-link");
if (voiceNotesLinkEl) {
  voiceNotesLinkEl.addEventListener("click", (e) => {
    e.preventDefault();
    showSettings();
    setTimeout(() => {
      const voiceSection = document.querySelector(".settings-section--voice");
      if (!voiceSection) return;
      voiceSection.scrollIntoView({ behavior: "smooth", block: "center" });
      voiceSection.classList.add("settings-section--highlight");
      setTimeout(() => voiceSection.classList.remove("settings-section--highlight"), 2500);
    }, 150);
  });
}

// Sprint 9 (F1): Developer Mode toggle
if (devModeToggle) {
  devModeToggle.addEventListener("change", async (e) => {
    await setDevMode(e.target.checked);
    showToast(e.target.checked ? "Developer Mode on" : "Simple Mode on");
  });
}

// Mode chip click — directly toggle dev/simple mode
if (devBadgeEl) {
  devBadgeEl.addEventListener("click", async () => {
    const entering = !devMode;
    await setDevMode(entering);
    if (entering) {
      const shown = await safeGet("markup_dev_intro_shown", false);
      if (!shown) {
        await safeSet({ markup_dev_intro_shown: true });
        showDevModeToast();
      }
    }
  });
}

// Sprint 9 (F4): Reload button
if (reloadBtn) {
  reloadBtn.addEventListener("click", () => { window.location.reload(); });
}

// Brief sort pill toggle
function updateBriefSortDesc() {
  if (!briefSortDescEl) return;
  briefSortDescEl.textContent = briefSortMode === "chronological"
    ? "Notes in the order they were captured"
    : "Notes grouped Critical → High → Medium → Low";
}

briefSortBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    briefSortMode = btn.dataset.sort;
    chrome.storage.local.set({ markup_brief_sort: briefSortMode });
    briefSortBtns.forEach((b) => b.classList.toggle("brief-sort-btn--active", b.dataset.sort === briefSortMode));
    updateBriefSortDesc();
  });
});

// Briefs Archive
briefsArchiveBtn.addEventListener("click", showBriefsArchive);
closeBriefArchiveBtn.addEventListener("click", hideBriefsArchive);

// Brief Reader
closeBriefReaderBtn.addEventListener("click", hideBriefReader);

copyBriefReaderBtn.addEventListener("click", async () => {
  if (!briefReaderCurrentBrief) return;
  try {
    await navigator.clipboard.writeText(briefReaderCurrentBrief.markdown);
    copyBriefReaderBtn.textContent = "Copied!";
    setTimeout(() => { copyBriefReaderBtn.textContent = "Copy to Clipboard"; }, 2000);
  } catch {
    showToast("Copy failed — try again.");
  }
});

downloadBriefReaderBtn.addEventListener("click", () => {
  if (!briefReaderCurrentBrief) return;
  const dateStr = new Date(briefReaderCurrentBrief.timestamp).toISOString().slice(0, 10);
  const blob = new Blob([briefReaderCurrentBrief.markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `markup-brief-${dateStr}.md`;
  a.click();
  URL.revokeObjectURL(url);
});

// Settings: Clear all notes for this domain (domain-wide)
settingsClearAllBtn.addEventListener("click", async () => {
  if (settingsClearAllBtn.dataset.confirming) return;

  const allKeys = await new Promise((res) =>
    chrome.storage.local.get(null, (items) => res(Object.keys(items)))
  );
  let hostname = "";
  try { hostname = new URL(currentNoteUrl).hostname; } catch { /* */ }
  const domainKeys = allKeys.filter(
    (k) => k.startsWith("markup_notes_") && k.includes(hostname)
  );
  if (domainKeys.length === 0) {
    showToast("No notes to clear.");
    return;
  }

  const allItems = await new Promise((res) =>
    chrome.storage.local.get(domainKeys, res)
  );
  const totalCount = domainKeys.reduce(
    (sum, k) => sum + (allItems[k]?.length || 0), 0
  );

  const originalText = settingsClearAllBtn.textContent;
  settingsClearAllBtn.textContent = `CONFIRM — DELETE ${totalCount} NOTE${totalCount === 1 ? "" : "S"}`;
  settingsClearAllBtn.dataset.confirming = "true";

  const resetBtn = () => {
    settingsClearAllBtn.textContent = originalText;
    delete settingsClearAllBtn.dataset.confirming;
  };

  const onConfirm = async () => {
    await writeBackup();
    await new Promise((res) => chrome.storage.local.remove(domainKeys, res));
    notes = [];
    renderNotesList();
    showToast(`Cleared ${totalCount} note${totalCount === 1 ? "" : "s"} for ${hostname}.`);
    resetBtn();
    hideSettings();
  };

  settingsClearAllBtn.addEventListener("click", onConfirm, { once: true });

  setTimeout(() => {
    if (settingsClearAllBtn.dataset.confirming) {
      resetBtn();
      settingsClearAllBtn.removeEventListener("click", onConfirm);
    }
  }, 4000);
});

// Export JSON
exportJsonBtn.addEventListener("click", () => {
  const exportNotes = notes.map(({ imageThumbnail, ...rest }) => rest);
  const data = JSON.stringify(exportNotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `markup-notes-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Notes exported as JSON.");
});

// Export CSV
exportCsvBtn.addEventListener("click", () => {
  const headers = ["id", "url", "type", "severity", "selector", "elementLabel", "location", "parentContext", "text", "createdAt"];
  const rows = notes.map((n) =>
    [
      n.id,
      currentNoteUrl || "",
      n.type,
      n.severity || "medium",
      n.selector || "",
      n.elementLabel || "",
      n.location || "",
      n.parentContext || "",
      n.text,
      new Date(n.createdAt || 0).toISOString(),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `markup-notes-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Notes exported as CSV.");
});

// ─── Messages from content script and background ───────────────
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "TAB_URL_CHANGED") {
    setToggleState(false);
    noteInput.value = "";
    activationHint.hidden = true;
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (tab) await loadTabState(tab);
    });
    return;
  }

  if (message.type === "MARKUP_ACTIVATED") {
    markupEverActivated = true;
    activationHint.hidden = true;
    setToggleState(true);
  }

  if (message.type === "MARKUP_DEACTIVATED") {
    setToggleState(false);
  }

  if (message.type === "ELEMENT_HOVERED") {
    if (locationInput && !locationInput.value.trim()) {
      const previewValue = devMode
        ? (message.selector || "")
        : (message.elementLabel || message.selector || "");
      if (previewValue) {
        locationInput.value = previewValue;
        locationInput.classList.add("location-input--preview");
        locationHoverPreview = true;
      }
    }
  }

  if (message.type === "ELEMENT_HOVER_END") {
    if (locationInput && locationHoverPreview) {
      locationInput.value = "";
      locationInput.classList.remove("location-input--preview");
      locationHoverPreview = false;
    }
  }

  if (message.type === "ELEMENT_SELECTED") {
    // Clear hover preview — user confirmed an element
    locationHoverPreview = false;
    if (locationInput) locationInput.classList.remove("location-input--preview");

    if (noteInput.value.trim() && !currentNoteId && !isEditing) {
      pendingElementSelector = message.selector;
      pendingElementLabel    = message.elementLabel  || null;
      pendingParentContext   = message.parentContext  || null;
      pendingElementRole     = message.elementRole   || null;
      notePendingPrompt.hidden = false;
      return;
    }
    // Update selector only — no auto-save, preserve unsaved text and edit state
    currentSelector      = message.selector;
    currentElementLabel  = message.elementLabel  || null;
    currentParentContext = message.parentContext  || null;
    currentElementRole   = message.elementRole   || null;
    // Pre-populate location field: dev mode shows selector, simple mode shows label
    if (locationInput && !locationInput.value.trim()) {
      locationInput.value = devMode ? (currentSelector || "") : (currentElementLabel || "");
    }
    // Do NOT clear noteInput — preserve any unsaved text
    // Do NOT reset isEditing or currentNoteId — preserve edit mode state
    updateClearSelectorVisibility();
    // Defer focus — chrome.runtime.onMessage handlers don't let .focus() land synchronously
    setTimeout(() => noteInput.focus(), 50);
  }

  if (message.type === "ELEMENT_DESELECTED") {
    if (ignoreNextDeselect) {
      ignoreNextDeselect = false;
      return;
    }
    // Clear selector only — no auto-save, preserve noteInput, type/severity pickers, and edit state.
    currentSelector      = null;
    currentElementLabel  = null;
    currentParentContext = null;
    currentElementRole   = null;
    updateClearSelectorVisibility();
  }

  // Sprint 10: Floating note input — submitted from in-page overlay
  if (message.type === "FLOATING_NOTE_SUBMIT") {
    (async () => {
      noteInput.value = message.text || "";
      await flushSave();
      softReset();
    })();
  }
  // FLOATING_NOTE_CANCEL: no-op — sidebar state is untouched

  // Sprint 9 (F4): iframe detection notice
  if (message.type === "IFRAME_DETECTED") {
    if (!iframeNoticeDismissed && iframeNoticeEl) {
      iframeNoticeEl.hidden = false;
      setTimeout(() => {
        iframeNoticeEl.hidden = true;
        iframeNoticeDismissed = true;
      }, 6000);
    }
  }

  // Sprint 8 F6: badge click → scroll to + flash note card
  if (message.type === "BADGE_HOVERED" || message.type === "BADGE_CLICKED") {
    const card = document.querySelector(`.note-card[data-note-id="${message.noteId}"]`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
      card.classList.add("note-card--highlighted");
      setTimeout(() => card.classList.remove("note-card--highlighted"), 1200);
    }
  }

  // Reset screenshot button when mode exits (cancel or region captured)
  if (message.type === "SCREENSHOT_MODE_EXITED" || message.type === "SCREENSHOT_REGION_SELECTED") {
    if (screenshotBtn) {
      screenshotBtn.classList.remove("btn-screenshot--active");
      screenshotBtn.textContent = "SCREENSHOT";
    }
  }

  // Sprint 11 Pass 15: screenshot region selected — capture viewport, crop, store as image
  if (message.type === "SCREENSHOT_REGION_SELECTED") {
    const { rect } = message;
    (async () => {
      try {
        const response = await new Promise((resolve) => {
          chrome.runtime.sendMessage({ type: "CAPTURE_SCREENSHOT" }, (r) => resolve(r));
        });
        if (!response?.dataUrl) { showToast("Screenshot capture failed."); return; }

        // Crop to rect using canvas; rect is in CSS pixels, captureVisibleTab is at native resolution
        const dpr = rect.dpr || 1;
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          canvas.width  = Math.round(rect.width  * dpr);
          canvas.height = Math.round(rect.height * dpr);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(
            img,
            Math.round(rect.x * dpr), Math.round(rect.y * dpr),
            Math.round(rect.width * dpr), Math.round(rect.height * dpr),
            0, 0,
            Math.round(rect.width * dpr), Math.round(rect.height * dpr)
          );
          const dataUrl = canvas.toDataURL("image/png");

          let hostname = "markup";
          try { hostname = new URL(currentNoteUrl).hostname.replace(/[^a-z0-9-]/gi, "-") || "markup"; } catch { /* */ }
          const filename = `markup-${hostname}-${Date.now()}.png`;

          currentImageThumbnail = await downscaleThumbnail(dataUrl);

          if (!imageDirHandle) {
            pendingImageBuffer   = dataUrlToArrayBuffer(dataUrl);
            pendingImageFilename = filename;
            if (imageFolderBannerEl) imageFolderBannerEl.hidden = false;
          } else {
            const ok = await ensureImageDirPermission();
            if (ok) {
              try {
                await saveImageToFolder(imageDirHandle, filename, dataUrlToArrayBuffer(dataUrl));
                currentImagePath = filename;
              } catch (err) {
                console.error("Markup: screenshot save failed", err);
              }
            }
          }

          showImagePreview(dataUrl);
          setTimeout(() => noteInput.focus(), 50);
        };
        img.src = response.dataUrl;
      } catch (err) {
        console.error("Markup: screenshot error", err);
        showToast("Screenshot failed.");
      }
    })();
  }
});

// ─── Tab state loader ──────────────────────────────────────────
async function loadTabState(tab) {
  currentTabId   = tab?.id    || null;
  tabTitle       = tab?.title || "";
  currentTabUrl  = tab?.url   || "";
  currentNoteUrl = currentTabUrl ? normalizeUrl(currentTabUrl) : "";

  if (currentNoteUrl) {
    notes = await loadNotes();
    allNotes = await loadAllDomainNotes(currentTabUrl); // Pass 7: scan same-hostname keys
    const stored = await loadSessionTitle();
    sessionTitle = stored !== null ? stored : tabTitle;
    sessionTitleInput.value = sessionTitle;
    if (viewingUrlText) {
      let domain = currentNoteUrl;
      try { domain = new URL(currentNoteUrl).hostname; } catch { /* use full url */ }
      viewingUrlText.textContent = `Viewing notes for ${domain}`;
    }
  } else {
    notes = [];
    sessionTitle = "";
    sessionTitleInput.value = "";
    if (viewingUrlText) viewingUrlText.textContent = "";
  }
  renderNotesList();
  updateBadge(); // Sprint 8 F2: sync badge on tab load

  if (currentTabId) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: currentTabId },
        func: (extId) => window["__mkp_" + extId + "_active"] === true,
        args: [chrome.runtime.id],
      });
      if (results?.[0]?.result === true) {
        markupEverActivated = true;
        setToggleState(true);
      }
    } catch {
      // Restricted page — stay OFF
    }
  }

  const url = currentTabUrl;
  const isRestricted =
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("about:") ||
    url.startsWith("edge://");
  if (isRestricted && !markupActive) {
    activationHint.textContent = "Markup can't run on this page.";
    activationHint.hidden = false;
  }
}

// ─── Init ──────────────────────────────────────────────────────
async function init() {
  // Version footer
  try {
    const manifest = chrome.runtime.getManifest();
    document.getElementById("version-text").textContent = `getmarkup.dev · v${manifest.version}`;
  } catch { /* not critical */ }

  // Sprint 9 (F1): Load dev mode before rendering anything
  await loadDevMode();

  // Sprint 11 Pass 10: load image folder handle from IndexedDB
  await loadImageDirHandle();

  // Sprint 10: Show onboarding card for new Simple Mode installs
  await showOnboardingCardIfNeeded();

  // Load brief sort setting — sync pill toggle
  try {
    const stored = await safeGet("markup_brief_sort", "severity");
    briefSortMode = stored;
    briefSortBtns.forEach((b) => b.classList.toggle("brief-sort-btn--active", b.dataset.sort === briefSortMode));
    updateBriefSortDesc();
  } catch { /* */ }

  // Sprint 8 F7: start timestamp refresh interval
  if (timestampInterval) clearInterval(timestampInterval);
  timestampInterval = setInterval(refreshTimestamps, 60000);

  const tabs = await new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, resolve);
  });
  const tab = tabs[0];
  currentWindowId = tab?.windowId || null;

  try {
    await loadTabState(tab);
  } catch (err) {
    // Sprint 8 F9: init failure fallback
    console.error("Markup: init failed", err);
    emptyState.innerHTML = `
      <p class="empty-state__text">Markup failed to load.</p>
      <button class="btn-activate" id="reload-markup">Reload</button>
    `;
    document.getElementById("reload-markup")?.addEventListener("click", () => {
      window.location.reload();
    });
  }
}

// ─── Tab switch listener ───────────────────────────────────────
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (currentWindowId && activeInfo.windowId !== currentWindowId) return;

  pendingElementSelector = null;
  pendingElementLabel    = null;
  pendingParentContext   = null;
  pendingElementRole     = null;
  notePendingPrompt.hidden = true;
  ignoreNextDeselect = false;

  setToggleState(false);
  noteInput.value = "";
  activationHint.hidden = true;

  const tab = await new Promise((resolve) => chrome.tabs.get(activeInfo.tabId, resolve));
  await loadTabState(tab);
});

init();
