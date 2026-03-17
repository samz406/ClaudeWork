import assert from 'node:assert/strict';
import test from 'node:test';

// Replicate the core shortcut parsing logic for testing
// Source: src/renderer/services/shortcuts.ts

const modifierAliases = {
  ctrl: 'ctrl', control: 'ctrl',
  cmd: 'meta', command: 'meta', meta: 'meta', win: 'meta', super: 'meta',
  alt: 'alt', option: 'alt',
  shift: 'shift',
};

const commandOrControlAliases = new Set([
  'cmdorctrl', 'commandorcontrol', 'cmdorcontrol', 'ctrlorcmd', 'ctrlorcommand',
]);

const keyAliases = {
  esc: 'escape', escape: 'escape', return: 'enter', enter: 'enter',
  space: ' ', spacebar: ' ', comma: ',', period: '.', dot: '.',
  minus: '-', dash: '-', backspace: 'backspace', delete: 'delete', del: 'delete',
  tab: 'tab', up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright',
  arrowup: 'arrowup', arrowdown: 'arrowdown', arrowleft: 'arrowleft', arrowright: 'arrowright',
  pageup: 'pageup', pagedown: 'pagedown', home: 'home', end: 'end', insert: 'insert',
};

const normalizeToken = (t) => t.trim().toLowerCase();
const normalizeKey = (k) => {
  if (k === ' ') return ' ';
  const n = normalizeToken(k);
  return keyAliases[n] ?? n;
};

function parseShortcut(shortcut) {
  if (!shortcut) return null;
  const tokens = shortcut.split('+').map(t => t.trim()).filter(Boolean);
  if (tokens.length === 0) return null;
  const parsed = { key: '', alt: false, ctrl: false, shift: false, meta: false, commandOrControl: false };
  for (const token of tokens) {
    const normalized = normalizeToken(token);
    if (commandOrControlAliases.has(normalized)) { parsed.commandOrControl = true; continue; }
    const modifier = modifierAliases[normalized];
    if (modifier) { parsed[modifier] = true; continue; }
    parsed.key = normalizeKey(token);
  }
  if (!parsed.key) return null;
  return parsed;
}

function matchesShortcut(event, shortcut) {
  const parsed = parseShortcut(shortcut);
  if (!parsed) return false;
  const key = normalizeKey(event.key);
  if (key !== parsed.key) return false;
  if (event.altKey !== parsed.alt) return false;
  if (event.shiftKey !== parsed.shift) return false;
  if (parsed.commandOrControl) {
    if (!event.ctrlKey && !event.metaKey) return false;
  } else {
    if (event.ctrlKey !== parsed.ctrl) return false;
    if (event.metaKey !== parsed.meta) return false;
  }
  return true;
}

// --- parseShortcut tests ---

test('parseShortcut: Ctrl+N', () => {
  const r = parseShortcut('Ctrl+N');
  assert.equal(r.key, 'n');
  assert.equal(r.ctrl, true);
  assert.equal(r.shift, false);
});

test('parseShortcut: CmdOrCtrl+Shift+P', () => {
  const r = parseShortcut('CmdOrCtrl+Shift+P');
  assert.equal(r.key, 'p');
  assert.equal(r.commandOrControl, true);
  assert.equal(r.shift, true);
  assert.equal(r.ctrl, false);
  assert.equal(r.meta, false);
});

test('parseShortcut: CmdOrCtrl+`', () => {
  const r = parseShortcut('CmdOrCtrl+`');
  assert.equal(r.key, '`');
  assert.equal(r.commandOrControl, true);
});

test('parseShortcut: CmdOrCtrl+B', () => {
  const r = parseShortcut('CmdOrCtrl+B');
  assert.equal(r.key, 'b');
  assert.equal(r.commandOrControl, true);
});

test('parseShortcut: returns null for empty input', () => {
  assert.equal(parseShortcut(''), null);
  assert.equal(parseShortcut(undefined), null);
  assert.equal(parseShortcut(null), null);
});

test('parseShortcut: Ctrl+, (comma)', () => {
  const r = parseShortcut('Ctrl+,');
  assert.equal(r.key, ',');
  assert.equal(r.ctrl, true);
});

test('parseShortcut: Alt+Shift+F', () => {
  const r = parseShortcut('Alt+Shift+F');
  assert.equal(r.key, 'f');
  assert.equal(r.alt, true);
  assert.equal(r.shift, true);
});

test('parseShortcut: returns null for only modifiers', () => {
  assert.equal(parseShortcut('Ctrl+Shift'), null);
});

test('parseShortcut: Escape key alias', () => {
  const r = parseShortcut('Esc');
  assert.equal(r.key, 'escape');
});

test('parseShortcut: arrow key aliases', () => {
  assert.equal(parseShortcut('Up').key, 'arrowup');
  assert.equal(parseShortcut('Down').key, 'arrowdown');
  assert.equal(parseShortcut('Left').key, 'arrowleft');
  assert.equal(parseShortcut('Right').key, 'arrowright');
});

test('parseShortcut: Command alias maps to meta', () => {
  const r = parseShortcut('Command+S');
  assert.equal(r.key, 's');
  assert.equal(r.meta, true);
});

test('parseShortcut: Option alias maps to alt', () => {
  const r = parseShortcut('Option+Z');
  assert.equal(r.key, 'z');
  assert.equal(r.alt, true);
});

test('parseShortcut: Space key alias', () => {
  const r = parseShortcut('Ctrl+Space');
  assert.equal(r.key, ' ');
  assert.equal(r.ctrl, true);
});

// --- matchesShortcut tests ---

function fakeEvent({ key, ctrlKey = false, metaKey = false, altKey = false, shiftKey = false }) {
  return { key, ctrlKey, metaKey, altKey, shiftKey };
}

test('matchesShortcut: Ctrl+N matches event', () => {
  const e = fakeEvent({ key: 'n', ctrlKey: true });
  assert.equal(matchesShortcut(e, 'Ctrl+N'), true);
});

test('matchesShortcut: Ctrl+N does not match without ctrl', () => {
  const e = fakeEvent({ key: 'n' });
  assert.equal(matchesShortcut(e, 'Ctrl+N'), false);
});

test('matchesShortcut: CmdOrCtrl+S matches with ctrlKey', () => {
  const e = fakeEvent({ key: 's', ctrlKey: true });
  assert.equal(matchesShortcut(e, 'CmdOrCtrl+S'), true);
});

test('matchesShortcut: CmdOrCtrl+S matches with metaKey', () => {
  const e = fakeEvent({ key: 's', metaKey: true });
  assert.equal(matchesShortcut(e, 'CmdOrCtrl+S'), true);
});

test('matchesShortcut: CmdOrCtrl+S fails without ctrl or meta', () => {
  const e = fakeEvent({ key: 's' });
  assert.equal(matchesShortcut(e, 'CmdOrCtrl+S'), false);
});

test('matchesShortcut: returns false for undefined shortcut', () => {
  const e = fakeEvent({ key: 'a' });
  assert.equal(matchesShortcut(e, undefined), false);
});

test('matchesShortcut: Alt+Shift+F matches correctly', () => {
  const e = fakeEvent({ key: 'f', altKey: true, shiftKey: true });
  assert.equal(matchesShortcut(e, 'Alt+Shift+F'), true);
});

test('matchesShortcut: Alt+Shift+F fails with extra modifier', () => {
  const e = fakeEvent({ key: 'f', altKey: true, shiftKey: true, ctrlKey: true });
  assert.equal(matchesShortcut(e, 'Alt+Shift+F'), false);
});

test('matchesShortcut: Escape key', () => {
  const e = fakeEvent({ key: 'Escape' });
  assert.equal(matchesShortcut(e, 'Esc'), true);
});
