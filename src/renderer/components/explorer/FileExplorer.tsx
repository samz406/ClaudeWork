import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  setTree,
  setSelectedFile,
  setSearchQuery,
  updateNodeChildren,
  toggleNodeExpanded,
  setNodeLoading,
} from '../../store/slices/fileExplorerSlice';
import type { FileTreeNode } from '../../store/slices/fileExplorerSlice';
import FileTreeNodeComponent from './FileTreeNode';
import { i18nService } from '../../services/i18n';
import { MagnifyingGlassIcon, FolderOpenIcon } from '@heroicons/react/24/outline';

interface FileExplorerProps {
  rootPath: string;
  onFileSelect?: (filePath: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ rootPath, onFileSelect }) => {
  const dispatch = useDispatch();
  const { tree, selectedFilePath, searchQuery } = useSelector(
    (state: RootState) => state.fileExplorer
  );
  const [gitBranch, setGitBranch] = useState<string>('');

  useEffect(() => {
    if (!rootPath || !window.electron.git) return;
    window.electron.git.branch(rootPath).then((result: { success: boolean; branch: string }) => {
      if (result.success) {
        setGitBranch(result.branch);
      }
    }).catch(() => {});
  }, [rootPath]);

  const loadDirectory = useCallback(async (dirPath: string): Promise<FileTreeNode[]> => {
    const result = await window.electron.fs.readDir(dirPath);
    if (!result.success || !result.entries) return [];
    return result.entries.map((entry) => ({
      name: entry.name,
      path: entry.path,
      isDirectory: entry.isDirectory,
      isExpanded: false,
      isLoading: false,
    }));
  }, []);

  useEffect(() => {
    if (!rootPath) return;
    const loadRoot = async () => {
      const nodes = await loadDirectory(rootPath);
      dispatch(setTree(nodes));
    };
    loadRoot();
  }, [rootPath, dispatch, loadDirectory]);

  const handleToggleExpand = useCallback(async (node: FileTreeNode) => {
    if (!node.isDirectory) return;

    if (node.isExpanded) {
      dispatch(toggleNodeExpanded(node.path));
      return;
    }

    // Load children if not yet loaded
    if (!node.children) {
      dispatch(setNodeLoading({ path: node.path, isLoading: true }));
      const children = await loadDirectory(node.path);
      dispatch(updateNodeChildren({ path: node.path, children }));
    } else {
      dispatch(toggleNodeExpanded(node.path));
    }
  }, [dispatch, loadDirectory]);

  const handleFileClick = useCallback((filePath: string) => {
    dispatch(setSelectedFile(filePath));
    onFileSelect?.(filePath);
  }, [dispatch, onFileSelect]);

  const filterNodes = useCallback((nodes: FileTreeNode[], query: string): FileTreeNode[] => {
    if (!query) return nodes;
    const lower = query.toLowerCase();
    return nodes.filter(node => {
      if (node.name.toLowerCase().includes(lower)) return true;
      if (node.isDirectory && node.children) {
        return filterNodes(node.children, query).length > 0;
      }
      return false;
    });
  }, []);

  const displayNodes = searchQuery ? filterNodes(tree, searchQuery) : tree;
  const rootName = rootPath.split(/[/\\]/).pop() || rootPath;

  return (
    <div className="flex flex-col h-full dark:bg-claude-darkBg bg-claude-bg">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b dark:border-claude-darkBorder border-claude-border shrink-0">
        <FolderOpenIcon className="w-4 h-4 dark:text-claude-accent text-claude-accent shrink-0" />
        <span className="text-xs font-medium dark:text-claude-darkText text-claude-text truncate uppercase tracking-wider">
          {i18nService.t('explorerTitle')}
        </span>
      </div>

      {/* Workspace Root Name */}
      <div className="px-3 py-1.5 border-b dark:border-claude-darkBorder border-claude-border shrink-0">
        <span className="text-xs font-semibold dark:text-claude-darkTextSecondary text-claude-textSecondary truncate block" title={rootPath}>
          {rootName}
        </span>
        {gitBranch && (
          <div className="mt-1 flex items-center gap-1.5 text-xs dark:text-claude-darkTextTertiary text-claude-textTertiary">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M11.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm-2.25.75a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.492 2.492 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25zM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM3.5 3.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0z" /></svg>
            <span className="truncate">{gitBranch}</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="px-2 py-1.5 shrink-0">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 dark:text-claude-darkTextTertiary text-claude-textTertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder={i18nService.t('explorerSearch')}
            className="w-full pl-7 pr-2 py-1 text-xs rounded-md dark:bg-claude-darkSurface bg-claude-surface border dark:border-claude-darkBorder border-claude-border dark:text-claude-darkText text-claude-text placeholder:dark:text-claude-darkTextTertiary placeholder:text-claude-textTertiary focus:outline-none focus:ring-1 focus:ring-claude-accent"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto min-h-0 px-1">
        {displayNodes.length === 0 ? (
          <div className="px-3 py-4 text-xs dark:text-claude-darkTextTertiary text-claude-textTertiary text-center">
            {searchQuery ? i18nService.t('explorerNoResults') : i18nService.t('explorerEmpty')}
          </div>
        ) : (
          <div className="py-1">
            {displayNodes.map((node) => (
              <FileTreeNodeComponent
                key={node.path}
                node={node}
                depth={0}
                selectedPath={selectedFilePath}
                onToggleExpand={handleToggleExpand}
                onFileClick={handleFileClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
