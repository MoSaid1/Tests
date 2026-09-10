(function () {
  'use strict';

  function initMarquee(track) {
    var items = Array.prototype.slice.call(track.children);
    var half = Math.floor(items.length / 2);
    if (half < 1) return;

    var root = track.parentElement;
    var isRtl = document.documentElement.getAttribute('dir') === 'rtl';
    var interval = parseFloat(track.getAttribute('data-marquee-interval') || '2.8') * 1000;
    var index = 0;
    var timer = null;
    var paused = false;

    function stepWidth() {
      var style = getComputedStyle(track);
      var gap = parseFloat(style.columnGap || style.gap || '0') || 0;
      return items[0].getBoundingClientRect().width + gap;
    }

    function goNext() {
      if (paused || document.hidden) return;
      index += 1;
      var offset = index * stepWidth();
      track.style.transition = 'transform 650ms cubic-bezier(0.65, 0, 0.35, 1)';
      track.style.transform = 'translateX(' + (isRtl ? offset : -offset) + 'px)';
    }

    track.addEventListener('transitionend', function (evt) {
      if (evt.propertyName !== 'transform' || index < half) return;
      track.style.transition = 'none';
      index = 0;
      track.style.transform = 'translateX(0px)';
      void track.offsetWidth;
    });

    function start() {
      stop();
      timer = setInterval(goNext, interval);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    if (root) {
      root.addEventListener('mouseenter', function () {
        paused = true;
      });
      root.addEventListener('mouseleave', function () {
        paused = false;
      });
    }

    start();
  }

  function init() {
    document.querySelectorAll('[data-marquee]').forEach(initMarquee);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
