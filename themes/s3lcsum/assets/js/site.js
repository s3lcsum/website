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

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const counters = document.querySelectorAll("[data-count-to]");

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
    if (reduceMotion || typeof gsap === "undefined") {
      el.textContent = String(target);
      return;
    }
    const obj = { n: 0 };
    gsap.to(obj, {
      n: target,
      duration: 0.9,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = String(Math.round(obj.n));
      },
    });
  };

  if (counters.length) {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || reduceMotion) {
      counters.forEach((el) => {
        el.textContent = String(parseInt(el.getAttribute("data-count-to"), 10) || 0);
      });
    } else {
      gsap.registerPlugin(ScrollTrigger);
      counters.forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () => animateCounter(el),
        });
      });
    }
  }

  if (typeof gsap === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const clearMotion = (targets) => {
    gsap.set(targets, { clearProps: "opacity,visibility,transform" });
  };

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const home = document.querySelector("body.is-home");
    if (home) {
      const portrait = home.querySelector(".card-portrait");
      const kicker = home.querySelector(".card-id .kicker");
      const title = home.querySelector(".card-id h1");
      const lede = home.querySelector(".card-id .lede");
      const socials = home.querySelectorAll(".contact-list li");
      const actions = home.querySelector(".card-actions");
      const foot = home.querySelector(".card-foot");
      const homeTargets = [portrait, kicker, title, lede, actions, foot, ...socials].filter(Boolean);

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => clearMotion(homeTargets),
      });

      if (portrait) {
        tl.from(portrait, { y: 18, autoAlpha: 0, duration: 0.55 }, 0);
      }
      if (kicker) {
        tl.from(kicker, { y: 12, autoAlpha: 0, duration: 0.4 }, 0.12);
      }
      if (title) {
        tl.from(title, { y: 14, autoAlpha: 0, duration: 0.5 }, 0.2);
      }
      if (lede) {
        tl.from(lede, { y: 12, autoAlpha: 0, duration: 0.45 }, 0.3);
      }
      if (socials.length) {
        tl.from(socials, { y: 10, autoAlpha: 0, duration: 0.35, stagger: 0.04 }, 0.4);
      }
      if (actions) {
        tl.from(actions, { y: 10, autoAlpha: 0, duration: 0.4 }, 0.55);
      }
      if (foot) {
        tl.from(foot, { y: 8, autoAlpha: 0, duration: 0.35 }, 0.62);
      }

      // Never leave the face stuck invisible if a tween is interrupted.
      window.setTimeout(() => {
        if (portrait) clearMotion(portrait);
        clearMotion(homeTargets);
      }, 2000);
    }

    const revealEls = gsap.utils.toArray("[data-reveal]");
    if (revealEls.length) {
      ScrollTrigger.batch(revealEls, {
        start: "top 92%",
        once: true,
        interval: 0.12,
        batchMax: 6,
        onEnter: (batch) => {
          gsap.from(batch, {
            y: 16,
            autoAlpha: 0,
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.out",
            overwrite: true,
            onComplete: () => clearMotion(batch),
          });
          batch.forEach((el) => el.classList.add("is-visible"));
        },
      });

      window.setTimeout(() => clearMotion(revealEls), 2800);
    }

    return () => {
      clearMotion(document.querySelectorAll(".card-portrait, .card-id .kicker, .card-id h1, .card-id .lede, .contact-list li, .card-actions, .card-foot, [data-reveal]"));
    };
  });
})();
