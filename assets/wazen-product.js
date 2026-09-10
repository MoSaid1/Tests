(function () {
  'use strict';

  document.querySelectorAll('.wz-pdp__tabs').forEach(function (tabbar) {
    var panels = tabbar.parentElement.querySelectorAll('.wz-pdp__panel');
    tabbar.querySelectorAll('.wz-pdp__tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab-target');
        tabbar.querySelectorAll('.wz-pdp__tab').forEach(function (t) {
          t.classList.toggle('is-active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });
        panels.forEach(function (panel) {
          panel.classList.toggle('is-active', panel.getAttribute('data-tab-panel') === target);
        });
      });
    });
  });

  document.querySelectorAll('.wz-pdp__buybox').forEach(function (buybox) {
    var qtyInput = buybox.querySelector('.wz-qty__input');
    var buyNowQty = buybox.querySelector('[data-buynow-qty]');
    if (!qtyInput || !buyNowQty) return;
    var sync = function () {
      buyNowQty.value = qtyInput.value || 1;
    };
    qtyInput.addEventListener('change', sync);
    qtyInput.addEventListener('input', sync);
    buybox.querySelectorAll('.wz-qty__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTimeout(sync, 0);
      });
    });
  });
})();
