// ========================================
// ARTICLE PAGE FUNCTIONALITY
// ========================================

/**
 * Article Page Module
 * Handles share buttons, tag clicks, related articles, and reading interactions
 */
(function() {
  'use strict';

  // ===== DOM REFS =====
  const shareButtons = document.querySelectorAll('.share button');
  const tagSpans = document.querySelectorAll('.tags span');
  const relatedCards = document.querySelectorAll('.related-card');
  const articleContent = document.querySelector('.article-content');
  const tocLinks = document.querySelectorAll('.toc-link');

  // ===== SHARE FUNCTIONALITY =====
  function handleShare(button) {
    const url = window.location.href;
    const title = document.querySelector('title')?.textContent || 'Clareon Article';
    const label = button.title || button.getAttribute('aria-label') || 'Share';

    let shareUrl = '';

    // Determine which platform
    if (label.includes('Twitter') || button.innerHTML.includes('🐦')) {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    } else if (label.includes('Facebook') || button.innerHTML.includes('📘')) {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (label.includes('LinkedIn') || button.innerHTML.includes('💼')) {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    } else if (label.includes('Copy') || button.innerHTML.includes('🔗')) {
      // Copy link to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          showNotification('🔗 Link copied to clipboard!');
        }).catch(() => {
          fallbackCopy(url);
        });
      } else {
        fallbackCopy(url);
      }
      return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    // Show feedback
    showNotification(`📤 Shared via ${label}!`);
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showNotification('🔗 Link copied to clipboard!');
    } catch (err) {
      showNotification('❌ Could not copy link');
    }
    document.body.removeChild(textarea);
  }

  // ===== NOTIFICATION =====
  function showNotification(message) {
    const existing = document.querySelector('.article-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'article-notification';
    notification.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: rgba(108, 99, 255, 0.95);
      color: #fff;
      padding: 14px 28px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      z-index: 1000;
      opacity: 0;
      transition: all 0.4s ease;
      backdrop-filter: blur(12px);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => {
        notification.remove();
      }, 400);
    }, 3000);
  }

  // ===== TAG CLICK =====
  function handleTagClick(tag) {
    const tagText = tag.textContent.trim();
    // Redirect to tech or news page with search parameter
    const currentPath = window.location.pathname;
    let basePath = '/pages/news/';

    if (currentPath.includes('/tech/')) {
      basePath = '/pages/tech/';
    }

    // Remove # from tag text if present
    const cleanTag = tagText.replace('#', '').trim();

    // Redirect to the main page with a search query
    window.location.href = `${basePath}?search=${encodeURIComponent(cleanTag)}`;
  }

  // ===== RELATED ARTICLE CLICK =====
  function handleRelatedClick(card) {
    const title = card.querySelector('h4')?.textContent || 'Article';
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Determine which section we're in
    const currentPath = window.location.pathname;
    let basePath = '/pages/news/';

    if (currentPath.includes('/tech/')) {
      basePath = '/pages/tech/';
    }

    window.location.href = `${basePath}${slug}/`;
  }

  // ===== READING PROGRESS =====
  function updateReadingProgress() {
    const progressBar = document.querySelector('.reading-progress');
    if (!progressBar) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    progressBar.style.width = Math.min(progress, 100) + '%';
  }

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
  function setupAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ===== DARK MODE COMPATIBILITY =====
  function updateTOCColors() {
    const isLight = document.documentElement.classList.contains('light-mode');
    const tocContainer = document.querySelector('.toc-container');
    if (!tocContainer) return;

    if (isLight) {
      tocContainer.style.background = 'rgba(0, 0, 0, 0.03)';
      tocContainer.style.borderColor = 'rgba(0, 0, 0, 0.08)';
      const h4 = tocContainer.querySelector('h4');
      if (h4) h4.style.color = '#1a1f2e';
      const links = tocContainer.querySelectorAll('a');
      links.forEach(link => {
        link.style.color = 'rgba(0, 0, 0, 0.5)';
      });
    } else {
      tocContainer.style.background = 'rgba(255, 255, 255, 0.04)';
      tocContainer.style.borderColor = 'rgba(255, 255, 255, 0.06)';
      const h4 = tocContainer.querySelector('h4');
      if (h4) h4.style.color = '#f0f3fa';
      const links = tocContainer.querySelectorAll('a');
      links.forEach(link => {
        link.style.color = 'rgba(255, 255, 255, 0.6)';
      });
    }
  }

  // ===== EVENT LISTENERS =====

  // Share buttons
  shareButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      handleShare(this);
    });
  });

  // Tags
  tagSpans.forEach(tag => {
    tag.addEventListener('click', function() {
      handleTagClick(this);
    });
  });

  // Related articles
  relatedCards.forEach(card => {
    card.addEventListener('click', function() {
      handleRelatedClick(this);
    });
  });

  // Reading progress
  window.addEventListener('scroll', updateReadingProgress);

  // ===== KEYBOARD SHORTCUTS =====
  document.addEventListener('keydown', (e) => {
    // 'S' key to share
    if (e.key === 's' && !e.ctrlKey && !e.metaKey && !e.target.closest('input, textarea')) {
      e.preventDefault();
      const firstShareBtn = document.querySelector('.share button');
      if (firstShareBtn) {
        handleShare(firstShareBtn);
      }
    }
  });

  // ===== OBSERVE THEME CHANGES =====
  const themeObserver = new MutationObserver(() => {
    updateTOCColors();
  });

  const htmlElement = document.documentElement;
  themeObserver.observe(htmlElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  // ===== INIT =====
  console.log('📄 Article page initialized');

  // Setup anchor links
  setupAnchorLinks();

  // Initial progress update
  updateReadingProgress();

  // Initial TOC colors
  setTimeout(updateTOCColors, 100);

  // ===== RESPONSIVE IMAGES =====
  // Add loading="lazy" to all images in article content
  if (articleContent) {
    const images = articleContent.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }
})();