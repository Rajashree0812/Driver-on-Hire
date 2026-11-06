/**
 * DriveEase - Main Website Core Scripts & Micro-interactions
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header
    const header = document.querySelector('.site-header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    }

    // 2. Mobile Dashboard Sidebar Toggle
    const sidebar = document.querySelector('.dashboard-sidebar');
    const sidebarToggleBtn = document.querySelector('#sidebarToggleBtn');
    let backdrop = document.querySelector('.sidebar-backdrop');

    if (sidebar && !backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    if (sidebarToggleBtn && sidebar && backdrop) {
      sidebarToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sidebar.classList.toggle('show');
        backdrop.classList.toggle('show');
      });

      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('show');
        backdrop.classList.remove('show');
      });
    }


    // 4. Animated Numerical Counters
    const counters = document.querySelectorAll('.counter-value');
    if (counters.length > 0) {
      const animateCounters = () => {
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target') || parseInt(counter.textContent.replace(/[^0-9]/g, ''), 10) || 0;
          const prefix = counter.getAttribute('data-prefix') || '';
          const suffix = counter.getAttribute('data-suffix') || '';
          const duration = 1500;
          const stepTime = 30;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = prefix + target.toLocaleString() + suffix;
              clearInterval(timer);
            } else {
              counter.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
            }
          }, stepTime);
        });
      };

      // Run once when in viewport or after load
      setTimeout(animateCounters, 300);
    }

    // 5. Blog Search & Filter Logic (for blog.html)
    const blogSearchInput = document.getElementById('blogSearchInput');
    const blogCategoryBtns = document.querySelectorAll('.blog-filter-cat');
    const blogCards = document.querySelectorAll('.blog-item-col');

    if (blogCards.length > 0) {
      let activeCategory = 'all';
      let searchQuery = '';

      function filterBlogItems() {
        blogCards.forEach(col => {
          const card = col.querySelector('.blog-card');
          const category = (card?.getAttribute('data-category') || '').toLowerCase();
          const title = (card?.querySelector('.blog-title')?.textContent || '').toLowerCase();
          const desc = (card?.querySelector('.blog-desc')?.textContent || '').toLowerCase();

          const matchesCategory = (activeCategory === 'all' || category === activeCategory);
          const matchesSearch = (searchQuery === '' || title.includes(searchQuery) || desc.includes(searchQuery));

          if (matchesCategory && matchesSearch) {
            col.style.display = 'block';
          } else {
            col.style.display = 'none';
          }
        });
      }

      if (blogSearchInput) {
        blogSearchInput.addEventListener('input', (e) => {
          searchQuery = e.target.value.toLowerCase().trim();
          filterBlogItems();
        });
      }

      blogCategoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          blogCategoryBtns.forEach(b => b.classList.remove('active', 'badge-soft-primary'));
          blogCategoryBtns.forEach(b => b.classList.add('badge-soft-secondary'));
          btn.classList.add('active', 'badge-soft-primary');
          btn.classList.remove('badge-soft-secondary');

          activeCategory = (btn.getAttribute('data-cat') || 'all').toLowerCase();
          filterBlogItems();
        });
      });
    }

    // 6. Sync Current User Info across Navbars and Sidebars
    if (window.DriveEaseAuth) {
      const user = window.DriveEaseAuth.getCurrentUser();
      if (user) {
        document.querySelectorAll('.current-user-name').forEach(el => el.textContent = user.fullName || 'Alex Morgan');
        document.querySelectorAll('.current-user-avatar').forEach(img => {
          if (user.avatar) img.src = user.avatar;
        });
      }
    }

    // 7. Initialize Bootstrap Tooltips if Bootstrap is available (Excluding theme and RTL switches)
    if (window.bootstrap && window.bootstrap.Tooltip) {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]:not(.theme-toggle-btn):not(.rtl-toggle-btn)'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new window.bootstrap.Tooltip(tooltipTriggerEl);
      });
    }

    // 8. Logout buttons binding
    document.querySelectorAll('.btn-do-logout').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.DriveEaseAuth) {
          window.DriveEaseAuth.logout();
        }
      });
    });

    // 9. Navbar Active Highlight Management
    // Prevents Home from staying highlighted when touching Services or any other menu item
    document.querySelectorAll('.navbar-nav').forEach(nav => {
      const links = nav.querySelectorAll('.nav-link');
      const activeLink = nav.querySelector('.nav-link.active');

      if (!activeLink) return;

      links.forEach(link => {
        if (link === activeLink) return;

        ['mouseenter', 'touchstart', 'focus', 'click'].forEach(evt => {
          link.addEventListener(evt, () => {
            activeLink.classList.add('temp-inactive');
          }, { passive: true });
        });

        ['mouseleave', 'blur'].forEach(evt => {
          link.addEventListener(evt, () => {
            setTimeout(() => {
              const hasOpenDropdown = nav.querySelector('.show') || nav.querySelector('[aria-expanded="true"]');
              const isAnotherHovered = Array.from(links).some(l => l !== activeLink && l.matches(':hover'));
              if (!hasOpenDropdown && !isAnotherHovered) {
                activeLink.classList.remove('temp-inactive');
              }
            }, 100);
          });
        });
      });

      // Handle Bootstrap dropdown open/close on the navbar & Desktop hover stability
      nav.querySelectorAll('.dropdown').forEach(dropdown => {
        let hoverTimeout;

        dropdown.addEventListener('mouseenter', () => {
          if (window.innerWidth >= 992) {
            clearTimeout(hoverTimeout);
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            if (toggle && menu) {
              toggle.setAttribute('aria-expanded', 'true');
              toggle.classList.add('show');
              menu.classList.add('show');
              if (activeLink && activeLink !== toggle) {
                activeLink.classList.add('temp-inactive');
              }
            }
          }
        });

        dropdown.addEventListener('mouseleave', () => {
          if (window.innerWidth >= 992) {
            hoverTimeout = setTimeout(() => {
              const toggle = dropdown.querySelector('.dropdown-toggle');
              const menu = dropdown.querySelector('.dropdown-menu');
              if (toggle && menu) {
                toggle.setAttribute('aria-expanded', 'false');
                toggle.classList.remove('show');
                menu.classList.remove('show');
                if (activeLink) {
                  activeLink.classList.remove('temp-inactive');
                }
              }
            }, 180);
          }
        });

        dropdown.addEventListener('show.bs.dropdown', () => {
          const toggle = dropdown.querySelector('.nav-link');
          if (activeLink && activeLink !== toggle) {
            activeLink.classList.add('temp-inactive');
          }
        });

        dropdown.addEventListener('hidden.bs.dropdown', () => {
          setTimeout(() => {
            const hasOpenDropdown = nav.querySelector('.show') || nav.querySelector('[aria-expanded="true"]');
            if (!hasOpenDropdown && activeLink) {
              activeLink.classList.remove('temp-inactive');
            }
          }, 100);
        });
      });
    });
  });
})();
