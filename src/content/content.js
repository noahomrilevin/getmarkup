// Markup — Content Script
import { getCssSelector } from "css-selector-generator";

console.log("Markup content script ready");

// ─── Constants ────────────────────────────────────────────────────
const RING_ID         = "__markup-ring";
const RING_LABEL_ID   = "__markup-ring-label";
const ESC_HINT_ID     = "__markup-esc-hint";
const CURSOR_STYLE_ID = "__markup-cursor";
const HIGHLIGHT_COLOR = "#FF8400";

// ─── State ────────────────────────────────────────────────────────
let ring      = null;
let selectedEl = null;
let isActive   = false;

// Fix 4: MutationObserver repositions the ring when the page's DOM shifts
// (e.g. LinkedIn infinite-scroll pushing selected element out of view)
let mutationObserver = null;
let reposTimeout     = null;
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

// ─── MutationObserver — reposition ring when page layout shifts ───
// LinkedIn and similar SPAs dynamically insert content that shifts elements.
// We watch the body subtree and debounce a ring reposition on any DOM change.
function startMutationObserver() {
  if (mutationObserver) return;
  const target = document.body || document.documentElement;
  mutationObserver = new MutationObserver(() => {
    if (!isActive || !selectedEl) return;
    if (reposTimeout) clearTimeout(reposTimeout);
    reposTimeout = setTimeout(() => {
      reposTimeout = null;
      if (isActive && selectedEl) positionRing(selectedEl);
    }, 300); // Fix 4: 300ms debounce — LinkedIn's infinite scroll fires too fast at 50ms
  });
  mutationObserver.observe(target, { childList: true, subtree: true });
}

function stopMutationObserver() {
  if (mutationObserver) { mutationObserver.disconnect(); mutationObserver = null; }
  if (reposTimeout)     { clearTimeout(reposTimeout);    reposTimeout    = null; }
}

// ─── Highlight ring ───────────────────────────────────────────────
function ensureRing() {
  if (!isActive) return ring;
  if (ring) return ring;
  ring = document.createElement("div");
  ring.id = RING_ID;
  // Fix 4: all:initial resets host-page CSS from bleeding into the ring element.
  // Each property then overrides with !important (inline !important beats author
  // stylesheet !important, so this survives LinkedIn-style aggressive CSS resets).
  ring.style.cssText = [
    "all: initial",
    "position: fixed !important",
    "pointer-events: none !important",
    "z-index: 2147483646 !important",
    "border: 2px dashed rgba(255, 132, 0, 0.5) !important",
    "border-radius: 2px !important",
    "box-sizing: border-box !important",
    "display: none !important",
    "overflow: visible !important",
  ].join("; ");

  // LOCKED label — shown only when an element is selected
  const label = document.createElement("span");
  label.id = RING_LABEL_ID;
  label.textContent = "LOCKED";
  Object.assign(label.style, {
    position: "absolute",
    top: "-18px",
    left: "0",
    background: HIGHLIGHT_COLOR,
    color: "#fff",
    fontSize: "9px",
    fontFamily: "monospace",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "1px 5px",
    borderRadius: "2px",
    opacity: "0",
    pointerEvents: "none",
    lineHeight: "1.4",
    whiteSpace: "nowrap",
  });
  ring.appendChild(label);

  document.documentElement.appendChild(ring);
  return ring;
}

// Fix 1: two visually distinct modes
function setRingMode(mode) {
  const r = ensureRing();
  const label = document.getElementById(RING_LABEL_ID);
  if (mode === "selected") {
    // Locked in: solid, full opacity
    r.style.setProperty("border", `2px solid ${HIGHLIGHT_COLOR}`, "important");
    if (label) label.style.opacity = "1";
  } else {
    // Intent only: dashed, 50% opacity
    r.style.setProperty("border", "2px dashed rgba(255, 132, 0, 0.5)", "important");
    if (label) label.style.opacity = "0";
  }
}

// ─── Esc hint ─────────────────────────────────────────────────────
function showEscHint() {
  if (document.getElementById(ESC_HINT_ID)) return;
  const hint = document.createElement("div");
  hint.id = ESC_HINT_ID;
  hint.textContent = "Press Esc to deselect";
  Object.assign(hint.style, {
    position: "fixed",
    top: "12px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(26, 39, 68, 0.92)",
    color: "#FAF8F3",
    fontSize: "11px",
    fontFamily: "monospace",
    letterSpacing: "0.08em",
    padding: "4px 12px",
    borderRadius: "4px",
    zIndex: "2147483645",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  });
  document.documentElement.appendChild(hint);
}

function hideEscHint() {
  document.getElementById(ESC_HINT_ID)?.remove();
}

function positionRing(el) {
  if (!isActive) return;
  const r = ensureRing();
  const rect = el.getBoundingClientRect();
  // Bug 2: use setProperty with !important so site CSS can't shift the ring
  r.style.setProperty("display", "block",              "important");
  r.style.setProperty("top",     rect.top  + "px",    "important");
  r.style.setProperty("left",    rect.left + "px",    "important");
  r.style.setProperty("width",   rect.width + "px",   "important");
  r.style.setProperty("height",  rect.height + "px",  "important");
}

function hideRing() {
  if (ring) ring.style.setProperty("display", "none", "important");
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
// Fix 4: wrap in try/catch — Chrome throws synchronously when the extension
// context is invalidated (e.g. after an extension update while a tab is open).
// Deactivate the orphaned script so it stops intercepting clicks.
function sendToSidebar(message) {
  try {
    chrome.runtime.sendMessage(message).catch(() => {
      // Sidebar may not be open — silently ignore
    });
  } catch (e) {
    if (e?.message?.includes("Extension context invalidated")) {
      deactivate();
    }
  }
}

// ─── Clear selection ──────────────────────────────────────────────
function clearSelection() {
  selectedEl = null;
  hideRing();
  hideEscHint();
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
  // Bug 5: safety net — if deactivate() failed to remove this listener for any reason,
  // bail immediately so we never block clicks when Markup is OFF.
  if (!isActive) return;
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
  showEscHint();
  // Fix 4: log selected element for debugging on aggressive-DOM sites like LinkedIn
  console.log(
    "Markup: selected →",
    target.tagName +
      (target.id ? "#" + target.id : "") +
      (typeof target.className === "string" && target.className
        ? "." + target.className.trim().split(/\s+/).slice(0, 3).join(".")
        : ""),
    "| selector:", selector
  );
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
  startMutationObserver(); // Fix 4: reposition ring when page DOM shifts (LinkedIn etc.)
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
  hideEscHint();
  removeCursorOverride();
  stopMutationObserver(); // Fix 4: stop watching for DOM shifts
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
