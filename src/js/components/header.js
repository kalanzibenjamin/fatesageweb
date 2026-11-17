// ========================================
// HEADER COMPONENT
// ========================================

import { $, $$, on, addClass, removeClass, toggleClass, hasClass, domReady } from '../utils/dom.js';
import { debounce, isMobile } from '../utils/helpers.js';

/**
 * Initialize header component
 */
export function initHeader() {
  const header = $('.site-header');
  const navToggle = $('.nav-toggle');
  const navMenu = document.getElementById('nav-menu') || $('.main-nav ul');
  const navLinks = Array.from($$('.main-nav a'));
  
  if (!header) return;
  
  // ========================================
  // 1. MOBILE MENU TOGGLE
  // ========================================
  
  // ✅ FIXED: Define setMenuState in the outer scope
  // so it's accessible to all functions (including resize handler)
  const setMenuState = (isOpen) => {
    if (!navMenu || !navToggle) return;
    
    navMenu.classList.toggle('is-open', isOpen);
    navToggle.classList.toggle('is-active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    navToggle.innerHTML = isOpen ?
      '<i class="fas fa-times"></i>' :
      '<i class="fas fa-bars"></i>';
  };

  const toggleMenu = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!navMenu || !navToggle) return;
    const isOpen = navMenu.classList.contains('is-open');
    setMenuState(!isOpen);
  };

  window.toggleMobileMenu = toggleMenu;
  window.closeMobileMenu = () => setMenuState(false);

  if (navToggle) {
    // Attach in capture phase so this runs before other potential listeners
    navToggle.addEventListener('click', toggleMenu, true);
  }
  
  // Close menu function (now uses setMenuState from outer scope)
  const closeMenu = () => {
    setMenuState(false);
  };
  
  if (navToggle && navMenu) {
    // Toggle menu on button click
    on(navToggle, 'click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = navMenu.classList.contains('is-open');
      setMenuState(!isOpen);
    });
    
    // Close menu when clicking outside
    on(document, 'click', (e) => {
      if (navMenu.classList.contains('is-open')) {
        const isClickInside = header.contains(e.target) || navMenu.contains(e.target);
        if (!isClickInside) {
          closeMenu();
        }
      }
    });
    
    // Close menu on escape key
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        closeMenu();
        // Focus the toggle button
        if (navToggle) navToggle.focus();
      }
    });
    
    // Close menu when a link is clicked
    navLinks.forEach(link => {
      on(link, 'click', () => {
        if (navMenu.classList.contains('is-open')) {
          closeMenu();
        }
      });
    });
  }
  
  // ========================================
  // 2. SCROLL EFFECTS
  // ========================================
  
  let lastScrollY = window.scrollY;
  let scrollTimeout;
  
  const handleScroll = debounce(() => {
    const currentScrollY = window.scrollY;
    
    // Add/remove scrolled class for header shadow
    if (currentScrollY > 50) {
      addClass(header, 'scrolled');
    } else {
      removeClass(header, 'scrolled');
    }
    
    // Hide/show header on scroll (optional)
    // Uncomment for auto-hide header
    // if (currentScrollY > lastScrollY && currentScrollY > 100) {
    //   // Scrolling down - hide header
    //   header.style.transform = 'translateY(-100%)';
    // } else {
    //   // Scrolling up - show header
    //   header.style.transform = 'translateY(0)';
    // }
    
    lastScrollY = currentScrollY;
  }, 100);
  
  on(window, 'scroll', handleScroll);
  
  // ========================================
  // 3. ACTIVE NAV LINK DETECTION
  // ========================================
  
  // Highlight current page in navigation
  const currentPath = window.location.pathname;
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Check if link matches current page
    const isHome = href === '/' || href === '/index.html';
    const isCurrent = href === currentPath || 
                      (currentPath !== '/' && href.includes(currentPath)) ||
                      (isHome && currentPath === '/');
    
    if (isCurrent) {
      addClass(link, 'active');
    }
  });
  
  // ========================================
  // 4. HEADER SEARCH TOGGLE (Optional)
  // ========================================
  
  const searchToggle = $('.search-toggle');
  const searchWrapper = $('.search-section');
  
  if (searchToggle && searchWrapper) {
    on(searchToggle, 'click', () => {
      toggleClass(searchWrapper, 'visible');
      const input = searchWrapper.querySelector('input');
      if (input && hasClass(searchWrapper, 'visible')) {
        setTimeout(() => input.focus(), 300);
      }
    });
  }
  
  // ========================================
  // 5. RESIZE HANDLING
  // ========================================
  
  const handleResize = debounce(() => {
    if (navMenu && hasClass(navMenu, 'is-open')) {
      closeMenu();
    }
  }, 250);
  
  on(window, 'resize', handleResize);
  
  // ========================================
  // 6. ACCESSIBILITY: Skip to main content
  // ========================================
  
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Skip to main content';
  skipLink.style.cssText = `
    position: absolute;
    top: -100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.75rem 1.5rem;
    background: ${getComputedStyle(document.documentElement).getPropertyValue('--accent-blue') || '#4f9eff'};
    color: white;
    border-radius: 0 0 8px 8px;
    z-index: 9999;
    font-weight: 600;
    transition: top 0.2s ease;
  `;
  
  on(skipLink, 'focus', () => {
    skipLink.style.top = '0';
  });
  
  on(skipLink, 'blur', () => {
    skipLink.style.top = '-100%';
  });
  
  document.body.prepend(skipLink);
  
  console.log('📋 Header initialized');
}

// Auto-initialize on DOM ready
domReady(() => {
  initHeader();
});