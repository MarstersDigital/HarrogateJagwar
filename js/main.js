/**
 * Harrogate Jagwar Specialists - Interactive Functionality
 * Includes: Sticky Header, Mobile Navigation, Lightbox Gallery, Form Dispatch
 */

(function () {
  "use strict";

  // --- 1. Sticky Header ---
  const header = document.querySelector(".site-header");
  function handleScroll() {
    if (header) {
      if (window.scrollY > 15) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }
  }
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // --- 2. Mobile Navigation Toggle ---
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      const isOpen = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });

    // Close when clicking any nav link
    const navLinks = siteNav.querySelectorAll("a");
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

    // Close with Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        document.body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  // --- 3. Dynamic Copyright Year ---
  const yearSpans = document.querySelectorAll(".current-year");
  const currentYear = new Date().getFullYear();
  yearSpans.forEach(function (el) {
    el.textContent = currentYear;
  });

  // --- 4. Gallery Filtering & Lightbox ---
  const galleryItems = document.querySelectorAll(".gallery-item");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");

  let activeIndex = 0;
  let visibleItems = Array.from(galleryItems);

  // Gallery Filters
  if (filterBtns.length > 0) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const category = btn.getAttribute("data-filter");

        galleryItems.forEach(function (item) {
          const itemCat = item.getAttribute("data-category");
          if (category === "all" || itemCat === category) {
            item.style.display = "block";
          } else {
            item.style.display = "none";
          }
        });

        // Update list of visible items for lightbox navigation
        visibleItems = Array.from(galleryItems).filter(item => item.style.display !== "none");
      });
    });
  }

  // Lightbox Open & Navigation
  function updateLightbox(index) {
    if (!visibleItems.length) return;
    if (index < 0) index = visibleItems.length - 1;
    if (index >= visibleItems.length) index = 0;
    activeIndex = index;

    const currentItem = visibleItems[activeIndex];
    const imgSrc = currentItem.getAttribute("data-src") || currentItem.querySelector("img").src;
    const title = currentItem.getAttribute("data-title") || "";
    const subtitle = currentItem.getAttribute("data-subtitle") || "";

    if (lightboxImg) {
      lightboxImg.src = imgSrc;
      lightboxImg.alt = title;
    }
    if (lightboxCaption) {
      lightboxCaption.innerHTML = `<strong>${title}</strong><br><span style="color:var(--color-bronze); font-size:0.88rem;">${subtitle}</span>`;
    }
  }

  function openLightbox(index) {
    if (!lightbox) return;
    updateLightbox(index);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (galleryItems.length > 0 && lightbox) {
    galleryItems.forEach(function (item, idx) {
      item.addEventListener("click", function () {
        const visibleIdx = visibleItems.indexOf(item);
        openLightbox(visibleIdx !== -1 ? visibleIdx : idx);
      });
    });

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener("click", () => updateLightbox(activeIndex - 1));
    if (lightboxNext) lightboxNext.addEventListener("click", () => updateLightbox(activeIndex + 1));

    // Close on background click
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") updateLightbox(activeIndex - 1);
      if (e.key === "ArrowRight") updateLightbox(activeIndex + 1);
    });
  }

})();
