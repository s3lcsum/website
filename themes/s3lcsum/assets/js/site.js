(function () {
  const card = document.querySelector("[data-card]");
  if (card) {
    const flip = () => {
      const next = card.getAttribute("aria-pressed") !== "true";
      card.setAttribute("aria-pressed", String(next));
      card.classList.toggle("is-flipped", next);
    };

    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      flip();
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        flip();
      }
    });
  }

  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      toggle.setAttribute("aria-expanded", String(!open));
    });
  }
})();
