import React from 'react';
import type { FileTreeNode } from '../../store/slices/fileExplorerSlice';
import {
  FolderIcon,
  FolderOpenIcon,
  DocumentIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface FileTreeNodeProps {
  node: FileTreeNode;
  depth: number;
  selectedPath: string | null;
  onToggleExpand: (node: FileTreeNode) => void;
  onFileClick: (filePath: string) => void;
}

const FILE_ICON_COLORS: Record<string, string> = {
  ts: 'text-blue-500',
  tsx: 'text-blue-500',
  js: 'text-yellow-500',
  jsx: 'text-yellow-500',
  json: 'text-yellow-600',
  md: 'text-gray-500',
  css: 'text-purple-500',
  html: 'text-orange-500',
  py: 'text-green-500',
  rs: 'text-orange-600',
  go: 'text-cyan-500',
};

const getFileExtension = (name: string): string => {
  const parts = name.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

const FileTreeNodeComponent: React.FC<FileTreeNodeProps> = ({
  node,
  depth,
  selectedPath,
  onToggleExpand,
  onFileClick,
}) => {
  const isSelected = selectedPath === node.path;
  const ext = getFileExtension(node.name);
  const iconColor = FILE_ICON_COLORS[ext] || 'dark:text-claude-darkTextTertiary text-claude-textTertiary';

  const handleClick = () => {
    if (node.isDirectory) {
      onToggleExpand(node);
    } else {
      onFileClick(node.path);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`
          flex items-center gap-1 w-full text-left py-0.5 px-1 rounded-md text-xs
          hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover
          transition-colors group
          ${isSelected ? 'bg-claude-accent/10 dark:bg-claude-accent/10 text-claude-accent' : 'dark:text-claude-darkText text-claude-text'}
        `}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        title={node.path}
      >
        {/* Expand indicator for directories */}
        {node.isDirectory ? (
          <ChevronRightIcon
            className={`w-3 h-3 shrink-0 transition-transform duration-150 dark:text-claude-darkTextTertiary text-claude-textTertiary ${
              node.isExpanded ? 'rotate-90' : ''
            }`}
          />
        ) : (
          <span className="w-3 shrink-0" />
        )}

        {/* Icon */}
        {node.isDirectory ? (
          node.isExpanded ? (
            <FolderOpenIcon className="w-4 h-4 shrink-0 text-claude-accent" />
          ) : (
            <FolderIcon className="w-4 h-4 shrink-0 dark:text-claude-darkTextSecondary text-claude-textSecondary" />
          )
        ) : (
          <DocumentIcon className={`w-4 h-4 shrink-0 ${iconColor}`} />
        )}

        {/* Name */}
        <span className="truncate">
          {node.name}
        </span>

        {/* Loading indicator */}
        {node.isLoading && (
          <span className="ml-auto shrink-0 w-3 h-3 border border-claude-accent border-t-transparent rounded-full animate-spin" />
        )}
      </button>

      {/* Children */}
      {node.isDirectory && node.isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNodeComponent
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onToggleExpand={onToggleExpand}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTreeNodeComponent;
