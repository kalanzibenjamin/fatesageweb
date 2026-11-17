// ========================================
// SHOP PAGE FUNCTIONALITY
// ========================================

/**
 * Shop Page Module
 * Handles category filtering, sorting, view toggling, and cart interactions
 */
(function() {
  'use strict';

  // ===== DOM REFS =====
  const productGrid = document.getElementById('productGrid');
  productGrid?.querySelectorAll('.product-card').forEach(card => {
    if (!card.querySelector('.product-image img')) card.remove();
  });
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('searchClearBtn');
  const sortSelect = document.getElementById('sortSelect');
  const categoryFilters = document.querySelectorAll('.category-filter');
  const productCards = document.querySelectorAll('.product-card');
  const gridViewBtn = document.getElementById('gridView');
  const listViewBtn = document.getElementById('listView');
  const addToCartBtns = document.querySelectorAll('.add-to-cart');
  const productImages = document.querySelectorAll('.product-image');

  // ===== STATE =====
  let currentCategory = 'all';
  let currentSort = 'popular';
  let currentView = 'grid';

  // ===== FILTER FUNCTION =====
  function filterProducts(category) {
    currentCategory = category;

    productCards.forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.style.display = 'block';
        card.style.animation = 'none';
        requestAnimationFrame(() => {
          card.style.animation = 'productFadeIn 0.3s ease';
        });
      } else {
        card.style.display = 'none';
      }
    });
  }

  // ===== SORT FUNCTION =====
  function sortProducts(sortType) {
    currentSort = sortType;
    const cards = Array.from(productGrid.querySelectorAll('.product-card'));

    cards.sort((a, b) => {
      const priceA = parseInt(a.dataset.price);
      const priceB = parseInt(b.dataset.price);
      const popularA = parseInt(a.dataset.popular);
      const popularB = parseInt(b.dataset.popular);

      if (sortType === 'price-low') {
        return priceA - priceB;
      } else if (sortType === 'price-high') {
        return priceB - priceA;
      } else if (sortType === 'popular') {
        return popularB - popularA;
      } else if (sortType === 'newest') {
        // Use data-date or fallback to random
        const dateA = a.dataset.date || '0';
        const dateB = b.dataset.date || '0';
        return dateB.localeCompare(dateA);
      }
      return 0;
    });

    // Re-append sorted cards
    cards.forEach(card => {
      productGrid.appendChild(card);
      card.style.animation = 'none';
      requestAnimationFrame(() => {
        card.style.animation = 'productFadeIn 0.3s ease';
      });
    });
  }

  // ===== SEARCH FUNCTION =====
  function filterBySearch(query) {
    const searchTerm = query.toLowerCase().trim();

    productCards.forEach(card => {
      const name = card.querySelector('.product-name')?.textContent?.toLowerCase() || '';
      const category = card.querySelector('.product-category')?.textContent?.toLowerCase() || '';
      const price = card.querySelector('.current')?.textContent?.toLowerCase() || '';

      const matches = searchTerm === '' ||
        name.includes(searchTerm) ||
        category.includes(searchTerm) ||
        price.includes(searchTerm);

      const categoryMatch = currentCategory === 'all' || card.dataset.category === currentCategory;

      if (matches && categoryMatch) {
        card.style.display = 'block';
        card.style.animation = 'none';
        requestAnimationFrame(() => {
          card.style.animation = 'productFadeIn 0.3s ease';
        });
      } else {
        card.style.display = 'none';
      }
    });
  }

  // ===== VIEW TOGGLE =====
  function toggleView(view) {
    currentView = view;

    if (view === 'grid') {
      productGrid.classList.remove('list-view');
      if (gridViewBtn) {
        gridViewBtn.classList.add('active');
        listViewBtn?.classList.remove('active');
      }
    } else {
      productGrid.classList.add('list-view');
      if (listViewBtn) {
        listViewBtn.classList.add('active');
        gridViewBtn?.classList.remove('active');
      }
    }
  }

  // ===== ADD TO CART =====
  function handleAddToCart(button) {
    const card = button.closest('.product-card');
    const productName = card.querySelector('.product-name')?.textContent || 'Product';
    const productPrice = card.querySelector('.current')?.textContent || '$0.00';
    const originalText = button.textContent;

    // Visual feedback
    button.textContent = '✅ Added!';
    button.classList.add('added');

    // Show confirmation
    const notification = document.createElement('div');
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
      display: flex;
      align-items: center;
      gap: 12px;
    `;
    notification.innerHTML = `
      <span style="font-size:20px;">🛒</span>
      <span>Added "${productName}" to cart — ${productPrice}</span>
    `;
    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => {
        notification.remove();
      }, 400);
    }, 3000);

    // Reset button after 1.5 seconds
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('added');
    }, 1500);

    // Log to console (for analytics)
    console.log(`🛒 Added to cart: ${productName} — ${productPrice}`);
  }

  // ===== PRODUCT IMAGE OVERLAY =====
  function openImageOverlay(image) {
    const overlay = document.createElement('div');
    overlay.className = 'shop-image-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', image.alt || 'Product image');
    overlay.innerHTML = `
      <button type="button" class="shop-image-overlay-close" aria-label="Close image">&times;</button>
      <img src="${image.src}" alt="${image.alt}" />
    `;

    const close = () => {
      overlay.remove();
      document.body.classList.remove('image-overlay-open');
      document.removeEventListener('keydown', handleEscape);
    };

    overlay.addEventListener('click', event => {
      if (event.target === overlay) close();
    });
    overlay.querySelector('.shop-image-overlay-close').addEventListener('click', close);
    document.addEventListener('keydown', function handleEscape(event) {
      if (event.key === 'Escape') {
        close();
        document.removeEventListener('keydown', handleEscape);
      }
    });

    document.body.appendChild(overlay);
    document.body.classList.add('image-overlay-open');
    overlay.querySelector('.shop-image-overlay-close').focus();
  }

  // ===== EVENT LISTENERS =====

  // Category filters
  categoryFilters.forEach(filter => {
    filter.addEventListener('click', function() {
      categoryFilters.forEach(f => f.classList.remove('active'));
      this.classList.add('active');

      const category = this.dataset.category;
      filterProducts(category);

      if (searchInput && searchInput.value.trim() !== '') {
        filterBySearch(searchInput.value);
      }
    });
  });

  // Sort
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      sortProducts(this.value);
    });
  }

  // Search
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      if (clearBtn) {
        if (this.value.length > 0) {
          clearBtn.classList.add('visible');
        } else {
          clearBtn.classList.remove('visible');
        }
      }

      filterBySearch(this.value);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        this.classList.remove('visible');
        filterBySearch('');
        searchInput.focus();
      });
    }

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  // View toggle
  if (gridViewBtn) {
    gridViewBtn.addEventListener('click', function() {
      toggleView('grid');
    });
  }

  if (listViewBtn) {
    listViewBtn.addEventListener('click', function() {
      toggleView('list');
    });
  }

  // Add to cart buttons
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent product card click
      handleAddToCart(this);
    });
  });

  productImages.forEach(container => {
    const image = container.querySelector('img');
    if (!image) return;

    const open = event => {
      event.stopPropagation();
      openImageOverlay(image);
    };

    container.addEventListener('click', open);
    container.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(event);
      }
    });
  });

  // Product card click
  productCards.forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.closest('.add-to-cart, .product-image')) return;
    });
  });

  // ===== KEYBOARD NAVIGATION =====
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchInput && searchInput.value) {
      searchInput.value = '';
      if (clearBtn) clearBtn.classList.remove('visible');
      filterBySearch('');
      searchInput.blur();
    }
  });

  // ===== INIT =====
  console.log('🛍️ Shop page initialized');

  // Set initial view
  if (productGrid) {
    productGrid.classList.remove('list-view');
  }
  if (gridViewBtn) {
    gridViewBtn.classList.add('active');
  }
  if (listViewBtn) {
    listViewBtn.classList.remove('active');
  }
})();