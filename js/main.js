/* Shared site behaviour: nav, scroll-reveal, lightbox, footer year */
(function () {
  "use strict";

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { links.classList.remove("open"); });
    });
  }

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Lightbox for gallery images ---- */
  var lb = document.querySelector(".lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    document.querySelectorAll(".frame-img img").forEach(function (img) {
      img.addEventListener("click", function () {
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt || "";
        lb.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    });
    function closeLb() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    lb.addEventListener("click", closeLb);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });
  }

  /* ---- Footer year ---- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
