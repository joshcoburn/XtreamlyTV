(function () {
  'use strict';

  var KEY = { LEFT:37, UP:38, RIGHT:39, DOWN:40, ENTER:13 };
  var current = null;
  var cachedFocusables = null;

  function invalidate() { cachedFocusables = null; }

  function isVisible(el) {
    if (!el || el.disabled) return false;
    if (el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
    var style = window.getComputedStyle(el);
    return style.visibility !== 'hidden' && style.display !== 'none';
  }

  function focusables() {
    if (cachedFocusables) return cachedFocusables;
    cachedFocusables = Array.prototype.slice.call(document.querySelectorAll('.focusable:not([disabled])')).filter(isVisible);
    return cachedFocusables;
  }

  function center(rect) { return { x:rect.left + rect.width / 2, y:rect.top + rect.height / 2 }; }

  function focusElement(el, preventScroll) {
    if (!el) return;
    try { el.focus({ preventScroll:!!preventScroll }); } catch (error) { el.focus(); }
  }

  function moveSibling(active, selector, delta) {
    if (!active || !active.parentNode) return false;
    var candidate = active;
    do {
      candidate = delta < 0 ? candidate.previousElementSibling : candidate.nextElementSibling;
    } while (candidate && (!candidate.matches(selector) || !isVisible(candidate)));
    if (!candidate) return false;
    focusElement(candidate, true);
    if (candidate.scrollIntoView) candidate.scrollIntoView({ block:'nearest', inline:'nearest' });
    return true;
  }


  function scrollHomeTargetIntoView(candidate) {
    var viewport = candidate && candidate.closest ? candidate.closest('.scroll-view') : null;
    if (viewport) {
      var itemRect = candidate.getBoundingClientRect();
      var viewportRect = viewport.getBoundingClientRect();
      var topGuard = viewportRect.top + 28;
      var bottomGuard = viewportRect.bottom - 54;
      if (itemRect.top < topGuard) viewport.scrollTop -= (topGuard - itemRect.top);
      else if (itemRect.bottom > bottomGuard) viewport.scrollTop += (itemRect.bottom - bottomGuard);
    }
    var row = candidate && candidate.parentElement;
    if (row && /channel-row|poster-row|mixed-row|shortcut-row/.test(row.className || '')) {
      var item = candidate.getBoundingClientRect();
      var rowRect = row.getBoundingClientRect();
      if (item.left < rowRect.left + 10) row.scrollLeft -= (rowRect.left + 10 - item.left);
      else if (item.right > rowRect.right - 18) row.scrollLeft += (item.right - (rowRect.right - 18));
    }
  }

  function moveHomeRow(active, delta) {
    if (!active || !active.dataset || active.dataset.homeRow === undefined) return false;
    var currentRow = Number(active.dataset.homeRow);
    if (!isFinite(currentRow)) return false;
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-home-row]'));
    var maxRow = rows.reduce(function (max, element) {
      var value = Number(element.dataset.homeRow);
      return isFinite(value) ? Math.max(max, value) : max;
    }, currentRow);
    var targetRow = currentRow + delta;
    while (targetRow >= 0 && targetRow <= maxRow) {
      var candidates = rows.filter(function (element) { return Number(element.dataset.homeRow) === targetRow && isVisible(element); });
      if (candidates.length) {
        var activeCenter = center(active.getBoundingClientRect()).x;
        var best = candidates[0];
        var bestDistance = Infinity;
        candidates.forEach(function (candidate) {
          var distance = Math.abs(center(candidate.getBoundingClientRect()).x - activeCenter);
          if (distance < bestDistance) { bestDistance = distance; best = candidate; }
        });
        focusElement(best, true);
        if (targetRow === 0 && best.closest) {
          var homeViewport = best.closest('.scroll-view');
          if (homeViewport) homeViewport.scrollTop = 0;
        } else scrollHomeTargetIntoView(best);
        return true;
      }
      targetRow += delta;
    }
    /* Keep vertical focus inside Home instead of jumping into the fixed sidebar. */
    return true;
  }

  function move(direction) {
    var list = focusables();
    if (!list.length) return;
    var active = document.activeElement;
    if (!active || list.indexOf(active) < 0) {
      focusElement(current && list.indexOf(current) >= 0 ? current : list[0], false);
      return;
    }

    var a = center(active.getBoundingClientRect());
    var best = null;
    var bestScore = Infinity;
    var i;
    for (i = 0; i < list.length; i += 1) {
      var candidate = list[i];
      if (candidate === active) continue;
      var b = center(candidate.getBoundingClientRect());
      var dx = b.x - a.x;
      var dy = b.y - a.y;
      var primary;
      var secondary;
      if (direction === 'left' && dx < -4) { primary = -dx; secondary = Math.abs(dy); }
      else if (direction === 'right' && dx > 4) { primary = dx; secondary = Math.abs(dy); }
      else if (direction === 'up' && dy < -4) { primary = -dy; secondary = Math.abs(dx); }
      else if (direction === 'down' && dy > 4) { primary = dy; secondary = Math.abs(dx); }
      else continue;
      var score = primary + secondary * 2.35;
      if (score < bestScore) { bestScore = score; best = candidate; }
    }
    if (best) {
      focusElement(best, true);
      if (best.scrollIntoView) best.scrollIntoView({ block:'nearest', inline:'nearest' });
    }
  }

  document.addEventListener('focusin', function (event) {
    if (event.target.classList && event.target.classList.contains('focusable')) current = event.target;
  });

  document.addEventListener('keydown', function (event) {
    if ((window.XtreamlyTVApp && window.XtreamlyTVApp.playerOpen) || (window.TVeeApp && window.TVeeApp.playerOpen)) return;
    var active = document.activeElement;
    var input = /INPUT|TEXTAREA|SELECT/.test(active && active.tagName);
    if (input && (event.keyCode === KEY.LEFT || event.keyCode === KEY.RIGHT)) return;

    if ((window.XtreamlyTVApp && window.XtreamlyTVApp.currentView === 'home') && active && active.dataset && active.dataset.homeRow !== undefined && (event.keyCode === KEY.UP || event.keyCode === KEY.DOWN)) {
      if (moveHomeRow(active, event.keyCode === KEY.UP ? -1 : 1)) { event.preventDefault(); return; }
    }
    if (active && active.classList && active.classList.contains('category-button') && (event.keyCode === KEY.UP || event.keyCode === KEY.DOWN)) {
      if (moveSibling(active, '.category-button', event.keyCode === KEY.UP ? -1 : 1)) { event.preventDefault(); return; }
    }
    if (active && active.classList && active.classList.contains('nav-item') && (event.keyCode === KEY.UP || event.keyCode === KEY.DOWN)) {
      if (moveSibling(active, '.nav-item', event.keyCode === KEY.UP ? -1 : 1)) { event.preventDefault(); return; }
    }

    if (event.keyCode === KEY.LEFT) { event.preventDefault(); move('left'); }
    else if (event.keyCode === KEY.RIGHT) { event.preventDefault(); move('right'); }
    else if (event.keyCode === KEY.UP) { event.preventDefault(); move('up'); }
    else if (event.keyCode === KEY.DOWN) { event.preventDefault(); move('down'); }
    else if (event.keyCode === KEY.ENTER && document.activeElement && !input) {
      event.preventDefault(); document.activeElement.click();
    }
  });

  if (window.MutationObserver) {
    new MutationObserver(invalidate).observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['disabled','hidden','style'] });
  }
  window.addEventListener('resize', invalidate);

  window.XtreamlyTVNavigation = window.TVeeNavigation = {
    focusFirst:function (selector) {
      invalidate();
      var el = selector ? document.querySelector(selector) : focusables()[0];
      if (el) focusElement(el, true);
    },
    invalidate:invalidate,
    reset:function () { current = null; invalidate(); }
  };
}());
