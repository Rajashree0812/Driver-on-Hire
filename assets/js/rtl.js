/**
 * DriveEase - RTL / LTR Layout Switcher
 * Persists direction preference in localStorage across all pages
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'driveease_dir';
  const htmlEl = document.documentElement;

  function getSavedDir() {
    return localStorage.getItem(STORAGE_KEY) || 'ltr';
  }

  function applyDirection(dir) {
    htmlEl.setAttribute('dir', dir);
    if (dir === 'rtl') {
      document.body && document.body.classList.add('rtl-mode');
    } else {
      document.body && document.body.classList.remove('rtl-mode');
    }
    updateRtlToggles(dir);
    window.dispatchEvent(new CustomEvent('dirChanged', { detail: { dir } }));
  }

  function updateRtlToggles(dir) {
    const toggles = document.querySelectorAll('.rtl-toggle-btn');
    toggles.forEach(btn => {
      btn.removeAttribute('title');
      btn.removeAttribute('data-bs-toggle');
      btn.removeAttribute('data-bs-original-title');
      btn.removeAttribute('aria-describedby');
      if (window.bootstrap && window.bootstrap.Tooltip) {
        const tt = window.bootstrap.Tooltip.getInstance(btn);
        if (tt) tt.dispose();
      }
      const textSpan = btn.querySelector('.dir-label');
      if (textSpan) {
        textSpan.textContent = dir.toUpperCase();
      }
    });
  }

  window.toggleDriveEaseRTL = function () {
    const currentDir = htmlEl.getAttribute('dir') || 'ltr';
    const nextDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
    localStorage.setItem(STORAGE_KEY, nextDir);
    applyDirection(nextDir);
  };

  // Immediate execution to prevent flash
  applyDirection(getSavedDir());

  document.addEventListener('DOMContentLoaded', () => {
    applyDirection(getSavedDir());
    const toggles = document.querySelectorAll('.rtl-toggle-btn');
    toggles.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.toggleDriveEaseRTL();
      });
    });
  });
})();
