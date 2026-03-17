import assert from 'node:assert/strict';
import test from 'node:test';

// Project detection logic replicated from src/renderer/services/projectDetector.ts

const PROJECT_SIGNATURES = [
  { file: 'package.json', type: 'nodejs', label: 'Node.js', icon: '📦' },
  { file: 'pyproject.toml', type: 'python', label: 'Python', icon: '🐍' },
  { file: 'setup.py', type: 'python', label: 'Python', icon: '🐍' },
  { file: 'requirements.txt', type: 'python', label: 'Python', icon: '🐍' },
  { file: 'Cargo.toml', type: 'rust', label: 'Rust', icon: '🦀' },
  { file: 'go.mod', type: 'go', label: 'Go', icon: '🔵' },
  { file: 'pom.xml', type: 'java', label: 'Java', icon: '☕' },
  { file: 'build.gradle', type: 'java', label: 'Java/Gradle', icon: '☕' },
  { file: '*.csproj', type: 'dotnet', label: '.NET', icon: '🟣' },
  { file: 'Gemfile', type: 'ruby', label: 'Ruby', icon: '💎' },
];

function detectProjectType(fileNames) {
  const nameSet = new Set(fileNames);
  for (const sig of PROJECT_SIGNATURES) {
    if (sig.file.startsWith('*')) {
      const ext = sig.file.substring(1);
      const match = fileNames.find(f => f.endsWith(ext));
      if (match) {
        return { type: sig.type, label: sig.label, icon: sig.icon, configFile: match };
      }
    } else if (nameSet.has(sig.file)) {
      return { type: sig.type, label: sig.label, icon: sig.icon, configFile: sig.file };
    }
  }
  return { type: 'unknown', label: 'Project', icon: '📁' };
}

function extractName(dirPath) {
  return dirPath.split(/[/\\]/).filter(Boolean).pop() || 'Project';
}

// --- detectProjectType tests ---

test('detectProjectType: Node.js project', () => {
  const result = detectProjectType(['package.json', 'tsconfig.json', 'src', 'node_modules']);
  assert.equal(result.type, 'nodejs');
  assert.equal(result.label, 'Node.js');
  assert.equal(result.configFile, 'package.json');
});

test('detectProjectType: Python project (pyproject.toml)', () => {
  const result = detectProjectType(['pyproject.toml', 'src', 'tests']);
  assert.equal(result.type, 'python');
  assert.equal(result.configFile, 'pyproject.toml');
});

test('detectProjectType: Python project (requirements.txt)', () => {
  const result = detectProjectType(['requirements.txt', 'main.py']);
  assert.equal(result.type, 'python');
  assert.equal(result.configFile, 'requirements.txt');
});

test('detectProjectType: Rust project', () => {
  const result = detectProjectType(['Cargo.toml', 'src']);
  assert.equal(result.type, 'rust');
  assert.equal(result.configFile, 'Cargo.toml');
});

test('detectProjectType: Go project', () => {
  const result = detectProjectType(['go.mod', 'go.sum', 'main.go']);
  assert.equal(result.type, 'go');
  assert.equal(result.configFile, 'go.mod');
});

test('detectProjectType: Java Maven project', () => {
  const result = detectProjectType(['pom.xml', 'src']);
  assert.equal(result.type, 'java');
  assert.equal(result.configFile, 'pom.xml');
});

test('detectProjectType: Java Gradle project', () => {
  const result = detectProjectType(['build.gradle', 'src']);
  assert.equal(result.type, 'java');
  assert.equal(result.label, 'Java/Gradle');
  assert.equal(result.configFile, 'build.gradle');
});

test('detectProjectType: .NET project (glob pattern)', () => {
  const result = detectProjectType(['MyApp.csproj', 'Program.cs']);
  assert.equal(result.type, 'dotnet');
  assert.equal(result.configFile, 'MyApp.csproj');
});

test('detectProjectType: Ruby project', () => {
  const result = detectProjectType(['Gemfile', 'Gemfile.lock', 'app']);
  assert.equal(result.type, 'ruby');
  assert.equal(result.configFile, 'Gemfile');
});

test('detectProjectType: unknown project', () => {
  const result = detectProjectType(['README.md', '.gitignore']);
  assert.equal(result.type, 'unknown');
  assert.equal(result.label, 'Project');
});

test('detectProjectType: empty directory', () => {
  const result = detectProjectType([]);
  assert.equal(result.type, 'unknown');
});

test('detectProjectType: priority - Node.js over others when multiple configs present', () => {
  const result = detectProjectType(['package.json', 'Cargo.toml']);
  assert.equal(result.type, 'nodejs');
});

// --- extractName tests ---

test('extractName: unix path', () => {
  assert.equal(extractName('/home/user/my-project'), 'my-project');
});

test('extractName: windows path', () => {
  assert.equal(extractName('C:\\Users\\user\\my-project'), 'my-project');
});

test('extractName: trailing slash', () => {
  assert.equal(extractName('/home/user/project/'), 'project');
});

test('extractName: empty string returns default', () => {
  assert.equal(extractName(''), 'Project');
});
