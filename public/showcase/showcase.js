// HarborVoice showcase: navigation, tabs, lazy clips, reveal and motion control.
// No network requests, storage or tracking.
(function () {
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile navigation
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Reveal on scroll
  var items = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach(function (el) {
      io.observe(el);
    });
  }

  // Pause decorative motion (WCAG 2.2.2)
  var motion = document.querySelector("[data-motion-toggle]");
  if (motion) {
    motion.addEventListener("click", function () {
      var paused = doc.classList.toggle("motion-paused");
      motion.setAttribute("aria-pressed", String(paused));
      motion.textContent = paused ? "Play animation" : "Pause animation";
    });
  }

  // Clips: load on demand, autoplay muted only when visible and motion is allowed
  function loadClip(video) {
    if (!video.src && video.dataset.src) {
      video.src = video.dataset.src;
    }
  }
  function setLabel(video) {
    var btn = video.parentElement.querySelector("[data-clip-toggle]");
    if (btn) btn.textContent = video.paused ? "Play" : "Pause";
  }
  document.querySelectorAll(".clip video").forEach(function (video) {
    var btn = video.parentElement.querySelector("[data-clip-toggle]");
    video.addEventListener("play", function () {
      setLabel(video);
    });
    video.addEventListener("pause", function () {
      setLabel(video);
    });
    if (btn) {
      btn.addEventListener("click", function () {
        loadClip(video);
        video.dataset.userPaused = video.paused ? "" : "1";
        if (video.paused) video.play().catch(function () {});
        else video.pause();
      });
    }
  });
  var clipObserver =
    "IntersectionObserver" in window && !reduce
      ? new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              var v = entry.target;
              if (
                entry.isIntersecting &&
                !v.closest("[hidden]") &&
                !v.dataset.userPaused
              ) {
                loadClip(v);
                v.play().catch(function () {});
              } else if (!entry.isIntersecting) {
                v.pause();
              }
            });
          },
          { threshold: 0.35 },
        )
      : null;
  if (clipObserver) {
    document.querySelectorAll(".clip video").forEach(function (v) {
      clipObserver.observe(v);
    });
  }

  // Tabs (WAI-ARIA tabs pattern)
  var tablist = document.querySelector("[data-tour] [role=tablist]");
  if (tablist) {
    var tabs = Array.prototype.slice.call(
      tablist.querySelectorAll("[role=tab]"),
    );
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        panel.hidden = !on;
        var v = panel.querySelector("video");
        if (!on && v) v.pause();
        if (on && v && !reduce && !v.dataset.userPaused) {
          loadClip(v);
          v.play().catch(function () {});
        }
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        select(tab, false);
      });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft")
          next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") next = tabs[0];
        if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          select(next, true);
        }
      });
    });
  }
})();
