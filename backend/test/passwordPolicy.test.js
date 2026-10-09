const test = require('node:test');
const assert = require('node:assert/strict');
const { validatePassword } = require('../src/utils/passwordPolicy');

test('accepts passwords meeting the policy at the minimum and maximum lengths', () => {
  assert.equal(validatePassword('Abcdefg1!x'), true);
  assert.equal(validatePassword('Abcdefghijk1!xyz'), true);
});

test('rejects passwords outside the permitted length', () => {
  assert.equal(validatePassword('Abcdef1!x'), false);
  assert.equal(validatePassword('Abcdefghijklm1!xyzz'), false);
});

test('requires an uppercase letter, a number, and a symbol', () => {
  assert.equal(validatePassword('abcdefghij1!'), false);
  assert.equal(validatePassword('Abcdefghij!'), false);
  assert.equal(validatePassword('Abcdefghij1'), false);
  assert.equal(validatePassword('Abcdefghi1 '), false);
});

test('rejects non-string input', () => {
  assert.equal(validatePassword(null), false);
  assert.equal(validatePassword(1234567890), false);
});
