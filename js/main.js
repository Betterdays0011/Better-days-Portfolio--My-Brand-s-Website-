/* ==========================================================================
   main.js - small interface behaviours shared by every page
   1. Mobile menu: open and close the navigation on small screens
   2. Header shadow once the page has been scrolled
   3. Footer year, kept up to date automatically
   ========================================================================== */
(function () {
  'use strict';

  // --- 1. Mobile menu ------------------------------------------------------
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
  }

  if (toggle && nav) {
    // Click on the hamburger button toggles the menu.
    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setMenu(!isOpen);
    });

    // Choosing a link closes the menu (useful for same-page anchors).
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    // Escape closes the menu and returns focus to the button.
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });

    // Clicking anywhere outside the header closes the menu.
    document.addEventListener('click', function (event) {
      if (!event.target.closest('.site-header')) setMenu(false);
    });

    // Rotating to a wide screen resets the menu state.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  // --- 2. Header shadow on scroll -------------------------------------------
  var header = document.querySelector('.site-header');
  function updateHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // --- 3. Footer year -------------------------------------------------------
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
