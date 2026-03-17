import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Editor from '@monaco-editor/react';

interface FileViewerProps {
  filePath: string;
  onClose: () => void;
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

// Map special filenames (no extension) to languages
const FILENAME_MAP: Record<string, string> = {
  Dockerfile: 'dockerfile',
  Makefile: 'plaintext',
  CMakeLists: 'plaintext',
  Vagrantfile: 'ruby',
  Gemfile: 'ruby',
  Rakefile: 'ruby',
};

function getLanguage(fileName: string): string {
  // Check exact filename match first (e.g. "Dockerfile", "Makefile")
  if (FILENAME_MAP[fileName]) return FILENAME_MAP[fileName];

  const ext = fileName.includes('.')
    ? fileName.split('.').pop()?.toLowerCase() || ''
    : '';

  // For extensionless files, check stem against special filenames
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

const FileViewer: React.FC<FileViewerProps> = ({ filePath, onClose }) => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDark = useIsDarkMode();

  const fileName = filePath.split(/[/\\]/).pop() || filePath;
  const language = getLanguage(fileName);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setContent(null);

    window.electron.fs.readFile(filePath).then((result) => {
      if (result.success && result.content !== undefined) {
        setContent(result.content);
      } else {
        setError(result.error || 'Failed to read file');
      }
      setIsLoading(false);
    }).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to read file');
      setIsLoading(false);
    });
  }, [filePath]);

  const editorOptions = useMemo(() => ({
    readOnly: true,
    minimap: { enabled: false },
    fontSize: 12,
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    wrappingIndent: 'indent' as const,
    automaticLayout: true,
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    renderLineHighlight: 'none' as const,
    contextmenu: false,
    folding: true,
    lineDecorationsWidth: 4,
    padding: { top: 8, bottom: 8 },
  }), []);

  return (
    <div className="flex flex-col h-full dark:bg-claude-darkBg bg-claude-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b dark:border-claude-darkBorder border-claude-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <DocumentTextIcon className="w-4 h-4 shrink-0 dark:text-claude-darkTextSecondary text-claude-textSecondary" />
          <span className="text-xs font-medium dark:text-claude-darkText text-claude-text truncate" title={filePath}>
            {fileName}
          </span>
          <span className="text-xs dark:text-claude-darkTextTertiary text-claude-textTertiary shrink-0">
            {language}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover transition-colors"
        >
          <XMarkIcon className="w-4 h-4 dark:text-claude-darkTextSecondary text-claude-textSecondary" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-claude-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full px-4">
            <p className="text-xs dark:text-claude-darkTextTertiary text-claude-textTertiary text-center">{error}</p>
          </div>
        ) : content !== null ? (
          <Editor
            value={content}
            language={language}
            theme={isDark ? 'vs-dark' : 'light'}
            options={editorOptions}
            loading={
              <div className="flex items-center justify-center h-full">
                <div className="w-5 h-5 border-2 border-claude-accent border-t-transparent rounded-full animate-spin" />
              </div>
            }
          />
        ) : null}
      </div>
    </div>
  );
};

export default FileViewer;
