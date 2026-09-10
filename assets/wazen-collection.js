(function () {
  'use strict';
  var form = document.getElementById('WzFacets');
  if (!form) return;

  form.querySelectorAll('.wz-filters__option input[type="checkbox"]').forEach(function (input) {
    input.addEventListener('change', function () {
      form.submit();
    });
  });

  var sortSelect = document.getElementById('wz-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      form.submit();
    });
  }

  form.querySelectorAll('.wz-filters__price-input').forEach(function (input) {
    input.addEventListener('keydown', function (evt) {
      if (evt.key === 'Enter') {
        evt.preventDefault();
        form.submit();
      }
    });
  });
})();
