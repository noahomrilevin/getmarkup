// Markup — Content Script
import { getCssSelector } from "css-selector-generator";

console.log("Markup content script ready");

// ─── Constants ────────────────────────────────────────────────────
const RING_ID         = "__markup-ring";
const RING_LABEL_ID   = "__markup-ring-label";
const ESC_HINT_ID     = "__markup-esc-hint";
const CURSOR_STYLE_ID = "__markup-cursor";
const BADGE_CLASS     = "__markup-badge";
const HIGHLIGHT_COLOR = "#FF8400";

// ─── Sprint 9: iframe detection (Feature 4b) ─────────────────────────
// If running inside an iframe, do not inject ring or intercept clicks.
if (window !== window.top) {
  try {
    chrome.runtime.sendMessage({ type: "IFRAME_DETECTED" }).catch(() => {});
  } catch { /* extension context may not be ready */ }
  // Stop all content script execution here — do not set up ring or listeners
  throw new Error("Markup: iframe detected — content script passive");
}

// ─── State ────────────────────────────────────────────────────────
let ring      = null;
let selectedEl = null;
let isActive   = false;
let currentLockedSelector = null; // Sprint 9: for SPA resilience (4a)

// Fix 4: MutationObserver repositions the ring when the page's DOM shifts
let mutationObserver = null;
let reposTimeout     = null;
window["__mkp_" + chrome.runtime.id + "_ready"]  = true;
window["__mkp_" + chrome.runtime.id + "_active"] = false; // Bug 3: sidebar reads this on reopen to restore state

// Sprint 8: annotation badge state
let badgeElements = []; // [{ noteId, el, badge }]
let currentAnnotatedNotes = []; // last notes received from sidebar
let badgeScrollRAF = null; // RAF id for badge reposition

// ─── Fix 2: Cursor override ───────────────────────────────────────
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
function startMutationObserver() {
  if (mutationObserver) return;
  const target = document.body || document.documentElement;
  mutationObserver = new MutationObserver(() => {
    if (!isActive || !selectedEl) return;
    if (reposTimeout) clearTimeout(reposTimeout);
    reposTimeout = setTimeout(() => {
      reposTimeout = null;
      if (!isActive || !selectedEl) return;
      // Sprint 9 (4a): SPA resilience — verify locked element still in DOM
      if (currentLockedSelector) {
        let found = null;
        try { found = document.querySelector(currentLockedSelector); } catch { /* invalid selector */ }
        if (!found) {
          // Element gone after React/Vue re-render — silently release lock
          clearSelection();
          return;
        }
        // Element may have been re-mounted to a new DOM node
        if (!document.body.contains(selectedEl)) {
          selectedEl = found;
        }
      }
      positionRing(selectedEl);
    }, 300);
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

function setRingMode(mode) {
  const r = ensureRing();
  const label = document.getElementById(RING_LABEL_ID);
  if (mode === "selected") {
    r.style.setProperty("border", `2px solid ${HIGHLIGHT_COLOR}`, "important");
    if (label) label.style.opacity = "1";
  } else {
    r.style.setProperty("border", "2px dashed rgba(255, 132, 0, 0.5)", "important");
    if (label) label.style.opacity = "0";
  }
}

// ─── Esc hint ─────────────────────────────────────────────────────
function showEscHint(text) {
  let hint = document.getElementById(ESC_HINT_ID);
  if (hint) {
    hint.textContent = text || "Press Esc to deselect";
    return;
  }
  hint = document.createElement("div");
  hint.id = ESC_HINT_ID;
  hint.textContent = text || "Press Esc to deselect";
  Object.assign(hint.style, {
    position: "fixed",
    top: "56px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(26, 39, 68, 0.565)",
    color: "#FAF8F3",
    fontSize: "11px",
    fontFamily: "monospace",
    letterSpacing: "0.08em",
    padding: "5px 16px",
    borderRadius: "20px",
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

// ─── Sprint 8 F5: Human-readable element label ────────────────────
// Priority: aria-label > alt > visible text (40 chars) > tagName.class
function getElementLabel(el) {
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel && ariaLabel.trim()) {
    return ariaLabel.trim().slice(0, 40);
  }
  const alt = el.getAttribute("alt");
  if (alt && alt.trim()) {
    return alt.trim().slice(0, 40);
  }
  const text = (el.innerText || el.textContent || "").trim().replace(/\s+/g, " ");
  if (text) {
    return text.length > 40 ? text.slice(0, 40) + "…" : text;
  }
  // Fallback: tagName + first class
  const cls = typeof el.className === "string" && el.className.trim()
    ? "." + el.className.trim().split(/\s+/)[0]
    : "";
  return el.tagName.toLowerCase() + cls;
}

// ─── Sprint 8 F6: Annotation badges ──────────────────────────────
// Numbered gold circles on annotated elements. Rerender on notes update.
function clearAllBadges() {
  document.querySelectorAll("." + BADGE_CLASS).forEach((el) => el.remove());
  badgeElements = [];
}

function repositionBadges() {
  badgeElements.forEach(({ el, badge }) => {
    try {
      const rect = el.getBoundingClientRect();
      badge.style.top  = (rect.top - 9) + "px";
      badge.style.left = (rect.left + rect.width - 9) + "px";
    } catch { /* element may have left DOM */ }
  });
}

function renderBadges() {
  if (!isActive) return;
  clearAllBadges();
  currentAnnotatedNotes.forEach((note, index) => {
    if (!note.selector) return;
    let el;
    try { el = document.querySelector(note.selector); } catch { return; }
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const badge = document.createElement("div");
    badge.className = BADGE_CLASS;
    badge.textContent = String(index + 1);
    badge.dataset.noteId = note.id;

    Object.assign(badge.style, {
      all:            "initial",
      position:       "fixed",
      top:            (rect.top - 9) + "px",
      left:           (rect.left + rect.width - 9) + "px",
      width:          "18px",
      height:         "18px",
      borderRadius:   "50%",
      background:     "#C9A84C",
      color:          "#FFFFFF",
      fontSize:       "10px",
      fontFamily:     "monospace",
      fontWeight:     "bold",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      zIndex:         "2147483647",
      cursor:         "pointer",
      userSelect:     "none",
      boxShadow:      "0 1px 4px rgba(0,0,0,0.25)",
      lineHeight:     "1",
      pointerEvents:  "auto",
    });

    badge.addEventListener("mouseenter", () => {
      sendToSidebar({ type: "BADGE_HOVERED", noteId: note.id });
    });
    badge.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      sendToSidebar({ type: "BADGE_CLICKED", noteId: note.id });
    });

    document.documentElement.appendChild(badge);
    badgeElements.push({ noteId: note.id, el, badge });
  });
}

// Reposition badges on scroll using RAF to avoid thrash
function onBadgeScroll() {
  if (badgeScrollRAF) return;
  badgeScrollRAF = requestAnimationFrame(() => {
    badgeScrollRAF = null;
    repositionBadges();
  });
}

// ─── Send message to sidebar ──────────────────────────────────────
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
  currentLockedSelector = null; // Sprint 9: reset SPA tracking
  hideRing();
  hideEscHint();
  sendToSidebar({ type: "ELEMENT_DESELECTED" });
}

// ─── Event handlers (named so they can be removed) ────────────────
function onMouseover(e) {
  if (!isActive || selectedEl) return;
  const target = e.target;
  if (
    target === ring ||
    target === document.documentElement ||
    target === document.body ||
    target.classList.contains(BADGE_CLASS)
  ) {
    return;
  }
  setRingMode("hover");
  positionRing(target);
  showEscHint("Press Esc to cancel");
  const selector = getSelector(target);
  if (selector) {
    sendToSidebar({ type: "ELEMENT_HOVERED", selector });
  }
}

function onMouseout() {
  if (!isActive || selectedEl) return;
  hideRing();
  hideEscHint();
  sendToSidebar({ type: "ELEMENT_HOVER_END" });
}

function onClick(e) {
  if (!isActive) return;
  const target = e.target;
  if (target === ring || target.id === RING_ID) return;
  // Badges handle their own click — don't intercept
  if (target.classList.contains(BADGE_CLASS)) return;

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
  currentLockedSelector = selector; // Sprint 9: track for SPA resilience
  setRingMode("selected");
  positionRing(target);
  showEscHint("Press Esc to deselect");
  console.log(
    "Markup: selected →",
    target.tagName +
      (target.id ? "#" + target.id : "") +
      (typeof target.className === "string" && target.className
        ? "." + target.className.trim().split(/\s+/).slice(0, 3).join(".")
        : ""),
    "| selector:", selector
  );

  // Sprint 8 F5: include human-readable label with selection message
  const elementLabel = getElementLabel(target);
  sendToSidebar({ type: "ELEMENT_SELECTED", selector, elementLabel });
}

function onScroll() {
  if (selectedEl) positionRing(selectedEl);
  if (badgeElements.length > 0) onBadgeScroll();
}

function onKeydown(e) {
  if (e.key === "Escape") clearSelection();
}

// ─── Activate / Deactivate ────────────────────────────────────────
function activate() {
  if (isActive) return;
  isActive = true;
  window["__mkp_" + chrome.runtime.id + "_active"] = true;
  selectedEl = null;
  hideRing();
  injectCursorOverride();
  ensureRing();
  startMutationObserver();
  document.addEventListener("mouseover", onMouseover, { capture: true, passive: true });
  document.addEventListener("mouseout", onMouseout, { capture: true, passive: true });
  document.addEventListener("click", onClick, { capture: true });
  document.addEventListener("scroll", onScroll, { capture: true, passive: true });
  document.addEventListener("keydown", onKeydown);
  // Re-render badges if we have notes waiting
  if (currentAnnotatedNotes.length > 0) renderBadges();
  sendToSidebar({ type: "MARKUP_ACTIVATED" });
}

function deactivate() {
  if (!isActive) return;
  isActive = false;
  window["__mkp_" + chrome.runtime.id + "_active"] = false;
  clearSelection();
  hideRing();
  hideEscHint();
  removeCursorOverride();
  stopMutationObserver();
  clearAllBadges(); // Sprint 8 F6: remove all annotation badges on deactivate
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

  // Sprint 8 F6: sidebar sends updated notes list — re-render annotation badges
  if (message.type === "NOTES_UPDATED") {
    currentAnnotatedNotes = message.notes || [];
    if (isActive) renderBadges();
  }

  // Sprint 8 F8: hover on note card temporarily shows ring on that element
  if (message.type === "HIGHLIGHT_ELEMENT") {
    if (!isActive || selectedEl) return; // never override a locked selection
    try {
      const el = document.querySelector(message.selector);
      if (el) {
        setRingMode("hover");
        positionRing(el);
      }
    } catch { /* invalid selector — ignore */ }
  }

  // Sprint 8 F8: mouseout from note card — clear temporary highlight
  if (message.type === "HIGHLIGHT_ELEMENT_END") {
    if (!isActive || selectedEl) return;
    hideRing();
    sendToSidebar({ type: "ELEMENT_HOVER_END" });
  }
});
