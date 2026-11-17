// ========================================
// clareon.live — Main JavaScript Entry
// ========================================

// 1. UTILITIES (Load first)
// ========================================
import './utils/helpers.js';
import './utils/dom.js';
import './utils/touch.js';
import './utils/analytics.js';

// 2. COMPONENTS (Reusable UI)
// ========================================
import './components/header.js';
import './components/footer.js';
import './components/theme.js';
import './components/search.js';
import './components/share.js';
import './components/countdown.js';
import './components/scroll.js';
import './components/forms.js';
import './components/dropdowns.js';
import './components/cards.js';
import './components/filters.js';

// 3. PAGE-SPECIFIC (Load based on page)
// ========================================
import './pages/home.js';
import './pages/announcements.js';
import './pages/faq.js';
import './pages/contact.js';
import './pages/resources.js';
import './pages/programs.js';
import './pages/contribute.js';
import './pages/news.js';
import './pages/tech.js';
import './pages/shop.js';
import './pages/article.js';

// 4. INITIALIZATION LOG
// ========================================
console.log('🚀 clareon.live loaded successfully');

// Log page name for debugging
const pageName = document.body.dataset.page || 'unknown';
console.log(`📄 Page: ${pageName}`);