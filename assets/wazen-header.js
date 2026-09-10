(function () {
  'use strict';

  function lockScroll(lock) {
    document.documentElement.classList.toggle('wz-scroll-lock', lock);
  }

  function anyOverlayOpen() {
    var modal = document.getElementById('wz-search-modal');
    var drawer = document.getElementById('wz-mobile-drawer');
    var filters = document.getElementById('wz-filter-sheet');
    return (modal && !modal.hidden) || (drawer && !drawer.hidden) || (filters && !filters.hidden);
  }

  function refreshScrollLock() {
    lockScroll(anyOverlayOpen());
  }

  /* Search modal ------------------------------------------------------- */
  var searchModal = document.getElementById('wz-search-modal');
  var searchOpenBtn = document.getElementById('wz-search-open');
  var searchInput = document.getElementById('wz-search-input');
  var emptyState = document.getElementById('wz-search-empty-state');

  function openSearch() {
    if (!searchModal) return;
    searchModal.hidden = false;
    refreshScrollLock();
    renderRecentSearches();
    setTimeout(function () {
      searchInput && searchInput.focus();
    }, 30);
  }

  function closeSearch() {
    if (!searchModal) return;
    searchModal.hidden = true;
    refreshScrollLock();
  }

  if (searchOpenBtn) searchOpenBtn.addEventListener('click', openSearch);
  if (searchModal) {
    searchModal.querySelectorAll('[data-search-close]').forEach(function (el) {
      el.addEventListener('click', closeSearch);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      if (!emptyState) return;
      emptyState.hidden = searchInput.value.trim().length > 0;
    });
    searchInput.closest('form') &&
      searchInput.closest('form').addEventListener('submit', function () {
        saveRecentSearch(searchInput.value.trim());
      });
  }

  document.addEventListener('keydown', function (evt) {
    if (evt.key !== 'Escape') return;
    if (searchModal && !searchModal.hidden) closeSearch();
    if (drawer && !drawer.hidden) closeDrawer();
    if (filterSheet && !filterSheet.hidden) closeFilterSheet();
  });

  /* Recent searches (localStorage) -------------------------------------- */
  var RECENT_KEY = 'wz_recent_searches';

  function getRecentSearches() {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveRecentSearch(term) {
    if (!term) return;
    try {
      var list = getRecentSearches().filter(function (t) {
        return t.toLowerCase() !== term.toLowerCase();
      });
      list.unshift(term);
      localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6)));
    } catch (e) {}
  }

  function renderRecentSearches() {
    var host = document.getElementById('wz-recent-searches');
    if (!host) return;
    var list = getRecentSearches();
    if (!list.length) return;
    host.innerHTML = list
      .map(function (term) {
        var url = (window.wzRoutes && window.wzRoutes.search) || '/search';
        return (
          '<a href="' + url + '?q=' + encodeURIComponent(term) + '">' + term.replace(/</g, '&lt;') + '</a>'
        );
      })
      .join('');
  }

  /* Mobile drawer --------------------------------------------------------- */
  var drawer = document.getElementById('wz-mobile-drawer');
  var drawerOpeners = [document.getElementById('wz-nav-open'), document.getElementById('wz-tabbar-categories')];

  function openDrawer() {
    if (!drawer) return;
    drawer.hidden = false;
    refreshScrollLock();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.hidden = true;
    refreshScrollLock();
  }

  drawerOpeners.forEach(function (btn) {
    if (btn) btn.addEventListener('click', openDrawer);
  });
  if (drawer) {
    drawer.querySelectorAll('[data-drawer-close]').forEach(function (el) {
      el.addEventListener('click', closeDrawer);
    });
  }

  /* Filter sheet (collection pages) ---------------------------------------- */
  var filterSheet = document.getElementById('wz-filter-sheet');
  var filterOpenBtn = document.getElementById('wz-filter-open');

  function openFilterSheet() {
    if (!filterSheet) return;
    filterSheet.hidden = false;
    refreshScrollLock();
  }
  function closeFilterSheet() {
    if (!filterSheet) return;
    filterSheet.hidden = true;
    refreshScrollLock();
  }
  if (filterOpenBtn) filterOpenBtn.addEventListener('click', openFilterSheet);
  if (filterSheet) {
    filterSheet.querySelectorAll('[data-filter-close]').forEach(function (el) {
      el.addEventListener('click', closeFilterSheet);
    });
  }

  /* Desktop mega menu ------------------------------------------------------- */
  var nav = document.getElementById('wz-desktop-nav');
  if (nav) {
    var items = nav.querySelectorAll('[data-mega]');
    var panels = document.querySelectorAll('[data-mega-panel]');
    var hideTimer;

    function showPanel(key) {
      clearTimeout(hideTimer);
      panels.forEach(function (panel) {
        panel.classList.toggle('is-open', panel.getAttribute('data-mega-panel') === key);
      });
    }
    function hideAll() {
      hideTimer = setTimeout(function () {
        panels.forEach(function (panel) {
          panel.classList.remove('is-open');
        });
      }, 80);
    }

    items.forEach(function (item) {
      var key = item.getAttribute('data-mega');
      item.addEventListener('mouseenter', function () {
        showPanel(key);
      });
      item.addEventListener('mouseleave', hideAll);
      var link = item.querySelector('.wz-navrow__link');
      if (link) {
        link.addEventListener('click', function (evt) {
          if (item.classList.contains('has-mega')) {
            evt.preventDefault();
            showPanel(key);
          }
        });
      }
    });
    panels.forEach(function (panel) {
      panel.addEventListener('mouseenter', function () {
        clearTimeout(hideTimer);
      });
      panel.addEventListener('mouseleave', hideAll);
    });
    document.addEventListener('click', function (evt) {
      if (!nav.contains(evt.target) && !evt.target.closest('[data-mega-panel]')) {
        panels.forEach(function (panel) {
          panel.classList.remove('is-open');
        });
      }
    });
  }

  /* Wishlist badge ---------------------------------------------------------- */
  var WISHLIST_KEY = 'wz_wishlist';

  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function updateWishlistBadge() {
    var badge = document.getElementById('wz-wishlist-count');
    if (!badge) return;
    var count = getWishlist().length;
    badge.textContent = count;
    badge.hidden = count === 0;
  }

  updateWishlistBadge();
  window.addEventListener('storage', function (evt) {
    if (evt.key === WISHLIST_KEY) updateWishlistBadge();
  });
  document.addEventListener('wazen:wishlist-updated', updateWishlistBadge);
})();
