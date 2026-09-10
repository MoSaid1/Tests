(function () {
  'use strict';
  document.querySelectorAll('[data-tabbar]').forEach(function (tabbar) {
    var container = tabbar.parentElement;
    var panels = container.querySelectorAll('[data-tab-panel]');
    tabbar.querySelectorAll('[data-tab-target]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab-target');
        tabbar.querySelectorAll('[data-tab-target]').forEach(function (t) {
          t.classList.toggle('is-active', t === tab);
        });
        panels.forEach(function (panel) {
          panel.classList.toggle('is-active', panel.getAttribute('data-tab-panel') === target);
        });
      });
    });
  });
})();
