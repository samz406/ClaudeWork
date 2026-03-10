import React from 'react';
import { FolderIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { i18nService } from '../../services/i18n';

interface WorkspaceHeaderProps {
  workingDirectory: string;
  onChangeWorkspace: () => void;
}

const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ workingDirectory, onChangeWorkspace }) => {
  if (!workingDirectory) return null;

  const projectName = workingDirectory.split(/[/\\]/).pop() || workingDirectory;

  return (
    <button
      onClick={onChangeWorkspace}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs dark:text-claude-darkTextSecondary text-claude-textSecondary hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover transition-colors group max-w-[200px]"
      title={`${i18nService.t('workspaceCurrentProject')}: ${workingDirectory}`}
    >
      <FolderIcon className="w-3.5 h-3.5 shrink-0 text-claude-accent" />
      <span className="truncate">{projectName}</span>
      <ArrowsRightLeftIcon className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

export default WorkspaceHeader;
