const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeMexicanPhone } = require('../src/utils/mexicanPhone');

test('normalizes Mexican ten-digit numbers to +52 format', () => {
  assert.equal(normalizeMexicanPhone('5512345678'), '+525512345678');
  assert.equal(normalizeMexicanPhone('(55) 1234-5678'), '+525512345678');
});

test('accepts the optional Mexican country code', () => {
  assert.equal(normalizeMexicanPhone('+52 55 1234 5678'), '+525512345678');
  assert.equal(normalizeMexicanPhone('52-55-1234-5678'), '+525512345678');
});

test('rejects values that are not Mexican ten-digit numbers', () => {
  for (const phone of ['123456789', '12345678901', '+1 555 123 4567', '55ABC45678', '++525512345678']) {
    assert.equal(normalizeMexicanPhone(phone), null, `expected ${phone} to be rejected`);
  }
});

test('allows an empty value only for optional profile phone numbers', () => {
  assert.equal(normalizeMexicanPhone(''), null);
  assert.equal(normalizeMexicanPhone('   '), null);
});
