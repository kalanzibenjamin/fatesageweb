// ========================================
// MAIN SITE — JavaScript
// ========================================

import { $, $$, on, addClass, removeClass, hasClass, domReady } from '../utils/dom.js';
import { debounce, throttle, isInViewport } from '../utils/helpers.js';

// ========================================
// 1. SEARCH SUGGESTIONS
// ========================================

export function initSearch() {
  const searchInput = $('#searchInput');
  const clearBtn = $('#searchClearBtn');
  const suggestions = $('#searchSuggestions');
  
  if (!searchInput) return;
  
  // Show suggestions on focus
  on(searchInput, 'focus', () => {
    if (searchInput.value.length > 0) {
      addClass(suggestions, 'active');
    }
  });
  
  // Filter suggestions on input
  const filterSuggestions = debounce((query) => {
    const trimmed = query.trim().toLowerCase();
    
    if (trimmed.length > 0) {
      addClass(clearBtn, 'visible');
      addClass(suggestions, 'active');
      
      // Filter suggestion items
      const items = $$('.suggestion-item', suggestions);
      items.forEach(item => {
        const text = item.querySelector('.suggestion-text')?.textContent?.toLowerCase() || '';
        if (text.includes(trimmed)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    } else {
      removeClass(clearBtn, 'visible');
      removeClass(suggestions, 'active');
      
      // Show all suggestions
      const items = $$('.suggestion-item', suggestions);
      items.forEach(item => {
        item.style.display = 'flex';
      });
    }
  }, 200);
  
  on(searchInput, 'input', (e) => {
    filterSuggestions(e.target.value);
  });
  
  // Clear button
  if (clearBtn) {
    on(clearBtn, 'click', () => {
      searchInput.value = '';
      removeClass(clearBtn, 'visible');
      removeClass(suggestions, 'active');
      searchInput.focus();
      
      // Show all suggestions
      const items = $$('.suggestion-item', suggestions);
      items.forEach(item => {
        item.style.display = 'flex';
      });
    });
  }
  
  // Close suggestions on outside click
  on(document, 'click', (e) => {
    if (!e.target.closest('.search-section')) {
      removeClass(suggestions, 'active');
    }
  });
  
  // Keyboard shortcut: Ctrl+K or Cmd+K
  on(document, 'keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    
    // Escape key closes suggestions and clears search
    if (e.key === 'Escape') {
      if (hasClass(suggestions, 'active')) {
        removeClass(suggestions, 'active');
        searchInput.blur();
      }
      if (searchInput.value.length > 0) {
        searchInput.value = '';
        removeClass(clearBtn, 'visible');
      }
    }
  });
  
  // Enter key triggers search
  on(searchInput, 'keydown', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        removeClass(suggestions, 'active');
        // Dispatch search event
        const event = new CustomEvent('searchPerformed', {
          detail: { query }
        });
        document.dispatchEvent(event);
        
        // Track search
        if (window.gtag) {
          window.gtag('event', 'search', {
            search_term: query,
          });
        }
        
        console.log(`🔍 Search: "${query}"`);
      }
    }
  });
  
  // Suggestion click
  const suggestionItems = $$('.suggestion-item', suggestions);
  suggestionItems.forEach(item => {
    on(item, 'click', (e) => {
      e.preventDefault();
      const text = item.querySelector('.suggestion-text')?.textContent || '';
      const href = item.getAttribute('href');
      
      if (href) {
        // Track suggestion click
        if (window.gtag) {
          window.gtag('event', 'search_suggestion_click', {
            suggestion: text,
            destination: href,
          });
        }
        
        // Navigate to suggestion
        window.location.href = href;
      }
    });
  });
  
  console.log('🔍 Search initialized');
}

// ========================================
// 2. PROJECT CARDS
// ========================================

export function initProjectCards() {
  const cards = $$('.project-card');
  
  cards.forEach(card => {
    // Add click tracking
    on(card, 'click', () => {
      const title = card.querySelector('h3')?.textContent || '';
      const status = card.querySelector('.project-status')?.textContent || '';
      
      if (window.gtag) {
        window.gtag('event', 'project_card_click', {
          project_title: title,
          project_status: status,
        });
      }
      
      const event = new CustomEvent('projectClicked', {
        detail: { title, status }
      });
      document.dispatchEvent(event);
    });
    
    // Keyboard support for card links
    if (card.getAttribute('href')) {
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
      
      on(card, 'keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    }
  });
  
  console.log('🃏 Project cards initialized');
}

// ========================================
// 3. STATS COUNTER ANIMATION
// ========================================

export function initStatsCounter() {
  const stats = $$('.stat-number');
  if (stats.length === 0) return;
  
  let hasAnimated = false;
  
  const animateStats = () => {
    if (hasAnimated) return;
    
    stats.forEach(stat => {
      const target = parseInt(stat.dataset.target, 10);
      if (isNaN(target) || target === 0) return;
      
      const duration = 2000;
      const startTime = performance.now();
      
      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        
        stat.textContent = current.toLocaleString();
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          stat.textContent = target.toLocaleString();
        }
      };
      
      requestAnimationFrame(updateCounter);
    });
    
    hasAnimated = true;
  };
  
  // Use Intersection Observer
  if ('IntersectionObserver' in window) {
    const statsGrid = $('.stats-grid');
    if (statsGrid) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated) {
            animateStats();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      
      observer.observe(statsGrid);
    }
  } else {
    // Fallback: animate on scroll
    const handleScroll = throttle(() => {
      if (!hasAnimated && isInViewport($('.stats-grid'), 100)) {
        animateStats();
      }
    }, 200);
    
    on(window, 'scroll', handleScroll);
    // Check on load
    setTimeout(handleScroll, 500);
  }
  
  console.log('📊 Stats counter initialized');
}

// ========================================
// 4. NEWS FILTERS
// ========================================

export function initNewsFilters() {
  const filters = $$('.news-filter');
  const newsItems = $$('.news-item');
  
  if (filters.length === 0) return;
  
  filters.forEach(filter => {
    on(filter, 'click', function() {
      // Remove active from all filters
      filters.forEach(f => removeClass(f, 'active'));
      addClass(this, 'active');
      
      const filterValue = this.dataset.filter || 'all';
      
      newsItems.forEach(item => {
        const category = item.dataset.category || 'all';
        if (filterValue === 'all' || category === filterValue) {
          item.style.display = 'flex';
          // Trigger reflow for animation
          void item.offsetWidth;
        } else {
          item.style.display = 'none';
        }
      });
      
      // Track filter change
      if (window.gtag) {
        window.gtag('event', 'news_filter_change', {
          filter: filterValue,
        });
      }
    });
  });
  
  console.log('📰 News filters initialized');
}

// ========================================
// 5. FADE-UP ANIMATIONS
// ========================================

export function initFadeUp() {
  const elements = $$('.fade-up');
  if (elements.length === 0) return;
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    elements.forEach(el => addClass(el, 'visible'));
    return;
  }
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          addClass(entry.target, 'visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -10% 0px' });
    
    elements.forEach(el => {
      // Check if already visible
      if (isInViewport(el, 50)) {
        addClass(el, 'visible');
      } else {
        observer.observe(el);
      }
    });
  } else {
    // Fallback: show all
    elements.forEach(el => addClass(el, 'visible'));
  }
  
  console.log('🎬 Fade-up animations initialized');
}

// ========================================
// 6. SMOOTH SCROLL FOR ANCHOR LINKS
// ========================================

export function initSmoothScroll() {
  const links = $$('a[href^="#"]');
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    
    const targetId = href.replace('#', '');
    const target = document.getElementById(targetId);
    if (!target) return;
    
    on(link, 'click', (e) => {
      e.preventDefault();
      
      const offset = 80;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
      
      // Update URL without reload
      history.pushState(null, '', href);
      
      // Track anchor click
      if (window.gtag) {
        window.gtag('event', 'anchor_click', {
          anchor: href,
        });
      }
    });
  });
  
  console.log('🔄 Smooth scroll initialized');
}

// ========================================
// 7. HEADER SCROLL EFFECT
// ========================================

export function initHeaderScroll() {
  const header = $('.site-header');
  if (!header) return;
  
  const handleScroll = throttle(() => {
    if (window.scrollY > 50) {
      addClass(header, 'scrolled');
    } else {
      removeClass(header, 'scrolled');
    }
  }, 100);
  
  on(window, 'scroll', handleScroll);
  handleScroll(); // Initial check
  
  console.log('📋 Header scroll effect initialized');
}

// ========================================
// 8. THEME TOGGLE (Enhanced)
// ========================================

export function initThemeToggle() {
  const toggle = $('#themeToggle');
  if (!toggle) return;
  
  // Scroll to top / theme toggle dual functionality
  let isScrollTopMode = false;
  const SCROLL_THRESHOLD = 220;
  
  const handleScroll = throttle(() => {
    const scrollY = window.scrollY;
    const shouldBeScrollTop = scrollY > SCROLL_THRESHOLD;
    
    if (shouldBeScrollTop !== isScrollTopMode) {
      isScrollTopMode = shouldBeScrollTop;
      if (isScrollTopMode) {
        addClass(toggle, 'scroll-top');
        const icon = toggle.querySelector('i');
        if (icon) {
          icon.className = 'fas fa-arrow-up';
        }
        toggle.setAttribute('aria-label', 'Scroll to top');
      } else {
        removeClass(toggle, 'scroll-top');
        const icon = toggle.querySelector('i');
        if (icon) {
          const isLight = document.body.classList.contains('light-mode');
          icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
        }
        toggle.setAttribute('aria-label', 'Toggle theme');
      }
    }
    
    // Show/hide button
    if (scrollY > 100) {
      addClass(toggle, 'visible');
      removeClass(toggle, 'fade-out');
    } else {
      removeClass(toggle, 'visible');
      addClass(toggle, 'fade-out');
    }
  }, 100);
  
  on(window, 'scroll', handleScroll);
  handleScroll();
  
  // Click handler
  on(toggle, 'click', () => {
    if (isScrollTopMode) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Toggle theme
    const isLight = document.body.classList.contains('light-mode');
    const newTheme = isLight ? 'dark' : 'light';
    
    document.body.classList.toggle('light-mode', newTheme === 'light');
    document.documentElement.classList.toggle('light-mode', newTheme === 'light');
    document.documentElement.style.colorScheme = newTheme === 'light' ? 'light' : 'dark';
    localStorage.setItem('clareon-theme', newTheme);
    
    // Update icon
    const icon = toggle.querySelector('i');
    if (icon) {
      icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    // Dispatch theme change event
    const event = new CustomEvent('themeChange', {
      detail: { theme: newTheme }
    });
    document.dispatchEvent(event);
    
    // Track theme change
    if (window.gtag) {
      window.gtag('event', 'theme_change', {
        theme: newTheme,
      });
    }
  });
  
  console.log('🎨 Theme toggle initialized');
}

// ========================================
// 9. WHATSAPP CHANNEL BUTTON
// ========================================

export function initWhatsAppChannel() {
  const btn = $('#whatsappChannelBtn');
  if (!btn) return;
  
  const url = btn.dataset.url;
  if (!url) return;
  
  on(btn, 'click', () => {
    window.open(url, '_blank', 'noopener,noreferrer');
    
    if (window.gtag) {
      window.gtag('event', 'whatsapp_click', {
        source: 'footer',
        channel: 'whatsapp',
      });
    }
    
    const event = new CustomEvent('whatsappClicked', {
      detail: { url }
    });
    document.dispatchEvent(event);
  });
  
  // Keyboard support
  btn.setAttribute('role', 'button');
  btn.setAttribute('tabindex', '0');
  on(btn, 'keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });
  
  console.log('📱 WhatsApp channel initialized');
}

// ========================================
// 10. INITIALIZE ALL
// ========================================

export function initMainSite() {
  console.log('🚀 Main site initializing...');
  
  initHeaderScroll();
  initThemeToggle();
  initSearch();
  initProjectCards();
  initStatsCounter();
  initNewsFilters();
  initFadeUp();
  initSmoothScroll();
  initWhatsAppChannel();
  
  console.log('✅ Main site initialized');
}

// Auto-initialize on DOM ready
domReady(() => {
  // Only run on main site (clareon.live)
  if (document.body.dataset.page === 'home' || window.location.hostname === 'clareon.live') {
    initMainSite();
  }
});
