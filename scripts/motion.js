(function () {
  function boot() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", function () {
      gsap.set(
        [
          ".hero__media",
          ".hero__name .word",
          ".hero__tag",
          ".hero .socials a",
          ".timeline__item",
          ".work-item",
          ".stack-cluster",
        ],
        { clearProps: "all" }
      );
      return function () {};
    });

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      var ctx = gsap.context(function () {
        gsap.set(
          [".hero__media", ".hero__name .word", ".hero__tag", ".hero .socials a"],
          {
            autoAlpha: 0,
            y: 16,
          }
        );

        var hero = gsap.timeline({ defaults: { ease: "power2.out" } });
        hero
          .to(".hero__media", { autoAlpha: 1, y: 0, duration: 0.55 })
          .to(
            ".hero__name .word",
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.08,
              ease: "power3.out",
            },
            "-=0.25"
          )
          .to(".hero__tag", { autoAlpha: 1, y: 0, duration: 0.45 }, "-=0.3")
          .to(
            ".hero .socials a",
            { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.04 },
            "-=0.2"
          );

        gsap.set([".timeline__item", ".work-item", ".stack-cluster"], {
          autoAlpha: 0,
          y: 18,
        });

        ScrollTrigger.batch(".timeline__item", {
          start: "top 85%",
          once: true,
          onEnter: function (batch) {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: "power2.out",
              overwrite: true,
            });
          },
        });

        ScrollTrigger.batch(".work-item", {
          start: "top 85%",
          once: true,
          onEnter: function (batch) {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.06,
              ease: "power2.out",
              overwrite: true,
            });
          },
        });

        ScrollTrigger.batch(".stack-cluster", {
          start: "top 85%",
          once: true,
          onEnter: function (batch) {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.05,
              ease: "power2.out",
              overwrite: true,
            });
          },
        });
      });

      return function () {
        ctx.revert();
      };
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        ScrollTrigger.refresh();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
