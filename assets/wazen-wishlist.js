(function () {
  'use strict';
  var KEY = 'wz_wishlist';

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function write(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {}
    document.dispatchEvent(new CustomEvent('wazen:wishlist-updated', { detail: { list: list } }));
  }

  function has(handle) {
    return read().indexOf(handle) !== -1;
  }

  function toggle(handle) {
    var list = read();
    var idx = list.indexOf(handle);
    if (idx === -1) {
      list.push(handle);
    } else {
      list.splice(idx, 1);
    }
    write(list);
    return idx === -1;
  }

  function remove(handle) {
    write(read().filter(function (h) {
      return h !== handle;
    }));
  }

  function paintButtons() {
    document.querySelectorAll('[data-wishlist-toggle]').forEach(function (btn) {
      var handle = btn.getAttribute('data-product-handle');
      btn.classList.toggle('is-active', has(handle));
      btn.setAttribute('aria-pressed', has(handle) ? 'true' : 'false');
    });
  }

  document.addEventListener('click', function (evt) {
    var btn = evt.target.closest('[data-wishlist-toggle]');
    if (!btn) return;
    evt.preventDefault();
    evt.stopPropagation();
    var handle = btn.getAttribute('data-product-handle');
    if (!handle) return;
    var nowActive = toggle(handle);
    btn.classList.toggle('is-active', nowActive);
    btn.setAttribute('aria-pressed', nowActive ? 'true' : 'false');
    paintButtons();
  });

  document.addEventListener('wazen:wishlist-updated', paintButtons);
  document.addEventListener('DOMContentLoaded', paintButtons);
  if (document.readyState !== 'loading') paintButtons();

  window.WazenWishlist = { read: read, has: has, toggle: toggle, remove: remove };
})();
