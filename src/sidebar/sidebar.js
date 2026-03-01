// Markup — Sidebar Script — Sprint 2

console.log("Markup: sidebar ready");

// ─── Close button ────────────────────────────────────────────────
const closeBtn = document.getElementById("close-btn");
closeBtn.addEventListener("click", () => {
  window.close();
});

// ─── Type picker ─────────────────────────────────────────────────
const typeButtons = document.querySelectorAll(".type-btn");

typeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    typeButtons.forEach((b) => {
      b.classList.remove("type-btn--active");
      b.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("type-btn--active");
    btn.setAttribute("aria-pressed", "true");
  });
});
