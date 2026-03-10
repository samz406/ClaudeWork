import React from 'react';
import { FolderIcon } from '@heroicons/react/24/outline';
import { i18nService } from '../../services/i18n';

interface WorkspaceCardProps {
  name: string;
  path: string;
  lastOpenedAt: number;
  onClick: () => void;
}

const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ name, path, lastOpenedAt, onClick }) => {
  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return i18nService.t('timeJustNow');
    if (minutes < 60) return `${minutes} ${i18nService.t('timeMinutesAgo')}`;
    if (hours < 24) return `${hours} ${i18nService.t('timeHoursAgo')}`;
    return `${days} ${i18nService.t('timeDaysAgo')}`;
  };

  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 p-4 rounded-xl border dark:border-claude-darkBorder border-claude-border dark:bg-claude-darkSurface bg-claude-surface hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover transition-colors text-left group"
    >
      <div className="shrink-0 w-10 h-10 rounded-lg dark:bg-claude-darkBg bg-claude-bg flex items-center justify-center">
        <FolderIcon className="w-5 h-5 dark:text-claude-accent text-claude-accent" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium dark:text-claude-darkText text-claude-text truncate">
          {name}
        </div>
        <div className="text-xs dark:text-claude-darkTextTertiary text-claude-textTertiary truncate mt-0.5">
          {path}
        </div>
        <div className="text-xs dark:text-claude-darkTextTertiary text-claude-textTertiary mt-1">
          {formatTime(lastOpenedAt)}
        </div>
      </div>
    </button>
  );
};

export default WorkspaceCard;
