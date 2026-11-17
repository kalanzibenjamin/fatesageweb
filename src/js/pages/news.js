// ========================================
// NEWS PAGE FUNCTIONALITY
// ========================================

/**
 * News Page Module
 * Handles category filtering, sorting, and article interactions
 */
(function() {
  'use strict';

  // ===== DOM REFS =====
  const newsGrid = document.getElementById('newsGrid');
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('searchClearBtn');
  const sortSelect = document.getElementById('sortSelect');
  const categoryFilters = document.querySelectorAll('.category-filter');
  const newsCards = document.querySelectorAll('.news-card');
  const featuredMain = document.querySelector('.featured-main');
  const featuredSides = document.querySelectorAll('.featured-side');

  // ===== STATE =====
  let currentCategory = 'all';
  let currentSort = 'latest';

  // ===== FILTER FUNCTION =====
  function filterNews(category) {
    currentCategory = category;

    // Filter featured
    if (category === 'all') {
      if (featuredMain) featuredMain.style.display = 'block';
      featuredSides.forEach(side => side.style.display = 'flex');
    } else {
      if (featuredMain) {
        featuredMain.style.display = featuredMain.dataset.category === category ? 'block' : 'none';
      }
      featuredSides.forEach(side => {
        side.style.display = side.dataset.category === category ? 'flex' : 'none';
      });
    }

    // Filter grid cards
    newsCards.forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.style.display = 'block';
        card.style.animation = 'none';
        // Re-trigger animation
        requestAnimationFrame(() => {
          card.style.animation = 'newsFadeIn 0.3s ease';
        });
      } else {
        card.style.display = 'none';
      }
    });
  }

  // ===== SORT FUNCTION =====
  function sortNews(sortType) {
    currentSort = sortType;
    const cards = Array.from(newsGrid.querySelectorAll('.news-card'));

    cards.sort((a, b) => {
      const dateA = new Date(a.dataset.date);
      const dateB = new Date(b.dataset.date);
      const popularA = parseInt(a.dataset.popular);
      const popularB = parseInt(b.dataset.popular);

      if (sortType === 'latest') {
        return dateB - dateA;
      } else if (sortType === 'oldest') {
        return dateA - dateB;
      } else if (sortType === 'popular') {
        return popularB - popularA;
      }
      return 0;
    });

    // Re-append sorted cards
    cards.forEach(card => {
      newsGrid.appendChild(card);
      card.style.animation = 'none';
      requestAnimationFrame(() => {
        card.style.animation = 'newsFadeIn 0.3s ease';
      });
    });
  }

  // ===== SEARCH FUNCTION =====
  function filterBySearch(query) {
    const searchTerm = query.toLowerCase().trim();

    // Filter grid cards
    newsCards.forEach(card => {
      const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
      const excerpt = card.querySelector('p')?.textContent?.toLowerCase() || '';
      const category = card.querySelector('.category-tag')?.textContent?.toLowerCase() || '';
      const date = card.dataset.date || '';

      const matches = searchTerm === '' ||
        title.includes(searchTerm) ||
        excerpt.includes(searchTerm) ||
        category.includes(searchTerm) ||
        date.includes(searchTerm);

      // Only filter if current category matches or is 'all'
      const categoryMatch = currentCategory === 'all' || card.dataset.category === currentCategory;

      if (matches && categoryMatch) {
        card.style.display = 'block';
        card.style.animation = 'none';
        requestAnimationFrame(() => {
          card.style.animation = 'newsFadeIn 0.3s ease';
        });
      } else {
        card.style.display = 'none';
      }
    });

    // Filter featured (if search is active)
    const searchActive = searchTerm !== '';
    if (featuredMain) {
      const mainTitle = featuredMain.querySelector('h2')?.textContent?.toLowerCase() || '';
      const mainExcerpt = featuredMain.querySelector('p')?.textContent?.toLowerCase() || '';
      const mainCategory = featuredMain.querySelector('.category-tag')?.textContent?.toLowerCase() || '';
      const mainMatches = !searchActive ||
        mainTitle.includes(searchTerm) ||
        mainExcerpt.includes(searchTerm) ||
        mainCategory.includes(searchTerm);

      const mainCategoryMatch = currentCategory === 'all' || featuredMain.dataset.category === currentCategory;
      featuredMain.style.display = (mainMatches && mainCategoryMatch) ? 'block' : 'none';
    }

    featuredSides.forEach(side => {
      const sideTitle = side.querySelector('h3')?.textContent?.toLowerCase() || '';
      const sideCategory = side.querySelector('.category-tag')?.textContent?.toLowerCase() || '';
      const sideMatches = !searchActive ||
        sideTitle.includes(searchTerm) ||
        sideCategory.includes(searchTerm);

      const sideCategoryMatch = currentCategory === 'all' || side.dataset.category === currentCategory;
      side.style.display = (sideMatches && sideCategoryMatch) ? 'flex' : 'none';
    });
  }

  // ===== EVENT LISTENERS =====

  // Category filters
  categoryFilters.forEach(filter => {
    filter.addEventListener('click', function() {
      // Update active state
      categoryFilters.forEach(f => f.classList.remove('active'));
      this.classList.add('active');

      const category = this.dataset.category;
      filterNews(category);

      // Re-apply search if there's a query
      if (searchInput && searchInput.value.trim() !== '') {
        filterBySearch(searchInput.value);
      }
    });
  });

  // Sort
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      sortNews(this.value);
    });
  }

  // Search
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      // Show/hide clear button
      if (clearBtn) {
        if (this.value.length > 0) {
          clearBtn.classList.add('visible');
        } else {
          clearBtn.classList.remove('visible');
        }
      }

      filterBySearch(this.value);
    });

    // Clear button
    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        this.classList.remove('visible');
        filterBySearch('');
        searchInput.focus();
      });
    }

    // Keyboard shortcut: Ctrl+K or Cmd+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  // ===== CLICK ON NEWS CARDS =====
  document.querySelectorAll('.news-card, .featured-main, .featured-side').forEach(item => {
    item.addEventListener('click', function(e) {
      // Don't trigger if clicking a link inside
      if (e.target.closest('a')) return;

      const title = this.querySelector('h2, h3')?.textContent || 'News Article';
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Redirect to article page
      window.location.href = `/pages/news/${slug}/`;
    });
  });

  // ===== KEYBOARD NAVIGATION =====
  document.addEventListener('keydown', (e) => {
    // Escape key to clear search
    if (e.key === 'Escape' && searchInput && searchInput.value) {
      searchInput.value = '';
      if (clearBtn) clearBtn.classList.remove('visible');
      filterBySearch('');
      searchInput.blur();
    }
  });

  // ===== INIT =====
  console.log('📰 News page initialized');
})();