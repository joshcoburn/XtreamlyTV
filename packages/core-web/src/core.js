(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.XtreamlyCore = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function trimSlash(value) {
    return String(value || '').trim().replace(/\/+$/, '');
  }

  function decodeMaybeBase64(value) {
    if (!value || typeof value !== 'string') return value || '';
    try {
      var decoded = atob(value);
      if (/^[\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]*$/.test(decoded)) {
        try { return decodeURIComponent(escape(decoded)); } catch (error) { return decoded; }
      }
    } catch (error) { /* plain text */ }
    return value;
  }

  function safeExtension(value, fallback) {
    var extension = String(value || fallback || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '');
    return extension || fallback || 'mp4';
  }

  function objectValues(value) {
    return Object.keys(value || {}).map(function (key) { return value[key]; });
  }

  function normalizeCollection(data, preferredKeys) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== 'object') return [];
    preferredKeys = preferredKeys || [];
    var keys = preferredKeys.concat(['data', 'results', 'items', 'streams', 'channels', 'movies', 'series', 'categories']);
    for (var index = 0; index < keys.length; index += 1) {
      if (Array.isArray(data[keys[index]])) return data[keys[index]];
    }
    return objectValues(data).filter(function (item) {
      return item && typeof item === 'object' && !Array.isArray(item);
    });
  }

  function deriveCategories(items, fallbackLabel) {
    var seen = {};
    var output = [];
    (items || []).forEach(function (item) {
      var id = item && (item.category_id !== undefined ? item.category_id : item.categoryId);
      if (id === undefined || id === null || id === '') return;
      var key = String(id);
      if (seen[key]) return;
      seen[key] = true;
      output.push({
        category_id: key,
        category_name: String(item.category_name || item.category || item.genre || (fallbackLabel + ' ' + key))
      });
    });
    return output;
  }

  function inferType(item) {
    if (!item) return 'live';
    if (item.content_type) return item.content_type;
    if (item.series_id !== undefined) return 'series';
    if (item.episode_num !== undefined || item.episode_id !== undefined) return 'episode';
    if (item.container_extension && item.stream_type !== 'live') return 'movie';
    return 'live';
  }

  function itemId(item, type) {
    type = type || inferType(item);
    if (!item) return '';
    if (type === 'series') return String(item.series_id !== undefined ? item.series_id : item.id || '');
    if (type === 'episode') return String(item.id !== undefined ? item.id : item.episode_id || item.stream_id || '');
    return String(item.stream_id !== undefined ? item.stream_id : item.id || '');
  }

  function buildStreamUrl(credentials, type, streamId, extension) {
    var server = trimSlash(credentials && credentials.server);
    var username = encodeURIComponent(String(credentials && credentials.username || '').trim());
    var password = encodeURIComponent(String(credentials && credentials.password || ''));
    var segment = type === 'episode' ? 'series' : type === 'movie' ? 'movie' : 'live';
    return server + '/' + segment + '/' + username + '/' + password + '/' + streamId + '.' + safeExtension(extension, type === 'live' ? 'm3u8' : 'mp4');
  }

  return {
    trimSlash: trimSlash,
    decodeMaybeBase64: decodeMaybeBase64,
    safeExtension: safeExtension,
    normalizeCollection: normalizeCollection,
    deriveCategories: deriveCategories,
    inferType: inferType,
    itemId: itemId,
    buildStreamUrl: buildStreamUrl
  };
}));
