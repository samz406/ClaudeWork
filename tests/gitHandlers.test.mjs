import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';

// Replicate git handler validation logic from src/main/main.ts

function validateGitCwd(cwd) {
  if (typeof cwd !== 'string' || !cwd) throw new Error('Invalid cwd');
  return path.resolve(cwd);
}

function sanitizeLimit(limit) {
  return Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 50);
}

// --- validateGitCwd tests ---

test('validateGitCwd: valid absolute path', () => {
  const result = validateGitCwd('/home/user/project');
  assert.equal(result, '/home/user/project');
});

test('validateGitCwd: relative path resolves to absolute', () => {
  const result = validateGitCwd('./myproject');
  assert.ok(path.isAbsolute(result));
  assert.ok(result.endsWith('myproject'));
});

test('validateGitCwd: empty string throws', () => {
  assert.throws(() => validateGitCwd(''), /Invalid cwd/);
});

test('validateGitCwd: null throws', () => {
  assert.throws(() => validateGitCwd(null), /Invalid cwd/);
});

test('validateGitCwd: undefined throws', () => {
  assert.throws(() => validateGitCwd(undefined), /Invalid cwd/);
});

test('validateGitCwd: number throws', () => {
  assert.throws(() => validateGitCwd(123), /Invalid cwd/);
});

test('validateGitCwd: path with .. is resolved', () => {
  const result = validateGitCwd('/home/user/../user/project');
  assert.equal(result, '/home/user/project');
});

// --- sanitizeLimit tests ---

test('sanitizeLimit: normal number', () => {
  assert.equal(sanitizeLimit(10), 10);
});

test('sanitizeLimit: zero falls back to default 10 (falsy)', () => {
  // parseInt(0) is 0, and 0 || 10 yields 10, then clamped to [1,50]
  assert.equal(sanitizeLimit(0), 10);
});

test('sanitizeLimit: negative becomes 1', () => {
  assert.equal(sanitizeLimit(-5), 1);
});

test('sanitizeLimit: over 50 clamps to 50', () => {
  assert.equal(sanitizeLimit(100), 50);
});

test('sanitizeLimit: string number', () => {
  assert.equal(sanitizeLimit('15'), 15);
});

test('sanitizeLimit: NaN becomes 10 (default)', () => {
  assert.equal(sanitizeLimit('abc'), 10);
});

test('sanitizeLimit: undefined becomes 10 (default)', () => {
  assert.equal(sanitizeLimit(undefined), 10);
});

test('sanitizeLimit: boundary value 1', () => {
  assert.equal(sanitizeLimit(1), 1);
});

test('sanitizeLimit: boundary value 50', () => {
  assert.equal(sanitizeLimit(50), 50);
});

test('sanitizeLimit: float truncated', () => {
  assert.equal(sanitizeLimit(25.9), 25);
});
