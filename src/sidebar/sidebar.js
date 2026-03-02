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
const QUOTA_WARN_BYTES  = 4 * 1024 * 1024;   // 4 MB — show amber warning

// ─── State ─────────────────────────────────────────────────────
let currentSelector       = null;
let currentElementLabel   = null; // Sprint 8 F5: human-readable label
let currentNoteId         = null;
let notes                 = [];
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
let briefSortMode         = "severity"; // "severity" | "chronological" — persisted
let briefMode             = "self-review"; // "self-review" | "user-interview" — session
let timestampInterval     = null; // Sprint 8 F7: interval for updating relative times

// ─── DOM refs ──────────────────────────────────────────────────
const toggleBtn          = document.getElementById("markup-toggle");
const activationHint     = document.getElementById("activation-hint");
const closeBtn           = document.getElementById("close-btn");
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
const copyBriefBtn       = document.getElementById("copy-brief");
const downloadBriefBtn   = document.getElementById("download-brief");
const closeBriefBtn      = document.getElementById("close-brief");
const briefHistoryDetails = document.getElementById("brief-history-details");
const briefHistorySummary = document.getElementById("brief-history-summary");
const briefHistoryItems  = document.getElementById("brief-history-items");
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
const exportJsonBtn      = document.getElementById("export-json");
const exportCsvBtn       = document.getElementById("export-csv");
const modeSelfBtn        = document.getElementById("mode-self");
const modeInterviewBtn   = document.getElementById("mode-interview");
const briefSortRadios    = document.querySelectorAll("input[name='brief-sort']");

// Bug 5: hide selector row at startup — only shown when Markup is ON
selectorRow.hidden = true;

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

// ─── Toggle state ──────────────────────────────────────────────
function setToggleState(active) {
  markupActive = active;
  if (active) {
    toggleBtn.textContent = "Elements ON";
    toggleBtn.classList.add("toggle-btn--on");
    toggleBtn.setAttribute("aria-pressed", "true");
    selectorRow.hidden = false;
    if (!currentSelector) {
      selectorDisplay.textContent = "Hover to preview element";
    }
  } else {
    toggleBtn.textContent = "Elements OFF";
    toggleBtn.classList.remove("toggle-btn--on");
    toggleBtn.setAttribute("aria-pressed", "false");
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
      func: () => window.__markupReady === true,
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
  chrome.tabs.sendMessage(tab.id, { type: msgType });
}

toggleBtn.addEventListener("click", sendToggle);

// ─── Close button ──────────────────────────────────────────────
closeBtn.addEventListener("click", () => {
  if (markupActive && currentTabId) {
    try { chrome.tabs.sendMessage(currentTabId, { type: "MARKUP_DEACTIVATE" }); }
    catch { /* tab may already be gone */ }
  }
  window.close();
});

// ─── Empty state ───────────────────────────────────────────────
function updateEmptyState() {
  emptyState.innerHTML = "";
  if (notes.length > 0) {
    emptyState.style.display = "none";
    return;
  }
  emptyState.style.display = "";

  if (!markupActive) {
    const heading = document.createElement("p");
    heading.className = "empty-state__heading";
    heading.textContent = "Ready to annotate?";
    const text = document.createElement("p");
    text.className = "empty-state__text";
    text.textContent = "Turn Markup on to start selecting elements.";
    const btn = document.createElement("button");
    btn.className = "btn-activate";
    btn.textContent = "Turn Markup On";
    btn.addEventListener("click", sendToggle);
    emptyState.append(heading, text, btn);
  } else {
    const text = document.createElement("p");
    text.className = "empty-state__text";
    text.textContent = "Click any element to annotate, or save a general note about this page.";
    emptyState.append(text);
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
    filterTabEls.forEach((t) => t.classList.toggle("filter-tab--active", t.dataset.filter === activeFilter));
    renderNotesList();
  });
});

// ─── Mode selector (Sprint 8 F11) ─────────────────────────────
[modeSelfBtn, modeInterviewBtn].forEach((btn) => {
  btn.addEventListener("click", () => {
    briefMode = btn.dataset.mode;
    modeSelfBtn.classList.toggle("mode-btn--active", briefMode === "self-review");
    modeInterviewBtn.classList.toggle("mode-btn--active", briefMode === "user-interview");
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
    .replace(/"/g, "&quot;");
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
  clearAllBtn.hidden = notes.length === 0;
}

// ─── Storage — notes ──────────────────────────────────────────
function loadNotes() {
  const key = `markup_notes_${currentNoteUrl}`;
  return safeGet(key, []);
}

async function persistAllNotes() {
  if (!currentNoteUrl) return;
  const allKey = "markup_all_notes";
  const existing = await safeGet(allKey, []);
  const otherNotes = existing.filter((n) => n.url !== currentNoteUrl);
  await safeSet({ [allKey]: [...otherNotes, ...notes] });
}

async function persistNotes() {
  if (!currentNoteUrl) return;
  const key = `markup_notes_${currentNoteUrl}`;
  await safeSet({ [key]: notes });
  persistAllNotes(); // fire-and-forget
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

// ─── Sprint 8 F1: Brief history storage ───────────────────────
// Saves last 10 generated briefs per URL with severity summary for each.
function loadBriefs() {
  const key = `markup_briefs_${currentNoteUrl}`;
  return safeGet(key, []);
}

async function saveBrief(markdown) {
  if (!currentNoteUrl) return;
  const key = `markup_briefs_${currentNoteUrl}`;
  const existing = await loadBriefs();

  // Build severity summary string: "2 Critical · 1 High"
  const sevSummary = SEVERITY_ORDER
    .map((s) => ({ s, n: notes.filter((n) => (n.severity || "medium") === s).length }))
    .filter(({ n }) => n > 0)
    .map(({ s, n }) => `${n} ${SEVERITY_CONFIG[s].label}`)
    .join(" · ") || null;

  const entry = {
    id: generateId(),
    timestamp: Date.now(),
    noteCount: notes.length,
    sevSummary,
    markdown,
  };
  const updated = [...existing, entry].slice(-10);
  await safeSet({ [key]: updated });
  await renderBriefHistory(); // update the collapsible list
}

async function deleteBriefEntry(id) {
  const key = `markup_briefs_${currentNoteUrl}`;
  const existing = await loadBriefs();
  const updated = existing.filter((b) => b.id !== id);
  await safeSet({ [key]: updated });
  await renderBriefHistory();
}

async function renderBriefHistory() {
  if (!briefHistoryItems) return;
  briefHistoryItems.innerHTML = "";

  const briefs = await loadBriefs();

  // Update summary label
  if (briefHistorySummary) {
    briefHistorySummary.textContent = briefs.length > 0
      ? `Past Briefs (${briefs.length})`
      : "Past Briefs";
  }

  if (briefs.length === 0) {
    const empty = document.createElement("p");
    empty.className = "brief-history-empty";
    empty.textContent = "No past briefs for this page yet.";
    briefHistoryItems.appendChild(empty);
    return;
  }

  // Newest first
  [...briefs].reverse().forEach((brief) => {
    const item = document.createElement("div");
    item.className = "brief-history-item";

    const dateStr = new Date(brief.timestamp).toLocaleString("en-US", {
      month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
    });
    const countStr = `${brief.noteCount} note${brief.noteCount === 1 ? "" : "s"}`;
    const sevStr = brief.sevSummary ? ` · ${brief.sevSummary}` : "";

    item.innerHTML = `
      <div class="brief-history-item__meta">
        <span class="brief-history-item__date">${escapeHtml(dateStr)}</span>
        <span class="brief-history-item__counts">${escapeHtml(countStr + sevStr)}</span>
      </div>
      <div class="brief-history-item__actions">
        <button class="btn-history-view">View</button>
        <button class="btn-history-delete" aria-label="Delete this brief">🗑</button>
      </div>
    `;

    item.querySelector(".btn-history-view").addEventListener("click", () => {
      briefContent.textContent = brief.markdown;
      showToast("Brief restored.");
    });

    item.querySelector(".btn-history-delete").addEventListener("click", async () => {
      await deleteBriefEntry(brief.id);
      showToast("Brief deleted.");
    });

    briefHistoryItems.appendChild(item);
  });
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
function updateFilterTabCounts() {
  const counts = {
    all:      notes.length,
    critical: notes.filter((n) => (n.severity || "medium") === "critical").length,
    high:     notes.filter((n) => (n.severity || "medium") === "high").length,
    medium:   notes.filter((n) => (n.severity || "medium") === "medium").length,
    low:      notes.filter((n) => (n.severity || "medium") === "low").length,
  };
  filterTabEls.forEach((tab) => {
    const f = tab.dataset.filter;
    const n = counts[f] ?? 0;
    let span = tab.querySelector(".filter-tab__count");
    if (!span) {
      span = document.createElement("span");
      span.className = "filter-tab__count";
      tab.appendChild(span);
    }
    span.textContent = `(${n})`;
    span.classList.toggle("filter-tab__count--nonzero", n > 0);
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
  notesList.querySelectorAll(".note-card").forEach((c) => c.remove());

  const count = notes.length;
  noteCountEl.textContent = count === 1 ? "1 note" : `${count} notes`;

  generateBtn.disabled = count === 0;
  generateBtn.setAttribute("aria-disabled", count === 0 ? "true" : "false");

  updateFilterTabCounts();
  updateEmptyState();
  updateClearAllVisibility();
  sendNotesToContentScript(); // Sprint 8 F6: update in-page badges

  const visible = activeFilter === "all"
    ? notes
    : notes.filter((n) => (n.severity || "medium") === activeFilter);

  visible.forEach((note) => {
    notesList.appendChild(createNoteCard(note));
  });
}

function createNoteCard(note) {
  const config = TYPE_CONFIG[note.type] || TYPE_CONFIG.general;
  const severity = note.severity || "medium";
  const sevConfig = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium;
  const card = document.createElement("div");
  card.className = "note-card";
  card.dataset.noteId = note.id;

  let locationChip = "";
  if (note.selector) {
    locationChip = `<code class="selector-chip">${escapeHtml(note.selector)}</code>`;
  } else if (note.type === "general") {
    locationChip = `<span class="general-note-label">General note</span>`;
  }

  // Sprint 8 F5: element label row
  const labelChip = note.elementLabel
    ? `<span class="note-element-label">${escapeHtml(note.elementLabel)}</span>`
    : "";

  // Sprint 8 F7: relative timestamp
  const tsStr = getRelativeTime(note.createdAt);
  const tsHtml = note.createdAt
    ? `<span class="note-card__timestamp" data-ts="${note.createdAt}">${escapeHtml(tsStr)}</span>`
    : "";

  card.innerHTML = `
    <div class="note-card__header">
      <div class="note-card__tags">
        <span class="note-type-tag note-type-tag--${escapeHtml(note.type)}">${config.label}</span>
        <span class="note-severity-badge note-severity-badge--${escapeHtml(severity)}">${sevConfig.label}</span>
      </div>
      <div class="note-card__meta-right">
        ${tsHtml}
        <div class="note-card__actions">
          <button class="icon-btn edit-btn" aria-label="Edit note">Edit</button>
          <button class="icon-btn delete-btn" aria-label="Delete note">✕</button>
        </div>
      </div>
    </div>
    ${locationChip}
    ${labelChip}
    <p class="note-card__text">${escapeHtml(note.text)}</p>
  `;

  card.querySelector(".edit-btn").addEventListener("click", () => { enterEditMode(note); });
  card.querySelector(".delete-btn").addEventListener("click", () => { deleteNote(note.id); });

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

// ─── Save ──────────────────────────────────────────────────────
async function flushSave() {
  const text = noteInput.value.trim();
  if (!text) return;

  checkStorageQuota(); // Sprint 8 F4: update warning strip (non-blocking)

  const type     = getActiveType();
  const severity = getActiveSeverity();

  if (currentNoteId) {
    const idx = notes.findIndex((n) => n.id === currentNoteId);
    if (idx >= 0) {
      pushUndo("Edit undone");
      notes[idx] = {
        ...notes[idx],
        type,
        severity,
        text,
        selector: currentSelector,
        elementLabel: currentSelector ? (currentElementLabel || notes[idx].elementLabel) : null,
        elementName: currentSelector ? null : "General note",
      };
    }
  } else {
    const note = {
      id: generateId(),
      url: currentNoteUrl,
      selector: currentSelector,
      elementLabel: currentSelector ? currentElementLabel : null, // Sprint 8 F5
      elementName: currentSelector ? null : "General note",
      type,
      severity,
      text,
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
  currentNoteId       = null;
  isEditing           = false;
  editPrevSelector    = null;
  noteInput.value     = "";
  selectorRow.hidden  = true;
  selectorDisplay.textContent = "";
  saveBtn.textContent = "Save Note";
  resetTypePicker();
  resetSeverityPicker();
  updateClearSelectorVisibility();
}

function deactivateReset() {
  currentSelector     = null;
  currentElementLabel = null;
  currentNoteId       = null;
  isEditing           = false;
  editPrevSelector    = null;
  selectorRow.hidden  = true;
  selectorDisplay.textContent = "";
  saveBtn.textContent = "Save Note";
  resetTypePicker();
  resetSeverityPicker();
  updateClearSelectorVisibility();
}

function softReset() {
  currentNoteId       = null;
  currentElementLabel = null;
  noteInput.value     = "";
  resetTypePicker();
  resetSeverityPicker();
  noteInput.focus();
}

// ─── Edit mode ─────────────────────────────────────────────────
function enterEditMode(note) {
  isEditing        = true;
  editPrevSelector = currentSelector;
  currentNoteId    = note.id;
  currentSelector  = note.selector;
  currentElementLabel = note.elementLabel || null;
  noteInput.value  = note.text;
  setTypePicker(note.type);
  setSeverityPicker(note.severity || "medium");
  selectorRow.hidden = false;
  selectorDisplay.textContent = note.selector || "Hover to preview element";
  saveBtn.textContent = "Update Note";
  updateClearSelectorVisibility();
  noteInput.focus();
}

function exitEditMode() {
  isEditing        = false;
  currentNoteId    = null;
  currentSelector  = editPrevSelector;
  currentElementLabel = null;
  editPrevSelector = null;
  noteInput.value  = "";
  resetTypePicker();
  resetSeverityPicker();
  saveBtn.textContent = "Save Note";
  selectorDisplay.textContent = currentSelector || "Hover to preview element";
  updateClearSelectorVisibility();
}

// ─── Delete note ───────────────────────────────────────────────
async function deleteNote(id) {
  pushUndo("Note restored");
  notes = notes.filter((n) => n.id !== id);
  await persistNotes();
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
  currentSelector = null;
  currentElementLabel = null;
  selectorDisplay.textContent = "Hover to preview element";
  updateClearSelectorVisibility();
});

// ─── Clear all ─────────────────────────────────────────────────
clearAllBtn.addEventListener("click", () => {
  const n = notes.length;
  clearConfirmMsgEl.textContent = `Delete all ${n} note${n === 1 ? "" : "s"}?`;
  clearConfirmEl.hidden = false;
  clearAllBtn.hidden = true;
});

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
  const sel = pendingElementSelector;
  pendingElementSelector = null;
  await flushSave();
  softReset();
  if (sel) {
    currentSelector = sel;
    currentNoteId   = null;
    selectorRow.hidden = false;
    selectorDisplay.textContent = sel;
    updateClearSelectorVisibility();
    noteInput.focus();
  }
});

notePendingDiscardBtn.addEventListener("click", () => {
  notePendingPrompt.hidden = true;
  const sel = pendingElementSelector;
  pendingElementSelector = null;
  noteInput.value = "";
  resetTypePicker();
  resetSeverityPicker();
  currentNoteId = null;
  if (sel) {
    currentSelector = sel;
    selectorRow.hidden = false;
    selectorDisplay.textContent = sel;
    updateClearSelectorVisibility();
    noteInput.focus();
  }
});

// ─── Brief panel ───────────────────────────────────────────────
function buildBriefText() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit",
  });

  const project = sessionTitle || tabTitle || "Unknown";

  // Severity summary counts
  const sevCounts = {};
  for (const s of SEVERITY_ORDER) {
    sevCounts[s] = notes.filter((n) => (n.severity || "medium") === s).length;
  }
  const sevSummary = SEVERITY_ORDER
    .map((s) => `${sevCounts[s]} ${SEVERITY_CONFIG[s].label}`)
    .join(" · ");

  // Sprint 8 F11: mode-aware copy
  const isUserInterview = briefMode === "user-interview";
  const modeLabel    = isUserInterview ? "User Interview"  : "Self Review";

  const lines = [
    `# Markup — Fix Instructions`,
    ``,
    `**Project:** ${project}`,
    `**URL:** ${currentTabUrl || "Unknown"}`,
    `**Reviewed:** ${dateStr} at ${timeStr}`,
    `**Mode:** ${modeLabel}`,
    `**Total Issues:** ${notes.length}`,
    `**Severity:** ${sevSummary}`,
    ``,
    `---`,
  ];

  // Sprint 8 F10 setting: severity-grouped (default) or chronological
  if (briefSortMode === "chronological") {
    lines.push(``);
    const sorted = [...notes].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    sorted.forEach((note, i) => {
      if (i > 0) lines.push(``);
      const typeCfg = TYPE_BRIEF[note.type] || TYPE_BRIEF.general;
      const sev     = note.severity || "medium";
      const sevCfg  = SEVERITY_CONFIG[sev];
      const label   = note.elementLabel || note.elementName || note.selector || "No element selected";
      lines.push(`**[${typeCfg.label} · ${sevCfg.label}]** ${label}`);
      if (note.selector) lines.push(`**Selector:** ${note.selector}`);
      lines.push(`**${typeCfg.field}:** ${note.text}`);
    });
    lines.push(``);
    lines.push(`---`);
  } else {
    // Severity-grouped (default)
    for (const sev of SEVERITY_ORDER) {
      const sevNotes = notes.filter((n) => (n.severity || "medium") === sev);
      if (sevNotes.length === 0) continue;

      const cfg = SEVERITY_CONFIG[sev];
      lines.push(``);
      lines.push(`## ${cfg.emoji} ${cfg.label} (${sevNotes.length})`);

      const sorted = [...sevNotes].sort(
        (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
      );

      sorted.forEach((note, i) => {
        if (i > 0) lines.push(``);
        const typeCfg = TYPE_BRIEF[note.type] || TYPE_BRIEF.general;
        // Sprint 8 F5: use elementLabel if available
        const label = note.elementLabel || note.elementName || note.selector || "No element selected";
        lines.push(`**[${typeCfg.label}]** ${label}`);
        if (note.selector) lines.push(`**Selector:** ${note.selector}`);
        lines.push(`**${typeCfg.field}:** ${note.text}`);
      });

      lines.push(``);
      lines.push(`---`);
    }
  }

  return lines.join("\n");
}

function showBrief() {
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

  setTimeout(async () => {
    const briefText = buildBriefText();
    briefContent.textContent = briefText;
    briefGenerating.hidden = true;
    briefContent.hidden = false;
    await saveBrief(briefText); // Sprint 8 F1: persist to history
  }, 400);
}

function hideBrief() {
  briefPanel.hidden = true;
  briefContent.hidden = false;
  briefGenerating.hidden = true;
  // Reset brief history collapsible
  if (briefHistoryDetails) briefHistoryDetails.open = false;

  notesList.hidden = false;
  sessionTitleWrap.hidden = false;
  formArea.hidden = false;
  filterTabsEl.hidden = false;
  markupActionsEl.hidden = false;
  toggleSectionEl.hidden = false;
  checkStorageQuota(); // restore quota warning if needed
}

generateBtn.addEventListener("click", () => {
  if (notes.length === 0) {
    showToast("No notes to generate a brief from.");
    return;
  }
  showBrief();
});

copyBriefBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(briefContent.textContent);
    copyBriefBtn.textContent = "Copied!";
    setTimeout(() => { copyBriefBtn.textContent = "Copy to Clipboard"; }, 2000);
  } catch {
    showToast("Copy failed — try again.");
  }
});

downloadBriefBtn.addEventListener("click", () => {
  const text = briefContent.textContent;
  const dateStr = new Date().toISOString().slice(0, 10);
  const blob = new Blob([text], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `markup-brief-${dateStr}.md`;
  a.click();
  URL.revokeObjectURL(url);
});

closeBriefBtn.addEventListener("click", hideBrief);

// ─── Sprint 8 F10: Settings panel ─────────────────────────────
function showSettings() {
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
  filterTabsEl.hidden = false;
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
    const pct = Math.min(100, (bytesUsed / (5 * 1024 * 1024)) * 100);
    if (storageUsageText) storageUsageText.textContent = `${kb} KB used of 5120 KB`;
    if (storageUsageFill) {
      storageUsageFill.style.width = pct + "%";
      storageUsageFill.className = "storage-usage__fill" +
        (pct >= 96 ? " storage-usage__fill--critical" :
         pct >= 80 ? " storage-usage__fill--warn" : "");
    }
  } catch { /* */ }

  // Brief sort radios — sync to current state
  briefSortRadios.forEach((radio) => {
    radio.checked = radio.value === briefSortMode;
  });
}

settingsBtn.addEventListener("click", showSettings);
closeSettingsBtn.addEventListener("click", hideSettings);

// Brief sort persistence
briefSortRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    briefSortMode = radio.value;
    chrome.storage.local.set({ markup_brief_sort: briefSortMode });
  });
});

// Settings: Clear all notes for this page
settingsClearAllBtn.addEventListener("click", async () => {
  if (!confirm(`Delete all ${notes.length} note${notes.length === 1 ? "" : "s"} for this page?`)) return;
  await writeBackup();
  notes = [];
  await persistNotes();
  renderNotesList();
  showToast("All notes cleared.");
  hideSettings();
});

// Export JSON
exportJsonBtn.addEventListener("click", () => {
  const data = JSON.stringify(notes, null, 2);
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
  const headers = ["id", "type", "severity", "selector", "elementLabel", "text", "createdAt"];
  const rows = notes.map((n) =>
    [
      n.id,
      n.type,
      n.severity || "medium",
      n.selector || "",
      n.elementLabel || "",
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

  if (message.type === "ELEMENT_SELECTED") {
    if (noteInput.value.trim() && !currentNoteId) {
      pendingElementSelector = message.selector;
      notePendingPrompt.hidden = false;
      return;
    }
    flushSave().then(() => {
      if (isEditing) {
        isEditing        = false;
        editPrevSelector = null;
        saveBtn.textContent = "Save Note";
      }
      currentSelector     = message.selector;
      currentElementLabel = message.elementLabel || null; // Sprint 8 F5
      currentNoteId       = null;
      selectorRow.hidden  = false;
      selectorDisplay.textContent = message.selector;
      noteInput.value = "";
      resetTypePicker();
      updateClearSelectorVisibility();
      noteInput.focus();
    });
  }

  if (message.type === "ELEMENT_DESELECTED") {
    if (ignoreNextDeselect) {
      ignoreNextDeselect = false;
      return;
    }
    flushSave().then(() => {
      if (isEditing) {
        isEditing        = false;
        editPrevSelector = null;
        saveBtn.textContent = "Save Note";
      }
      currentSelector     = null;
      currentElementLabel = null;
      currentNoteId       = null;
      if (markupActive) {
        noteInput.value = "";
      }
      selectorDisplay.textContent = "Hover to preview element";
      resetTypePicker();
      updateClearSelectorVisibility();
    });
  }

  if (message.type === "ELEMENT_HOVERED") {
    if (!currentSelector) {
      selectorRow.hidden = false;
      selectorDisplay.textContent = message.selector;
    }
  }

  if (message.type === "ELEMENT_HOVER_END") {
    if (!currentSelector) {
      selectorDisplay.textContent = "Hover to preview element";
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
});

// ─── Tab state loader ──────────────────────────────────────────
async function loadTabState(tab) {
  currentTabId   = tab?.id    || null;
  tabTitle       = tab?.title || "";
  currentTabUrl  = tab?.url   || "";
  currentNoteUrl = currentTabUrl ? normalizeUrl(currentTabUrl) : "";

  if (currentNoteUrl) {
    notes = await loadNotes();
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
  await renderBriefHistory(); // Sprint 8 F1: pre-load history list

  if (currentTabId) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: currentTabId },
        func: () => window.__markupActive === true,
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

  // Sprint 8 F10: load brief sort setting
  try {
    const stored = await safeGet("markup_brief_sort", "severity");
    briefSortMode = stored;
    briefSortRadios.forEach((r) => { r.checked = r.value === briefSortMode; });
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
      <button class="btn-activate" id="reload-markup">Reload Markup</button>
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
  notePendingPrompt.hidden = true;
  ignoreNextDeselect = false;

  setToggleState(false);
  noteInput.value = "";
  activationHint.hidden = true;

  const tab = await new Promise((resolve) => chrome.tabs.get(activeInfo.tabId, resolve));
  await loadTabState(tab);
});

init();
