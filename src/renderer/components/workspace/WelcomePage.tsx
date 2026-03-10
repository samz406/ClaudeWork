import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addRecentWorkspace } from '../../store/slices/workspaceSlice';
import { i18nService } from '../../services/i18n';
import WorkspaceCard from './WorkspaceCard';
import { FolderOpenIcon } from '@heroicons/react/24/outline';

interface WelcomePageProps {
  onWorkspaceSelected: (path: string) => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onWorkspaceSelected }) => {
  const dispatch = useDispatch();
  const recentWorkspaces = useSelector((state: RootState) => state.workspace.recentWorkspaces);

  const handleOpenFolder = async () => {
    const result = await window.electron.dialog.selectDirectory();
    if (result.success && result.path) {
      const dirPath = result.path;
      const name = dirPath.split(/[/\\]/).pop() || dirPath;
      dispatch(addRecentWorkspace({
        path: dirPath,
        name,
        lastOpenedAt: Date.now(),
      }));
      onWorkspaceSelected(dirPath);
    }
  };

  const handleSelectWorkspace = (path: string) => {
    const name = path.split(/[/\\]/).pop() || path;
    dispatch(addRecentWorkspace({
      path,
      name,
      lastOpenedAt: Date.now(),
    }));
    onWorkspaceSelected(path);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center dark:bg-claude-darkBg bg-claude-bg min-h-0 overflow-y-auto">
      <div className="max-w-2xl w-full px-6 py-12 space-y-10">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-claude-accent to-claude-accentHover flex items-center justify-center shadow-glow-accent">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-claude-darkText text-claude-text">
            {i18nService.t('welcomeTitle')}
          </h1>
          <p className="text-sm dark:text-claude-darkTextSecondary text-claude-textSecondary max-w-md mx-auto">
            {i18nService.t('welcomeSubtitle')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleOpenFolder}
            className="flex items-center gap-3 px-8 py-4 bg-claude-accent hover:bg-claude-accentHover text-white rounded-xl shadow-md hover:shadow-lg transition-all text-base font-medium"
          >
            <FolderOpenIcon className="w-6 h-6" />
            {i18nService.t('welcomeOpenFolder')}
          </button>
        </div>

        {/* Recent Workspaces */}
        {recentWorkspaces.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium dark:text-claude-darkTextSecondary text-claude-textSecondary uppercase tracking-wider">
              {i18nService.t('welcomeRecentProjects')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.path}
                  name={workspace.name}
                  path={workspace.path}
                  lastOpenedAt={workspace.lastOpenedAt}
                  onClick={() => handleSelectWorkspace(workspace.path)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;
