import React from 'react';
import { i18nService } from '../../services/i18n';
import {
  BugAntIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface TaskTemplate {
  id: string;
  icon: React.ReactNode;
  labelKey: string;
  promptKey: string;
}

const templates: TaskTemplate[] = [
  {
    id: 'fix-bug',
    icon: <BugAntIcon className="w-4 h-4" />,
    labelKey: 'templateFixBug',
    promptKey: 'templateFixBugPrompt',
  },
  {
    id: 'add-feature',
    icon: <SparklesIcon className="w-4 h-4" />,
    labelKey: 'templateAddFeature',
    promptKey: 'templateAddFeaturePrompt',
  },
  {
    id: 'code-review',
    icon: <MagnifyingGlassIcon className="w-4 h-4" />,
    labelKey: 'templateCodeReview',
    promptKey: 'templateCodeReviewPrompt',
  },
  {
    id: 'write-tests',
    icon: <DocumentTextIcon className="w-4 h-4" />,
    labelKey: 'templateWriteTests',
    promptKey: 'templateWriteTestsPrompt',
  },
  {
    id: 'refactor',
    icon: <ArrowPathIcon className="w-4 h-4" />,
    labelKey: 'templateRefactor',
    promptKey: 'templateRefactorPrompt',
  },
];

interface TaskTemplatesProps {
  onSelectTemplate: (prompt: string) => void;
}

const TaskTemplates: React.FC<TaskTemplatesProps> = ({ onSelectTemplate }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelectTemplate(i18nService.t(template.promptKey))}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border dark:border-claude-darkBorder border-claude-border dark:bg-claude-darkSurface bg-claude-surface hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover transition-colors text-xs dark:text-claude-darkTextSecondary text-claude-textSecondary hover:text-claude-accent dark:hover:text-claude-accent"
        >
          {template.icon}
          <span>{i18nService.t(template.labelKey)}</span>
        </button>
      ))}
    </div>
  );
};

export default TaskTemplates;
