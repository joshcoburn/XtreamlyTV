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
    favoriteGroups: [],
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

  function favoriteKey(type, id) {
    return String(type || 'live') + ':' + String(id || '');
  }

  function normalizeFavoriteGroup(group) {
    group = group && typeof group === 'object' ? group : {};
    var allowedIcons = ['heart', 'tv', 'popcorn', 'play', 'smile', 'trophy', 'folder', 'star'];
    var allowedColors = ['purple', 'blue', 'teal', 'orange', 'rose', 'lime', 'slate'];
    var icon = allowedIcons.indexOf(group.icon) >= 0 ? group.icon : 'folder';
    var color = allowedColors.indexOf(group.color) >= 0 ? group.color : 'purple';
    var seen = {};
    var itemKeys = (Array.isArray(group.itemKeys) ? group.itemKeys : []).map(String).filter(function (key) {
      if (!key || seen[key]) return false;
      seen[key] = true;
      return /^(live|movie|series):.+/.test(key);
    });
    return {
      id: String(group.id || ''),
      name: String(group.name || 'Untitled group').trim().slice(0, 36) || 'Untitled group',
      icon: icon,
      color: color,
      itemKeys: itemKeys.slice(0, 250),
      created_at: Number(group.created_at || Date.now()),
      updated_at: Number(group.updated_at || Date.now())
    };
  }

  function migrateFavoriteGroups(groups) {
    var seen = {};
    return (Array.isArray(groups) ? groups : []).map(normalizeFavoriteGroup).filter(function (group) {
      if (!group.id || seen[group.id]) return false;
      seen[group.id] = true;
      return true;
    }).slice(0, 24);
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
        favoriteGroups: migrateFavoriteGroups(parsed.favoriteGroups),
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
      if (index >= 0) {
        state.favorites.splice(index, 1);
        var removedKey = favoriteKey(type, id);
        state.favoriteGroups.forEach(function (group) {
          group.itemKeys = group.itemKeys.filter(function (key) { return key !== removedKey; });
          group.updated_at = Date.now();
        });
      } else state.favorites.unshift(normalizedItem(item, type));
      state.favorites = state.favorites.slice(0, 250);
      this.persist();
      return index < 0;
    },
    favoriteKey: favoriteKey,
    saveFavoriteGroup: function (group) {
      var value = normalizeFavoriteGroup(group);
      if (!value.id) value.id = 'group-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
      value.updated_at = Date.now();
      var index = state.favoriteGroups.findIndex(function (entry) { return entry.id === value.id; });
      if (index >= 0) {
        value.created_at = state.favoriteGroups[index].created_at || value.created_at;
        state.favoriteGroups.splice(index, 1, value);
      } else {
        value.created_at = Date.now();
        state.favoriteGroups.unshift(value);
        state.favoriteGroups = state.favoriteGroups.slice(0, 24);
      }
      this.persist();
      return clone(value);
    },
    deleteFavoriteGroup: function (id) {
      var before = state.favoriteGroups.length;
      state.favoriteGroups = state.favoriteGroups.filter(function (group) { return group.id !== String(id); });
      if (state.favoriteGroups.length !== before) this.persist();
      return state.favoriteGroups.length !== before;
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
