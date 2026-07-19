/* Generated from packages/core-web/src/store.js. Do not edit this copy. */
(function () {
  'use strict';

  var Core = window.XtreamlyCore;
  if (!Core) throw new Error('XtreamlyCore must load before store.js');

  var KEY = 'xtreamlytv.state.v1';
  var defaults = {
    credentials: null,
    settings: {
      apiProxy: '',
      streamFormat: 'auto',
      autoplay: true,
      theme: 'teal',
      maxCachedCategories: 3
    },
    favorites: [],
    recent: [],
    progress: {}
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function normalizedItem(item, type) {
    var output = Object.assign({}, item || {});
    output.content_type = type || Core.inferType(output);
    return output;
  }

  function migrateItems(items) {
    return (Array.isArray(items) ? items : []).map(function (item) {
      return normalizedItem(item, Core.inferType(item));
    });
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return clone(defaults);
      var parsed = JSON.parse(raw);
      return {
        credentials: parsed.credentials || null,
        settings: Object.assign({}, defaults.settings, parsed.settings || {}),
        favorites: migrateItems(parsed.favorites),
        recent: migrateItems(parsed.recent),
        progress: parsed.progress && typeof parsed.progress === 'object' ? parsed.progress : {}
      };
    } catch (error) { return clone(defaults); }
  }

  var state = load();
  function progressKey(type, id) { return String(type || 'movie') + ':' + String(id || ''); }

  window.XtreamlyTVStore = window.TVeeStore = {
    getState: function () { return clone(state); },
    saveCredentials: function (credentials) { state.credentials = credentials; this.persist(); },
    clearCredentials: function () { state.credentials = null; this.persist(); },
    updateSettings: function (settings) { state.settings = Object.assign({}, state.settings, settings); this.persist(); },
    isFavorite: function (type, id) {
      if (arguments.length === 1) { id = type; type = 'live'; }
      return state.favorites.some(function (item) {
        return Core.inferType(item) === type && Core.itemId(item, type) === String(id);
      });
    },
    toggleFavorite: function (item, type) {
      type = type || Core.inferType(item);
      var id = Core.itemId(item, type);
      var index = state.favorites.findIndex(function (favorite) {
        return Core.inferType(favorite) === type && Core.itemId(favorite, type) === id;
      });
      if (index >= 0) state.favorites.splice(index, 1);
      else state.favorites.unshift(normalizedItem(item, type));
      state.favorites = state.favorites.slice(0, 250);
      this.persist();
      return index < 0;
    },
    addRecent: function (item, type) {
      type = type || Core.inferType(item);
      var id = Core.itemId(item, type);
      state.recent = state.recent.filter(function (recent) {
        return !(Core.inferType(recent) === type && Core.itemId(recent, type) === id);
      });
      state.recent.unshift(Object.assign(normalizedItem(item, type), { watched_at: Date.now() }));
      state.recent = state.recent.slice(0, 40);
      this.persist();
    },
    getProgress: function (type, id) { return clone(state.progress[progressKey(type, id)] || null); },
    saveProgress: function (type, id, seconds, duration) {
      if (!id || !isFinite(seconds) || seconds < 0) return;
      var key = progressKey(type, id);
      if (duration && seconds >= duration - 30) delete state.progress[key];
      else state.progress[key] = {
        seconds: Math.floor(seconds),
        duration: isFinite(duration) ? Math.floor(duration) : 0,
        updated_at: Date.now()
      };
      this.persist();
    },
    clearProgress: function (type, id) { delete state.progress[progressKey(type, id)]; this.persist(); },
    clearHistory: function () { state.recent = []; state.progress = {}; this.persist(); },
    persist: function () { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (error) { /* unavailable */ } },
    reset: function () { state = clone(defaults); this.persist(); },
    inferType: Core.inferType,
    itemId: Core.itemId
  };
}());
