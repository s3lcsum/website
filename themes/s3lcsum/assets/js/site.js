(function () {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      toggle.setAttribute("aria-expanded", String(!open));
    });
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reading progress rule for long single-page documents (currently just the CV)
  const progress = document.querySelector("[data-cv-progress]");
  if (progress) {
    const updateProgress = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const pct = scrollable > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / scrollable) * 100)) : 0;
      progress.style.width = pct + "%";
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  // Reveal-on-scroll for CV rows, skill cards and certification seals
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      // Positive bottom margin only ever widens the trigger zone, so an
      // element can't end up permanently unrevealed on a viewport tall
      // enough to fit the whole page without scrolling.
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.01, rootMargin: "0px 0px 80px 0px" }
      );
      revealEls.forEach((el) => revealObserver.observe(el));

      // Safety net: never leave content invisible if intersection timing
      // doesn't work out the way it's expected to on some viewport/browser.
      window.setTimeout(() => {
        revealEls.forEach((el) => el.classList.add("is-visible"));
      }, 2500);
    }
  }

  // Counting-up stat numbers (years, roles, companies, languages)
  const counters = document.querySelectorAll("[data-count-to]");
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
      if (reduceMotion) {
        el.textContent = String(target);
        return;
      }
      const duration = 900;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(eased * target));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach((el) => counterObserver.observe(el));
    } else {
      counters.forEach((el) => animateCounter(el));
    }
  }
})();
