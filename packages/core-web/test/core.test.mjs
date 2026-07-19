import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../src/core.js');

test('normalizes wrapped arrays', () => {
  assert.deepEqual(core.normalizeCollection({ channels: [{ id: 1 }] }), [{ id: 1 }]);
});

test('infers content types and stable ids', () => {
  assert.equal(core.inferType({ series_id: 44 }), 'series');
  assert.equal(core.itemId({ series_id: 44 }, 'series'), '44');
  assert.equal(core.inferType({ container_extension: 'mp4', stream_type: 'movie' }), 'movie');
});

test('builds encoded stream URLs', () => {
  assert.equal(
    core.buildStreamUrl({ server: 'https://provider.example/', username: 'a b', password: 'p/1' }, 'live', 9, 'm3u8'),
    'https://provider.example/live/a%20b/p%2F1/9.m3u8'
  );
});

test('derives unique categories', () => {
  assert.deepEqual(core.deriveCategories([
    { category_id: '1', category_name: 'One' },
    { category_id: '1', category_name: 'One' },
    { category_id: '2', category_name: 'Two' }
  ], 'Category'), [
    { category_id: '1', category_name: 'One' },
    { category_id: '2', category_name: 'Two' }
  ]);
});
