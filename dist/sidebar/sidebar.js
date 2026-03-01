// Markup — Sidebar Script

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

// ─── State ─────────────────────────────────────────────────────
let currentSelector     = null;
let currentNoteId       = null;
let notes               = [];
let currentTabId        = null;
let currentTabUrl       = "";
let currentNoteUrl      = "";   // Bug 1: normalized URL used as storage key
let tabTitle            = "";
let sessionTitle        = "";
let markupActive        = false;
let isEditing           = false;
let editPrevSelector    = null;
let markupEverActivated = false;
const undoStack         = [];
const redoStack         = [];
let toastTimeout        = null;

// ─── DOM refs ──────────────────────────────────────────────────
const toggleBtn          = document.getElementById("markup-toggle");
const activationHint     = document.getElementById("activation-hint");
const closeBtn           = document.getElementById("close-btn");
const noteCountEl        = document.getElementById("note-count");
const notesList          = document.getElementById("notes-list");
const emptyState         = document.getElementById("empty-state");
const selectorDisplay    = document.getElementById("selector-display");
const selectorRow        = document.querySelector(".selector-row");   // Bug 5
const clearSelectorBtn   = document.getElementById("clear-selector");
const noteInput          = document.getElementById("note-input");
const generateBtn        = document.getElementById("generate-brief");
const saveBtn            = document.getElementById("save-note");
const toastEl            = document.getElementById("toast");
const typeButtons        = document.querySelectorAll(".type-btn");
const briefPanel         = document.getElementById("brief-output");
const briefContent       = document.getElementById("brief-content");
const copyBriefBtn       = document.getElementById("copy-brief");
const downloadBriefBtn   = document.getElementById("download-brief");
const closeBriefBtn      = document.getElementById("close-brief");
const formArea           = document.querySelector(".markup-form-area");
const clearAllBtn        = document.getElementById("clear-all");
const clearConfirmEl     = document.getElementById("clear-confirm");
const clearConfirmMsgEl  = document.getElementById("clear-confirm-msg");
const clearConfirmYesBtn = document.getElementById("clear-confirm-yes");
const clearConfirmNoBtn  = document.getElementById("clear-confirm-no");
const sessionTitleInput  = document.getElementById("session-title");
const sessionTitleWrap   = document.getElementById("session-title-wrap");

// Bug 5: hide selector row at startup — only shown when Markup is ON
selectorRow.hidden = true;

// ─── URL normalization (Bug 1 + Bug 8) ─────────────────────────
// Strip hash and trailing slash so notes follow the page, not the tab.
function normalizeUrl(url) {
  return url.split("#")[0].replace(/\/$/, "");
}

// ─── Toggle state ──────────────────────────────────────────────
function setToggleState(active) {
  markupActive = active;
  if (active) {
    toggleBtn.textContent = "Markup ON";
    toggleBtn.classList.add("toggle-btn--on");
    toggleBtn.setAttribute("aria-pressed", "true");
    saveBtn.disabled = false;
    saveBtn.setAttribute("aria-disabled", "false");
    selectorRow.hidden = false;
    if (!currentSelector) {
      selectorDisplay.textContent = "Hover to preview element";
    }
  } else {
    toggleBtn.textContent = "Markup OFF";
    toggleBtn.classList.remove("toggle-btn--on");
    toggleBtn.setAttribute("aria-pressed", "false");
    deactivateReset(); // Bug 6: preserves noteInput
  }
  updateEmptyState();
}

// ─── Toggle send (shared by header button + empty state button) ─
async function sendToggle() {
  const tabs = await new Promise((resolve) =>
    chrome.tabs.query({ active: true, currentWindow: true }, resolve)
  );
  const tab = tabs[0];
  if (!tab?.id) return;

  const url = tab.url || "";

  // Always clear any stale hint before evaluating the new page context.
  activationHint.hidden = true;

  console.log("Markup: sendToggle tabId=", tab.id, "url=", url);

  // Bug 2: file:// is NOT restricted — it's a core Markup use case.
  // The manifest already declares file_urls permission.
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

  // Bug 2: include file:// as a normal injectable page
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
    console.log("Markup: ping result=", ready);
  } catch (err) {
    console.log("Markup: ping failed:", err?.message);
    ready = false;
  }

  if (!ready && isNormalPage) {
    console.log("Markup: content script not ready, attempting direct injection");
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content/content.js"],
      });
      await new Promise((r) => setTimeout(r, 500));
      chrome.tabs.sendMessage(tab.id, { type: "MARKUP_ACTIVATE" });
    } catch (injErr) {
      console.log("Markup: injection failed:", injErr?.message);
      activationHint.textContent = "Try refreshing the page.";
      activationHint.hidden = false;
    }
    return;
  }

  if (!ready) {
    return;
  }

  markupEverActivated = true;
  const msgType = markupActive ? "MARKUP_DEACTIVATE" : "MARKUP_ACTIVATE";
  chrome.tabs.sendMessage(tab.id, { type: msgType });
}

toggleBtn.addEventListener("click", sendToggle);

// ─── Close button ──────────────────────────────────────────────
closeBtn.addEventListener("click", () => {
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
    text.textContent = "Click any element to annotate.";
    emptyState.append(text);
  }
}

// ─── Type picker ───────────────────────────────────────────────
typeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setTypePicker(btn.dataset.type);
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

function resetTypePicker() {
  setTypePicker("general");
}

// ─── Clear selector visibility ─────────────────────────────────
function updateClearSelectorVisibility() {
  clearSelectorBtn.hidden = !currentSelector;
}

// ─── Clear all visibility ──────────────────────────────────────
function updateClearAllVisibility() {
  clearAllBtn.hidden = notes.length === 0;
}

// ─── Storage — notes (Bug 1: keyed by normalizedUrl, not tabId) ─
function loadNotes() {
  const key = `markup_notes_${currentNoteUrl}`;
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (data) => {
      resolve(data[key] || []);
    });
  });
}

function persistNotes() {
  if (!currentNoteUrl) return Promise.resolve();
  const key = `markup_notes_${currentNoteUrl}`;
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: notes }, resolve);
  });
}

// ─── Storage — session title (Bug 8: keyed by normalizedUrl) ───
function loadSessionTitle() {
  const key = `markup_session_${currentNoteUrl}`;
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (data) => {
      resolve(key in data ? data[key] : null);
    });
  });
}

function persistSessionTitle(title) {
  if (!currentNoteUrl) return;
  const key = `markup_session_${currentNoteUrl}`;
  chrome.storage.local.set({ [key]: title });
}

sessionTitleInput.addEventListener("input", () => {
  sessionTitle = sessionTitleInput.value;
  persistSessionTitle(sessionTitle);
});

// ─── Storage — backup (Bug 9) ──────────────────────────────────
// Written before any destructive clear. Keeps the last 3 snapshots per URL.
async function writeBackup() {
  if (!currentNoteUrl || notes.length === 0) return;
  const backupKey = `markup_backup_${currentNoteUrl}`;
  const existing = await new Promise((resolve) =>
    chrome.storage.local.get(backupKey, (data) => resolve(data[backupKey] || []))
  );
  const backup = { timestamp: Date.now(), notes: JSON.parse(JSON.stringify(notes)) };
  const updated = [...existing, backup].slice(-3);
  await new Promise((resolve) => chrome.storage.local.set({ [backupKey]: updated }, resolve));
  console.log(`Markup: backup written (${updated.length}/3 for ${currentNoteUrl})`);
}

// ─── Render ────────────────────────────────────────────────────
function renderNotesList() {
  notesList.querySelectorAll(".note-card").forEach((c) => c.remove());

  const count = notes.length;
  noteCountEl.textContent = count === 1 ? "1 note" : `${count} notes`;

  generateBtn.disabled = count === 0;
  generateBtn.setAttribute("aria-disabled", count === 0 ? "true" : "false");

  updateEmptyState();
  updateClearAllVisibility();

  notes.forEach((note) => {
    notesList.appendChild(createNoteCard(note));
  });
}

function createNoteCard(note) {
  const config = TYPE_CONFIG[note.type] || TYPE_CONFIG.general;
  const card = document.createElement("div");
  card.className = "note-card";
  card.dataset.noteId = note.id;

  // Bug 7: only show "General note" label for the General type with no selector.
  // For Bug/Design/Copy/Question with no element, show nothing in that area.
  let locationChip = "";
  if (note.selector) {
    locationChip = `<code class="selector-chip">${escapeHtml(note.selector)}</code>`;
  } else if (note.type === "general") {
    locationChip = `<span class="general-note-label">General note</span>`;
  }

  card.innerHTML = `
    <div class="note-card__header">
      <span class="note-type-tag note-type-tag--${escapeHtml(note.type)}">${config.label}</span>
      <div class="note-card__actions">
        <button class="icon-btn edit-btn" aria-label="Edit note">Edit</button>
        <button class="icon-btn delete-btn" aria-label="Delete note">✕</button>
      </div>
    </div>
    ${locationChip}
    <p class="note-card__text">${escapeHtml(note.text)}</p>
  `;

  card.querySelector(".edit-btn").addEventListener("click", () => {
    enterEditMode(note);
  });

  card.querySelector(".delete-btn").addEventListener("click", () => {
    deleteNote(note.id);
  });

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

  const type = getActiveType();

  if (currentNoteId) {
    // Bug 4: always update in place when currentNoteId is set — never insert new.
    // Also update selector/elementName so a cleared element is reflected correctly.
    const idx = notes.findIndex((n) => n.id === currentNoteId);
    if (idx >= 0) {
      pushUndo("Edit undone");
      notes[idx] = {
        ...notes[idx],
        type,
        text,
        selector: currentSelector,
        elementName: currentSelector ? null : "General note",
      };
    }
  } else {
    const note = {
      id: generateId(),
      selector: currentSelector,
      elementName: currentSelector ? null : "General note",
      type,
      text,
      createdAt: Date.now(),
    };
    currentNoteId = note.id;
    notes.push(note);
  }

  await persistNotes();
  renderNotesList();
}

// ─── Form reset — full (used after explicit user action: save/cancel) ──
function resetForm() {
  currentSelector  = null;
  currentNoteId    = null;
  isEditing        = false;
  editPrevSelector = null;
  noteInput.value  = "";
  selectorRow.hidden = true;
  selectorDisplay.textContent = "";
  saveBtn.textContent = "Save Note";
  saveBtn.disabled = true;
  saveBtn.setAttribute("aria-disabled", "true");
  resetTypePicker();
  updateClearSelectorVisibility();
}

// ─── Deactivation reset (Bug 6) ────────────────────────────────
// Like resetForm but preserves noteInput so in-progress text isn't lost
// when Markup is toggled off or the content script disconnects.
function deactivateReset() {
  currentSelector  = null;
  currentNoteId    = null;
  isEditing        = false;
  editPrevSelector = null;
  // noteInput.value intentionally NOT cleared
  selectorRow.hidden = true;
  selectorDisplay.textContent = "";
  saveBtn.textContent = "Save Note";
  saveBtn.disabled = true;
  saveBtn.setAttribute("aria-disabled", "true");
  resetTypePicker();
  updateClearSelectorVisibility();
}

// ─── Soft reset (keeps element active after save) ──────────────
function softReset() {
  currentNoteId   = null;
  noteInput.value = "";
  resetTypePicker();
  noteInput.focus();
}

// ─── Edit mode ─────────────────────────────────────────────────
function enterEditMode(note) {
  isEditing        = true;
  editPrevSelector = currentSelector;
  currentNoteId    = note.id;
  currentSelector  = note.selector;
  noteInput.value  = note.text;
  setTypePicker(note.type);
  selectorRow.hidden = false;
  selectorDisplay.textContent = note.selector || "Hover to preview element";
  saveBtn.textContent = "Update Note";
  saveBtn.disabled = false;
  saveBtn.setAttribute("aria-disabled", "false");
  updateClearSelectorVisibility();
  noteInput.focus();
}

function exitEditMode() {
  isEditing        = false;
  currentNoteId    = null;
  currentSelector  = editPrevSelector;
  editPrevSelector = null;
  noteInput.value  = "";
  resetTypePicker();
  saveBtn.textContent = "Save Note";
  selectorDisplay.textContent = currentSelector || "Hover to preview element";
  saveBtn.disabled = !markupActive;
  saveBtn.setAttribute("aria-disabled", !markupActive ? "true" : "false");
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
  if (isEditing) {
    exitEditMode();
  } else {
    softReset();
  }
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
  // Let textarea handle its own native undo while focused
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
    chrome.tabs.sendMessage(tab.id, { type: "MARKUP_DESELECT" });
  }
  currentSelector = null;
  // Bug 4: do NOT clear currentNoteId here.
  // If in edit mode, currentNoteId must remain set so flushSave() updates in place
  // rather than inserting a duplicate note.
  selectorDisplay.textContent = "Hover to preview element";
  updateClearSelectorVisibility();
  if (!noteInput.value.trim()) {
    saveBtn.disabled = !markupActive;
    saveBtn.setAttribute("aria-disabled", !markupActive ? "true" : "false");
  }
});

// ─── Clear all ─────────────────────────────────────────────────
clearAllBtn.addEventListener("click", () => {
  const n = notes.length;
  clearConfirmMsgEl.textContent = `Delete all ${n} note${n === 1 ? "" : "s"}?`;
  clearConfirmEl.hidden = false;
  clearAllBtn.hidden = true;
});

clearConfirmYesBtn.addEventListener("click", async () => {
  await writeBackup(); // Bug 9: persist a backup before destructive clear
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

  const lines = [
    `# Markup — Fix Instructions`,
    ``,
    `**Project:** ${project}`,
    `**URL:** ${currentTabUrl || "Unknown"}`,
    `**Reviewed:** ${dateStr} at ${timeStr}`,
    `**Mode:** Self Review`,
    `**Total Issues:** ${notes.length}`,
    ``,
    `---`,
  ];

  for (const type of TYPE_ORDER) {
    const typeNotes = notes.filter((n) => n.type === type);
    if (typeNotes.length === 0) continue;

    const cfg = TYPE_BRIEF[type];
    lines.push(``);
    lines.push(`## ${cfg.emoji} ${cfg.label}`);

    typeNotes.forEach((note, i) => {
      if (i > 0) lines.push(``);
      const elementLabel = note.elementName || note.selector || "No element selected";
      lines.push(`**Element:** ${elementLabel}`);
      if (note.selector) {
        lines.push(`**Selector:** ${note.selector}`);
      }
      lines.push(`**${cfg.field}:** ${note.text}`);
    });

    lines.push(``);
    lines.push(`---`);
  }

  return lines.join("\n");
}

function showBrief() {
  briefContent.textContent = buildBriefText();
  notesList.hidden = true;
  sessionTitleWrap.hidden = true;
  clearConfirmEl.hidden = true;
  formArea.hidden = true;
  briefPanel.hidden = false;
}

function hideBrief() {
  briefPanel.hidden = true;
  notesList.hidden = false;
  sessionTitleWrap.hidden = false;
  formArea.hidden = false;
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
    setTimeout(() => {
      copyBriefBtn.textContent = "Copy to Clipboard";
    }, 2000);
  } catch {
    showToast("Copy failed — try again.");
  }
});

downloadBriefBtn.addEventListener("click", () => {
  const text = briefContent.textContent;
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `markup-brief-${dateStr}.md`;
  const blob = new Blob([text], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
});

closeBriefBtn.addEventListener("click", hideBrief);

// ─── Messages from content script ─────────────────────────────
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "MARKUP_ACTIVATED") {
    markupEverActivated = true;
    activationHint.hidden = true;
    setToggleState(true);
  }

  if (message.type === "MARKUP_DEACTIVATED") {
    setToggleState(false);
  }

  if (message.type === "ELEMENT_SELECTED") {
    // Flush any unsaved text for the previous element, then set up the new one
    flushSave().then(() => {
      if (isEditing) {
        isEditing        = false;
        editPrevSelector = null;
        saveBtn.textContent = "Save Note";
      }
      currentSelector = message.selector;
      currentNoteId   = null;
      selectorRow.hidden = false;
      selectorDisplay.textContent = message.selector;
      noteInput.value = "";
      resetTypePicker();
      updateClearSelectorVisibility();
      noteInput.focus();
    });
  }

  if (message.type === "ELEMENT_DESELECTED") {
    flushSave().then(() => {
      if (isEditing) {
        isEditing        = false;
        editPrevSelector = null;
        saveBtn.textContent = "Save Note";
      }
      currentSelector = null;
      currentNoteId   = null;
      // Bug 6 fix: only clear noteInput on an explicit user deselect (Markup still ON).
      // When Markup deactivates, content script sends ELEMENT_DESELECTED before
      // MARKUP_DEACTIVATED. By the time this .then() runs, MARKUP_DEACTIVATED has
      // already fired and deactivateReset() has intentionally preserved noteInput.
      // Clearing it here would undo that preservation.
      if (markupActive) {
        noteInput.value = "";
      }
      selectorDisplay.textContent = "Hover to preview element";
      resetTypePicker();
      updateClearSelectorVisibility();
      // saveBtn stays enabled — Markup is still ON
    });
  }

  if (message.type === "ELEMENT_HOVERED") {
    // Bug 5: only update when Markup is ON (selectorRow is visible) and no element locked
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
});

// ─── Init ──────────────────────────────────────────────────────
async function init() {
  const tabs = await new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, resolve);
  });
  const tab = tabs[0];
  currentTabId  = tab?.id || null;
  tabTitle      = tab?.title || "";
  currentTabUrl = tab?.url || "";

  // Bug 1 + Bug 8: derive storage key from normalized URL, not ephemeral tabId
  currentNoteUrl = currentTabUrl ? normalizeUrl(currentTabUrl) : "";

  if (currentNoteUrl) {
    notes = await loadNotes();
    const stored = await loadSessionTitle();
    sessionTitle = stored !== null ? stored : tabTitle;
    sessionTitleInput.value = sessionTitle;
    renderNotesList();
  }

  // Bug 3: if the content script is already active (sidebar was closed and reopened),
  // sync the sidebar to ON without requiring the user to click toggle again.
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
      // Restricted page or content script unavailable — start in OFF state.
    }
  }
}

init();
