/* Sin Rueda Tecnológica — interactions */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---- Theme toggle ---- */
  var toggle = document.querySelector(".theme-toggle");
  function syncToggle() {
    var isLight = root.getAttribute("data-theme") === "light";
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(isLight));
      toggle.setAttribute(
        "aria-label",
        isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro"
      );
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isLight ? "#ffffff" : "#171b22");
  }
  syncToggle();

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("srt-theme", next); } catch (e) {}
      syncToggle();
    });
  }

  /* Respect OS changes only if the user hasn't chosen explicitly */
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: light)");
    var onChange = function (e) {
      var stored = null;
      try { stored = localStorage.getItem("srt-theme"); } catch (err) {}
      if (!stored) {
        root.setAttribute("data-theme", e.matches ? "light" : "dark");
        syncToggle();
      }
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ---- Mobile nav ---- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  function closeNav() {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("is-open");
    mobileNav.hidden = true;
  }
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      if (open) {
        closeNav();
      } else {
        navToggle.setAttribute("aria-expanded", "true");
        mobileNav.hidden = false;
        // allow display before animating-in class
        requestAnimationFrame(function () { mobileNav.classList.add("is-open"); });
      }
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---- Sticky header shadow ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.setAttribute("data-scrolled", String(window.scrollY > 8));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Product filters ---- */
  var chips = document.querySelectorAll(".filters .chip");
  var cards = document.querySelectorAll("#product-grid .card");
  var emptyMsg = document.querySelector(".products__empty");
  if (chips.length && cards.length) {
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var filter = chip.getAttribute("data-filter");
        chips.forEach(function (c) {
          var active = c === chip;
          c.classList.toggle("is-active", active);
          c.setAttribute("aria-pressed", String(active));
        });
        var shown = 0;
        cards.forEach(function (card) {
          var match = filter === "all" || card.getAttribute("data-lang") === filter;
          card.classList.toggle("is-hidden", !match);
          if (match) shown++;
        });
        if (emptyMsg) emptyMsg.hidden = shown !== 0;
      });
    });
  }

  /* ---- Reveal on scroll (enhances already-visible content) ---- */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealTargets = [
    ".section__head", ".card", ".step", ".tech__item",
    ".why__copy", ".why__art", ".founder__photo", ".founder__copy",
    ".qa", ".cta-final__inner", ".hero__copy", ".hero__art"
  ];
  var nodes = [];
  revealTargets.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (n) { nodes.push(n); });
  });

  if (reduce || !("IntersectionObserver" in window)) {
    nodes.forEach(function (n) { n.classList.add("reveal", "is-in"); });
  } else {
    // group siblings to stagger
    nodes.forEach(function (n) {
      n.classList.add("reveal");
      var idx = Array.prototype.indexOf.call(n.parentElement.children, n);
      var delay = Math.min(idx % 4, 3);
      if (delay > 0) n.setAttribute("data-delay", String(delay));
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    nodes.forEach(function (n) { io.observe(n); });

    // Failsafe: never leave content hidden. If the observer hasn't revealed a
    // node within 1.2s (headless render, background tab, scroll-to-anchor on
    // load), force it visible.
    window.setTimeout(function () {
      nodes.forEach(function (n) { n.classList.add("is-in"); });
    }, 1200);
  }
})();
