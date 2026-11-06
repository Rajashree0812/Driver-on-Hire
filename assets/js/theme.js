/**
 * DriveEase - Theme Switcher (Dark / Light Mode)
 * Persists user choice in localStorage across all pages
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'driveease_theme';
  const htmlEl = document.documentElement;

  // Detect initial theme
  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  // Apply theme to HTML tag
  function applyTheme(theme) {
    if (theme === 'dark') {
      htmlEl.setAttribute('data-bs-theme', 'dark');
      document.body && document.body.classList.add('dark-theme');
    } else {
      htmlEl.setAttribute('data-bs-theme', 'light');
      document.body && document.body.classList.remove('dark-theme');
    }
    updateThemeToggles(theme);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  // Update theme toggle icons across the DOM (No floating text tooltips)
  function updateThemeToggles(theme) {
    const toggles = document.querySelectorAll('.theme-toggle-btn');
    toggles.forEach(btn => {
      // Remove title and tooltip attributes so no popup words ever appear
      btn.removeAttribute('title');
      btn.removeAttribute('data-bs-toggle');
      btn.removeAttribute('data-bs-original-title');
      btn.removeAttribute('aria-describedby');
      if (window.bootstrap && window.bootstrap.Tooltip) {
        const existingTooltip = window.bootstrap.Tooltip.getInstance(btn);
        if (existingTooltip) {
          existingTooltip.dispose();
        }
      }
      // Clean up any rogue tooltip floating elements
      document.querySelectorAll('.tooltip').forEach(tt => tt.remove());

      const icon = btn.querySelector('i');
      if (icon) {
        if (theme === 'dark') {
          icon.className = 'bi bi-sun-fill text-warning';
        } else {
          icon.className = 'bi bi-moon-stars-fill text-primary';
        }
      }
    });
  }

  // Toggle function
  window.toggleDriveEaseTheme = function () {
    const currentTheme = htmlEl.getAttribute('data-bs-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  // Immediate execution to prevent flash of wrong theme
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  // Bind DOM elements on load
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getPreferredTheme());
    const toggles = document.querySelectorAll('.theme-toggle-btn');
    toggles.forEach(btn => {
      // Ensure zero tooltip attributes upon hovering or placing cursor
      btn.removeAttribute('title');
      btn.removeAttribute('data-bs-original-title');
      btn.removeAttribute('data-bs-toggle');
      btn.removeAttribute('aria-describedby');

      btn.addEventListener('mouseenter', () => {
        btn.removeAttribute('title');
        btn.removeAttribute('data-bs-original-title');
        btn.removeAttribute('aria-describedby');
        if (window.bootstrap && window.bootstrap.Tooltip) {
          const tt = window.bootstrap.Tooltip.getInstance(btn);
          if (tt) tt.dispose();
        }
        document.querySelectorAll('.tooltip').forEach(el => el.remove());
      });

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.toggleDriveEaseTheme();
      });
    });
  });
})();
