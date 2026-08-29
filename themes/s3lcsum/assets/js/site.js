(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof gsap !== "undefined";
  const hasST = typeof ScrollTrigger !== "undefined";
  const hasSwup = typeof Swup !== "undefined";

  let pageCtx = null;
  let scrollUnbind = null;
  let resizeUnbind = null;

  const clearMotion = (targets) => {
    if (!hasGsap || !targets) return;
    gsap.set(targets, { clearProps: "opacity,visibility,transform" });
  };

  const safeTargets = () =>
    document.querySelectorAll(
      ".card-portrait, .card-id .kicker, .card-id h1, .card-id .lede, .contact-list li, .card-actions, .card-foot, [data-reveal], #swup"
    );

  const ensureVisible = () => {
    clearMotion(safeTargets());
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
  };

  const killPageMotion = () => {
    if (pageCtx) {
      pageCtx.revert();
      pageCtx = null;
    }
    if (hasST) {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    }
    ensureVisible();
  };

  const unbindProgress = () => {
    if (scrollUnbind) {
      scrollUnbind();
      scrollUnbind = null;
    }
    if (resizeUnbind) {
      resizeUnbind();
      resizeUnbind = null;
    }
  };

  const initNav = () => {
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");
    if (!toggle || !nav || toggle.dataset.bound === "1") return;
    toggle.dataset.bound = "1";
    toggle.addEventListener("click", () => {
      const open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      toggle.setAttribute("aria-expanded", String(!open));
    });
  };

  const initProgress = () => {
    unbindProgress();
    const progress = document.querySelector("[data-cv-progress]");
    if (!progress) return;

    const updateProgress = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const pct = scrollable > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / scrollable) * 100)) : 0;
      progress.style.width = pct + "%";
    };

    updateProgress();
    const onScroll = () => updateProgress();
    const onResize = () => updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    scrollUnbind = () => window.removeEventListener("scroll", onScroll);
    resizeUnbind = () => window.removeEventListener("resize", onResize);
  };

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
    if (reduceMotion || !hasGsap) {
      el.textContent = String(target);
      return;
    }
    const obj = { n: 0 };
    gsap.to(obj, {
      n: target,
      duration: 1.05,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = String(Math.round(obj.n));
      },
    });
  };

  const initCounters = () => {
    const counters = document.querySelectorAll("[data-count-to]");
    if (!counters.length) return;

    if (!hasGsap || !hasST || reduceMotion) {
      counters.forEach((el) => {
        el.textContent = String(parseInt(el.getAttribute("data-count-to"), 10) || 0);
      });
      return;
    }

    counters.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => animateCounter(el),
      });
    });
  };

  const initHomeEntrance = () => {
    if (!document.body.classList.contains("is-home")) return;

    const portrait = document.querySelector(".card-portrait");
    const kicker = document.querySelector(".card-id .kicker");
    const title = document.querySelector(".card-id h1");
    const lede = document.querySelector(".card-id .lede");
    const socials = gsap.utils.toArray(".contact-list li");
    const actions = document.querySelector(".card-actions");
    const foot = document.querySelector(".card-foot");
    const homeTargets = [portrait, kicker, title, lede, actions, foot, ...socials].filter(Boolean);
    if (!homeTargets.length) return;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => clearMotion(homeTargets),
    });

    if (portrait) {
      tl.from(portrait, { y: 36, autoAlpha: 0, scale: 0.96, duration: 0.7 }, 0);
    }
    if (kicker) {
      tl.from(kicker, { y: 22, autoAlpha: 0, duration: 0.55 }, 0.14);
    }
    if (title) {
      tl.from(title, { y: 28, autoAlpha: 0, duration: 0.7 }, 0.22);
    }
    if (lede) {
      tl.from(lede, { y: 22, autoAlpha: 0, duration: 0.6 }, 0.34);
    }
    if (socials.length) {
      tl.from(
        socials,
        { y: 20, autoAlpha: 0, duration: 0.5, stagger: { each: 0.055, from: "start" } },
        0.48
      );
    }
    if (actions) {
      tl.from(actions, { y: 18, autoAlpha: 0, duration: 0.55 }, 0.72);
    }
    if (foot) {
      tl.from(foot, { y: 14, autoAlpha: 0, duration: 0.45 }, 0.82);
    }

    // Never leave the face stuck invisible if a tween is interrupted.
    window.setTimeout(() => {
      if (portrait) clearMotion(portrait);
      clearMotion(homeTargets);
    }, 2400);
  };

  const initReveals = () => {
    const revealEls = gsap.utils.toArray("[data-reveal]");
    if (!revealEls.length || !hasST) return;

    ScrollTrigger.batch(revealEls, {
      start: "top 88%",
      once: true,
      interval: 0.1,
      batchMax: 8,
      onEnter: (batch) => {
        gsap.from(batch, {
          y: 40,
          autoAlpha: 0,
          duration: 0.7,
          stagger: 0.09,
          ease: "power3.out",
          overwrite: true,
          onComplete: () => clearMotion(batch),
        });
        batch.forEach((el) => el.classList.add("is-visible"));
      },
    });

    window.setTimeout(() => clearMotion(revealEls), 3200);
  };

  const initNavHover = () => {
    if (window.matchMedia("(hover: none)").matches) return;
    const links = gsap.utils.toArray(".mast-nav a");
    if (!links.length) return;

    links.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        gsap.to(link, { y: -2, duration: 0.22, ease: "power2.out", overwrite: "auto" });
      });
      link.addEventListener("mouseleave", () => {
        gsap.to(link, { y: 0, duration: 0.28, ease: "power2.out", overwrite: "auto" });
      });
    });
  };

  const initPageMotion = () => {
    killPageMotion();
    if (!hasGsap || reduceMotion) {
      ensureVisible();
      initCounters();
      return;
    }

    if (hasST) gsap.registerPlugin(ScrollTrigger);

    pageCtx = gsap.context(() => {
      initHomeEntrance();
      initReveals();
      initNavHover();
      initCounters();
    });
  };

  const initPage = () => {
    initNav();
    initProgress();
    initPageMotion();
    if (hasST) ScrollTrigger.refresh();
  };

  const waitTween = (tween) =>
    new Promise((resolve) => {
      if (!tween) {
        resolve();
        return;
      }
      tween.eventCallback("onComplete", resolve);
    });

  const initSwup = () => {
    if (!hasSwup) return;

    const plugins = [];
    if (typeof SwupHeadPlugin !== "undefined") {
      plugins.push(
        new SwupHeadPlugin({
          persistAssets: true,
          awaitAssets: false,
        })
      );
    }
    if (typeof SwupBodyClassPlugin !== "undefined") {
      plugins.push(new SwupBodyClassPlugin());
    }

    const swup = new Swup({
      containers: ["#swup"],
      animationSelector: false,
      animateHistoryBrowsing: true,
      plugins,
    });

    swup.hooks.replace("animation:out:await", async () => {
      const el = document.querySelector("#swup");
      if (!el) return;

      if (reduceMotion || !hasGsap) {
        killPageMotion();
        return;
      }

      killPageMotion();
      await waitTween(
        gsap.to(el, {
          autoAlpha: 0,
          y: -28,
          duration: 0.38,
          ease: "power2.in",
          overwrite: true,
        })
      );
    });

    swup.hooks.replace("animation:in:await", async () => {
      const el = document.querySelector("#swup");
      if (!el) return;

      if (reduceMotion || !hasGsap) {
        clearMotion(el);
        return;
      }

      gsap.set(el, { autoAlpha: 0, y: 32 });
      await waitTween(
        gsap.to(el, {
          autoAlpha: 1,
          y: 0,
          duration: 0.52,
          ease: "power3.out",
          overwrite: true,
          clearProps: "opacity,visibility,transform",
        })
      );
    });

    swup.hooks.on("page:view", () => {
      window.scrollTo(0, 0);
      initPage();
    });

    swup.hooks.on("visit:start", () => {
      const nav = document.querySelector("[data-nav]");
      const toggle = document.querySelector("[data-nav-toggle]");
      if (nav) nav.setAttribute("data-open", "false");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        delete toggle.dataset.bound;
      }
    });
  };

  // Fail-safe: if GSAP never settles, keep content readable.
  window.setTimeout(ensureVisible, 2800);

  initPage();
  initSwup();
})();
