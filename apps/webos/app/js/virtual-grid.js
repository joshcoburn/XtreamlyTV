(function () {
  'use strict';

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function toElement(html) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return wrapper.firstElementChild;
  }

  function VirtualGrid(options) {
    this.container = options.container;
    this.columns = Math.max(1, Number(options.columns || 4));
    this.visibleRows = Math.max(0, Number(options.visibleRows || 0));
    this.baseRowHeight = Math.max(1, Number(options.rowHeight || 160));
    this.rowHeight = this.baseRowHeight;
    this.gap = Math.max(0, Number(options.gap || 16));
    this.overscan = Math.max(1, Number(options.overscan || 2));
    this.renderItem = options.renderItem;
    this.onActivate = options.onActivate || function () {};
    this.items = [];
    this.activeIndex = 0;
    this.renderedStart = -1;
    this.renderedEnd = -1;
    this.frame = 0;
    this.snapTimer = 0;
    this.programmaticScroll = false;
    this.destroyed = false;
    this.nodes = {};

    this.container.classList.add('virtual-grid-host');
    this.container.setAttribute('role', 'grid');
    this.inner = document.createElement('div');
    this.inner.className = 'virtual-grid-inner';
    this.container.innerHTML = '';
    this.container.appendChild(this.inner);

    this.boundScroll = this.handleScroll.bind(this);
    this.boundResize = this.handleResize.bind(this);
    this.boundClick = this.handleClick.bind(this);
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundFocusIn = this.handleFocusIn.bind(this);

    this.container.addEventListener('scroll', this.boundScroll);
    this.container.addEventListener('click', this.boundClick);
    this.container.addEventListener('keydown', this.boundKeyDown, true);
    this.container.addEventListener('focusin', this.boundFocusIn);
    window.addEventListener('resize', this.boundResize);
  }

  VirtualGrid.prototype.clearNodes = function () {
    this.nodes = {};
    this.inner.innerHTML = '';
  };

  VirtualGrid.prototype.stride = function () {
    return this.rowHeight + this.gap;
  };

  VirtualGrid.prototype.totalRows = function () {
    return Math.ceil(this.items.length / this.columns);
  };

  VirtualGrid.prototype.maxFirstRow = function () {
    if (!this.visibleRows) return Math.max(0, this.totalRows() - 1);
    return Math.max(0, this.totalRows() - this.visibleRows);
  };

  VirtualGrid.prototype.setItems = function (items, options) {
    options = options || {};
    this.items = Array.isArray(items) ? items : [];
    if (!options.preserveScroll) this.container.scrollTop = 0;
    this.activeIndex = clamp(options.activeIndex || 0, 0, Math.max(0, this.items.length - 1));
    this.renderedStart = -1;
    this.renderedEnd = -1;
    this.clearNodes();
    this.measureRowHeight();
    this.updateHeight();
    this.render(true);
  };

  VirtualGrid.prototype.measureRowHeight = function () {
    if (!this.visibleRows) { this.rowHeight = this.baseRowHeight; return; }
    var style = window.getComputedStyle ? window.getComputedStyle(this.container) : null;
    var verticalPadding = style ? (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0) : 0;
    var available = (this.container.clientHeight || 0) - verticalPadding - this.gap * Math.max(0, this.visibleRows - 1) - 2;
    if (available > this.visibleRows * 60) this.rowHeight = Math.max(60, Math.floor(available / this.visibleRows));
    else this.rowHeight = this.baseRowHeight;
  };

  VirtualGrid.prototype.updateHeight = function () {
    var rows = this.totalRows();
    var height = rows ? rows * this.rowHeight + Math.max(0, rows - 1) * this.gap : 0;
    this.inner.style.height = height + 'px';
  };

  VirtualGrid.prototype.handleResize = function () {
    this.measureRowHeight();
    this.updateHeight();
    this.renderedStart = -1;
    this.renderedEnd = -1;
    this.snapToNearestRow(true);
    this.scheduleRender();
  };

  VirtualGrid.prototype.handleScroll = function () {
    var self = this;
    this.scheduleRender();
    if (this.programmaticScroll) return;
    clearTimeout(this.snapTimer);
    this.snapTimer = setTimeout(function () { self.snapToNearestRow(false); }, 95);
  };

  VirtualGrid.prototype.snapToNearestRow = function (immediate) {
    if (this.destroyed || !this.visibleRows) return;
    var stride = this.stride();
    var row = clamp(Math.round(this.container.scrollTop / stride), 0, this.maxFirstRow());
    var target = row * stride;
    var maxScroll = Math.max(0, this.container.scrollHeight - this.container.clientHeight);
    target = Math.min(target, maxScroll);
    if (Math.abs(this.container.scrollTop - target) < 1) return;
    this.programmaticScroll = true;
    this.container.scrollTop = target;
    this.programmaticScroll = false;
    if (immediate) this.render(true);
    else this.scheduleRender();
  };

  VirtualGrid.prototype.scheduleRender = function () {
    var self = this;
    if (this.destroyed || this.frame) return;
    this.frame = requestAnimationFrame(function () {
      self.frame = 0;
      self.render(false);
    });
  };

  VirtualGrid.prototype.visibleRange = function () {
    var stride = this.stride();
    var viewportHeight = this.container.clientHeight || 700;
    var firstVisibleRow = clamp(Math.round(this.container.scrollTop / stride), 0, this.maxFirstRow());
    var firstRow = Math.max(0, firstVisibleRow - this.overscan);
    var visibleCount = this.visibleRows || Math.ceil(viewportHeight / stride) + 1;
    var lastRow = firstVisibleRow + visibleCount + this.overscan;
    return { start:firstRow * this.columns, end:Math.min(this.items.length, lastRow * this.columns) };
  };

  VirtualGrid.prototype.positionNode = function (element, index, itemWidth) {
    var row = Math.floor(index / this.columns);
    var column = index % this.columns;
    element.style.position = 'absolute';
    element.style.width = itemWidth + 'px';
    element.style.height = this.rowHeight + 'px';
    element.style.left = (column * (itemWidth + this.gap)) + 'px';
    element.style.top = (row * this.stride()) + 'px';
  };

  VirtualGrid.prototype.render = function (force) {
    if (this.destroyed) return;
    var range = this.visibleRange();
    if (!force && range.start === this.renderedStart && range.end === this.renderedEnd) return;
    this.renderedStart = range.start;
    this.renderedEnd = range.end;

    var key;
    for (key in this.nodes) {
      if (!Object.prototype.hasOwnProperty.call(this.nodes, key)) continue;
      var existingIndex = Number(key);
      if (existingIndex < range.start || existingIndex >= range.end) {
        if (this.nodes[key].parentNode) this.nodes[key].parentNode.removeChild(this.nodes[key]);
        delete this.nodes[key];
      }
    }

    if (!this.items.length) return;
    var containerStyle = window.getComputedStyle ? window.getComputedStyle(this.container) : null;
    var horizontalPadding = containerStyle ? (parseFloat(containerStyle.paddingLeft) || 0) + (parseFloat(containerStyle.paddingRight) || 0) : 0;
    var containerWidth = Math.max(1, (this.container.clientWidth || 1000) - horizontalPadding);
    var itemWidth = Math.floor((containerWidth - this.gap * (this.columns - 1)) / this.columns);
    var fragment = document.createDocumentFragment();
    var index;
    for (index = range.start; index < range.end; index += 1) {
      var element = this.nodes[index];
      if (!element) {
        element = toElement(this.renderItem(this.items[index], index));
        if (!element) continue;
        element.dataset.virtualIndex = String(index);
        element.setAttribute('role', 'gridcell');
        this.nodes[index] = element;
        fragment.appendChild(element);
      }
      this.positionNode(element, index, itemWidth);
    }
    if (fragment.childNodes.length) this.inner.appendChild(fragment);
    if (window.XtreamlyTVNavigation && window.XtreamlyTVNavigation.invalidate) window.XtreamlyTVNavigation.invalidate();
  };

  VirtualGrid.prototype.handleClick = function (event) {
    var target = event.target.closest('[data-virtual-index]');
    if (!target || !this.container.contains(target)) return;
    var index = Number(target.dataset.virtualIndex);
    if (!isFinite(index) || !this.items[index]) return;
    this.activeIndex = index;
    this.onActivate(this.items[index], index, target);
  };

  VirtualGrid.prototype.handleFocusIn = function (event) {
    var target = event.target.closest('[data-virtual-index]');
    if (!target) return;
    var index = Number(target.dataset.virtualIndex);
    if (isFinite(index)) this.activeIndex = index;
  };

  VirtualGrid.prototype.handleKeyDown = function (event) {
    var target = event.target.closest('[data-virtual-index]');
    if (!target) return;
    var index = Number(target.dataset.virtualIndex);
    if (!isFinite(index)) return;
    var next = index;
    var column = index % this.columns;

    if (event.keyCode === 37 && column > 0) next = index - 1;
    else if (event.keyCode === 39 && column < this.columns - 1 && index + 1 < this.items.length) next = index + 1;
    else if (event.keyCode === 38 && index - this.columns >= 0) next = index - this.columns;
    else if (event.keyCode === 40 && index + this.columns < this.items.length) next = index + this.columns;
    else return;

    event.preventDefault();
    event.stopPropagation();
    this.focusIndex(next);
  };

  VirtualGrid.prototype.focusIndex = function (index) {
    if (!this.items.length) return;
    index = clamp(index, 0, this.items.length - 1);
    this.activeIndex = index;
    var row = Math.floor(index / this.columns);
    var stride = this.stride();
    var firstVisibleRow = clamp(Math.round(this.container.scrollTop / stride), 0, this.maxFirstRow());
    var lastVisibleRow = firstVisibleRow + Math.max(1, this.visibleRows || 1) - 1;
    var targetFirstRow = firstVisibleRow;

    if (row < firstVisibleRow) targetFirstRow = row;
    else if (row > lastVisibleRow) targetFirstRow = row - Math.max(1, this.visibleRows || 1) + 1;
    targetFirstRow = clamp(targetFirstRow, 0, this.maxFirstRow());

    var targetScroll = targetFirstRow * stride;
    var maxScroll = Math.max(0, this.container.scrollHeight - this.container.clientHeight);
    targetScroll = Math.min(targetScroll, maxScroll);
    if (Math.abs(this.container.scrollTop - targetScroll) > 0.5) {
      this.programmaticScroll = true;
      this.container.scrollTop = targetScroll;
      this.programmaticScroll = false;
    }

    if (!this.nodes[index]) this.render(true);
    else this.render(false);

    var element = this.nodes[index] || this.inner.querySelector('[data-virtual-index="' + index + '"]');
    if (element) {
      try { element.focus({ preventScroll:true }); } catch (error) { element.focus(); }
      /* Older webOS Chromium may ignore preventScroll. Re-assert the row-aligned offset after focus. */
      if (Math.abs(this.container.scrollTop - targetScroll) > 0.5) this.container.scrollTop = targetScroll;
      var self = this;
      requestAnimationFrame(function () {
        if (!self.destroyed && self.activeIndex === index && Math.abs(self.container.scrollTop - targetScroll) > 0.5) {
          self.programmaticScroll = true;
          self.container.scrollTop = targetScroll;
          self.programmaticScroll = false;
          self.render(false);
        }
      });
    }
  };

  VirtualGrid.prototype.destroy = function () {
    this.destroyed = true;
    if (this.frame) cancelAnimationFrame(this.frame);
    clearTimeout(this.snapTimer);
    this.container.removeEventListener('scroll', this.boundScroll);
    this.container.removeEventListener('click', this.boundClick);
    this.container.removeEventListener('keydown', this.boundKeyDown, true);
    this.container.removeEventListener('focusin', this.boundFocusIn);
    window.removeEventListener('resize', this.boundResize);
    this.nodes = {};
  };

  window.XtreamlyTVVirtualGrid = VirtualGrid;
}());
