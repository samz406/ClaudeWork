import React, { useState, useEffect } from 'react';
import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface FileViewerProps {
  filePath: string;
  onClose: () => void;
}

const LANGUAGE_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  json: 'json',
  md: 'markdown',
  css: 'css',
  html: 'html',
  py: 'python',
  rs: 'rust',
  go: 'go',
  sh: 'bash',
  yml: 'yaml',
  yaml: 'yaml',
  toml: 'toml',
  xml: 'xml',
  sql: 'sql',
  txt: 'text',
};

const FileViewer: React.FC<FileViewerProps> = ({ filePath, onClose }) => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fileName = filePath.split(/[/\\]/).pop() || filePath;
  const ext = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() || '' : '';
  const language = LANGUAGE_MAP[ext] || 'text';

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
      <div className="flex-1 overflow-auto min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-claude-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full px-4">
            <p className="text-xs dark:text-claude-darkTextTertiary text-claude-textTertiary text-center">{error}</p>
          </div>
        ) : content !== null ? (
          <pre className="p-3 text-xs leading-relaxed dark:text-claude-darkText text-claude-text font-mono whitespace-pre overflow-x-auto">
            <code>
              {content.split('\n').map((line, i) => (
                <div key={i} className="flex">
                  <span className="select-none w-10 pr-3 text-right dark:text-claude-darkTextTertiary text-claude-textTertiary shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1">{line || ' '}</span>
                </div>
              ))}
            </code>
          </pre>
        ) : null}
      </div>
    </div>
  );
};

export default FileViewer;
