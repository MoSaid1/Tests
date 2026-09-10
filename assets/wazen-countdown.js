(function () {
  'use strict';
  function pad(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }
  function tick(el) {
    var deadline = new Date(el.getAttribute('data-countdown')).getTime();
    if (isNaN(deadline)) return;
    var now = Date.now();
    var diff = Math.max(0, deadline - now);
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var minutes = Math.floor((diff % 3600000) / 60000);
    var d = el.querySelector('[data-cd="d"]');
    var h = el.querySelector('[data-cd="h"]');
    var m = el.querySelector('[data-cd="m"]');
    if (d) d.textContent = pad(days);
    if (h) h.textContent = pad(hours);
    if (m) m.textContent = pad(minutes);
  }
  function init() {
    var nodes = document.querySelectorAll('[data-countdown]');
    if (!nodes.length) return;
    nodes.forEach(tick);
    setInterval(function () {
      nodes.forEach(tick);
    }, 30000);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
