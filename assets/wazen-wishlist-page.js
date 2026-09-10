(function () {
  'use strict';

  function formatMoney(cents, format) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = format || '${{amount}}';

    function defaultOption(opts, name, fallback) {
      return opts[name] == null ? fallback : opts[name];
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultOption({ precision: precision }, 'precision', 2);
      thousands = defaultOption({ thousands: thousands }, 'thousands', ',');
      decimal = defaultOption({ decimal: decimal }, 'decimal', '.');
      if (isNaN(number) || number == null) return 0;
      number = (number / 100.0).toFixed(precision);
      var parts = number.split('.');
      var dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var cents2 = parts[1] ? decimal + parts[1] : '';
      return dollars + cents2;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
      default:
        value = formatWithDelimiters(cents, 2);
    }

    return formatString.replace(placeholderRegex, value);
  }

  function render() {
    var listEl = document.getElementById('wz-wishlist-list');
    var emptyEl = document.getElementById('wz-wishlist-empty');
    var loadingEl = document.getElementById('wz-wishlist-loading');
    var subEl = document.getElementById('wz-wishlist-sub');
    var stringsEl = document.getElementById('wz-wishlist-strings');
    if (!listEl || !window.WazenWishlist) return;

    var strings = {};
    try {
      strings = JSON.parse(stringsEl.textContent);
    } catch (e) {}

    var handles = window.WazenWishlist.read();

    if (!handles.length) {
      loadingEl.hidden = true;
      listEl.hidden = true;
      emptyEl.hidden = false;
      subEl.textContent = '';
      return;
    }

    emptyEl.hidden = true;
    subEl.textContent = strings.savedCount ? strings.savedCount.replace('{{ count }}', handles.length) : '';

    Promise.all(
      handles.map(function (handle) {
        return fetch('/products/' + handle + '.js')
          .then(function (res) {
            return res.ok ? res.json() : null;
          })
          .catch(function () {
            return null;
          });
      })
    ).then(function (products) {
      loadingEl.hidden = true;
      listEl.hidden = false;
      listEl.innerHTML = products
        .filter(Boolean)
        .map(function (product) {
          var variant = product.variants[0];
          var hasDiscount = variant.compare_at_price && variant.compare_at_price > variant.price;
          var img = product.featured_image || (product.images && product.images[0]);
          var offPct = hasDiscount
            ? Math.round(((variant.compare_at_price - variant.price) / variant.compare_at_price) * 100)
            : 0;
          return (
            '<div class="wz-wishlist-row" data-handle="' +
            product.handle +
            '">' +
            '<a href="/products/' +
            product.handle +
            '" class="wz-wishlist-row__media" style="background-image:url(' +
            (img || '') +
            ')"></a>' +
            '<div class="wz-wishlist-row__body">' +
            '<div class="wz-wishlist-row__brand">' +
            (product.vendor || '') +
            '</div>' +
            '<a href="/products/' +
            product.handle +
            '" class="wz-wishlist-row__title">' +
            product.title +
            '</a>' +
            '<div class="wz-wishlist-row__price">' +
            '<span class="wz-wishlist-row__price-now">' +
            formatMoney(variant.price, strings.moneyFormat) +
            '</span>' +
            (hasDiscount
              ? '<span class="wz-wishlist-row__price-old">' + formatMoney(variant.compare_at_price, strings.moneyFormat) + '</span>' +
                '<span class="wz-wishlist-row__off">-' + offPct + '%</span>'
              : '') +
            '</div>' +
            '</div>' +
            '<div class="wz-wishlist-row__stock' + (variant.available ? '' : ' is-out') + '">' +
            (variant.available ? '' : strings.soldOut || '') +
            '</div>' +
            '<div class="wz-wishlist-row__actions">' +
            (variant.available
              ? '<button type="button" class="wz-btn wz-btn--primary wz-btn--sm" data-wishlist-add data-variant-id="' + variant.id + '">' + (strings.add || 'Add to cart') + '</button>'
              : '') +
            '<button type="button" class="wz-btn wz-btn--icon" data-wishlist-remove aria-label="' +
            (strings.remove || 'Remove') +
            '">✕</button>' +
            '</div>' +
            '</div>'
          );
        })
        .join('');
    });
  }

  document.addEventListener('click', function (evt) {
    var removeBtn = evt.target.closest('[data-wishlist-remove]');
    if (removeBtn) {
      var row = removeBtn.closest('.wz-wishlist-row');
      var handle = row && row.getAttribute('data-handle');
      if (handle && window.WazenWishlist) {
        window.WazenWishlist.remove(handle);
        row.remove();
        render();
      }
      return;
    }

    var addBtn = evt.target.closest('[data-wishlist-add]');
    if (addBtn) {
      var variantId = addBtn.getAttribute('data-variant-id');
      addBtn.disabled = true;
      fetch(window.routes ? window.routes.cart_add_url : '/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 }),
      })
        .then(function () {
          document.dispatchEvent(new CustomEvent('wazen:cart-updated'));
          var cartIcon = document.getElementById('cart-icon-bubble');
          if (cartIcon) cartIcon.click();
        })
        .finally(function () {
          addBtn.disabled = false;
        });
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
