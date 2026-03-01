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
let currentSelector  = null;
let currentNoteId    = null;
let notes            = [];
let currentTabId     = null;
let tabTitle         = "";
let markupActive     = false;
let isEditing        = false;
let editPrevSelector = null;
const undoStack      = [];
const redoStack      = [];
let toastTimeout     = null;

// ─── DOM refs ──────────────────────────────────────────────────
const toggleBtn       = document.getElementById("markup-toggle");
const activationHint  = document.getElementById("activation-hint");
const closeBtn        = document.getElementById("close-btn");
const noteCountEl     = document.getElementById("note-count");
const notesList       = document.getElementById("notes-list");
const emptyState      = document.getElementById("empty-state");
const selectorDisplay = document.getElementById("selector-display");
const noteInput       = document.getElementById("note-input");
const generateBtn     = document.getElementById("generate-brief");
const saveBtn         = document.getElementById("save-note");
const toastEl         = document.getElementById("toast");
const typeButtons     = document.querySelectorAll(".type-btn");
const briefPanel      = document.getElementById("brief-output");
const briefContent    = document.getElementById("brief-content");
const copyBriefBtn    = document.getElementById("copy-brief");
const closeBriefBtn   = document.getElementById("close-brief");
const formArea        = document.querySelector(".markup-form-area");

// ─── Toggle state ──────────────────────────────────────────────
function setToggleState(active) {
  markupActive = active;
  if (active) {
    toggleBtn.textContent = "Markup ON";
    toggleBtn.classList.add("toggle-btn--on");
    toggleBtn.setAttribute("aria-pressed", "true");
    saveBtn.disabled = false;
    saveBtn.setAttribute("aria-disabled", "false");
    if (!currentSelector) {
      selectorDisplay.textContent = "No element selected";
    }
  } else {
    toggleBtn.textContent = "Markup OFF";
    toggleBtn.classList.remove("toggle-btn--on");
    toggleBtn.setAttribute("aria-pressed", "false");
    resetForm();
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

  // Detect restricted URL schemes where content scripts can't inject
  const url = tab.url || "";
  if (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("about:") ||
    url.startsWith("edge://")
  ) {
    activationHint.textContent = "Markup can't run on this page.";
    activationHint.hidden = false;
    return;
  }

  let ready = false;
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.__markupReady === true,
    });
    ready = results?.[0]?.result === true;
  } catch {
    ready = false;
  }

  if (!ready) {
    activationHint.textContent = "Reload the page to activate Markup.";
    activationHint.hidden = false;
    return;
  }

  activationHint.hidden = true;
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

// ─── Storage ───────────────────────────────────────────────────
function loadNotes(tabId) {
  const key = `markup_notes_${tabId}`;
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (data) => {
      resolve(data[key] || []);
    });
  });
}

function persistNotes() {
  if (!currentTabId) return Promise.resolve();
  const key = `markup_notes_${currentTabId}`;
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: notes }, resolve);
  });
}

// ─── Render ────────────────────────────────────────────────────
function renderNotesList() {
  notesList.querySelectorAll(".note-card").forEach((c) => c.remove());

  const count = notes.length;
  noteCountEl.textContent = count === 1 ? "1 note" : `${count} notes`;

  generateBtn.disabled = count === 0;
  generateBtn.setAttribute("aria-disabled", count === 0 ? "true" : "false");

  updateEmptyState();

  notes.forEach((note) => {
    notesList.appendChild(createNoteCard(note));
  });
}

function createNoteCard(note) {
  const config = TYPE_CONFIG[note.type] || TYPE_CONFIG.general;
  const card = document.createElement("div");
  card.className = "note-card";
  card.dataset.noteId = note.id;

  const locationChip = note.selector
    ? `<code class="selector-chip">${escapeHtml(note.selector)}</code>`
    : `<span class="general-note-label">General note</span>`;

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
    const idx = notes.findIndex((n) => n.id === currentNoteId);
    if (idx >= 0) {
      pushUndo("Edit undone");
      notes[idx] = { ...notes[idx], type, text };
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

// ─── Form reset (full — used when Markup turns OFF) ────────────
function resetForm() {
  currentSelector  = null;
  currentNoteId    = null;
  isEditing        = false;
  editPrevSelector = null;
  noteInput.value  = "";
  selectorDisplay.textContent = "Hover to preview element";
  saveBtn.textContent = "Save Note";
  saveBtn.disabled = true;
  saveBtn.setAttribute("aria-disabled", "true");
  resetTypePicker();
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
  selectorDisplay.textContent = note.selector || "General note";
  saveBtn.textContent = "Update Note";
  saveBtn.disabled = false;
  saveBtn.setAttribute("aria-disabled", "false");
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
  selectorDisplay.textContent = currentSelector
    ? currentSelector
    : markupActive ? "No element selected" : "Hover to preview element";
  saveBtn.disabled = !markupActive;
  saveBtn.setAttribute("aria-disabled", !markupActive ? "true" : "false");
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

// ─── Brief panel ───────────────────────────────────────────────
function buildBriefText() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit",
  });

  const lines = [
    `# Markup — Fix Instructions`,
    ``,
    `**Project:** ${tabTitle || "Unknown"}`,
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
  formArea.hidden = true;
  briefPanel.hidden = false;
}

function hideBrief() {
  briefPanel.hidden = true;
  notesList.hidden = false;
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

closeBriefBtn.addEventListener("click", hideBrief);

// ─── Messages from content script ─────────────────────────────
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "MARKUP_ACTIVATED") {
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
      selectorDisplay.textContent = message.selector;
      noteInput.value = "";
      resetTypePicker();
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
      noteInput.value = "";
      selectorDisplay.textContent = "No element selected";
      resetTypePicker();
      // saveBtn stays enabled — Markup is still ON
    });
  }

  if (message.type === "ELEMENT_HOVERED") {
    // Live hover preview — only update if no element is currently selected
    if (!currentSelector) {
      selectorDisplay.textContent = message.selector;
    }
  }

  if (message.type === "ELEMENT_HOVER_END") {
    if (!currentSelector) {
      selectorDisplay.textContent = markupActive ? "No element selected" : "Hover to preview element";
    }
  }
});

// ─── Init ──────────────────────────────────────────────────────
async function init() {
  const tabs = await new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, resolve);
  });
  const tab = tabs[0];
  currentTabId = tab?.id || null;
  tabTitle     = tab?.title || "";
  if (currentTabId) {
    notes = await loadNotes(currentTabId);
    renderNotesList();
  }
}

init();
