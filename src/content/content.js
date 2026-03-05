// Markup — Content Script
import { getCssSelector } from "css-selector-generator";

console.log("Markup content script ready");

// ─── Constants ────────────────────────────────────────────────────
const RING_ID               = "__markup-ring";
const RING_LABEL_ID         = "__markup-ring-label";
const ESC_HINT_ID           = "__markup-esc-hint";
const CURSOR_STYLE_ID       = "__markup-cursor";
const BADGE_CLASS           = "__markup-badge";
const HIGHLIGHT_COLOR       = "#FF8400";
const FLOATING_INPUT_ID     = "__markup-floating-input";
const SCREENSHOT_OVERLAY_ID = "__markup-screenshot-overlay";
const SCREENSHOT_SEL_ID     = "__markup-screenshot-selection";

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
// Sprint 11 Pass 15: screenshot mode
let isScreenshotMode = false;
let ssOverlay        = null;
let ssSelection      = null;
let ssStartX         = 0;
let ssStartY         = 0;

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
const IFRAME_BLOCK_ID = "__markup-iframe-block";

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

// Blocks iframes from receiving pointer events during selection mode
function injectIframeBlock() {
  if (document.getElementById(IFRAME_BLOCK_ID)) return;
  const style = document.createElement("style");
  style.id = IFRAME_BLOCK_ID;
  style.textContent = "iframe { pointer-events: none !important; }";
  (document.head || document.documentElement).appendChild(style);
}

function removeIframeBlock() {
  document.getElementById(IFRAME_BLOCK_ID)?.remove();
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
    hint.textContent = text || "ESC · EXIT SELECTOR";
    return;
  }
  hint = document.createElement("div");
  hint.id = ESC_HINT_ID;
  hint.textContent = text || "ESC · EXIT SELECTOR";
  Object.assign(hint.style, {
    position: "fixed",
    top: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1A2744",
    color: "#C9A84C",
    fontSize: "12px",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.08em",
    padding: "6px 14px",
    borderRadius: "999px",
    zIndex: "2147483645",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  });
  document.documentElement.appendChild(hint);
}

function hideEscHint() {
  document.getElementById(ESC_HINT_ID)?.remove();
}

// ─── Floating note input ──────────────────────────────────────
function showFloatingInput(el) {
  hideFloatingInput(); // never more than one
  const rect = el.getBoundingClientRect();
  const OVERLAY_W = 248;
  const OVERLAY_H = 104; // approximate height for positioning

  let top  = rect.bottom + 8;
  let left = rect.left;

  // Flip above element if it would overflow viewport bottom
  if (top + OVERLAY_H > window.innerHeight - 8) {
    top = rect.top - OVERLAY_H - 8;
  }
  // Clamp horizontal so it stays within viewport
  if (left + OVERLAY_W > window.innerWidth - 8) left = window.innerWidth - OVERLAY_W - 8;
  if (left < 8) left = 8;
  top = Math.max(8, top);

  const overlay = document.createElement("div");
  overlay.id = FLOATING_INPUT_ID;
  Object.assign(overlay.style, {
    position:     "fixed",
    top:          top + "px",
    left:         left + "px",
    width:        OVERLAY_W + "px",
    background:   "#1A2744",
    border:       "1px solid #C9A84C",
    borderRadius: "8px",
    padding:      "10px",
    zIndex:       "999999",
    boxShadow:    "0 4px 16px rgba(0,0,0,0.35)",
    display:      "flex",
    flexDirection:"column",
    gap:          "8px",
    boxSizing:    "border-box",
  });

  const textarea = document.createElement("textarea");
  Object.assign(textarea.style, {
    width:       "100%",
    background:  "transparent",
    color:       "#FAF8F3",
    border:      "none",
    outline:     "none",
    resize:      "none",
    fontFamily:  "system-ui, -apple-system, sans-serif",
    fontSize:    "13px",
    lineHeight:  "1.45",
    minHeight:   "52px",
    boxSizing:   "border-box",
    padding:     "0",
  });
  textarea.placeholder = "Type a note…";
  textarea.rows = 2;

  const btn = document.createElement("button");
  btn.textContent = "SAVE";
  Object.assign(btn.style, {
    alignSelf:     "flex-end",
    background:    "#C9A84C",
    color:         "#1A2744",
    border:        "none",
    borderRadius:  "4px",
    padding:       "4px 12px",
    fontSize:      "11px",
    fontFamily:    "system-ui, -apple-system, sans-serif",
    fontWeight:    "700",
    letterSpacing: "0.06em",
    cursor:        "pointer",
  });

  function submit() {
    const text = textarea.value.trim();
    hideFloatingInput();
    if (text) {
      sendToSidebar({ type: "FLOATING_NOTE_SUBMIT", text });
    } else {
      sendToSidebar({ type: "FLOATING_NOTE_CANCEL" });
    }
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    submit();
  });

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      submit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      hideFloatingInput();
      sendToSidebar({ type: "FLOATING_NOTE_CANCEL" });
    }
  });

  overlay.appendChild(textarea);
  overlay.appendChild(btn);
  document.documentElement.appendChild(overlay);
  textarea.focus();
}

function hideFloatingInput() {
  document.getElementById(FLOATING_INPUT_ID)?.remove();
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
// Skip layout/utility classes that carry no identity meaning
const GENERIC_CLASSES = new Set([
  'wrapper', 'container', 'inner', 'outer', 'row', 'col', 'block',
  'flex', 'grid', 'relative', 'absolute', 'hidden', 'clearfix',
  'wrap', 'holder', 'content',
]);
// Tailwind utility prefixes (w-*, h-*, p-*, m-*, text-*, etc.) and state/modifier variants
const UTILITY_RE = /^[wh]-|^p[xytrbl]?-|^m[xytrbl]?-|^(text|font|bg|border|rounded|shadow|gap|space|z|opacity|cursor|items|justify|self|leading|tracking|ring|overflow|flex|grid)-|^(hover|focus|active|disabled|sm|md|lg|xl|2xl|peer|group|has|aria):/;
// Framework-generated data attributes that carry no identity meaning.
// Also rejects any attribute whose value looks like a UUID or long hex hash (8+ hex chars with dashes).
const FRAMEWORK_ATTR_RE = /\[data-w-id|data-reactid|data-v-[a-z0-9]+|data-[a-z-]+=["'][0-9a-f]{8}(-[0-9a-f]{4,})+["']/;
// Tags that carry semantic identity
const SEMANTIC_TAGS = new Set([
  'header', 'footer', 'main', 'nav', 'aside', 'section', 'article',
  'form', 'button', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'figure', 'figcaption', 'blockquote', 'dialog',
  'details', 'summary', 'select', 'input', 'textarea', 'label',
]);

function isMeaningfulClass(cls) {
  if (!cls) return false;
  if (GENERIC_CLASSES.has(cls)) return false;
  if (UTILITY_RE.test(cls)) return false;
  return true;
}

function countMatches(selector) {
  try { return document.querySelectorAll(selector).length; } catch { return 0; }
}

function getSelector(el) {
  if (
    el === document.documentElement ||
    el === document.head ||
    el === document.body ||
    el.id === RING_ID
  ) {
    return null;
  }

  const tag = el.tagName.toLowerCase();

  // 1. Unique ID
  if (el.id && el.id.trim() && !el.id.startsWith('__markup')) {
    const sel = '#' + CSS.escape(el.id.trim());
    if (sel.length <= 60 && countMatches(sel) === 1) return sel;
  }

  // Collect meaningful classes, shortest first
  const classes = (typeof el.className === 'string')
    ? el.className.trim().split(/\s+/).filter(isMeaningfulClass)
        .sort((a, b) => a.length - b.length)
    : [];

  // 2. Semantic tag + meaningful class
  if (SEMANTIC_TAGS.has(tag) && classes.length > 0) {
    for (const cls of classes) {
      const sel = tag + '.' + CSS.escape(cls);
      if (sel.length <= 60 && countMatches(sel) === 1) return sel;
    }
  }

  // 3. Meaningful class alone; try pairs if no single is unique
  for (const cls of classes) {
    const sel = '.' + CSS.escape(cls);
    if (sel.length <= 60 && countMatches(sel) === 1) return sel;
  }
  if (classes.length >= 2) {
    const sel = '.' + CSS.escape(classes[0]) + '.' + CSS.escape(classes[1]);
    if (sel.length <= 60 && countMatches(sel) === 1) return sel;
  }

  // 4. Semantic tag alone
  if (SEMANTIC_TAGS.has(tag) && countMatches(tag) === 1) return tag;

  // 5. Fall back to css-selector-generator, but reject if it uses framework-generated attributes
  try {
    const sel = getCssSelector(el);
    if (sel && !FRAMEWORK_ATTR_RE.test(sel)) return sel;
    return null;
  } catch {
    return null;
  }
}

// ─── Sprint 11 Pass 9: Container element detection ────────────────
// These tags dump all child text as innerText — useless as a label.
const CONTAINER_TAGS = new Set([
  'nav', 'header', 'footer', 'section', 'main', 'aside',
  'ul', 'ol', 'menu', 'form', 'dialog',
]);
// Concise role-based fallback descriptions for container elements
const CONTAINER_ROLE_LABELS = {
  nav:     "Navigation",
  header:  "Page header",
  footer:  "Page footer",
  main:    "Main content",
  aside:   "Sidebar",
  section: "Section",
  ul:      "List",
  ol:      "List",
  menu:    "Menu",
  form:    "Form",
  dialog:  "Dialog",
};

// ─── Sprint 8 F5: Human-readable element label ────────────────────
// Priority for containers: aria-label > aria-labelledby > role description > innerText (40)
// Priority for leaf elements: aria-label > alt > innerText (120) > tagName.class
function getElementLabel(el) {
  // 1. aria-label — always wins for all elements
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel && ariaLabel.trim()) {
    return ariaLabel.trim().slice(0, 120);
  }

  // 2. alt text (images, inputs)
  const alt = el.getAttribute("alt");
  if (alt && alt.trim()) {
    return alt.trim().slice(0, 120);
  }

  const tag = el.tagName.toLowerCase();

  if (CONTAINER_TAGS.has(tag)) {
    // 3. aria-labelledby — resolve to the referenced element's text
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy && labelledBy.trim()) {
      const ref = document.getElementById(labelledBy.trim().split(/\s+/)[0]);
      if (ref) {
        const refText = (ref.innerText || ref.textContent || "").trim().replace(/\s+/g, " ");
        if (refText) return refText.slice(0, 120);
      }
    }
    // 4. Role-based description (clean, no child-text noise)
    const roleLabel = CONTAINER_ROLE_LABELS[tag];
    if (roleLabel) return roleLabel;
    // 5. Last resort: innerText capped at 40 chars for containers
    const text = (el.innerText || el.textContent || "").trim().replace(/\s+/g, " ");
    if (text) return text.length > 40 ? text.slice(0, 40) + "…" : text;
  } else {
    // Non-container leaf elements: up to 120 chars of innerText
    const text = (el.innerText || el.textContent || "").trim().replace(/\s+/g, " ");
    if (text) {
      return text.length > 120 ? text.slice(0, 120) + "…" : text;
    }
  }

  // Fallback: tagName + first class
  const cls = typeof el.className === "string" && el.className.trim()
    ? "." + el.className.trim().split(/\s+/)[0]
    : "";
  return tag + cls;
}

// ─── Sprint 11 Pass 8: Computed semantic role ──────────────────────
function getElementRole(el) {
  const explicit = el.getAttribute("role");
  if (explicit && explicit.trim()) return explicit.trim();
  const roleMap = {
    nav:    "navigation",
    button: "button",
    h1: "heading", h2: "heading", h3: "heading",
    h4: "heading", h5: "heading", h6: "heading",
    header: "banner",
    footer: "contentinfo",
    main:   "main",
    aside:  "complementary",
    a:      "link",
    input:  "textbox",
    select: "listbox",
  };
  return roleMap[el.tagName.toLowerCase()] || null;
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
  hideFloatingInput();
  hideRing();
  if (isActive) {
    // Restore hover-mode pill instead of hiding
    showEscHint("ESC · EXIT SELECTOR");
  } else {
    hideEscHint();
  }
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
  showEscHint("ESC · EXIT SELECTOR");
  const selector = getSelector(target);
  if (selector) {
    const elementLabel = getElementLabel(target);
    sendToSidebar({ type: "ELEMENT_HOVERED", selector, elementLabel });
  }
}

function onMouseout() {
  if (!isActive || selectedEl) return;
  hideRing();
  showEscHint("ESC · EXIT SELECTOR");
  sendToSidebar({ type: "ELEMENT_HOVER_END" });
}

function onClick(e) {
  if (!isActive) return;
  const target = e.target;
  if (target === ring || target.id === RING_ID) return;
  // Badges handle their own click — don't intercept
  if (target.classList.contains(BADGE_CLASS)) return;
  // Floating input handles its own events — don't intercept
  const floatingEl = document.getElementById(FLOATING_INPUT_ID);
  if (floatingEl && floatingEl.contains(target)) return;

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
  showEscHint("ESC · DESELECT");
  console.log(
    "Markup: selected →",
    target.tagName +
      (target.id ? "#" + target.id : "") +
      (typeof target.className === "string" && target.className
        ? "." + target.className.trim().split(/\s+/).slice(0, 3).join(".")
        : ""),
    "| selector:", selector
  );

  // Sprint 11 Pass 8/9: include label, role, and parent context
  const elementLabel = getElementLabel(target);
  const elementRole  = getElementRole(target);

  // Compute parent context — suppress when noisy or redundant
  const parentEl = target.parentElement;
  let parentContext = null;
  if (parentEl
      && parentEl !== document.body
      && parentEl !== document.documentElement
      && parentEl.tagName.toLowerCase() !== "main") {
    const pLabel = getElementLabel(parentEl);
    if (pLabel && pLabel.trim()) {
      // Suppress if the parent label shares the same first 30 chars as the element label
      // (catches identical labels and the common case where child text == parent text)
      const same30 = elementLabel.slice(0, 30) === pLabel.slice(0, 30);
      if (!same30) parentContext = pLabel;
    }
  }
  sendToSidebar({ type: "ELEMENT_SELECTED", selector, elementLabel, elementRole, parentContext });
  showFloatingInput(target);
}

function onScroll() {
  if (selectedEl) positionRing(selectedEl);
  if (badgeElements.length > 0) onBadgeScroll();
}

function onMousedown(e) {
  if (!isActive) return;
  const target = e.target;
  if (target === ring || target.id === RING_ID) return;
  if (target.classList.contains(BADGE_CLASS)) return;
  const floatingEl = document.getElementById(FLOATING_INPUT_ID);
  if (floatingEl && floatingEl.contains(target)) return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
}

function onPointerdown(e) {
  if (!isActive) return;
  const target = e.target;
  if (target === ring || target.id === RING_ID) return;
  if (target.classList.contains(BADGE_CLASS)) return;
  const floatingEl = document.getElementById(FLOATING_INPUT_ID);
  if (floatingEl && floatingEl.contains(target)) return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
}

function onKeydown(e) {
  if (e.key !== "Escape") return;
  if (selectedEl) {
    // Locked state — just deselect, return to hover mode
    clearSelection();
  } else {
    // Hover mode — exit immediately; pill is cosmetic only
    deactivate();
    showEscHint("SELECTOR OFF");
    setTimeout(() => hideEscHint(), 1500);
  }
}

// ─── Activate / Deactivate ────────────────────────────────────────
function activate() {
  if (isActive) return;
  isActive = true;
  window["__mkp_" + chrome.runtime.id + "_active"] = true;
  selectedEl = null;
  hideRing();
  injectCursorOverride();
  injectIframeBlock();
  ensureRing();
  startMutationObserver();
  document.addEventListener("mouseover", onMouseover, { capture: true, passive: true });
  document.addEventListener("mouseout", onMouseout, { capture: true, passive: true });
  document.addEventListener("click", onClick, { capture: true });
  document.addEventListener("mousedown", onMousedown, { capture: true });
  document.addEventListener("pointerdown", onPointerdown, { capture: true });
  document.addEventListener("scroll", onScroll, { capture: true, passive: true });
  document.addEventListener("keydown", onKeydown, true);
  // Re-render badges if we have notes waiting
  if (currentAnnotatedNotes.length > 0) renderBadges();
  showEscHint("ESC · EXIT SELECTOR");
  sendToSidebar({ type: "MARKUP_ACTIVATED" });
}

function deactivate() {
  if (!isActive) return;
  isActive = false;
  window["__mkp_" + chrome.runtime.id + "_active"] = false;
  clearSelection(); // also calls hideFloatingInput
  hideRing();
  hideEscHint();
  removeCursorOverride();
  removeIframeBlock();
  stopMutationObserver();
  clearAllBadges(); // Sprint 8 F6: remove all annotation badges on deactivate
  document.removeEventListener("mouseover", onMouseover, { capture: true });
  document.removeEventListener("mouseout", onMouseout, { capture: true });
  document.removeEventListener("click", onClick, { capture: true });
  document.removeEventListener("mousedown", onMousedown, { capture: true });
  document.removeEventListener("pointerdown", onPointerdown, { capture: true });
  document.removeEventListener("scroll", onScroll, { capture: true });
  document.removeEventListener("keydown", onKeydown, true);
  sendToSidebar({ type: "MARKUP_DEACTIVATED" });
}

// ─── Sprint 11 Pass 15: Screenshot mode ───────────────────────────
function enterScreenshotMode() {
  if (isScreenshotMode) return;
  isScreenshotMode = true;

  // Suspend element selection event handlers for the duration of screenshot mode
  document.removeEventListener("mouseover", onMouseover, { capture: true });
  document.removeEventListener("mouseout",  onMouseout,  { capture: true });
  document.removeEventListener("click",     onClick,     { capture: true });
  hideRing();

  // Dim overlay — captures mouse events, cursor: crosshair
  ssOverlay = document.createElement("div");
  ssOverlay.id = SCREENSHOT_OVERLAY_ID;
  Object.assign(ssOverlay.style, {
    all:          "initial",
    position:     "fixed",
    inset:        "0",
    zIndex:       "999998",
    cursor:       "crosshair",
    userSelect:   "none",
  });
  document.documentElement.appendChild(ssOverlay);

  const ssBanner = document.createElement("div");
  ssBanner.id = "__markup-ss-banner";
  Object.assign(ssBanner.style, {
    all:            "initial",
    position:       "fixed",
    top:            "16px",
    left:           "50%",
    transform:      "translateX(-50%)",
    zIndex:         "1000000",
    background:     "rgba(13,13,13,0.82)",
    color:          "#FAF8F3",
    fontFamily:     "DM Sans, sans-serif",
    fontSize:       "13px",
    fontWeight:     "500",
    padding:        "8px 18px",
    borderRadius:   "20px",
    pointerEvents:  "none",
    whiteSpace:     "nowrap",
    letterSpacing:  "0.02em",
  });
  ssBanner.textContent = "Click and drag to capture a region  ·  Esc to cancel";
  document.documentElement.appendChild(ssBanner);

  // Selection box — hidden until drag starts; box-shadow creates the dim effect outside selection
  ssSelection = document.createElement("div");
  ssSelection.id = SCREENSHOT_SEL_ID;
  Object.assign(ssSelection.style, {
    all:          "initial",
    position:     "fixed",
    display:      "none",
    border:       "2px dashed #C9A84C",
    boxShadow:    "0 0 0 9999px rgba(0,0,0,0.45)",
    background:   "transparent",
    zIndex:       "999999",
    pointerEvents:"none",
    boxSizing:    "border-box",
  });
  document.documentElement.appendChild(ssSelection);

  ssOverlay.addEventListener("mousedown", onSsMousedown);
  document.addEventListener("keydown", onSsKeydown, true);
}

function exitScreenshotMode() {
  if (!isScreenshotMode) return;
  isScreenshotMode = false;

  ssOverlay?.removeEventListener("mousedown", onSsMousedown);
  document.removeEventListener("keydown",    onSsKeydown, true);
  document.removeEventListener("mousemove",  onSsMousemove);
  document.removeEventListener("mouseup",    onSsMouseup);

  ssOverlay?.remove();   ssOverlay   = null;
  ssSelection?.remove(); ssSelection = null;

  const ssBanner = document.getElementById("__markup-ss-banner");
  if (ssBanner) ssBanner.remove();

  sendToSidebar({ type: "SCREENSHOT_MODE_EXITED" });

  // Restore element selection handlers if markup is still active
  if (isActive) {
    document.addEventListener("mouseover", onMouseover, { capture: true, passive: true });
    document.addEventListener("mouseout",  onMouseout,  { capture: true, passive: true });
    document.addEventListener("click",     onClick,     { capture: true });
    showEscHint("ESC · EXIT SELECTOR");
  }
}

function onSsKeydown(e) {
  if (e.key !== "Escape") return;
  e.preventDefault();
  exitScreenshotMode();
}

function onSsMousedown(e) {
  e.preventDefault();
  e.stopPropagation();
  ssStartX = e.clientX;
  ssStartY = e.clientY;
  document.addEventListener("mousemove", onSsMousemove);
  document.addEventListener("mouseup",   onSsMouseup);
}

function onSsMousemove(e) {
  const x = Math.min(e.clientX, ssStartX);
  const y = Math.min(e.clientY, ssStartY);
  const w = Math.abs(e.clientX - ssStartX);
  const h = Math.abs(e.clientY - ssStartY);
  if (w > 4 || h > 4) {
    ssSelection.style.display  = "block";
    ssSelection.style.left     = x + "px";
    ssSelection.style.top      = y + "px";
    ssSelection.style.width    = w + "px";
    ssSelection.style.height   = h + "px";
  }
}

function onSsMouseup(e) {
  document.removeEventListener("mousemove", onSsMousemove);
  document.removeEventListener("mouseup",   onSsMouseup);

  const dx = Math.abs(e.clientX - ssStartX);
  const dy = Math.abs(e.clientY - ssStartY);

  exitScreenshotMode();

  const dpr = window.devicePixelRatio || 1;
  let rect;
  if (dx < 5 && dy < 5) {
    // Click without meaningful drag — full viewport
    rect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight, dpr };
  } else {
    rect = {
      x:      Math.min(e.clientX, ssStartX),
      y:      Math.min(e.clientY, ssStartY),
      width:  dx,
      height: dy,
      dpr,
    };
  }

  // Wait for DOM removal to repaint before triggering capture
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sendToSidebar({ type: "SCREENSHOT_REGION_SELECTED", rect });
    });
  });
}

// ─── Message listener ─────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "MARKUP_ACTIVATE") {
    exitScreenshotMode(); // cancel screenshot if active (mutually exclusive)
    activate();
  }
  if (message.type === "MARKUP_DEACTIVATE") deactivate();
  if (message.type === "MARKUP_DESELECT") clearSelection();
  // Sprint 11 Pass 15: enter/exit screenshot selection mode
  if (message.type === "ENTER_SCREENSHOT_MODE") enterScreenshotMode();
  if (message.type === "EXIT_SCREENSHOT_MODE") exitScreenshotMode();

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
