document.documentElement.classList.add('js');

/* =====================================================================
   Sanjay Events GRD — script.js
   Plain JavaScript, no libraries.
   1. Mobile navigation menu
   2. Header shadow on scroll + current section link
   3. Scroll reveal animation
   4. Gallery filtering
   5. Lightbox (open / next / prev / keyboard / swipe)
   6. Footer year
   ===================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. MOBILE NAVIGATION
     ------------------------------------------------------------------ */
  var toggle = document.getElementById('nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');

  function closeMenu() {
    if (!mobileNav) return;
    mobileNav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  function openMenu() {
    mobileNav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      if (mobileNav.classList.contains('is-open')) { closeMenu(); } else { openMenu(); }
    });

    // Close after choosing a link
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Tap outside the menu closes it (mobile only)
    document.addEventListener('click', function (e) {
      if (!mobileNav.classList.contains('is-open')) return;
      if (mobileNav.contains(e.target) || toggle.contains(e.target)) return;
      closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900) closeMenu();
    });
  }

  /* ------------------------------------------------------------------
     2. HEADER SHADOW + CURRENT SECTION HIGHLIGHT
     ------------------------------------------------------------------ */
  var header = document.getElementById('site-header');

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-desktop a[href^="#"]'));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-current', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ------------------------------------------------------------------
     3. SCROLL REVEAL
     ------------------------------------------------------------------ */
  var revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealItems.length) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);       // animate once
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(function (item, i) {
      item.style.transitionDelay = (Math.min(i, 5) * 60) + 'ms';
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------
     4. GALLERY FILTERING
     ------------------------------------------------------------------ */
  var chips = document.querySelectorAll('.chip');
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filter = chip.getAttribute('data-filter');

      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      galleryItems.forEach(function (item) {
        var show = filter === 'all' || item.getAttribute('data-cat') === filter;
        item.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* ------------------------------------------------------------------
     5. LIGHTBOX
     ------------------------------------------------------------------ */
  var lightbox = document.getElementById('lightbox');
  var lbImage = document.getElementById('lb-image');
  var lbCaption = document.getElementById('lb-caption');
  var lbClose = document.getElementById('lb-close');
  var lbPrev = document.getElementById('lb-prev');
  var lbNext = document.getElementById('lb-next');
  var currentIndex = 0;
  var lastFocused = null;
  var touchStartX = 0;

  // Only visible items are navigable (respects the active filter)
  function visibleItems() {
    return galleryItems.filter(function (item) { return !item.classList.contains('is-hidden'); });
  }

  function showSlide(index) {
    var items = visibleItems();
    if (!items.length) return;
    currentIndex = (index + items.length) % items.length;

    var item = items[currentIndex];
    var img = item.querySelector('img');
    var full = item.getAttribute('data-full') || (img ? img.getAttribute('src') : '');

    lbImage.src = full;
    lbImage.alt = img ? img.getAttribute('alt') : '';
    lbCaption.textContent = (item.getAttribute('data-caption') || '') +
      '  ·  ' + (currentIndex + 1) + ' / ' + items.length;
  }

  function openLightbox(item) {
    var items = visibleItems();
    lastFocused = document.activeElement;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    showSlide(items.indexOf(item));
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    lbImage.src = '';
    if (lastFocused) lastFocused.focus();
  }

  galleryItems.forEach(function (item) {
    item.addEventListener('click', function () { openLightbox(item); });
  });

  if (lightbox) {
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { showSlide(currentIndex - 1); });
    lbNext.addEventListener('click', function () { showSlide(currentIndex + 1); });

    // Click on the dark backdrop closes the viewer
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard: Esc to close, arrows to move
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showSlide(currentIndex - 1);
      if (e.key === 'ArrowRight') showSlide(currentIndex + 1);
    });

    // Swipe on touch screens
    lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      var delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) < 45) return;
      showSlide(delta > 0 ? currentIndex - 1 : currentIndex + 1);
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     6. FOOTER YEAR
     ------------------------------------------------------------------ */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
