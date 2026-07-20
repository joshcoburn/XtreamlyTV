(function () {
  'use strict';

  var BACK = 461, PLAY = 415, PAUSE = 19, STOP = 413, RED = 403, GREEN = 404;
  var APP_NAME = 'XtreamlyTV';
  var APP_ID = 'com.github.xtreamlytv.webos';
  var APP_VERSION = '0.5.1';

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (char) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' })[char];
    });
  }

  function uiIcon(name, className) {
    className = className || 'ui-icon';
    var body = '';
    if (name === 'home') body = '<path d="M3.5 10.8 12 3.8l8.5 7v9.2h-5.7v-6.1H9.2V20H3.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>';
    else if (name === 'tv') body = '<path d="m8.2 2.5 3.8 3 3.8-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="3" y="5.5" width="18" height="13" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 21h8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="17.5" cy="12" r="1" fill="currentColor"/>';
    else if (name === 'popcorn') body = '<path d="M6.3 9.2h11.4L16.2 21H7.8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.3 9.5 10.2 21M14.7 9.5 13.8 21" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".75"/><path d="M6.7 9.2a3.1 3.1 0 0 1 1.6-5.8 3.3 3.3 0 0 1 6.2.4 3 3 0 0 1 3.1 5.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
    else if (name === 'play') body = '<rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m10 8 6.5 4-6.5 4z" fill="currentColor"/>';
    else if (name === 'heart') body = '<path d="M12 20.2 4.3 12.8C-.1 8.7 5.8 2.4 12 7.2c6.2-4.8 12.1 1.5 7.7 5.6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>';
    else if (name === 'plus') body = '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
    else if (name === 'folder') body = '<path d="M3 6.5h6l2 2h10v10.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>';
    else if (name === 'star') body = '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>';
    else if (name === 'trophy') body = '<path d="M8 4h8v4.5c0 3-1.7 5.2-4 5.2s-4-2.2-4-5.2zM10 14v3h4v-3M8 20h8M6.5 6H4v2.5A3.5 3.5 0 0 0 7.5 12M17.5 6H20v2.5a3.5 3.5 0 0 1-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>';
    else if (name === 'smile') body = '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 10h.01M15.5 10h.01M8.5 14.5c1.9 2 5.1 2 7 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
    else if (name === 'settings') body = '<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M19.4 15a8 8 0 0 0 .1-6l2-1.2-2-3.4-2.1 1.2a8.4 8.4 0 0 0-5.2-2.1L12 1H8l-.2 2.5a8.4 8.4 0 0 0-3.2 2.1L2.5 4.4.5 7.8l2 1.2a8 8 0 0 0 .1 6l-2.1 1.2 2 3.4 2.2-1.2a8.2 8.2 0 0 0 5.1 2.1L8 23h4l.2-2.5a8.2 8.2 0 0 0 5.1-2.1l2.2 1.2 2-3.4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>';
    return '<svg class="' + className + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  function initials(name) {
    return String(name || 'TV').split(/\s+/).slice(0, 2).map(function (part) {
      return part.charAt(0);
    }).join('').toUpperCase();
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  function formatSeconds(seconds) {
    seconds = Math.max(0, Number(seconds || 0));
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = Math.floor(seconds % 60);
    function pad(value) { return value < 10 ? '0' + value : String(value); }
    return (hours ? hours + ':' + pad(minutes) : minutes) + ':' + pad(secs);
  }

  function settle(promise, fallback) {
    return promise.catch(function () { return fallback; });
  }

  function typeOf(item) {
    return XtreamlyTVStore.inferType(item);
  }

  function idOf(item, type) {
    return XtreamlyTVStore.itemId(item, type);
  }

  function titleOf(item) {
    return String((item && (item.name || item.title || item.series_name)) || 'Untitled');
  }

  function yearOf(item) {
    var value = item && (item.releaseDate || item.releasedate || item.year || item.release_date);
    return value ? String(value).slice(0, 4) : '';
  }

  function ratingOf(item) {
    var value = item && (item.rating_5based || item.rating);
    if (value === undefined || value === null || value === '') return '';
    var number = Number(value);
    if (isFinite(number) && number <= 5) number *= 2;
    return isFinite(number) ? number.toFixed(1).replace('.0', '') : String(value);
  }

  function descriptionOf(item) {
    return String((item && (item.plot || item.description || item.info && item.info.plot)) || '');
  }

  function imageOf(item, type) {
    if (!item) return '';
    if (type === 'live') return item.stream_icon || '';
    if (type === 'series') return item.cover || item.cover_big || item.stream_icon || '';
    if (type === 'episode') return item.movie_image || item.cover || item.stream_icon || '';
    return item.stream_icon || item.movie_image || item.cover_big || item.cover || '';
  }

  function logo(item, className) {
    className = className || 'channel-logo';
    var image = imageOf(item, 'live');
    if (image) {
      return '<img class="' + className + '" src="' + escapeHtml(image) + '" alt="" loading="lazy" decoding="async" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'grid\'">' +
        '<div class="channel-logo-fallback" style="display:none">' + escapeHtml(initials(titleOf(item))) + '</div>';
    }
    return '<div class="channel-logo-fallback">' + escapeHtml(initials(titleOf(item))) + '</div>';
  }

  function poster(item, type, className) {
    className = className || 'poster-art';
    var image = imageOf(item, type);
    return '<div class="' + className + (image ? '' : ' image-failed') + '">' +
      (image ? '<img src="' + escapeHtml(image) + '" alt="" loading="lazy" decoding="async" onerror="this.style.display=\'none\';this.parentNode.classList.add(\'image-failed\')">' : '') +
      '<div class="poster-fallback"><span>' + escapeHtml(initials(titleOf(item))) + '</span></div></div>';
  }

  function metadataHtml(item, type) {
    var values = [];
    var year = yearOf(item);
    var rating = ratingOf(item);
    if (year) values.push(year);
    if (rating) values.push('★ ' + rating);
    if (type === 'series' && item && item.last_modified) values.push('Series');
    if (item && item.duration) values.push(String(item.duration));
    return values.map(function (value) {
      return '<span class="meta-chip">' + escapeHtml(value) + '</span>';
    }).join('');
  }

  function normalizeMovie(base, response) {
    return Object.assign({}, base || {}, response && response.movie_data || {}, response && response.info || {}, {
      stream_id: (base && base.stream_id) || response && response.movie_data && response.movie_data.stream_id,
      content_type: 'movie'
    });
  }

  function normalizeSeries(base, response) {
    return Object.assign({}, base || {}, response && response.info || {}, {
      series_id: (base && base.series_id) || response && response.info && response.info.series_id,
      content_type: 'series'
    });
  }

  function episodeTitle(episode) {
    return String(episode && (episode.title || episode.name || 'Episode ' + (episode.episode_num || '')) || 'Episode');
  }

  function categoryIdOf(item) {
    return String(item && (item.category_id !== undefined ? item.category_id : item.categoryId) || '');
  }

  function uniqueById(items, type) {
    var seen = {};
    return (items || []).filter(function (item) {
      var key = type + ':' + idOf(item, type);
      if (!idOf(item, type) || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  var App = {
    root: document.getElementById('app'),
    playerHost: document.getElementById('playerHost'),
    toastEl: document.getElementById('toast'),
    state: XtreamlyTVStore.getState(),
    profile: null,
    liveCategories: [],
    vodCategories: [],
    seriesCategories: [],
    catalogCache: { live: {}, movies: {}, series: {} },
    cacheOrder: { live: [], movies: [], series: [] },
    catalogPromises: { live: {}, movies: {}, series: {} },
    catalogErrors: { live: '', movies: '', series: '' },
    requestGeneration: { live: 0, movies: 0, series: 0 },
    currentItems: { live: [], movies: [], series: [] },
    currentFilteredItems: { live: [], movies: [], series: [] },
    itemLookup: {},
    currentView: 'home',
    activeCategory: { live: '', movies: '', series: '' },
    searchText: { live: '', movies: '', series: '' },
    searchTimer: null,
    api: null,
    demo: false,
    detail: null,
    episodeLookup: {},
    virtualGrid: null,
    categoryRail: null,
    seriesDiscovery: 'idle',
    seriesDiscoveryPromise: null,
    playerOpen: false,
    playerMedia: null,
    playerType: null,
    playerList: [],
    playerParent: null,
    playbackCandidates: [],
    playbackCandidateIndex: 0,
    playbackWatchdog: null,
    playbackBufferTimer: null,
    playbackStartedAt: 0,
    lastPlaybackProgressAt: 0,
    lastPlaybackTime: 0,
    playbackProgressRestored: false,
    playbackSwitching: false,
    playbackFailureLock: false,
    overlayTimer: null,
    playerHasPlayed: false,
    lastPlaybackToggleAt: 0,
    lastProgressSave: 0,
    favoriteMode: 'home',
    favoriteFilter: 'all',
    favoriteGroupId: 'all',
    favoriteEditor: null,
    favoriteDeleteArmed: false,

    init: function () {
      this.applyTheme(this.state.settings.theme || 'teal');
      this.scale();
      window.addEventListener('resize', this.scale.bind(this));
      document.addEventListener('keydown', this.onGlobalKey.bind(this));
      document.addEventListener('focusin', this.updateMenuHint.bind(this));
      if (window.location.search.indexOf('demo=1') >= 0) this.startDemo();
      else if (this.state.credentials) this.connectSaved();
      else this.renderLogin();
    },

    scale: function () {
      var scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
      if (Math.abs(scale - 1) < 0.001) {
        this.root.style.transform = 'none';
        this.root.style.marginLeft = '0px';
        this.root.style.marginTop = '0px';
        return;
      }
      this.root.style.transform = 'scale(' + scale + ')';
      this.root.style.marginLeft = ((window.innerWidth - 1920 * scale) / 2) + 'px';
      this.root.style.marginTop = ((window.innerHeight - 1080 * scale) / 2) + 'px';
    },

    applyTheme: function (theme, persist) {
      var allowed = ['teal', 'gray', 'purple', 'pink', 'blue'];
      if (allowed.indexOf(theme) < 0) theme = 'teal';
      document.body.setAttribute('data-theme', theme);
      if (persist) {
        XtreamlyTVStore.updateSettings({ theme: theme });
        this.state = XtreamlyTVStore.getState();
      }
    },

    toast: function (message) {
      var self = this;
      this.toastEl.textContent = message;
      this.toastEl.classList.add('show');
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(function () { self.toastEl.classList.remove('show'); }, 2600);
    },

    renderLogin: function (error) {
      this.destroyVirtualGrid();
      var credentials = this.state.credentials || {};
      var settings = this.state.settings || {};
      this.root.innerHTML = '<section class="screen login-screen">' +
        '<div class="login-brand"><div class="brand-lockup"><img src="assets/largeIcon.png" alt="XtreamlyTV"><div><h1>XtreamlyTV</h1><span>Live · Movies · Series</span></div></div>' +
        '<p>A fast, remote-first Xtream player designed for large provider libraries and LG webOS televisions.</p>' +
        '<div class="feature-pills"><span class="feature-pill">Virtualized catalogs</span><span class="feature-pill">Lazy loading</span><span class="feature-pill">Stream fallback</span><span class="feature-pill">Resume playback</span><span class="feature-pill">No tracking</span></div></div>' +
        '<form id="loginForm" class="login-card">' +
        '<h2>Connect your provider</h2><div class="sub">Enter the Xtream credentials supplied by your IPTV service.</div>' +
        (error ? '<div class="form-error">' + escapeHtml(error) + '</div>' : '') +
        '<label class="field"><span>Server URL</span><input id="loginServer" class="focusable" name="server" type="url" enterkeyhint="next" value="' + escapeHtml(credentials.server || '') + '" placeholder="https://provider.example:443" autocomplete="off"></label>' +
        '<label class="field"><span>Username</span><input id="loginUsername" class="focusable" name="username" enterkeyhint="next" value="' + escapeHtml(credentials.username || '') + '" autocomplete="off"></label>' +
        '<label class="field"><span>Password</span><input id="loginPassword" class="focusable" name="password" type="password" enterkeyhint="done" value="' + escapeHtml(credentials.password || '') + '" autocomplete="off"></label>' +
        '<div class="field-row"><label class="field"><span>Live stream format</span><select class="focusable" name="streamFormat"><option value="auto"' + (settings.streamFormat === 'auto' || !settings.streamFormat ? ' selected' : '') + '>Automatic fallback</option><option value="m3u8"' + (settings.streamFormat === 'm3u8' ? ' selected' : '') + '>HLS (.m3u8)</option><option value="ts"' + (settings.streamFormat === 'ts' ? ' selected' : '') + '>MPEG-TS (.ts)</option></select></label>' +
        '<label class="field"><span>API bridge (optional)</span><input class="focusable" name="apiProxy" value="' + escapeHtml(settings.apiProxy || '') + '" placeholder="http://unraid.local:8787"></label></div>' +
        '<div class="button-row"><button id="loginConnect" class="primary-button focusable" type="submit">Connect</button><button class="secondary-button focusable" type="button" id="demoButton">Explore demo</button></div>' +
        '<div class="login-note">XtreamlyTV provides no channels or subscriptions. Use only services and content you are authorized to access. Credentials are stored locally on this TV.</div>' +
        '</form></section>';

      var self = this;
      document.getElementById('loginForm').addEventListener('submit', function (event) {
        event.preventDefault();
        var form = new FormData(event.currentTarget);
        self.connect({
          server: form.get('server'), username: form.get('username'), password: form.get('password')
        }, { apiProxy: form.get('apiProxy'), streamFormat: form.get('streamFormat'), theme: settings.theme || 'teal' });
      });
      document.getElementById('demoButton').addEventListener('click', function () { self.startDemo(); });
      [['loginServer', 'loginUsername'], ['loginUsername', 'loginPassword']].forEach(function (pair) {
        var input = document.getElementById(pair[0]);
        if (!input) return;
        input.addEventListener('keydown', function (event) {
          if (event.keyCode !== 13 && event.key !== 'Enter') return;
          event.preventDefault();
          event.stopPropagation();
          var next = document.getElementById(pair[1]);
          if (next) { next.focus(); if (next.select) next.select(); }
        });
      });
      XtreamlyTVNavigation.focusFirst('#loginConnect');
    },

    renderLoading: function (message) {
      this.destroyVirtualGrid();
      this.root.innerHTML = '<div class="loading"><div><div class="spinner"></div>' + escapeHtml(message || 'Loading…') + '</div></div>';
    },

    connectSaved: function () {
      this.connect(this.state.credentials, this.state.settings, true);
    },

    resetCatalog: function () {
      this.destroyVirtualGrid();
      this.catalogCache = { live: {}, movies: {}, series: {} };
      this.cacheOrder = { live: [], movies: [], series: [] };
      this.catalogPromises = { live: {}, movies: {}, series: {} };
      this.catalogErrors = { live: '', movies: '', series: '' };
      this.requestGeneration = { live: 0, movies: 0, series: 0 };
      this.currentItems = { live: [], movies: [], series: [] };
      this.currentFilteredItems = { live: [], movies: [], series: [] };
      this.itemLookup = {};
      this.seriesDiscovery = 'idle';
      this.seriesDiscoveryPromise = null;
    },

    connect: function (credentials, settings, silent) {
      var self = this;
      credentials = {
        server: String(credentials.server || '').trim().replace(/\/+$/, ''),
        username: String(credentials.username || '').trim(),
        password: String(credentials.password || '')
      };
      if (!credentials.server || !credentials.username || !credentials.password) {
        this.renderLogin('Server, username, and password are required.');
        return;
      }
      if (!/^https?:\/\//i.test(credentials.server)) credentials.server = 'http://' + credentials.server;
      XtreamlyTVStore.updateSettings(settings || {});
      this.state = XtreamlyTVStore.getState();
      this.applyTheme(this.state.settings.theme || 'teal');
      this.api = new XtreamlyTVApi(credentials, this.state.settings);
      this.renderLoading('Connecting and loading category indexes…');
      this.api.authenticate().then(function (profile) {
        self.profile = profile;
        XtreamlyTVStore.saveCredentials(credentials);
        self.state = XtreamlyTVStore.getState();
        return Promise.all([
          settle(self.api.getLiveCategories(), []),
          settle(self.api.getVodCategories(), []),
          settle(self.api.getSeriesCategories(), [])
        ]);
      }).then(function (results) {
        self.resetCatalog();
        self.liveCategories = results[0];
        self.vodCategories = results[1];
        self.seriesCategories = results[2];
        self.activeCategory.live = self.firstCategoryId('live');
        self.activeCategory.movies = self.firstCategoryId('movies');
        self.activeCategory.series = self.firstCategoryId('series');
        self.demo = false;
        self.renderShell('home');
        if (!self.seriesCategories.length) {
          setTimeout(function () { self.ensureSeriesDiscovery(true); }, 250);
        }
      }).catch(function (error) {
        if (!silent) XtreamlyTVStore.clearCredentials();
        self.state = XtreamlyTVStore.getState();
        self.renderLogin(error.message || 'Unable to connect.');
      });
    },

    startDemo: function () {
      var self = this;
      this.resetCatalog();
      this.demo = true;
      this.profile = XtreamlyTVMock.profile;
      this.liveCategories = XtreamlyTVMock.liveCategories.slice();
      this.vodCategories = XtreamlyTVMock.vodCategories.slice();
      this.seriesCategories = XtreamlyTVMock.seriesCategories.slice();
      this.api = {
        getLiveStreams: function (category) { return Promise.resolve(self.filterByCategory(XtreamlyTVMock.liveStreams, category)); },
        getVodStreams: function (category) { return Promise.resolve(self.filterByCategory(XtreamlyTVMock.vodStreams, category)); },
        getSeries: function (category) { return Promise.resolve(self.filterByCategory(XtreamlyTVMock.series, category)); },
        discoverSeries: function () { return Promise.resolve({ categories: self.seriesCategories, items: XtreamlyTVMock.series }); },
        getShortEpg: function (id) {
          return Promise.resolve(XtreamlyTVMock.epg(XtreamlyTVMock.liveStreams.find(function (stream) { return String(stream.stream_id) === String(id); }) || { name: 'Demo' }));
        },
        getVodInfo: function (id) {
          var item = XtreamlyTVMock.vodStreams.find(function (movie) { return String(movie.stream_id) === String(id); });
          return Promise.resolve(XtreamlyTVMock.vodInfo(item || { name: 'Demo Movie', stream_id: id }));
        },
        getSeriesInfo: function (id) {
          var item = XtreamlyTVMock.series.find(function (series) { return String(series.series_id) === String(id); });
          return Promise.resolve(XtreamlyTVMock.seriesInfo(item || { name: 'Demo Series', series_id: id }));
        },
        getLiveCandidates: function () { return []; },
        getMediaCandidates: function () { return []; }
      };
      this.activeCategory.live = this.firstCategoryId('live');
      this.activeCategory.movies = this.firstCategoryId('movies');
      this.activeCategory.series = this.firstCategoryId('series');
      this.storeCache('live', 'all', this.normalizeCatalogItems('live', XtreamlyTVMock.liveStreams));
      this.storeCache('movies', 'all', this.normalizeCatalogItems('movies', XtreamlyTVMock.vodStreams));
      this.storeCache('series', 'all', this.normalizeCatalogItems('series', XtreamlyTVMock.series));
      this.renderShell('home');
    },

    categoriesFor: function (kind) {
      if (kind === 'live') return this.liveCategories;
      if (kind === 'movies') return this.vodCategories;
      return this.seriesCategories;
    },

    firstCategoryId: function (kind) {
      var categories = this.categoriesFor(kind);
      return categories.length ? String(categories[0].category_id) : '';
    },

    filterByCategory: function (items, category) {
      if (!category || category === 'all') return (items || []).slice();
      return (items || []).filter(function (item) { return categoryIdOf(item) === String(category); });
    },

    normalizeCatalogItems: function (kind, items) {
      var type = kind === 'live' ? 'live' : (kind === 'movies' ? 'movie' : 'series');
      return (Array.isArray(items) ? items : []).map(function (item) {
        var normalized = Object.assign({}, item, { content_type: type });
        normalized._search = titleOf(normalized).toLowerCase();
        return normalized;
      });
    },

    indexItems: function (kind, items) {
      var type = kind === 'live' ? 'live' : (kind === 'movies' ? 'movie' : 'series');
      var self = this;
      (items || []).forEach(function (item) {
        var id = idOf(item, type);
        if (id) self.itemLookup[type + ':' + id] = item;
      });
    },

    storeCache: function (kind, category, items) {
      category = String(category || 'all');
      this.catalogCache[kind][category] = items;
      this.indexItems(kind, items);
      this.cacheOrder[kind] = this.cacheOrder[kind].filter(function (key) { return key !== category; });
      this.cacheOrder[kind].push(category);
      var limit = Math.max(1, Number(this.state.settings.maxCachedCategories || 3));
      while (this.cacheOrder[kind].length > limit) {
        var evict = this.cacheOrder[kind].shift();
        if (evict === category) continue;
        delete this.catalogCache[kind][evict];
      }
    },

    loadedItems: function (kind) {
      var type = kind === 'live' ? 'live' : (kind === 'movies' ? 'movie' : 'series');
      var combined = [];
      Object.keys(this.catalogCache[kind]).forEach(function (key) {
        combined = combined.concat(App.catalogCache[kind][key]);
      });
      return uniqueById(combined, type);
    },

    loadedCount: function (kind) {
      return this.loadedItems(kind).length;
    },

    providerAllowedFormats: function () {
      var values = this.profile && this.profile.user_info && this.profile.user_info.allowed_output_formats;
      return Array.isArray(values) ? values : [];
    },

    ensureSeriesDiscovery: function (background) {
      var self = this;
      if (this.seriesCategories.length || this.seriesDiscovery === 'done') return Promise.resolve(this.seriesCategories);
      if (this.seriesDiscoveryPromise) return this.seriesDiscoveryPromise;
      this.seriesDiscovery = 'loading';
      this.seriesDiscoveryPromise = this.api.discoverSeries(this.seriesCategories).then(function (result) {
        self.seriesCategories = result.categories || [];
        if (result.items && result.items.length) {
          var normalized = self.normalizeCatalogItems('series', result.items);
          self.storeCache('series', 'all', normalized);
        }
        self.activeCategory.series = self.firstCategoryId('series');
        self.seriesDiscovery = 'done';
        self.seriesDiscoveryPromise = null;
        if (self.currentView === 'series' && !self.detail) self.renderCatalog('series');
        return self.seriesCategories;
      }).catch(function (error) {
        self.seriesDiscovery = 'done';
        self.seriesDiscoveryPromise = null;
        self.catalogErrors.series = error.message || 'Unable to discover series.';
        if (self.currentView === 'series') self.renderCatalog('series');
        return [];
      });
      return this.seriesDiscoveryPromise;
    },

    fetchCatalog: function (kind, category) {
      var self = this;
      if (kind === 'live') return this.api.getLiveStreams(category);
      if (kind === 'movies') return this.api.getVodStreams(category);
      return this.api.getSeries(category).then(function (items) {
        if (items.length || category === 'all') return items;
        var cachedAll = self.catalogCache.series.all;
        if (cachedAll) return self.filterByCategory(cachedAll, category);
        return self.api.getSeries('all').then(function (allItems) {
          var normalizedAll = self.normalizeCatalogItems('series', allItems);
          self.storeCache('series', 'all', normalizedAll);
          return self.filterByCategory(allItems, category);
        });
      });
    },

    loadCategory: function (kind, category, options) {
      var self = this;
      options = options || {};
      category = String(category || 'all');
      if (this.catalogCache[kind][category]) {
        this.currentItems[kind] = this.catalogCache[kind][category];
        if (options.render !== false) this.updateCatalogGrid(kind);
        return Promise.resolve(this.currentItems[kind]);
      }
      if (this.catalogPromises[kind][category]) return this.catalogPromises[kind][category];

      var generation = ++this.requestGeneration[kind];
      this.catalogErrors[kind] = '';
      if (options.render !== false) this.showCatalogLoading(kind, category === 'all' ? 'Loading the full provider catalog…' : 'Loading category…');
      this.catalogPromises[kind][category] = this.fetchCatalog(kind, category).then(function (rawItems) {
        var items = self.normalizeCatalogItems(kind, rawItems);
        if (category !== 'all') {
          var matches = self.filterByCategory(items, category);
          if (matches.length && matches.length < items.length) items = matches;
        }
        self.storeCache(kind, category, items);
        delete self.catalogPromises[kind][category];
        if (String(self.activeCategory[kind]) === category && generation === self.requestGeneration[kind]) {
          self.currentItems[kind] = items;
          if (options.render !== false && self.currentView === kind && !self.detail) self.updateCatalogGrid(kind);
        }
        return items;
      }).catch(function (error) {
        delete self.catalogPromises[kind][category];
        self.catalogErrors[kind] = error.message || 'Unable to load this category.';
        if (options.render !== false && self.currentView === kind) self.showCatalogError(kind, self.catalogErrors[kind]);
        throw error;
      });
      return this.catalogPromises[kind][category];
    },

    renderShell: function (view) {
      this.destroyVirtualGrid();
      this.destroyCategoryRail();
      this.currentView = view || this.currentView;
      this.root.classList.remove('player-active');
      document.body.classList.remove('video-mode');
      document.documentElement.classList.remove('video-mode');
      this.root.removeAttribute('aria-hidden');
      if (this.playerHost) {
        this.playerHost.classList.remove('active');
        this.playerHost.setAttribute('aria-hidden', 'true');
        this.playerHost.innerHTML = '';
      }
      this.root.innerHTML = '<div class="shell screen">' + this.sidebarHtml() +
        '<main class="main"><header class="topbar"><h1 id="viewTitle"></h1><div class="topbar-right"><span class="status-cluster"><span class="status-dot"></span><span class="status-text">' +
        escapeHtml(this.demo ? 'Demo mode' : ((this.profile && this.profile.user_info && this.profile.user_info.status) || 'Connected')) +
        '</span></span><strong id="clock" class="topbar-clock"></strong></div></header><section id="view" class="view"></section></main></div>' +
        '<div id="menuHint" class="menu-hint" aria-hidden="true"><span class="menu-key menu-key-red">RED</span><span id="menuHintText">Add favorite</span></div>';
      this.bindShell();
      this.updateClock();
      clearInterval(this.clockInterval);
      this.clockInterval = setInterval(this.updateClock.bind(this), 30000);
      this.renderView();
    },

    sidebarHtml: function () {
      var items = [
        ['home', uiIcon('home', 'nav-svg'), 'Home'],
        ['live', uiIcon('tv', 'nav-svg'), 'Live TV'],
        ['movies', uiIcon('popcorn', 'nav-svg'), 'Movies'],
        ['series', uiIcon('play', 'nav-svg'), 'Series'],
        ['favorites', uiIcon('heart', 'nav-svg'), 'Favorites'],
        ['settings', uiIcon('settings', 'nav-svg'), 'Settings']
      ];
      return '<aside class="sidebar"><div class="logo"><img src="assets/icon.png" alt="X"><span>treamlyTV</span></div><nav class="nav-list">' +
        items.map(function (item) {
          return '<button class="nav-item focusable ' + (App.currentView === item[0] ? 'active' : '') + '" data-view="' + item[0] + '"><span class="nav-icon">' + item[1] + '</span>' + item[2] + '</button>';
        }).join('') + '</nav></aside>';
    },

    bindShell: function () {
      var self = this;
      Array.prototype.forEach.call(document.querySelectorAll('[data-view]'), function (button) {
        button.addEventListener('click', function () {
          self.detail = null;
          if (button.dataset.view === 'favorites') {
            self.favoriteMode = 'home';
            self.favoriteFilter = 'all';
            self.favoriteGroupId = 'all';
            self.favoriteEditor = null;
          }
          self.currentView = button.dataset.view;
          self.renderShell(self.currentView);
        });
      });
    },

    updateMenuHint: function () {
      var hint = document.getElementById('menuHint');
      if (!hint || this.playerOpen) return;
      var active = document.activeElement;
      var card = active && active.closest ? active.closest('[data-content-type][data-content-id]') : null;
      if (!card) {
        hint.classList.remove('visible');
        hint.setAttribute('aria-hidden', 'true');
        return;
      }
      var type = card.dataset.contentType;
      var item = this.resolveItem(type, card.dataset.contentId);
      if (!item || ['live', 'movie', 'series'].indexOf(type) < 0) {
        hint.classList.remove('visible');
        hint.setAttribute('aria-hidden', 'true');
        return;
      }
      var favorite = XtreamlyTVStore.isFavorite(type, idOf(item, type));
      var text = document.getElementById('menuHintText');
      if (text) text.textContent = favorite ? 'Remove favorite' : 'Add favorite';
      hint.classList.add('visible');
      hint.setAttribute('aria-hidden', 'false');
    },

    focusedFavoriteTarget: function () {
      var active = document.activeElement;
      var card = active && active.closest ? active.closest('[data-content-type][data-content-id]') : null;
      if (!card) return null;
      var type = card.dataset.contentType;
      if (['live', 'movie', 'series'].indexOf(type) < 0) return null;
      var item = this.resolveItem(type, card.dataset.contentId);
      return item ? { item:item, type:type, element:card } : null;
    },

    updateFavoriteCard: function (element, item, type, added) {
      if (!element) return;
      var existing = element.querySelector('.favorite-badge');
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
      if (added) {
        var badge = document.createElement('span');
        badge.className = 'favorite-badge' + (element.classList.contains('poster-card') ? ' poster-favorite' : '');
        badge.textContent = '♥';
        element.insertBefore(badge, element.firstChild);
      }
      if (element.classList.contains('channel-tile')) {
        var number = element.querySelector('.channel-number');
        if (number) number.textContent = added ? '♥ Favorite' : 'CH ' + String(item.num || '—');
      }
    },

    toggleFocusedFavorite: function () {
      var target = this.focusedFavoriteTarget();
      if (!target) return false;
      var added = XtreamlyTVStore.toggleFavorite(target.item, target.type);
      this.state = XtreamlyTVStore.getState();
      if (this.currentView === 'favorites') {
        this.renderFavorites();
      } else {
        var self = this;
        Array.prototype.forEach.call(document.querySelectorAll('[data-content-type][data-content-id]'), function (element) {
          if (element.dataset.contentType === target.type && String(element.dataset.contentId) === String(idOf(target.item, target.type))) {
            self.updateFavoriteCard(element, target.item, target.type, added);
          }
        });
      }
      this.toast(added ? 'Added to favorites' : 'Removed from favorites');
      this.updateMenuHint();
      return true;
    },

    updateClock: function () {
      var clock = document.getElementById('clock');
      if (clock) clock.textContent = formatTime(new Date());
      var playerClock = document.querySelector('.player-clock');
      if (playerClock) playerClock.textContent = formatTime(new Date());
    },

    viewTitle: function () {
      if (this.detail && this.detail.type === 'movie') return 'Movie Details';
      if (this.detail && this.detail.type === 'series') return 'Series Details';
      return ({ home: 'Home', live: 'Live TV', movies: 'Movies', series: 'Series', favorites: 'Favorites', settings: 'Settings' })[this.currentView] || 'XtreamlyTV';
    },

    renderView: function () {
      var title = document.getElementById('viewTitle');
      if (title) title.textContent = this.viewTitle();
      if (this.detail && this.detail.type === 'movie') this.renderMovieDetail();
      else if (this.detail && this.detail.type === 'series') this.renderSeriesDetail();
      else if (this.currentView === 'home') this.renderHome();
      else if (this.currentView === 'live' || this.currentView === 'movies' || this.currentView === 'series') this.renderCatalog(this.currentView);
      else if (this.currentView === 'favorites') this.renderFavorites();
      else this.renderSettings();
    },

    renderHome: function () {
      var self = this;
      var view = document.getElementById('view');
      var recent = this.state.recent || [];
      var livePreview = recent.filter(function (item) { return typeOf(item) === 'live'; }).slice(0, 7);
      var moviePreview = recent.filter(function (item) { return typeOf(item) === 'movie'; }).slice(0, 7);
      var seriesPreview = uniqueById(recent.map(function (item) {
        return typeOf(item) === 'episode' && item.parent_series ? item.parent_series : item;
      }).filter(function (item) { return typeOf(item) === 'series'; }), 'series').slice(0, 7);
      var featured = recent[0] || this.loadedItems('live')[0];
      var featuredType = featured ? typeOf(featured) : 'live';
      view.innerHTML = '<div class="scroll-view">' +
        '<div class="hero"><div class="hero-art"></div><div class="hero-lines"></div><div class="hero-content"><h2>' +
        escapeHtml(featured ? titleOf(featured) : 'Live TV, movies, and series without the lag') + '</h2><p>' +
        (featured ? 'Jump back into recently watched content or browse Live TV.' : 'Browse Live TV, movies, and series from your provider.') +
        '</p><div class="hero-actions">' + (featured ? '<button class="primary-button focusable" id="heroPlay">▶ ' + (featuredType === 'live' ? 'Watch now' : 'Open details') + '</button>' : '') +
        '<button class="secondary-button focusable" id="browseAll">Browse Live TV</button></div></div></div>' +
        this.libraryShortcutsHtml() +
        (recent.length ? this.contentSection('Continue watching', recent.slice(0, 8)) : '') +
        (livePreview.length ? this.channelSection('Recently watched channels', livePreview) : '') +
        (moviePreview.length ? this.posterSection('Recently watched movies', moviePreview, 'movie') : '') +
        (seriesPreview.length ? this.posterSection('Recently watched series', seriesPreview, 'series') : '') +
        '</div>';
      if (featured && document.getElementById('heroPlay')) {
        document.getElementById('heroPlay').addEventListener('click', function () { self.openContent(featured, featuredType); });
      }
      document.getElementById('browseAll').addEventListener('click', function () { self.currentView = 'live'; self.renderShell('live'); });
      this.bindShortcutCards();
      this.bindContentCards();
      this.annotateHomeNavigation();
      XtreamlyTVNavigation.focusFirst('.hero .focusable');
    },


    annotateHomeNavigation: function () {
      var row = 0;
      function mark(elements, rowIndex) {
        Array.prototype.forEach.call(elements || [], function (element, columnIndex) {
          element.dataset.homeRow = String(rowIndex);
          element.dataset.homeColumn = String(columnIndex);
        });
      }
      mark(document.querySelectorAll('.hero .focusable'), row);
      row += 1;
      mark(document.querySelectorAll('.shortcut-row .focusable'), row);
      row += 1;
      Array.prototype.forEach.call(document.querySelectorAll('.mixed-row, .channel-row, .poster-row'), function (container) {
        var controls = container.querySelectorAll('.focusable');
        if (!controls.length) return;
        mark(controls, row);
        row += 1;
      });
      if (window.XtreamlyTVNavigation && window.XtreamlyTVNavigation.invalidate) window.XtreamlyTVNavigation.invalidate();
    },

    libraryShortcutsHtml: function () {
      var seriesMeta = this.seriesCategories.length ? this.seriesCategories.length + ' categories' : (this.seriesDiscovery === 'loading' ? 'Discovering series…' : (this.loadedCount('series') ? this.loadedCount('series') + ' shows found' : 'Open to discover'));
      var items = [
        { view: 'live', label: 'Live TV', meta: this.liveCategories.length + ' categories', icon: 'tv' },
        { view: 'movies', label: 'Movies', meta: this.vodCategories.length + ' categories', icon: 'popcorn' },
        { view: 'series', label: 'Series', meta: seriesMeta, icon: 'play' }
      ];
      return '<section class="section"><div class="section-head"><h2>Browse your provider</h2></div><div class="shortcut-row">' +
        items.map(function (item) {
          return '<button class="shortcut-card focusable" data-shortcut="' + item.view + '"><span class="shortcut-icon">' + uiIcon(item.icon, 'shortcut-svg') + '</span><span class="shortcut-copy"><strong>' + item.label + '</strong><small>' + escapeHtml(item.meta) + '</small></span></button>';
        }).join('') + '</div></section>';
    },

    bindShortcutCards: function () {
      var self = this;
      Array.prototype.forEach.call(document.querySelectorAll('[data-shortcut]'), function (button) {
        button.addEventListener('click', function () { self.currentView = button.dataset.shortcut; self.renderShell(self.currentView); });
      });
    },

    contentSection: function (heading, items) {
      return '<section class="section"><div class="section-head"><h2>' + escapeHtml(heading) + '</h2><span class="section-meta">' + items.length + ' items</span></div><div class="mixed-row">' +
        items.map(function (item) {
          var type = typeOf(item);
          return type === 'live' ? App.channelCardHtml(item) : App.posterCardHtml(item, type);
        }).join('') + '</div></section>';
    },

    channelSection: function (heading, channels) {
      return '<section class="section"><div class="section-head"><h2>' + escapeHtml(heading) + '</h2><span class="section-meta">' + channels.length + ' channels</span></div><div class="channel-row">' + channels.map(this.channelCardHtml.bind(this)).join('') + '</div></section>';
    },

    posterSection: function (heading, items, type) {
      return '<section class="section"><div class="section-head"><h2>' + escapeHtml(heading) + '</h2><span class="section-meta">' + items.length + ' titles</span></div><div class="poster-row">' + items.map(function (item) { return App.posterCardHtml(item, type); }).join('') + '</div></section>';
    },

    channelCardHtml: function (channel) {
      var favorite = XtreamlyTVStore.isFavorite('live', channel.stream_id);
      return '<button class="channel-card focusable" data-content-type="live" data-content-id="' + escapeHtml(channel.stream_id) + '">' +
        (favorite ? '<span class="favorite-badge">♥</span>' : '') + '<div class="channel-top">' + logo(channel) + '<div><div class="channel-name">' + escapeHtml(channel.name) + '</div><div class="channel-number">CH ' + escapeHtml(channel.num || '—') + '</div></div></div>' +
        '<div class="now-line">Live programming</div><div class="progress"><i style="width:' + (20 + (Number(channel.stream_id) % 60)) + '%"></i></div></button>';
    },

    posterCardHtml: function (item, type) {
      var id = idOf(item, type);
      var favorite = XtreamlyTVStore.isFavorite(type, id);
      var progress = type === 'movie' || type === 'episode' ? XtreamlyTVStore.getProgress(type, id) : null;
      var percent = progress && progress.duration ? Math.min(100, progress.seconds / progress.duration * 100) : 0;
      return '<button class="poster-card focusable" data-content-type="' + type + '" data-content-id="' + escapeHtml(id) + '">' +
        (favorite ? '<span class="favorite-badge poster-favorite">♥</span>' : '') + poster(item, type) +
        '<div class="poster-copy"><strong>' + escapeHtml(titleOf(item)) + '</strong><span>' + escapeHtml(yearOf(item) || (type === 'series' ? 'Series' : 'Movie')) + (ratingOf(item) ? ' · ★ ' + escapeHtml(ratingOf(item)) : '') + '</span></div>' +
        (percent ? '<div class="poster-progress"><i style="width:' + percent + '%"></i></div>' : '') + '</button>';
    },

    channelTileHtml: function (channel) {
      return '<button class="channel-tile focusable" data-content-type="live" data-content-id="' + escapeHtml(channel.stream_id) + '"><div class="channel-top">' + logo(channel) +
        '<div class="channel-tile-copy"><div class="channel-name">' + escapeHtml(channel.name) + '</div><div class="channel-number">' + (XtreamlyTVStore.isFavorite('live', channel.stream_id) ? '♥ Favorite' : 'CH ' + escapeHtml(channel.num || '—')) + '</div></div></div></button>';
    },

    bindContentCards: function () {
      var self = this;
      Array.prototype.forEach.call(document.querySelectorAll('[data-content-type][data-content-id]:not([data-virtual-index])'), function (button) {
        button.addEventListener('click', function () {
          var type = button.dataset.contentType;
          var item = self.resolveItem(type, button.dataset.contentId);
          if (item) self.openContent(item, type);
        });
      });
    },

    resolveItem: function (type, id) {
      var direct = this.itemLookup[type + ':' + String(id)];
      if (direct) return direct;
      var source = this.state.recent.concat(this.state.favorites).concat(Object.keys(this.episodeLookup).map(function (key) { return App.episodeLookup[key]; }));
      return source.find(function (item) { return typeOf(item) === type && idOf(item, type) === String(id); });
    },

    openContent: function (item, type, list) {
      if (type === 'live') this.playMedia(item, 'live', list && list.length ? list : (this.currentFilteredItems.live.length ? this.currentFilteredItems.live : [item]));
      else if (type === 'movie') this.openMovieDetail(item);
      else if (type === 'series') this.openSeriesDetail(item);
      else if (type === 'episode') this.playMedia(item, 'episode', [], item.parent_series || null);
    },

    catalogConfig: function (kind) {
      if (kind === 'live') return { type: 'live', plural: 'channels', singular: 'channel', columns: 4, visibleRows: 4, rowHeight: 188, gap: 16, gridClass: 'channel-grid' };
      if (kind === 'movies') return { type: 'movie', plural: 'movies', singular: 'movie', columns: 5, visibleRows: 2, rowHeight: 382, gap: 18, gridClass: 'poster-grid' };
      return { type: 'series', plural: 'series', singular: 'series', columns: 5, visibleRows: 2, rowHeight: 382, gap: 18, gridClass: 'poster-grid' };
    },

    categoryRailItems: function (kind, categories) {
      var items = [];
      (categories || []).forEach(function (category) {
        if (category.category_id === undefined || category.category_id === null || String(category.category_id) === 'all') return;
        items.push({
          id:String(category.category_id),
          label:category.category_name || ('Category ' + category.category_id),
          secondary:''
        });
      });
      return items;
    },

    setupCategoryRail: function (kind, categories, active) {
      var self = this;
      var container = document.getElementById('categoryList');
      if (!container) return;
      this.destroyCategoryRail();
      this.categoryRail = new XtreamlyTVCategoryRail({
        container:container,
        items:this.categoryRailItems(kind, categories),
        activeId:active,
        maxVisible:13,
        onActivate:function (item) {
          var category = String(item.id);
          self.activeCategory[kind] = category;
          self.searchText[kind] = '';
          self.renderCatalog(kind);
        }
      });
    },

    renderCatalog: function (kind) {
      if (kind === 'series' && !this.seriesCategories.length && this.seriesDiscovery === 'idle') {
        this.ensureSeriesDiscovery(false);
      }
      var config = this.catalogConfig(kind);
      var categories = this.categoriesFor(kind).filter(function (category) {
        return category && category.category_id !== undefined && category.category_id !== null && String(category.category_id) !== 'all';
      });
      var activeExists = categories.some(function (category) { return String(category.category_id) === String(App.activeCategory[kind]); });
      if (!activeExists) this.activeCategory[kind] = categories.length ? String(categories[0].category_id) : '';
      var active = String(this.activeCategory[kind] || '');
      var view = document.getElementById('view');
      var emptySeries = kind === 'series' && this.seriesDiscovery === 'done' && !categories.length && !this.catalogCache.series.all;
      this.destroyCategoryRail();
      view.innerHTML = '<div class="library-layout catalog-' + kind + '"><aside id="categoryList" class="category-list" aria-label="' + escapeHtml(config.plural) + ' categories"></aside><section class="library-browser catalog-browser-' + kind + '"><div class="browser-tools"><input id="catalogSearch" class="search-box focusable" placeholder="Search loaded ' + config.plural + '" value="' + escapeHtml(this.searchText[kind]) + '"><span class="result-count">0 ' + config.plural + '</span></div>' +
        '<div id="catalogStatus" class="catalog-status"></div><div id="catalogGrid" class="' + config.gridClass + '"></div></section></div>';

      this.setupCategoryRail(kind, categories, active);
      var self = this;
      var search = document.getElementById('catalogSearch');
      search.addEventListener('input', function () {
        self.searchText[kind] = search.value;
        clearTimeout(self.searchTimer);
        self.searchTimer = setTimeout(function () { self.updateCatalogGrid(kind); }, 220);
      });

      if (kind === 'series' && this.seriesDiscovery === 'loading' && !categories.length) {
        this.showCatalogLoading(kind, 'Discovering how this provider exposes Series…');
      } else if (emptySeries) {
        this.showCatalogError(kind, this.catalogErrors.series || 'This provider returned no Series catalog through the Xtream API.');
      } else if (!active) {
        this.showCatalogError(kind, 'This provider returned no usable ' + config.singular + ' categories.');
      } else if (this.catalogCache[kind][active]) {
        this.currentItems[kind] = this.catalogCache[kind][active];
        this.updateCatalogGrid(kind);
      } else {
        this.loadCategory(kind, active).catch(function () { /* rendered by loadCategory */ });
      }
      if (this.categoryRail && active) this.categoryRail.focusActive();
    },

    showCatalogLoading: function (kind, message) {
      this.destroyVirtualGrid();
      var status = document.getElementById('catalogStatus');
      var grid = document.getElementById('catalogGrid');
      if (status) status.innerHTML = '<div class="catalog-loading"><div class="spinner small-spinner"></div><span>' + escapeHtml(message) + '</span></div>';
      if (grid) grid.innerHTML = '';
      var count = document.querySelector('.result-count');
      if (count) count.textContent = 'Loading…';
    },

    showCatalogError: function (kind, message) {
      this.destroyVirtualGrid();
      var self = this;
      var status = document.getElementById('catalogStatus');
      var grid = document.getElementById('catalogGrid');
      if (status) status.innerHTML = '<div class="catalog-error"><h2>Unable to load this category</h2><p>' + escapeHtml(message) + '</p><button id="retryCatalog" class="primary-button focusable">Try again</button></div>';
      if (grid) grid.innerHTML = '';
      var retry = document.getElementById('retryCatalog');
      if (retry) retry.addEventListener('click', function () {
        delete self.catalogCache[kind][String(self.activeCategory[kind])];
        self.loadCategory(kind, self.activeCategory[kind]).catch(function () {});
      });
      XtreamlyTVNavigation.focusFirst('#retryCatalog');
    },

    filteredCatalogItems: function (kind) {
      var search = String(this.searchText[kind] || '').trim().toLowerCase();
      var items = this.currentItems[kind] || [];
      if (!search) return items;
      return items.filter(function (item) { return (item._search || titleOf(item).toLowerCase()).indexOf(search) >= 0; });
    },

    updateCatalogGrid: function (kind) {
      var config = this.catalogConfig(kind);
      var gridElement = document.getElementById('catalogGrid');
      if (!gridElement) return;
      var status = document.getElementById('catalogStatus');
      if (status) status.innerHTML = '';
      var items = this.filteredCatalogItems(kind);
      this.currentFilteredItems[kind] = items;
      var count = document.querySelector('.result-count');
      if (count) count.textContent = items.length.toLocaleString() + ' ' + config.plural;
      this.destroyVirtualGrid();
      gridElement.innerHTML = '';
      if (!items.length) {
        gridElement.innerHTML = '<div class="empty-state grid-empty">No ' + config.plural + ' match this category or search.</div>';
        return;
      }
      var self = this;
      this.virtualGrid = new XtreamlyTVVirtualGrid({
        container: gridElement,
        columns: config.columns,
        visibleRows: config.visibleRows,
        rowHeight: config.rowHeight,
        gap: config.gap,
        overscan: 2,
        renderItem: function (item) {
          return kind === 'live' ? self.channelTileHtml(item) : self.posterCardHtml(item, config.type);
        },
        onActivate: function (item) {
          if (kind === 'live') self.playMedia(item, 'live', self.currentFilteredItems.live);
          else self.openContent(item, config.type);
        }
      });
      this.virtualGrid.setItems(items);
    },

    destroyVirtualGrid: function () {
      if (this.virtualGrid) {
        this.virtualGrid.destroy();
        this.virtualGrid = null;
      }
    },

    destroyCategoryRail: function () {
      if (this.categoryRail) {
        this.categoryRail.destroy();
        this.categoryRail = null;
      }
    },

    openMovieDetail: function (movie) {
      var self = this;
      var returnView = this.currentView === 'favorites' ? 'favorites' : 'movies';
      this.detail = { type: 'movie', item: movie, info: null, loading: true, error: '', returnView:returnView };
      this.renderShell(returnView);
      this.api.getVodInfo(movie.stream_id).then(function (response) {
        if (!self.detail || self.detail.type !== 'movie' || String(self.detail.item.stream_id) !== String(movie.stream_id)) return;
        self.detail.info = normalizeMovie(movie, response);
        self.detail.loading = false;
        self.renderView();
      }).catch(function (error) {
        if (!self.detail) return;
        self.detail.info = normalizeMovie(movie, {});
        self.detail.loading = false;
        self.detail.error = error.message || 'Movie details are unavailable.';
        self.renderView();
      });
    },

    renderMovieDetail: function () {
      var self = this;
      var view = document.getElementById('view');
      var movie = this.detail.info || normalizeMovie(this.detail.item, {});
      if (this.detail.loading) {
        view.innerHTML = '<div class="loading"><div><div class="spinner"></div>Loading movie details…</div></div>';
        return;
      }
      var id = movie.stream_id;
      var favorite = XtreamlyTVStore.isFavorite('movie', id);
      var progress = XtreamlyTVStore.getProgress('movie', id);
      view.innerHTML = '<div class="scroll-view detail-scroll"><section class="detail-hero">' +
        '<div class="detail-backdrop">' + poster(movie, 'movie', 'detail-backdrop-art') + '</div><div class="detail-gradient"></div>' +
        '<div class="detail-layout">' + poster(movie, 'movie', 'detail-poster') + '<div class="detail-copy"><div class="eyebrow">Movie</div><h2>' + escapeHtml(titleOf(movie)) + '</h2><div class="metadata-row">' + metadataHtml(movie, 'movie') + (movie.genre ? '<span class="meta-chip">' + escapeHtml(movie.genre) + '</span>' : '') + '</div>' +
        '<p class="detail-plot">' + escapeHtml(descriptionOf(movie) || 'No description supplied by this provider.') + '</p>' +
        (this.detail.error ? '<p class="detail-warning">' + escapeHtml(this.detail.error) + '</p>' : '') +
        '<div class="detail-actions"><button class="primary-button focusable" id="playMovie">▶ ' + (progress && progress.seconds > 30 ? 'Resume from ' + formatSeconds(progress.seconds) : 'Play movie') + '</button><button class="secondary-button focusable" id="favoriteMovie">' + (favorite ? '♥ Remove favorite' : '♡ Add favorite') + '</button><button class="secondary-button focusable" id="closeDetail">Back</button></div>' +
        '<div class="detail-facts">' + (movie.cast ? '<div><span>Cast</span><strong>' + escapeHtml(movie.cast) + '</strong></div>' : '') + (movie.director ? '<div><span>Director</span><strong>' + escapeHtml(movie.director) + '</strong></div>' : '') + '</div></div></div></section></div>';
      document.getElementById('playMovie').addEventListener('click', function () { self.playMedia(movie, 'movie'); });
      document.getElementById('favoriteMovie').addEventListener('click', function () { XtreamlyTVStore.toggleFavorite(self.detail.item, 'movie'); self.state = XtreamlyTVStore.getState(); self.renderMovieDetail(); self.toast(favorite ? 'Removed from favorites' : 'Added to favorites'); });
      document.getElementById('closeDetail').addEventListener('click', function () { var returnView = self.detail && self.detail.returnView || 'movies'; self.detail = null; self.renderShell(returnView); });
      XtreamlyTVNavigation.focusFirst('#playMovie');
    },

    openSeriesDetail: function (series) {
      var self = this;
      var returnView = this.currentView === 'favorites' ? 'favorites' : 'series';
      this.detail = { type: 'series', item: series, info: null, loading: true, error: '', season: null, returnView:returnView };
      this.renderShell(returnView);
      this.api.getSeriesInfo(series.series_id).then(function (response) {
        if (!self.detail || self.detail.type !== 'series' || String(self.detail.item.series_id) !== String(series.series_id)) return;
        self.detail.info = response || {};
        self.detail.loading = false;
        var seasons = self.seriesSeasonKeys(response);
        self.detail.season = seasons.length ? seasons[0] : null;
        self.renderView();
      }).catch(function (error) {
        if (!self.detail) return;
        self.detail.loading = false;
        self.detail.info = { info: series, episodes: {} };
        self.detail.error = error.message || 'Series details are unavailable.';
        self.renderView();
      });
    },

    seriesSeasonKeys: function (response) {
      var episodes = response && response.episodes || {};
      if (Array.isArray(episodes)) {
        var map = {};
        episodes.forEach(function (episode) { map[String(episode.season || 1)] = true; });
        return Object.keys(map).sort(function (a, b) { return Number(a) - Number(b); });
      }
      return Object.keys(episodes).sort(function (a, b) { return Number(a) - Number(b); });
    },

    episodesForSeason: function (response, season) {
      var episodes = response && response.episodes || {};
      if (Array.isArray(episodes)) return episodes.filter(function (episode) { return String(episode.season || 1) === String(season); });
      return Array.isArray(episodes[String(season)]) ? episodes[String(season)] : [];
    },

    normalizeEpisode: function (episode, series, season) {
      var info = episode.info || {};
      return Object.assign({}, episode, info, {
        id: episode.id !== undefined ? episode.id : episode.stream_id,
        name: episodeTitle(episode),
        title: episodeTitle(episode),
        season: episode.season || season,
        series_id: series.series_id,
        series_name: titleOf(series),
        cover: imageOf(series, 'series'),
        content_type: 'episode',
        parent_series: series
      });
    },

    renderSeriesDetail: function () {
      var self = this;
      var view = document.getElementById('view');
      if (this.detail.loading) {
        view.innerHTML = '<div class="loading"><div><div class="spinner"></div>Loading seasons and episodes…</div></div>';
        return;
      }
      var response = this.detail.info || {};
      var series = normalizeSeries(this.detail.item, response);
      var seasons = this.seriesSeasonKeys(response);
      var activeSeason = this.detail.season || (seasons.length ? seasons[0] : null);
      var episodes = this.episodesForSeason(response, activeSeason).map(function (episode) { return self.normalizeEpisode(episode, series, activeSeason); });
      this.episodeLookup = {};
      episodes.forEach(function (episode) { self.episodeLookup[idOf(episode, 'episode')] = episode; });
      var favorite = XtreamlyTVStore.isFavorite('series', series.series_id);
      view.innerHTML = '<div class="scroll-view detail-scroll"><section class="series-hero"><div class="series-hero-art">' + poster(series, 'series', 'detail-backdrop-art') + '</div><div class="detail-gradient"></div><div class="series-summary">' + poster(series, 'series', 'series-poster') + '<div><div class="eyebrow">Series</div><h2>' + escapeHtml(titleOf(series)) + '</h2><div class="metadata-row">' + metadataHtml(series, 'series') + (series.genre ? '<span class="meta-chip">' + escapeHtml(series.genre) + '</span>' : '') + '</div><p class="detail-plot">' + escapeHtml(descriptionOf(series) || 'No description supplied by this provider.') + '</p><div class="detail-actions"><button class="secondary-button focusable" id="favoriteSeries">' + (favorite ? '♥ Remove favorite' : '♡ Add favorite') + '</button><button class="secondary-button focusable" id="closeSeries">Back</button></div></div></div></section>' +
        '<section class="episode-section"><div class="season-row">' + seasons.map(function (season) { return '<button class="season-button focusable ' + (String(activeSeason) === String(season) ? 'active' : '') + '" data-season="' + escapeHtml(season) + '">Season ' + escapeHtml(season) + '</button>'; }).join('') + '</div>' +
        (this.detail.error ? '<p class="detail-warning">' + escapeHtml(this.detail.error) + '</p>' : '') +
        '<div class="episode-grid">' + (episodes.length ? episodes.map(this.episodeCardHtml.bind(this)).join('') : '<div class="empty-state grid-empty">No episodes were returned for this season.</div>') + '</div></section></div>';
      document.getElementById('favoriteSeries').addEventListener('click', function () { XtreamlyTVStore.toggleFavorite(self.detail.item, 'series'); self.state = XtreamlyTVStore.getState(); self.renderSeriesDetail(); self.toast(favorite ? 'Removed from favorites' : 'Added to favorites'); });
      document.getElementById('closeSeries').addEventListener('click', function () { var returnView = self.detail && self.detail.returnView || 'series'; self.detail = null; self.renderShell(returnView); });
      Array.prototype.forEach.call(document.querySelectorAll('[data-season]'), function (button) {
        button.addEventListener('click', function () { self.detail.season = button.dataset.season; self.renderSeriesDetail(); });
      });
      this.bindEpisodeCards();
      XtreamlyTVNavigation.focusFirst('.season-button.active, .episode-card');
    },

    episodeCardHtml: function (episode) {
      var id = idOf(episode, 'episode');
      var progress = XtreamlyTVStore.getProgress('episode', id);
      var percent = progress && progress.duration ? Math.min(100, progress.seconds / progress.duration * 100) : 0;
      return '<button class="episode-card focusable" data-episode-id="' + escapeHtml(id) + '"><span class="episode-number">' + escapeHtml(episode.episode_num || '•') + '</span><div><strong>' + escapeHtml(episodeTitle(episode)) + '</strong><p>' + escapeHtml(descriptionOf(episode) || 'Episode ' + (episode.episode_num || '')) + '</p></div><span class="episode-play">▶</span>' + (percent ? '<div class="episode-progress"><i style="width:' + percent + '%"></i></div>' : '') + '</button>';
    },

    bindEpisodeCards: function () {
      var self = this;
      Array.prototype.forEach.call(document.querySelectorAll('[data-episode-id]'), function (button) {
        button.addEventListener('click', function () {
          var episode = self.episodeLookup[button.dataset.episodeId];
          if (episode) self.playMedia(episode, 'episode', [], episode.parent_series);
        });
      });
    },

    favoriteKeyForItem: function (item) {
      var type = typeOf(item);
      return XtreamlyTVStore.favoriteKey(type, idOf(item, type));
    },

    favoriteSystemGroups: function () {
      var favorites = this.state.favorites || [];
      return [
        { id:'all', name:'All Favorites', icon:'heart', color:'purple', system:true, count:favorites.length },
        { id:'live', name:'Live TV', icon:'tv', color:'blue', system:true, count:favorites.filter(function (item) { return typeOf(item) === 'live'; }).length },
        { id:'movie', name:'Movies', icon:'popcorn', color:'teal', system:true, count:favorites.filter(function (item) { return typeOf(item) === 'movie'; }).length },
        { id:'series', name:'Series', icon:'play', color:'orange', system:true, count:favorites.filter(function (item) { return typeOf(item) === 'series'; }).length }
      ];
    },

    favoriteGroups: function () {
      return this.favoriteSystemGroups().concat((this.state.favoriteGroups || []).map(function (group) {
        return Object.assign({}, group, { system:false });
      }));
    },

    favoriteGroupById: function (id) {
      return this.favoriteGroups().find(function (group) { return group.id === String(id); }) || this.favoriteSystemGroups()[0];
    },

    favoriteItemsForGroup: function (groupId) {
      var favorites = this.state.favorites || [];
      groupId = String(groupId || 'all');
      if (groupId === 'all') return favorites.slice();
      if (groupId === 'live' || groupId === 'movie' || groupId === 'series') {
        return favorites.filter(function (item) { return typeOf(item) === groupId; });
      }
      var group = (this.state.favoriteGroups || []).find(function (entry) { return entry.id === groupId; });
      if (!group) return [];
      var keys = {};
      (group.itemKeys || []).forEach(function (key) { keys[key] = true; });
      return favorites.filter(function (item) { return keys[App.favoriteKeyForItem(item)]; });
    },

    filterFavoriteItems: function (items, filter) {
      filter = String(filter || 'all');
      if (filter === 'all') return (items || []).slice();
      return (items || []).filter(function (item) { return typeOf(item) === filter; });
    },

    favoriteFiltersForItems: function (items, includeEmpty) {
      var filters = [{ id:'all', label:'All' }];
      var definitions = [
        { id:'live', label:'Live TV' },
        { id:'movie', label:'Movies' },
        { id:'series', label:'Series' }
      ];
      definitions.forEach(function (definition) {
        if (includeEmpty || (items || []).some(function (item) { return typeOf(item) === definition.id; })) filters.push(definition);
      });
      return filters;
    },

    favoriteFilterHtml: function (filters, active, attribute) {
      attribute = attribute || 'data-favorite-filter';
      return '<div class="favorite-filter-row">' + filters.map(function (filter) {
        return '<button class="favorite-filter-chip focusable ' + (String(active) === filter.id ? 'active' : '') + '" ' + attribute + '="' + filter.id + '">' + escapeHtml(filter.label) + '</button>';
      }).join('') + '</div>';
    },

    favoriteGroupIconHtml: function (group, className) {
      return '<span class="' + (className || 'favorite-group-icon') + '">' + uiIcon(group.icon || 'folder', 'favorite-group-svg') + '</span>';
    },

    favoriteGroupCount: function (group, filter) {
      return this.filterFavoriteItems(this.favoriteItemsForGroup(group.id), filter || 'all').length;
    },

    favoriteGroupCardHtml: function (group, filter) {
      var count = this.favoriteGroupCount(group, filter);
      return '<button class="favorite-group-card favorite-color-' + escapeHtml(group.color || 'purple') + ' focusable" data-favorite-group="' + escapeHtml(group.id) + '">' +
        this.favoriteGroupIconHtml(group) + '<span class="favorite-group-copy"><strong>' + escapeHtml(group.name) + '</strong><small>' + count + (count === 1 ? ' item' : ' items') + '</small></span></button>';
    },

    favoriteRecentItems: function (filter) {
      var favorites = {};
      (this.state.favorites || []).forEach(function (item) { favorites[App.favoriteKeyForItem(item)] = item; });
      var recent = [];
      (this.state.recent || []).forEach(function (item) {
        var favorite = favorites[App.favoriteKeyForItem(item)];
        if (favorite && !recent.some(function (entry) { return App.favoriteKeyForItem(entry) === App.favoriteKeyForItem(favorite); })) recent.push(favorite);
      });
      return this.filterFavoriteItems(recent, filter).slice(0, 7);
    },

    renderFavorites: function () {
      this.destroyVirtualGrid();
      if (this.favoriteMode === 'editor') this.renderFavoriteEditor();
      else if (this.favoriteMode === 'group') this.renderFavoriteGroup();
      else this.renderFavoritesHome();
    },

    renderFavoritesHome: function () {
      var self = this;
      var view = document.getElementById('view');
      var favorites = this.state.favorites || [];
      var filter = this.favoriteFilter || 'all';
      var recent = this.favoriteRecentItems(filter);
      var systemGroups = this.favoriteSystemGroups();
      var customGroups = (this.state.favoriteGroups || []).map(function (group) { return Object.assign({}, group, { system:false }); });
      var groups;
      if (filter === 'all') groups = systemGroups.concat(customGroups);
      else {
        groups = systemGroups.filter(function (group) { return group.id === filter; }).concat(customGroups.filter(function (group) {
          return self.favoriteGroupCount(group, filter) > 0;
        }));
      }
      var recentHtml = recent.length ? this.contentSection('Recently watched favorites', recent) :
        '<section class="section favorite-empty-strip"><div class="section-head"><h2>Recently watched favorites</h2></div><div class="favorite-empty-copy">Favorite something you watch and it will appear here.</div></section>';
      var emptyHtml = favorites.length ? '' : '<div class="favorite-onboarding"><span class="favorite-onboarding-icon">♡</span><div><strong>Your favorites are ready for you.</strong><p>Focus a channel, movie, or series anywhere in XtreamlyTV and press the red remote button.</p></div></div>';
      view.innerHTML = '<div class="scroll-view favorites-home"><div class="favorites-intro"><div><p>Your favorite content, organized your way.</p></div><div class="favorites-intro-actions"><button id="browseFavoriteGroups" class="secondary-button focusable">Browse all</button><button id="newFavoriteGroup" class="primary-button focusable">+ New group</button></div></div>' +
        this.favoriteFilterHtml(this.favoriteFiltersForItems(favorites, true), filter, 'data-favorite-home-filter') + emptyHtml + recentHtml +
        '<section class="section favorite-groups-section"><div class="section-head"><h2>My Groups</h2><span class="section-meta">Create collections for sports, kids, news, or anything else</span></div><div class="favorite-groups-row">' +
        groups.map(function (group) { return self.favoriteGroupCardHtml(group, filter); }).join('') +
        '<button class="favorite-group-card favorite-add-group focusable" id="addFavoriteGroupCard"><span class="favorite-group-icon">' + uiIcon('plus', 'favorite-group-svg') + '</span><span class="favorite-group-copy"><strong>Add Group</strong><small>Build a custom collection</small></span></button></div></section></div>';

      Array.prototype.forEach.call(document.querySelectorAll('[data-favorite-home-filter]'), function (button) {
        button.addEventListener('click', function () {
          self.favoriteFilter = button.dataset.favoriteHomeFilter;
          self.renderFavoritesHome();
          XtreamlyTVNavigation.focusFirst('[data-favorite-home-filter="' + self.favoriteFilter + '"]');
        });
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-favorite-group]'), function (button) {
        button.addEventListener('click', function () { self.openFavoriteGroup(button.dataset.favoriteGroup, filter); });
      });
      document.getElementById('browseFavoriteGroups').addEventListener('click', function () { self.openFavoriteGroup('all', filter); });
      document.getElementById('newFavoriteGroup').addEventListener('click', function () { self.beginFavoriteEditor(); });
      document.getElementById('addFavoriteGroupCard').addEventListener('click', function () { self.beginFavoriteEditor(); });
      this.bindContentCards();
      XtreamlyTVNavigation.focusFirst('[data-favorite-home-filter].active');
    },

    openFavoriteGroup: function (groupId, filter) {
      var items = this.favoriteItemsForGroup(groupId);
      var available = this.favoriteFiltersForItems(items, false).map(function (entry) { return entry.id; });
      this.favoriteGroupId = String(groupId || 'all');
      this.favoriteFilter = available.indexOf(filter) >= 0 ? filter : 'all';
      this.favoriteMode = 'group';
      this.renderFavorites();
    },

    favoriteMixedCardHtml: function (item) {
      var type = typeOf(item);
      var id = idOf(item, type);
      var label = type === 'live' ? 'Live TV' : (type === 'movie' ? (yearOf(item) || 'Movie') : 'Series');
      var art = type === 'live' ? '<div class="favorite-live-art">' + logo(item, 'favorite-live-logo') + '<span class="favorite-live-label">LIVE</span></div>' : poster(item, type, 'favorite-mixed-art');
      return '<button class="favorite-mixed-card focusable" data-content-type="' + type + '" data-content-id="' + escapeHtml(id) + '">' + art + '<div class="favorite-mixed-copy"><strong>' + escapeHtml(titleOf(item)) + '</strong><span>' + escapeHtml(label) + '</span></div></button>';
    },

    renderFavoriteGroup: function () {
      var self = this;
      var view = document.getElementById('view');
      var group = this.favoriteGroupById(this.favoriteGroupId);
      var groupItems = this.favoriteItemsForGroup(group.id);
      var filters = this.favoriteFiltersForItems(groupItems, false);
      if (!filters.some(function (filter) { return filter.id === self.favoriteFilter; })) this.favoriteFilter = 'all';
      var filtered = this.filterFavoriteItems(groupItems, this.favoriteFilter);
      var groups = this.favoriteGroups();
      view.innerHTML = '<div class="favorites-browser"><aside class="favorite-group-rail"><div class="favorite-rail-title"><strong>All Groups</strong><span>' + (this.state.favorites || []).length + ' favorites</span></div><div class="favorite-rail-list">' +
        groups.map(function (entry) {
          return '<button class="favorite-group-button focusable ' + (entry.id === group.id ? 'active' : '') + '" data-favorite-rail-group="' + escapeHtml(entry.id) + '">' + self.favoriteGroupIconHtml(entry, 'favorite-rail-icon') + '<span><strong>' + escapeHtml(entry.name) + '</strong><small>' + self.favoriteItemsForGroup(entry.id).length + ' items</small></span></button>';
        }).join('') + '</div><button id="railAddFavoriteGroup" class="favorite-rail-add focusable">' + uiIcon('plus', 'favorite-group-svg') + '<span>New group</span></button></aside>' +
        '<section class="favorite-group-browser"><header class="favorite-group-header"><div><button id="favoriteGroupsBack" class="favorite-back-button focusable">‹ Groups</button><h2>' + escapeHtml(group.name) + '</h2><p>' + groupItems.length + (groupItems.length === 1 ? ' item' : ' items') + '</p></div><div class="favorite-group-actions">' + (!group.system ? '<button id="editFavoriteGroup" class="secondary-button focusable">Edit group</button>' : '') + '<button id="newFavoriteGroupFromBrowser" class="primary-button focusable">+ New group</button></div></header>' +
        this.favoriteFilterHtml(filters, this.favoriteFilter, 'data-favorite-filter') +
        '<div id="favoriteGridStatus" class="favorite-grid-status">' + (!filtered.length ? '<div class="favorite-grid-empty"><span>♡</span><strong>No ' + (this.favoriteFilter === 'all' ? 'items' : filters.find(function (entry) { return entry.id === self.favoriteFilter; }).label.toLowerCase()) + ' in this group.</strong><p>Edit the group to add favorites, or choose another filter.</p></div>' : '') + '</div>' +
        '<div id="favoriteGrid" class="favorite-grid favorite-grid-' + escapeHtml(this.favoriteFilter) + '"></div></section></div>';

      Array.prototype.forEach.call(document.querySelectorAll('[data-favorite-rail-group]'), function (button) {
        button.addEventListener('click', function () { self.openFavoriteGroup(button.dataset.favoriteRailGroup, 'all'); });
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-favorite-filter]'), function (button) {
        button.addEventListener('click', function () {
          self.favoriteFilter = button.dataset.favoriteFilter;
          self.renderFavoriteGroup();
          XtreamlyTVNavigation.focusFirst('[data-favorite-filter="' + self.favoriteFilter + '"]');
        });
      });
      document.getElementById('favoriteGroupsBack').addEventListener('click', function () { self.favoriteMode = 'home'; self.renderFavorites(); });
      document.getElementById('railAddFavoriteGroup').addEventListener('click', function () { self.beginFavoriteEditor(); });
      document.getElementById('newFavoriteGroupFromBrowser').addEventListener('click', function () { self.beginFavoriteEditor(); });
      var edit = document.getElementById('editFavoriteGroup');
      if (edit) edit.addEventListener('click', function () { self.beginFavoriteEditor(group.id); });
      if (filtered.length) this.setupFavoriteGrid(filtered);
      else XtreamlyTVNavigation.focusFirst('[data-favorite-filter].active, .favorite-group-button.active');
    },

    setupFavoriteGrid: function (items) {
      var self = this;
      var container = document.getElementById('favoriteGrid');
      if (!container) return;
      var filter = this.favoriteFilter;
      var config;
      if (filter === 'live') config = { columns:4, visibleRows:4, rowHeight:188, gap:16 };
      else config = { columns:5, visibleRows:2, rowHeight:382, gap:18 };
      container.classList.add(filter === 'live' ? 'channel-grid' : (filter === 'all' ? 'favorite-mixed-grid' : 'poster-grid'));
      this.virtualGrid = new XtreamlyTVVirtualGrid({
        container:container,
        columns:config.columns,
        visibleRows:config.visibleRows,
        rowHeight:config.rowHeight,
        gap:config.gap,
        overscan:2,
        renderItem:function (item) {
          if (filter === 'live') return self.channelTileHtml(item);
          if (filter === 'movie' || filter === 'series') return self.posterCardHtml(item, filter);
          return self.favoriteMixedCardHtml(item);
        },
        onActivate:function (item) { self.openContent(item, typeOf(item), items); }
      });
      this.virtualGrid.setItems(items);
      setTimeout(function () {
        if (self.virtualGrid) self.virtualGrid.focusIndex(0);
      }, 0);
    },

    beginFavoriteEditor: function (groupId) {
      var group = (this.state.favoriteGroups || []).find(function (entry) { return entry.id === String(groupId || ''); });
      this.favoriteEditor = group ? {
        id:group.id,
        name:group.name,
        icon:group.icon,
        color:group.color,
        itemKeys:(group.itemKeys || []).slice(),
        filter:'all'
      } : { id:'', name:'', icon:'folder', color:'purple', itemKeys:[], filter:'all' };
      this.favoriteDeleteArmed = false;
      this.favoriteMode = 'editor';
      this.renderFavorites();
    },

    favoriteSelectionCardHtml: function (item) {
      var type = typeOf(item);
      var key = this.favoriteKeyForItem(item);
      var selected = this.favoriteEditor.itemKeys.indexOf(key) >= 0;
      var label = type === 'live' ? 'Live TV' : (type === 'movie' ? (yearOf(item) || 'Movie') : 'Series');
      var art = type === 'live' ? '<div class="favorite-live-art">' + logo(item, 'favorite-live-logo') + '</div>' : poster(item, type, 'favorite-mixed-art');
      return '<button class="favorite-selection-card focusable ' + (selected ? 'selected' : '') + '" data-group-item-key="' + escapeHtml(key) + '">' + art + '<span class="selection-check">✓</span><div class="favorite-mixed-copy"><strong>' + escapeHtml(titleOf(item)) + '</strong><span>' + escapeHtml(label) + '</span></div></button>';
    },

    renderFavoriteEditor: function () {
      var self = this;
      var view = document.getElementById('view');
      var editor = this.favoriteEditor;
      if (!editor) { this.favoriteMode = 'home'; this.renderFavoritesHome(); return; }
      var favorites = this.state.favorites || [];
      var filtered = this.filterFavoriteItems(favorites, editor.filter || 'all');
      var icons = ['heart', 'tv', 'popcorn', 'play', 'smile', 'trophy', 'folder', 'star'];
      var colors = ['purple', 'blue', 'teal', 'orange', 'rose', 'lime', 'slate'];
      view.innerHTML = '<div class="favorite-editor"><section class="favorite-editor-settings"><button id="cancelFavoriteEditorTop" class="favorite-back-button focusable">‹ Back</button><div class="favorite-editor-heading"><h2>' + (editor.id ? 'Edit Group' : 'Add Group') + '</h2><p>Choose a name, an icon, and which favorites belong in this collection.</p></div>' +
        '<label class="field"><span>Group name</span><input id="favoriteGroupName" class="focusable" maxlength="36" autocomplete="off" value="' + escapeHtml(editor.name) + '" placeholder="Weekend Movies"></label>' +
        '<div class="favorite-editor-label">Group icon</div><div class="favorite-icon-picker">' + icons.map(function (icon) { return '<button class="favorite-icon-choice focusable ' + (editor.icon === icon ? 'active' : '') + '" data-favorite-icon="' + icon + '">' + uiIcon(icon, 'favorite-group-svg') + '</button>'; }).join('') + '</div>' +
        '<div class="favorite-editor-label">Group color</div><div class="favorite-color-picker">' + colors.map(function (color) { return '<button class="favorite-color-choice favorite-color-' + color + ' focusable ' + (editor.color === color ? 'active' : '') + '" data-favorite-color="' + color + '"><span></span></button>'; }).join('') + '</div>' +
        '<div class="favorite-editor-summary"><strong id="favoriteSelectionCount">' + editor.itemKeys.length + '</strong><span>selected favorites</span></div><div class="favorite-editor-actions"><button id="saveFavoriteGroup" class="primary-button focusable">Save group</button><button id="cancelFavoriteEditor" class="secondary-button focusable">Cancel</button>' + (editor.id ? '<button id="deleteFavoriteGroup" class="danger-button focusable">Delete group</button>' : '') + '</div></section>' +
        '<section class="favorite-editor-content"><header><div><h3>Choose favorites</h3><p>Press OK to add or remove an item from this group.</p></div></header>' + this.favoriteFilterHtml(this.favoriteFiltersForItems(favorites, true), editor.filter || 'all', 'data-editor-favorite-filter') + '<div id="favoriteEditorGrid" class="favorite-editor-grid"></div></section></div>';

      var nameInput = document.getElementById('favoriteGroupName');
      nameInput.addEventListener('input', function () { editor.name = nameInput.value; });
      Array.prototype.forEach.call(document.querySelectorAll('[data-favorite-icon]'), function (button) {
        button.addEventListener('click', function () {
          editor.icon = button.dataset.favoriteIcon;
          Array.prototype.forEach.call(document.querySelectorAll('[data-favorite-icon]'), function (entry) { entry.classList.toggle('active', entry === button); });
        });
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-favorite-color]'), function (button) {
        button.addEventListener('click', function () {
          editor.color = button.dataset.favoriteColor;
          Array.prototype.forEach.call(document.querySelectorAll('[data-favorite-color]'), function (entry) { entry.classList.toggle('active', entry === button); });
        });
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-editor-favorite-filter]'), function (button) {
        button.addEventListener('click', function () {
          editor.filter = button.dataset.editorFavoriteFilter;
          self.renderFavoriteEditor();
          XtreamlyTVNavigation.focusFirst('[data-editor-favorite-filter="' + editor.filter + '"]');
        });
      });
      function cancelEditor() {
        self.favoriteEditor = null;
        self.favoriteDeleteArmed = false;
        self.favoriteMode = self.favoriteGroupId && self.favoriteGroupId !== 'all' ? 'group' : 'home';
        self.renderFavorites();
      }
      document.getElementById('cancelFavoriteEditorTop').addEventListener('click', cancelEditor);
      document.getElementById('cancelFavoriteEditor').addEventListener('click', cancelEditor);
      document.getElementById('saveFavoriteGroup').addEventListener('click', function () {
        editor.name = String(nameInput.value || '').trim();
        if (!editor.name) { self.toast('Enter a group name'); nameInput.focus(); return; }
        var saved = XtreamlyTVStore.saveFavoriteGroup(editor);
        self.state = XtreamlyTVStore.getState();
        self.favoriteEditor = null;
        self.favoriteGroupId = saved.id;
        self.favoriteFilter = 'all';
        self.favoriteMode = 'group';
        self.toast(editor.id ? 'Group updated' : 'Group created');
        self.renderFavorites();
      });
      var deleteButton = document.getElementById('deleteFavoriteGroup');
      if (deleteButton) deleteButton.addEventListener('click', function () {
        if (!self.favoriteDeleteArmed) {
          self.favoriteDeleteArmed = true;
          deleteButton.textContent = 'Press again to delete';
          self.toast('Press Delete group again to confirm');
          return;
        }
        XtreamlyTVStore.deleteFavoriteGroup(editor.id);
        self.state = XtreamlyTVStore.getState();
        self.favoriteEditor = null;
        self.favoriteGroupId = 'all';
        self.favoriteMode = 'home';
        self.favoriteDeleteArmed = false;
        self.toast('Group deleted');
        self.renderFavorites();
      });
      this.setupFavoriteEditorGrid(filtered);
      var menuHint = document.getElementById('menuHint');
      if (menuHint) { menuHint.classList.remove('visible'); menuHint.setAttribute('aria-hidden', 'true'); }
      XtreamlyTVNavigation.focusFirst('#cancelFavoriteEditorTop');
    },

    setupFavoriteEditorGrid: function (items) {
      var self = this;
      var container = document.getElementById('favoriteEditorGrid');
      if (!container) return;
      if (!items.length) {
        container.innerHTML = '<div class="favorite-editor-empty">No favorites match this filter.</div>';
        return;
      }
      container.classList.add('favorite-mixed-grid');
      this.virtualGrid = new XtreamlyTVVirtualGrid({
        container:container,
        columns:5,
        visibleRows:2,
        rowHeight:344,
        gap:16,
        overscan:2,
        renderItem:function (item) { return self.favoriteSelectionCardHtml(item); },
        onActivate:function (item, index, element) {
          var key = self.favoriteKeyForItem(item);
          var keyIndex = self.favoriteEditor.itemKeys.indexOf(key);
          if (keyIndex >= 0) self.favoriteEditor.itemKeys.splice(keyIndex, 1);
          else self.favoriteEditor.itemKeys.push(key);
          var selected = keyIndex < 0;
          element.classList.toggle('selected', selected);
          var count = document.getElementById('favoriteSelectionCount');
          if (count) count.textContent = self.favoriteEditor.itemKeys.length;
        }
      });
      this.virtualGrid.setItems(items);
    },

    renderSettings: function () {
      var self = this;
      var view = document.getElementById('view');
      var settings = this.state.settings;
      var credentials = this.state.credentials || { server:'', username:'', password:'' };
      var themes = [
        { id: 'teal', label: 'Teal' }, { id: 'gray', label: 'Graphite' }, { id: 'purple', label: 'Purple' }, { id: 'pink', label: 'Pink' }, { id: 'blue', label: 'Blue' }
      ];
      var maskedPassword = credentials.password ? '••••••••' : 'Not set';
      view.innerHTML = '<div class="scroll-view"><div class="settings-grid">' +
        '<section class="settings-card provider-card-wide"><h3>Provider</h3><p>Your saved Xtream connection. Select Edit provider only when you want to change the fields.</p><div class="provider-summary"><div><span>Server</span><strong>' + escapeHtml(credentials.server || 'Not configured') + '</strong></div><div><span>Username</span><strong>' + escapeHtml(credentials.username || 'Not configured') + '</strong></div><div><span>Password</span><strong>' + maskedPassword + '</strong></div></div><div class="settings-actions provider-summary-actions"><button id="editProvider" class="primary-button focusable">Edit provider</button><button id="signOut" class="danger-button focusable">Disconnect provider</button></div><div id="providerEditor" class="provider-editor" hidden><div class="provider-settings-grid"><label class="field provider-server"><span>Server URL</span><input id="providerServer" class="focusable" type="url" value="' + escapeHtml(credentials.server || '') + '" autocomplete="off"></label><label class="field"><span>Username</span><input id="providerUsername" class="focusable" value="' + escapeHtml(credentials.username || '') + '" autocomplete="off"></label><label class="field"><span>Password</span><input id="providerPassword" class="focusable" type="password" value="' + escapeHtml(credentials.password || '') + '" autocomplete="off"></label></div><div class="settings-actions"><button id="saveProvider" class="primary-button focusable">Save and reconnect</button><button id="cancelProviderEdit" class="secondary-button focusable">Cancel</button></div></div></section>' +
        '<section class="settings-card theme-card-wide"><h3>Appearance</h3><p>Choose a skin. The layout stays identical while the background, panels, focus ring, and highlights change hue.</p><div class="theme-picker">' + themes.map(function (theme) { return '<button class="theme-choice focusable ' + (settings.theme === theme.id ? 'active' : '') + '" data-theme-choice="' + theme.id + '"><i class="theme-preview theme-' + theme.id + '"></i><span>' + theme.label + '</span><b>' + (settings.theme === theme.id ? '✓' : '') + '</b></button>'; }).join('') + '</div></section>' +
        '<section class="settings-card"><h3>Playback compatibility</h3><p>Automatic mode tries HLS and MPEG-TS. If audio starts without video, XtreamlyTV retries the alternate container.</p><label class="field"><span>Preferred live format</span><select id="formatSetting" class="focusable"><option value="auto"' + (settings.streamFormat === 'auto' || !settings.streamFormat ? ' selected' : '') + '>Automatic fallback</option><option value="m3u8"' + (settings.streamFormat === 'm3u8' ? ' selected' : '') + '>HLS first</option><option value="ts"' + (settings.streamFormat === 'ts' ? ' selected' : '') + '>MPEG-TS first</option></select></label><button id="savePlayback" class="primary-button focusable">Save playback</button></section>' +
        '<section class="settings-card"><h3>Performance</h3><p>Only visible cards are added to the DOM. Category data is cached temporarily to make back-and-forth browsing quick without consuming excessive TV memory.</p><label class="field"><span>Cached categories per library</span><select id="cacheSetting" class="focusable"><option value="2"' + (Number(settings.maxCachedCategories || 3) === 2 ? ' selected' : '') + '>2 — lowest memory</option><option value="3"' + (Number(settings.maxCachedCategories || 3) === 3 ? ' selected' : '') + '>3 — balanced</option><option value="5"' + (Number(settings.maxCachedCategories || 3) === 5 ? ' selected' : '') + '>5 — faster revisits</option></select></label><button id="savePerformance" class="primary-button focusable">Save performance</button><button id="clearCatalogCache" class="secondary-button focusable settings-secondary">Clear catalog cache</button></section>' +
        '<section class="settings-card"><h3>API bridge</h3><p>Optional local bridge for Xtream servers that do not permit CORS requests from a TV web app.</p><label class="field"><span>Bridge URL</span><input id="proxySetting" class="focusable" value="' + escapeHtml(settings.apiProxy || '') + '" placeholder="http://unraid.local:8787"></label><button id="saveProxy" class="primary-button focusable">Save bridge</button></section>' +
        '<section class="settings-card"><h3>Catalog diagnostics</h3><p>Loaded in memory: ' + this.loadedCount('live').toLocaleString() + ' channels, ' + this.loadedCount('movies').toLocaleString() + ' movies, and ' + this.loadedCount('series').toLocaleString() + ' series. Provider catalogs remain category-scoped so the full library is never loaded into TV memory at once.</p><div class="diagnostic-pill">Virtual rendering active</div><div class="diagnostic-pill">Series discovery: ' + escapeHtml(this.seriesDiscovery) + '</div></section>' +
        '<section class="settings-card"><h3>About XtreamlyTV</h3><div class="about-list"><div><span>Version</span><strong>' + APP_VERSION + '</strong></div><div><span>Application ID</span><strong>' + APP_ID + '</strong></div><div><span>Platform</span><strong>LG webOS TV</strong></div><div><span>License</span><strong>MIT open source</strong></div><div><span>Content</span><strong>No channels or subscriptions included</strong></div></div></section>' +
        '<section class="settings-card"><h3>Privacy & history</h3><p>XtreamlyTV has no analytics, advertising, or tracking. Provider credentials, favorites, recent items, and resume positions are stored locally on the TV.</p><button id="clearHistory" class="secondary-button focusable">Clear watch history</button></section>' +
        '</div></div>';
      Array.prototype.forEach.call(document.querySelectorAll('[data-theme-choice]'), function (button) {
        button.addEventListener('click', function () {
          self.applyTheme(button.dataset.themeChoice, true);
          self.renderSettings();
          self.toast('Skin changed to ' + button.textContent.replace('✓', '').trim());
        });
      });
      document.getElementById('editProvider').addEventListener('click', function () {
        var editor = document.getElementById('providerEditor');
        if (!editor) return;
        editor.hidden = false;
        XtreamlyTVNavigation.invalidate();
        setTimeout(function () { XtreamlyTVNavigation.focusFirst('#providerServer'); }, 0);
      });
      document.getElementById('cancelProviderEdit').addEventListener('click', function () {
        var editor = document.getElementById('providerEditor');
        if (editor) editor.hidden = true;
        XtreamlyTVNavigation.invalidate();
        XtreamlyTVNavigation.focusFirst('#editProvider');
      });
      document.getElementById('saveProvider').addEventListener('click', function () {
        self.connect({
          server: document.getElementById('providerServer').value,
          username: document.getElementById('providerUsername').value,
          password: document.getElementById('providerPassword').value
        }, self.state.settings || {});
      });
      document.getElementById('savePlayback').addEventListener('click', function () { XtreamlyTVStore.updateSettings({ streamFormat: document.getElementById('formatSetting').value }); self.refreshStateAndApi(); self.toast('Playback setting saved'); });
      document.getElementById('savePerformance').addEventListener('click', function () { XtreamlyTVStore.updateSettings({ maxCachedCategories: Number(document.getElementById('cacheSetting').value) }); self.state = XtreamlyTVStore.getState(); self.toast('Performance setting saved'); });
      document.getElementById('clearCatalogCache').addEventListener('click', function () { self.resetCatalog(); self.activeCategory.live = self.firstCategoryId('live'); self.activeCategory.movies = self.firstCategoryId('movies'); self.activeCategory.series = self.firstCategoryId('series'); self.toast('Catalog cache cleared'); self.renderSettings(); });
      document.getElementById('saveProxy').addEventListener('click', function () { XtreamlyTVStore.updateSettings({ apiProxy: document.getElementById('proxySetting').value.trim().replace(/\/+$/, '') }); self.refreshStateAndApi(); self.toast('API bridge saved'); });
      document.getElementById('signOut').addEventListener('click', function () { self.demo = false; self.detail = null; XtreamlyTVStore.clearCredentials(); self.state = XtreamlyTVStore.getState(); self.renderLogin(); });
      document.getElementById('clearHistory').addEventListener('click', function () { XtreamlyTVStore.clearHistory(); self.state = XtreamlyTVStore.getState(); self.toast('Watch history and resume positions cleared'); });
      XtreamlyTVNavigation.focusFirst('#editProvider');
    },

    refreshStateAndApi: function () {
      this.state = XtreamlyTVStore.getState();
      this.applyTheme(this.state.settings.theme || 'teal');
      if (this.state.credentials) this.api = new XtreamlyTVApi(this.state.credentials, this.state.settings);
    },

    mediaSubtitle: function (item, type) {
      if (type === 'live') return 'Loading program information…';
      if (type === 'episode') return titleOf(item.parent_series || { name: item.series_name || 'Series' }) + ' · S' + (item.season || '—') + ' E' + (item.episode_num || '—');
      return [yearOf(item), item.genre, item.duration].filter(Boolean).join(' · ') || 'Movie';
    },

    buildPlaybackCandidates: function (item, type) {
      if (this.demo) return [];
      if (type === 'live') return this.api.getLiveCandidates(item.stream_id, this.providerAllowedFormats());
      return this.api.getMediaCandidates(type, idOf(item, type), item.container_extension);
    },

    buildChannelSwitchList: function (item, requested) {
      var currentId = String(item && item.stream_id || '');
      function uniqueLive(source) {
        var seen = {};
        return (Array.isArray(source) ? source : []).filter(function (channel) {
          var id = String(channel && channel.stream_id || '');
          if (!id || seen[id]) return false;
          seen[id] = true;
          return true;
        });
      }
      function containsCurrent(source) {
        return source.some(function (channel) { return String(channel.stream_id) === currentId; });
      }

      var preferred = uniqueLive(requested);
      if (preferred.length > 1 && containsCurrent(preferred)) return preferred;

      var filtered = uniqueLive(this.currentFilteredItems.live);
      if (filtered.length > 1 && containsCurrent(filtered)) return filtered;

      var current = uniqueLive(this.currentItems.live);
      if (current.length > 1 && containsCurrent(current)) return current;

      var cacheKeys = Object.keys(this.catalogCache.live || {});
      var i;
      for (i = 0; i < cacheKeys.length; i += 1) {
        var cached = uniqueLive(this.catalogCache.live[cacheKeys[i]]);
        if (cached.length > 1 && containsCurrent(cached)) return cached;
      }

      var fallback = uniqueLive([item]
        .concat(preferred)
        .concat(this.loadedItems('live'))
        .concat((this.state.favorites || []).filter(function (entry) { return typeOf(entry) === 'live'; }))
        .concat((this.state.recent || []).filter(function (entry) { return typeOf(entry) === 'live'; })));
      return fallback;
    },

    playMedia: function (item, type, list, parent) {
      var self = this;
      this.playerOpen = true;
      this.playerMedia = item;
      this.playerType = type;
      this.playerList = type === 'live' ? this.buildChannelSwitchList(item, list) : (list && list.length ? list : []);
      this.playerParent = parent || null;
      this.playbackCandidates = this.buildPlaybackCandidates(item, type);
      this.playbackCandidateIndex = 0;
      this.playbackProgressRestored = false;
      this.playbackSwitching = false;
      this.playbackFailureLock = false;
      this.playerHasPlayed = false;
      this.lastPlaybackToggleAt = 0;
      clearTimeout(this.playbackBufferTimer);
      this.playbackBufferTimer = null;
      this.lastPlaybackProgressAt = 0;
      this.lastPlaybackTime = 0;
      this.lastProgressSave = 0;
      XtreamlyTVStore.addRecent(item, type);
      this.state = XtreamlyTVStore.getState();
      var artwork = type === 'live' ? logo(item) : poster(item, type, 'player-poster');
      var hints = type === 'live' ? '<span class="key">▲▼</span> Channel &nbsp; <span class="key">◀▶</span> Rewind / forward<br><span class="key">OK</span> Pause / play &nbsp; <span class="key green-key">GREEN</span> Go live &nbsp; <span class="key red-key">RED</span> Favorite' : '<span class="key">◀▶</span> Seek 30 seconds<br><span class="key">OK</span> Pause / play &nbsp; <span class="key red-key">RED</span> Favorite';
      var player = document.createElement('section');
      player.className = 'player overlay';
      player.id = 'player';
      player.innerHTML = '<video id="video" autoplay playsinline webkit-playsinline preload="auto"></video><div class="player-shade"></div>' +
        '<div id="playerLoading" class="player-loading"><div class="spinner"></div><strong id="playerLoadingText">Opening stream…</strong><span id="playerFormatLabel"></span></div>' +
        '<div class="player-top"><div class="player-brand"><img src="assets/icon.png" alt="X"><span>treamlyTV</span></div><div class="player-clock">' + formatTime(new Date()) + '</div></div>' +
        '<div class="player-bottom"><div id="playerTimeline" class="player-timeline"><span id="currentTime">0:00</span><div id="playerProgressTrack" class="player-progress"><i id="playerProgress"></i><b id="playerScrubber"></b></div><span id="durationTime">0:00</span><button id="goLiveButton" class="go-live-button" type="button">Go Live</button></div>' +
        '<div class="player-transport"><button id="rewindButton" type="button">−30</button><button id="playPauseButton" class="play-pause-button" type="button">Pause</button><button id="forwardButton" type="button">+30</button></div>' +
        '<div class="player-info"><div id="playerArtwork">' + artwork + '</div><div><div id="playerTitle" class="player-channel">' + escapeHtml(type === 'episode' ? episodeTitle(item) : titleOf(item)) + '</div><div id="playerProgram" class="player-program">' + escapeHtml(this.mediaSubtitle(item, type)) + '</div><div id="playerDescription" class="player-program-description">' + escapeHtml(type === 'live' ? '' : descriptionOf(item)) + '</div></div>' +
        '<div class="player-hints">' + hints + '<br><span class="key">BACK</span> Exit player</div></div></div>';
      if (!this.playerHost) {
        this.showPlayerError('Player unavailable', 'The dedicated video surface could not be created.');
        return;
      }
      this.playerHost.innerHTML = '';
      this.playerHost.appendChild(player);
      this.playerHost.classList.add('active');
      this.playerHost.setAttribute('aria-hidden', 'false');
      document.body.classList.add('video-mode');
      document.documentElement.classList.add('video-mode');
      this.root.classList.add('player-active');
      this.root.setAttribute('aria-hidden', 'true');
      this.showOverlay(true);
      this.loadPlayerEpg(item);

      document.getElementById('rewindButton').addEventListener('click', function () { self.seek(-30); });
      document.getElementById('forwardButton').addEventListener('click', function () { self.seek(30); });
      document.getElementById('playPauseButton').addEventListener('click', function () { self.togglePlayback(); });
      document.getElementById('goLiveButton').addEventListener('click', function () { self.goToLive(); });
      var progressTrack = document.getElementById('playerProgressTrack');
      function seekFromPointer(event) {
        var rect = progressTrack.getBoundingClientRect();
        if (rect.width > 0) self.seekToRatio((event.clientX - rect.left) / rect.width);
      }
      progressTrack.addEventListener('click', seekFromPointer);
      progressTrack.addEventListener('mousedown', function (event) {
        event.preventDefault();
        seekFromPointer(event);
        function move(moveEvent) { seekFromPointer(moveEvent); }
        function stop() {
          document.removeEventListener('mousemove', move);
          document.removeEventListener('mouseup', stop);
        }
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', stop);
      });

      if (this.demo) {
        this.showPlayerError('Demo mode', 'Connect your provider to play this content. Demo mode is for exploring XtreamlyTV’s interface and remote navigation.');
        return;
      }
      var video = document.getElementById('video');
      video.addEventListener('error', function () { self.tryNextPlaybackCandidate('The current stream format failed.'); });
      video.addEventListener('loadedmetadata', function () {
        self.restoreProgress(video);
        self.updatePlayerProgress(video);
      });
      video.addEventListener('durationchange', function () { self.updatePlayerProgress(video); });
      video.addEventListener('loadeddata', function () { self.onPlaybackReady(video); });
      video.addEventListener('canplay', function () { self.onPlaybackReady(video); });
      video.addEventListener('playing', function () {
        self.playerHasPlayed = true;
        self.onPlaybackReady(video);
        self.startPlaybackWatchdog(video);
        self.updateTransportState(video);
        self.showOverlay(false);
      });
      video.addEventListener('play', function () { self.updateTransportState(video); });
      video.addEventListener('pause', function () {
        self.clearPlayerBuffering();
        self.updateTransportState(video);
        if (!self.playbackSwitching && self.playerHasPlayed) self.showOverlay(true);
      });
      video.addEventListener('waiting', function () { self.schedulePlayerBuffering(video, 'Buffering stream…', 1800); });
      video.addEventListener('stalled', function () { self.schedulePlayerBuffering(video, 'Stream stalled…', 2600); });
      video.addEventListener('progress', function () { if (video.readyState >= 3) self.clearPlayerBuffering(); self.updatePlayerProgress(video); });
      video.addEventListener('timeupdate', function () { self.onPlaybackProgress(video); });
      video.addEventListener('ended', function () { if (self.playerType !== 'live') XtreamlyTVStore.clearProgress(self.playerType, idOf(self.playerMedia, self.playerType)); self.updateTransportState(video); });
      this.loadPlaybackCandidate(0, 'Opening stream…');
    },

    loadPlayerEpg: function (item) {
      if (this.playerType !== 'live' || !this.api || !this.api.getShortEpg) return;
      this.api.getShortEpg(item.stream_id).then(function (epg) {
        var now = epg.find(function (entry) { var time = Date.now() / 1000; return Number(entry.start_timestamp) <= time && Number(entry.stop_timestamp) >= time; }) || epg[0];
        var program = document.getElementById('playerProgram');
        var description = document.getElementById('playerDescription');
        if (program) program.textContent = now ? now.title : 'Live programming';
        if (description) description.textContent = now ? now.description : '';
      }).catch(function () { var program = document.getElementById('playerProgram'); if (program) program.textContent = 'Live programming'; });
    },

    loadPlaybackCandidate: function (index, message) {
      var self = this;
      var video = document.getElementById('video');
      if (!video || !this.playbackCandidates.length || !this.playbackCandidates[index]) {
        this.showPlayerError('Unable to build a stream URL', 'The provider did not expose a compatible playback URL.');
        return;
      }
      clearTimeout(this.playbackWatchdog);
      this.clearPlayerBuffering(true);
      this.playbackCandidateIndex = index;
      this.playbackStartedAt = Date.now();
      this.lastPlaybackProgressAt = 0;
      this.lastPlaybackTime = 0;
      this.playbackSwitching = true;
      this.playerHasPlayed = false;
      this.playbackFailureLock = false;
      var candidate = this.playbackCandidates[index];
      this.showPlayerLoading(message || 'Opening stream…', candidate.label);
      try {
        video.pause();
        video.removeAttribute('src');
        while (video.firstChild) video.removeChild(video.firstChild);
        var source = document.createElement('source');
        source.src = candidate.url;
        if (candidate.mime) source.type = candidate.mime;
        video.appendChild(source);
        video.load();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () { setTimeout(function () { self.tryNextPlaybackCandidate('Playback could not start.'); }, 300); });
        }
      } catch (error) {
        this.tryNextPlaybackCandidate(error.message || 'Playback failed.');
      }
    },

    onPlaybackReady: function (video) {
      this.playbackSwitching = false;
      this.lastPlaybackProgressAt = Date.now();
      this.lastPlaybackTime = isFinite(video.currentTime) ? video.currentTime : 0;
      this.clearPlayerBuffering();
      this.updatePlayerProgress(video);
    },

    onPlaybackProgress: function (video) {
      var current = isFinite(video.currentTime) ? video.currentTime : 0;
      var advanced = current > this.lastPlaybackTime + 0.05 || current < this.lastPlaybackTime;
      if (advanced) {
        this.lastPlaybackProgressAt = Date.now();
        this.lastPlaybackTime = current;
        this.playerHasPlayed = true;
      }
      this.clearPlayerBuffering();
      this.updatePlayerProgress(video);
      this.maybeSaveProgress(video);
      var player = document.getElementById('player');
      if (advanced && player && player.classList.contains('overlay') && !this.overlayTimer && !video.paused && !this.playbackSwitching) {
        this.showOverlay(false);
      }
    },

    schedulePlayerBuffering: function (video, message, delay) {
      var self = this;
      clearTimeout(this.playbackBufferTimer);
      var observedTime = isFinite(video.currentTime) ? video.currentTime : 0;
      var requestedAt = Date.now();
      this.playbackBufferTimer = setTimeout(function () {
        self.playbackBufferTimer = null;
        if (!self.playerOpen || !video || video.paused || video.ended || self.playbackSwitching) return;
        var current = isFinite(video.currentTime) ? video.currentTime : 0;
        var advanced = current > observedTime + 0.08 || self.lastPlaybackProgressAt > requestedAt;
        if (advanced || video.readyState >= 3) return;
        self.showPlayerLoading(message || 'Buffering stream…');
      }, Math.max(900, Number(delay) || 1800));
    },

    clearPlayerBuffering: function (keepInitialLoading) {
      clearTimeout(this.playbackBufferTimer);
      this.playbackBufferTimer = null;
      if (keepInitialLoading || this.playbackSwitching) return;
      var loading = document.getElementById('playerLoading');
      if (loading) loading.classList.add('hidden');
    },

    showPlayerLoading: function (message, format) {
      var loading = document.getElementById('playerLoading');
      var text = document.getElementById('playerLoadingText');
      var label = document.getElementById('playerFormatLabel');
      if (loading) loading.classList.remove('hidden');
      if (text) text.textContent = message || 'Opening stream…';
      if (label) label.textContent = format || (this.playbackCandidates[this.playbackCandidateIndex] && this.playbackCandidates[this.playbackCandidateIndex].label) || '';
    },

    startPlaybackWatchdog: function (video) {
      var self = this;
      clearTimeout(this.playbackWatchdog);
      this.playbackWatchdog = setTimeout(function () {
        if (!self.playerOpen || !video || video.paused) return;
        var audioOnly = video.videoWidth === 0 && video.videoHeight === 0 && (isFinite(video.currentTime) ? video.currentTime > 0 : Date.now() - self.playbackStartedAt > 10000);
        if (audioOnly) self.tryNextPlaybackCandidate('Audio was detected without a video picture.');
      }, 10000);
    },

    tryNextPlaybackCandidate: function (reason) {
      if (!this.playerOpen || this.playbackFailureLock) return;
      this.playbackFailureLock = true;
      this.playbackSwitching = false;
      var next = this.playbackCandidateIndex + 1;
      if (next < this.playbackCandidates.length) {
        this.toast(reason + ' Trying ' + this.playbackCandidates[next].label + '…');
        this.loadPlaybackCandidate(next, reason);
        return;
      }
      var video = document.getElementById('video');
      var code = video && video.error ? ' Media error ' + video.error.code + '.' : '';
      this.showPlayerError('Unable to display this stream', reason + code + ' The channel may be offline or encoded with a video codec unsupported by this LG TV.');
    },

    restoreProgress: function (video) {
      if (this.playerType === 'live' || this.playbackProgressRestored) return;
      this.playbackProgressRestored = true;
      var progress = XtreamlyTVStore.getProgress(this.playerType, idOf(this.playerMedia, this.playerType));
      if (progress && progress.seconds > 30 && (!video.duration || progress.seconds < video.duration - 30)) {
        try { video.currentTime = progress.seconds; this.toast('Resumed from ' + formatSeconds(progress.seconds)); } catch (e) { /* ignore */ }
      }
    },

    maybeSaveProgress: function (video) {
      if (this.playerType === 'live' || !video || !isFinite(video.currentTime)) return;
      if (Date.now() - this.lastProgressSave < 10000) return;
      this.lastProgressSave = Date.now();
      XtreamlyTVStore.saveProgress(this.playerType, idOf(this.playerMedia, this.playerType), video.currentTime, video.duration);
    },

    liveSeekRange: function (video) {
      if (!video || !video.seekable || !video.seekable.length) return null;
      try {
        var index = video.seekable.length - 1;
        var start = video.seekable.start(index);
        var end = video.seekable.end(index);
        if (!isFinite(start) || !isFinite(end) || end <= start) return null;
        return { start:start, end:end, duration:end - start };
      } catch (error) { return null; }
    },

    updatePlayerProgress: function (video) {
      var timeline = document.getElementById('playerTimeline');
      if (!timeline || !video) return;
      timeline.style.display = 'grid';
      var bar = document.getElementById('playerProgress');
      var scrubber = document.getElementById('playerScrubber');
      var currentEl = document.getElementById('currentTime');
      var durationEl = document.getElementById('durationTime');
      var goLive = document.getElementById('goLiveButton');
      var percent = 0;

      if (this.playerType === 'live') {
        var range = this.liveSeekRange(video);
        if (range) {
          var current = Math.max(range.start, Math.min(range.end, isFinite(video.currentTime) ? video.currentTime : range.end));
          var behind = Math.max(0, range.end - current);
          percent = range.duration ? ((current - range.start) / range.duration) * 100 : 100;
          if (currentEl) currentEl.textContent = behind > 2 ? '−' + formatSeconds(behind) : 'LIVE';
          if (durationEl) durationEl.textContent = 'LIVE';
          if (goLive) {
            goLive.style.display = 'inline-flex';
            goLive.disabled = behind <= 2;
            if (behind > 2) goLive.classList.add('behind-live');
            else goLive.classList.remove('behind-live');
          }
        } else {
          percent = 100;
          if (currentEl) currentEl.textContent = 'LIVE';
          if (durationEl) durationEl.textContent = '';
          if (goLive) { goLive.style.display = 'inline-flex'; goLive.disabled = true; goLive.classList.remove('behind-live'); }
        }
      } else {
        var duration = isFinite(video.duration) ? video.duration : 0;
        var currentTime = isFinite(video.currentTime) ? video.currentTime : 0;
        percent = duration ? currentTime / duration * 100 : 0;
        if (currentEl) currentEl.textContent = formatSeconds(currentTime);
        if (durationEl) durationEl.textContent = formatSeconds(duration);
        if (goLive) goLive.style.display = 'none';
      }

      percent = Math.max(0, Math.min(100, percent));
      if (bar) bar.style.width = percent + '%';
      if (scrubber) scrubber.style.left = percent + '%';
      this.updateTransportState(video);
    },

    updateTransportState: function (video) {
      var button = document.getElementById('playPauseButton');
      if (!button || !video) return;
      button.textContent = video.paused ? 'Play' : 'Pause';
      button.setAttribute('aria-label', video.paused ? 'Play' : 'Pause');
      var player = document.getElementById('player');
      if (player) {
        if (video.paused) player.classList.add('paused');
        else player.classList.remove('paused');
      }
    },

    togglePlayback: function () {
      var self = this;
      var video = document.getElementById('video');
      if (!video || this.playbackSwitching) return;
      var now = Date.now();
      if (now - this.lastPlaybackToggleAt < 450) return;
      this.lastPlaybackToggleAt = now;
      if (video.paused || video.ended) {
        var promise;
        try { promise = video.play(); } catch (error) { promise = null; }
        if (promise && typeof promise.then === 'function') {
          promise.then(function () { self.updateTransportState(video); self.showOverlay(false); }).catch(function () { self.showOverlay(true); });
        } else {
          setTimeout(function () { self.updateTransportState(video); self.showOverlay(video.paused); }, 0);
        }
      } else {
        try { video.pause(); } catch (error2) { /* ignore */ }
        this.updateTransportState(video);
        this.showOverlay(true);
      }
    },

    goToLive: function () {
      var video = document.getElementById('video');
      if (!video || this.playerType !== 'live') return;
      var range = this.liveSeekRange(video);
      if (!range) { this.toast('This stream does not expose a rewind buffer.'); this.showOverlay(); return; }
      try { video.currentTime = Math.max(range.start, range.end - 0.35); } catch (error) { /* ignore */ }
      try { video.play(); } catch (error2) { /* ignore */ }
      this.updatePlayerProgress(video);
      this.showOverlay();
    },

    showPlayerError: function (title, message) {
      clearTimeout(this.playbackWatchdog);
      var loading = document.getElementById('playerLoading');
      if (loading) loading.classList.add('hidden');
      var video = document.getElementById('video');
      if (video) { try { video.pause(); } catch (error) { /* ignore */ } }
      var player = document.getElementById('player');
      if (!player) return;
      var old = player.querySelector('.player-error');
      if (old) old.remove();
      var error = document.createElement('div');
      error.className = 'player-error';
      error.innerHTML = '<div><h2>' + escapeHtml(title) + '</h2><p>' + escapeHtml(message) + '</p><p>Press BACK to return.</p></div>';
      player.appendChild(error);
    },

    showOverlay: function (keepOpen) {
      var self = this;
      var player = document.getElementById('player');
      if (!player) return;
      player.classList.add('overlay');
      clearTimeout(this.overlayTimer);
      this.overlayTimer = null;
      var video = document.getElementById('video');
      if (keepOpen || !video || video.paused || this.playbackSwitching) return;
      this.overlayTimer = setTimeout(function () {
        var current = document.getElementById('player');
        var currentVideo = document.getElementById('video');
        if (!self.playerOpen || !current || !currentVideo || currentVideo.paused || self.playbackSwitching) return;
        current.classList.remove('overlay');
        self.overlayTimer = null;
      }, 4200);
    },

    closePlayer: function () {
      clearTimeout(this.overlayTimer);
      clearTimeout(this.playbackWatchdog);
      clearTimeout(this.playbackBufferTimer);
      this.playbackBufferTimer = null;
      var video = document.getElementById('video');
      if (video) {
        if (this.playerType !== 'live' && isFinite(video.currentTime)) XtreamlyTVStore.saveProgress(this.playerType, idOf(this.playerMedia, this.playerType), video.currentTime, video.duration);
        try { video.pause(); video.removeAttribute('src'); video.load(); } catch (error) { /* ignore */ }
      }
      var player = document.getElementById('player');
      if (player) player.remove();
      if (this.playerHost) {
        this.playerHost.innerHTML = '';
        this.playerHost.classList.remove('active');
        this.playerHost.setAttribute('aria-hidden', 'true');
      }
      document.body.classList.remove('video-mode');
      document.documentElement.classList.remove('video-mode');
      this.root.classList.remove('player-active');
      this.root.removeAttribute('aria-hidden');
      this.playerOpen = false;
      this.playerMedia = null;
      this.playerType = null;
      this.playerList = [];
      this.playerParent = null;
      this.playbackCandidates = [];
      this.playerHasPlayed = false;
      this.lastPlaybackToggleAt = 0;
      this.state = XtreamlyTVStore.getState();
      this.renderShell(this.currentView);
    },

    changeChannel: function (delta) {
      if (this.playerType !== 'live' || !this.playerMedia) return;
      if (!this.playerList || this.playerList.length < 2) {
        this.toast('No adjacent channels are loaded for this stream.');
        this.showOverlay(false);
        return;
      }
      var currentId = this.playerMedia.stream_id;
      var index = this.playerList.findIndex(function (channel) { return String(channel.stream_id) === String(currentId); });
      if (index < 0) index = 0;
      var nextIndex = (index + delta + this.playerList.length) % this.playerList.length;
      if (nextIndex === index) return;
      var next = this.playerList[nextIndex];
      this.playerMedia = next;
      this.playbackCandidates = this.buildPlaybackCandidates(next, 'live');
      this.playbackCandidateIndex = 0;
      this.playbackProgressRestored = false;
      XtreamlyTVStore.addRecent(next, 'live');
      var title = document.getElementById('playerTitle');
      var program = document.getElementById('playerProgram');
      var description = document.getElementById('playerDescription');
      var artwork = document.getElementById('playerArtwork');
      if (title) title.textContent = titleOf(next);
      if (program) program.textContent = 'Loading program information…';
      if (description) description.textContent = '';
      if (artwork) artwork.innerHTML = logo(next);
      var oldError = document.querySelector('.player-error');
      if (oldError) oldError.remove();
      this.loadPlayerEpg(next);
      this.loadPlaybackCandidate(0, 'Changing channel…');
      this.showOverlay();
    },

    seekToRatio: function (ratio) {
      var video = document.getElementById('video');
      if (!video) return;
      ratio = Math.max(0, Math.min(1, Number(ratio) || 0));
      var target;
      if (this.playerType === 'live') {
        var range = this.liveSeekRange(video);
        if (!range) { this.toast('This live stream does not expose a rewind buffer.'); return; }
        target = range.start + range.duration * ratio;
      } else {
        if (!isFinite(video.duration) || video.duration <= 0) return;
        target = video.duration * ratio;
      }
      try { video.currentTime = target; } catch (error) { /* ignore */ }
      this.updatePlayerProgress(video);
      this.showOverlay();
    },

    seek: function (seconds) {
      var video = document.getElementById('video');
      if (!video) return;
      var target;
      if (this.playerType === 'live') {
        var range = this.liveSeekRange(video);
        if (!range) { this.toast('This live stream does not expose a rewind buffer.'); this.showOverlay(); return; }
        target = Math.max(range.start, Math.min(range.end - 0.1, (isFinite(video.currentTime) ? video.currentTime : range.end) + seconds));
      } else {
        var duration = isFinite(video.duration) ? video.duration : 0;
        target = Math.max(0, Math.min(duration || (video.currentTime + seconds), video.currentTime + seconds));
      }
      try { video.currentTime = target; } catch (error) { /* ignore */ }
      this.updatePlayerProgress(video);
      this.showOverlay();
    },

    toggleCurrentFavorite: function () {
      if (!this.playerMedia) return;
      var target = this.playerType === 'episode' && this.playerParent ? this.playerParent : this.playerMedia;
      var type = this.playerType === 'episode' && this.playerParent ? 'series' : this.playerType;
      var added = XtreamlyTVStore.toggleFavorite(target, type);
      this.state = XtreamlyTVStore.getState();
      this.toast(added ? 'Added to favorites' : 'Removed from favorites');
      this.showOverlay();
    },

    onGlobalKey: function (event) {
      if (this.playerOpen) {
        if (event.keyCode === BACK || event.keyCode === STOP) { event.preventDefault(); this.closePlayer(); }
        else if (event.keyCode === 38 && this.playerType === 'live') { event.preventDefault(); this.changeChannel(-1); }
        else if (event.keyCode === 40 && this.playerType === 'live') { event.preventDefault(); this.changeChannel(1); }
        else if (event.keyCode === 37) { event.preventDefault(); this.seek(-30); }
        else if (event.keyCode === 39) { event.preventDefault(); this.seek(30); }
        else if (event.keyCode === 13) { event.preventDefault(); this.togglePlayback(); }
        else if (event.keyCode === PLAY) { event.preventDefault(); var playVideo = document.getElementById('video'); if (playVideo) { try { playVideo.play(); } catch (playError) { /* ignore */ } this.updateTransportState(playVideo); } this.showOverlay(); }
        else if (event.keyCode === PAUSE) { event.preventDefault(); var pauseVideo = document.getElementById('video'); if (pauseVideo) { try { pauseVideo.pause(); } catch (pauseError) { /* ignore */ } this.updateTransportState(pauseVideo); } this.showOverlay(true); }
        else if (event.keyCode === GREEN && this.playerType === 'live') { event.preventDefault(); this.goToLive(); }
        else if (event.keyCode === RED) { event.preventDefault(); this.toggleCurrentFavorite(); }
        return;
      }
      if (event.keyCode === RED) {
        if (this.toggleFocusedFavorite()) event.preventDefault();
        return;
      }
      if (event.keyCode === BACK) {
        event.preventDefault();
        if (this.detail) { this.detail = null; this.renderShell(this.currentView); }
        else if (this.currentView === 'favorites' && this.favoriteMode === 'editor') {
          this.favoriteEditor = null;
          this.favoriteDeleteArmed = false;
          this.favoriteMode = this.favoriteGroupId && this.favoriteGroupId !== 'all' ? 'group' : 'home';
          this.renderFavorites();
        }
        else if (this.currentView === 'favorites' && this.favoriteMode === 'group') {
          this.favoriteMode = 'home';
          this.renderFavorites();
        }
        else if (this.currentView !== 'home' && document.querySelector('.shell')) this.renderShell('home');
        else if (this.state.credentials || this.demo) this.exitApp();
      }
    },

    exitApp: function () {
      try {
        if (window.webOS && typeof window.webOS.platformBack === 'function') window.webOS.platformBack();
        else window.close();
      } catch (error) { window.close(); }
    }
  };

  window.XtreamlyTVApp = window.TVeeApp = App;
  document.addEventListener('DOMContentLoaded', function () { App.init(); });
}());
