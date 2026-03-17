import React, { useState, useEffect, useMemo } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { DiffEditor } from '@monaco-editor/react';

interface DiffViewerProps {
  filePath: string;
  originalContent: string;
  modifiedContent: string;
  language?: string;
}

const LANGUAGE_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  json: 'json',
  md: 'markdown',
  css: 'css',
  scss: 'scss',
  less: 'less',
  html: 'html',
  htm: 'html',
  py: 'python',
  pyw: 'python',
  rs: 'rust',
  go: 'go',
  java: 'java',
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  cxx: 'cpp',
  cc: 'cpp',
  hpp: 'cpp',
  cs: 'csharp',
  rb: 'ruby',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  kts: 'kotlin',
  scala: 'scala',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  fish: 'shell',
  ps1: 'powershell',
  yml: 'yaml',
  yaml: 'yaml',
  toml: 'ini',
  ini: 'ini',
  cfg: 'ini',
  xml: 'xml',
  svg: 'xml',
  sql: 'sql',
  graphql: 'graphql',
  gql: 'graphql',
  r: 'r',
  lua: 'lua',
  perl: 'perl',
  pl: 'perl',
  dockerfile: 'dockerfile',
  makefile: 'plaintext',
  cmake: 'plaintext',
  txt: 'plaintext',
  log: 'plaintext',
  env: 'plaintext',
  gitignore: 'plaintext',
  dockerignore: 'plaintext',
};

const FILENAME_MAP: Record<string, string> = {
  Dockerfile: 'dockerfile',
  Makefile: 'plaintext',
  CMakeLists: 'plaintext',
  Vagrantfile: 'ruby',
  Gemfile: 'ruby',
  Rakefile: 'ruby',
};

function getLanguage(fileName: string): string {
  if (FILENAME_MAP[fileName]) return FILENAME_MAP[fileName];

  const ext = fileName.includes('.')
    ? fileName.split('.').pop()?.toLowerCase() || ''
    : '';

  if (!ext && FILENAME_MAP[fileName]) return FILENAME_MAP[fileName];

  return LANGUAGE_MAP[ext] || 'plaintext';
}

function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

const DiffViewer: React.FC<DiffViewerProps> = ({
  filePath,
  originalContent,
  modifiedContent,
  language,
}) => {
  const isDark = useIsDarkMode();

  const fileName = filePath.split(/[/\\]/).pop() || filePath;
  const resolvedLanguage = language || getLanguage(fileName);

  const editorOptions = useMemo(() => ({
    readOnly: true,
    originalEditable: false,
    minimap: { enabled: false },
    fontSize: 12,
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    scrollbar: {
      verticalScrollbarSize: 6,
      horizontalScrollbarSize: 6,
    },
    overviewRulerLanes: 0,
    renderLineHighlight: 'none' as const,
    contextmenu: false,
    folding: true,
    lineDecorationsWidth: 4,
    padding: { top: 8, bottom: 8 },
    renderSideBySide: true,
  }), []);

  return (
    <div className="flex flex-col h-full dark:bg-claude-darkBg bg-claude-bg">
      {/* Header */}
      <div className="flex items-center px-3 py-2 border-b dark:border-claude-darkBorder border-claude-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <DocumentTextIcon className="w-4 h-4 shrink-0 dark:text-claude-darkTextSecondary text-claude-textSecondary" />
          <span
            className="text-xs font-medium dark:text-claude-darkText text-claude-text truncate"
            title={filePath}
          >
            {filePath}
          </span>
          <span className="text-xs dark:text-claude-darkTextTertiary text-claude-textTertiary shrink-0">
            {resolvedLanguage}
          </span>
        </div>
      </div>

      {/* Diff content */}
      <div className="flex-1 min-h-0">
        <DiffEditor
          original={originalContent}
          modified={modifiedContent}
          language={resolvedLanguage}
          theme={isDark ? 'vs-dark' : 'light'}
          options={editorOptions}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="w-5 h-5 border-2 border-claude-accent border-t-transparent rounded-full animate-spin" />
            </div>
          }
        />
      </div>
    </div>
  );
};

export default DiffViewer;
