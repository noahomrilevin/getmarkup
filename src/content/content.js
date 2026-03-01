// Markup — Content Script
import { getCssSelector } from "css-selector-generator";

console.log("Markup content script ready");

// ─── Constants ────────────────────────────────────────────────────
const RING_ID = "__markup-ring";
const CURSOR_STYLE_ID = "__markup-cursor";
const HIGHLIGHT_COLOR = "#FF8400";

// ─── State ────────────────────────────────────────────────────────
let ring = null;
let selectedEl = null;
let isActive = false;
window.__markupReady  = true;
window.__markupActive = false; // Bug 3: sidebar reads this on reopen to restore state

// ─── Fix 2: Cursor override ───────────────────────────────────────
// Some sites hide the cursor with cursor:none. Force it visible while
// Markup is active so users can always see where they're pointing.
function injectCursorOverride() {
  if (document.getElementById(CURSOR_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = CURSOR_STYLE_ID;
  style.textContent = "body { cursor: default !important; }";
  (document.head || document.documentElement).appendChild(style);
}

function removeCursorOverride() {
  document.getElementById(CURSOR_STYLE_ID)?.remove();
}

// ─── Highlight ring ───────────────────────────────────────────────
function ensureRing() {
  if (!isActive) return ring;
  if (ring) return ring;
  ring = document.createElement("div");
  ring.id = RING_ID;
  Object.assign(ring.style, {
    position: "fixed",
    pointerEvents: "none",
    zIndex: "2147483646",
    // Fix 1: start in hover style (dashed, 50% opacity)
    border: "2px dashed rgba(255, 132, 0, 0.5)",
    borderRadius: "2px",
    boxSizing: "border-box",
    display: "none",
  });
  document.documentElement.appendChild(ring);
  return ring;
}

// Fix 1: two visually distinct modes
function setRingMode(mode) {
  const r = ensureRing();
  if (mode === "selected") {
    // Locked in: solid, full opacity
    r.style.border = `2px solid ${HIGHLIGHT_COLOR}`;
  } else {
    // Intent only: dashed, 50% opacity
    r.style.border = "2px dashed rgba(255, 132, 0, 0.5)";
  }
}

function positionRing(el) {
  if (!isActive) return;
  const r = ensureRing();
  const rect = el.getBoundingClientRect();
  r.style.display = "block";
  r.style.top = rect.top + "px";
  r.style.left = rect.left + "px";
  r.style.width = rect.width + "px";
  r.style.height = rect.height + "px";
}

function hideRing() {
  if (ring) ring.style.display = "none";
}

// ─── Selector generation ──────────────────────────────────────────
function getSelector(el) {
  if (
    el === document.documentElement ||
    el === document.head ||
    el === document.body ||
    el.id === RING_ID
  ) {
    return null;
  }
  try {
    return getCssSelector(el);
  } catch {
    return null;
  }
}

// ─── Send message to sidebar ──────────────────────────────────────
function sendToSidebar(message) {
  chrome.runtime.sendMessage(message).catch(() => {
    // Sidebar may not be open — silently ignore
  });
}

// ─── Clear selection ──────────────────────────────────────────────
function clearSelection() {
  selectedEl = null;
  hideRing();
  sendToSidebar({ type: "ELEMENT_DESELECTED" });
}

// ─── Event handlers (named so they can be removed) ────────────────
function onMouseover(e) {
  if (!isActive || selectedEl) return; // guard against stale listener firing
  const target = e.target;
  if (
    target === ring ||
    target === document.documentElement ||
    target === document.body
  ) {
    return;
  }
  setRingMode("hover");
  positionRing(target);
  // Hover preview — send selector so sidebar can show it before click
  const selector = getSelector(target);
  if (selector) {
    sendToSidebar({ type: "ELEMENT_HOVERED", selector });
  }
}

function onMouseout() {
  if (!isActive || selectedEl) return; // guard against stale listener firing
  hideRing();
  sendToSidebar({ type: "ELEMENT_HOVER_END" });
}

function onClick(e) {
  const target = e.target;
  if (target === ring || target.id === RING_ID) return;

  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  // Toggle: clicking the already-selected element deselects it
  if (target === selectedEl) {
    clearSelection();
    return;
  }

  const selector = getSelector(target);
  if (!selector) return;

  selectedEl = target;
  setRingMode("selected");
  positionRing(target);
  sendToSidebar({ type: "ELEMENT_SELECTED", selector });
}

function onScroll() {
  if (selectedEl) positionRing(selectedEl);
}

function onKeydown(e) {
  if (e.key === "Escape") clearSelection();
}

// ─── Activate / Deactivate ────────────────────────────────────────
function activate() {
  if (isActive) return;
  isActive = true;
  window.__markupActive = true;
  selectedEl = null; // clear any stale selection from a previous session
  hideRing();
  injectCursorOverride();
  ensureRing();
  document.addEventListener("mouseover", onMouseover, { capture: true, passive: true });
  document.addEventListener("mouseout", onMouseout, { capture: true, passive: true });
  document.addEventListener("click", onClick, { capture: true });
  document.addEventListener("scroll", onScroll, { capture: true, passive: true });
  document.addEventListener("keydown", onKeydown);
  sendToSidebar({ type: "MARKUP_ACTIVATED" });
}

function deactivate() {
  if (!isActive) return;
  isActive = false;
  window.__markupActive = false;
  clearSelection();
  hideRing();
  removeCursorOverride();
  document.removeEventListener("mouseover", onMouseover, { capture: true });
  document.removeEventListener("mouseout", onMouseout, { capture: true });
  document.removeEventListener("click", onClick, { capture: true });
  document.removeEventListener("scroll", onScroll, { capture: true });
  document.removeEventListener("keydown", onKeydown);
  sendToSidebar({ type: "MARKUP_DEACTIVATED" });
}

// ─── Message listener ─────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "MARKUP_ACTIVATE") activate();
  if (message.type === "MARKUP_DEACTIVATE") deactivate();
  if (message.type === "MARKUP_DESELECT") clearSelection();
});
