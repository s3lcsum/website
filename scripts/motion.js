(function () {
  function boot() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", function () {
      gsap.set(
        [".avatar", ".hero__name", ".hero__tag", ".hero__lede", ".hero .socials", ".hero__ctas", ".timeline__item", ".work-card", ".stack-cluster"],
        { clearProps: "all" }
      );
      return function () {};
    });

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      var ctx = gsap.context(function () {
        gsap.set(
          [".avatar", ".hero__name", ".hero__tag", ".hero__lede", ".hero .socials", ".hero__ctas"],
          { autoAlpha: 0, y: 10 }
        );

        var hero = gsap.timeline({ defaults: { ease: "power1.out", duration: 0.45 } });
        hero
          .to(".avatar", { autoAlpha: 1, y: 0 })
          .to(".hero__name", { autoAlpha: 1, y: 0 }, "-=0.25")
          .to(".hero__tag", { autoAlpha: 1, y: 0 }, "-=0.28")
          .to(".hero__lede", { autoAlpha: 1, y: 0 }, "-=0.28")
          .to(".hero .socials", { autoAlpha: 1, y: 0 }, "-=0.25")
          .to(".hero__ctas", { autoAlpha: 1, y: 0 }, "-=0.25");

        gsap.set([".timeline__item", ".work-card", ".stack-cluster"], {
          autoAlpha: 0,
          y: 12,
        });

        ScrollTrigger.batch(".timeline__item", {
          start: "top 88%",
          once: true,
          onEnter: function (batch) {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.06,
              ease: "power1.out",
              overwrite: true,
            });
          },
        });

        ScrollTrigger.batch(".work-card", {
          start: "top 88%",
          once: true,
          onEnter: function (batch) {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.05,
              ease: "power1.out",
              overwrite: true,
            });
          },
        });

        ScrollTrigger.batch(".stack-cluster", {
          start: "top 88%",
          once: true,
          onEnter: function (batch) {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.35,
              stagger: 0.04,
              ease: "power1.out",
              overwrite: true,
            });
          },
        });
      });

      return function () {
        ctx.revert();
      };
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
