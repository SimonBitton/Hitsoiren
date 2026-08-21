import test from 'node:test';
import assert from 'node:assert/strict';

import {
  escapeHtml,
  parseHistoricalDate,
  sanitizeExternalUrl
} from '../src/utils.js';

test('parse les années avec séparateurs de milliers', () => {
  assert.equal(parseHistoricalDate('≈ 500 000 av. J.-C.').year, -500000);
  assert.equal(parseHistoricalDate('3 200 000 av. J.-C.').year, -3200000);
});

test('distingue le jour du mois et l’année', () => {
  assert.equal(parseHistoricalDate('2012 (4 juillet)').year, 2012);
  assert.equal(parseHistoricalDate('4 juillet 1776').year, 1776);
  assert.equal(parseHistoricalDate('1914–1918').year, 1914);
});

test('échappe le HTML, y compris pour une valeur non textuelle', () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(escapeHtml(42), '42');
});

test('refuse les protocoles actifs et les URL avec identifiants', () => {
  assert.equal(sanitizeExternalUrl('javascript:alert(1)'), null);
  assert.equal(sanitizeExternalUrl('data:text/html,test'), null);
  assert.equal(sanitizeExternalUrl('https://user:pass@example.com/private'), null);
  assert.equal(sanitizeExternalUrl('https://example.com/article'), 'https://example.com/article');
});
