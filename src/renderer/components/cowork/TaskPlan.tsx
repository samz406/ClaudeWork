import React, { useState, useCallback } from 'react';
import { CheckCircleIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  children?: TaskItem[];
}

interface TaskPlanProps {
  title: string;
  tasks: TaskItem[];
  onToggleTask?: (taskId: string) => void;
  onClose?: () => void;
  readOnly?: boolean;
}

function countTasks(tasks: TaskItem[]): { total: number; completed: number } {
  let total = 0;
  let completed = 0;
  for (const task of tasks) {
    total++;
    if (task.completed) completed++;
    if (task.children) {
      const sub = countTasks(task.children);
      total += sub.total;
      completed += sub.completed;
    }
  }
  return { total, completed };
}

const TaskItemRow: React.FC<{
  task: TaskItem;
  depth: number;
  onToggle?: (taskId: string) => void;
  readOnly: boolean;
}> = ({ task, depth, onToggle, readOnly }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = task.children && task.children.length > 0;

  const handleToggle = useCallback(() => {
    if (!readOnly && onToggle) {
      onToggle(task.id);
    }
  }, [readOnly, onToggle, task.id]);

  return (
    <div>
      <div
        className={`flex items-start gap-2 py-1.5 px-2 rounded-md transition-colors
          ${!readOnly ? 'hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover cursor-pointer' : ''}
          ${depth > 0 ? 'ml-6' : ''}`}
        onClick={handleToggle}
      >
        <button
          className="flex-shrink-0 mt-0.5"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          disabled={readOnly}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed ? (
            <CheckCircleSolid className="w-5 h-5 text-green-500" />
          ) : (
            <CheckCircleIcon className="w-5 h-5 text-claude-textSecondary dark:text-claude-darkTextSecondary" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <span
            className={`text-sm leading-5 ${
              task.completed
                ? 'line-through text-claude-textSecondary dark:text-claude-darkTextSecondary'
                : 'text-claude-text dark:text-claude-darkText'
            }`}
          >
            {task.title}
          </span>
          {task.description && (
            <p className="text-xs text-claude-textSecondary dark:text-claude-darkTextSecondary mt-0.5 leading-4">
              {task.description}
            </p>
          )}
        </div>
        {hasChildren && (
          <button
            className="flex-shrink-0 mt-0.5 text-claude-textSecondary dark:text-claude-darkTextSecondary hover:text-claude-text dark:hover:text-claude-darkText"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            aria-label={expanded ? 'Collapse sub-tasks' : 'Expand sub-tasks'}
          >
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {task.children?.map((child) => (
            <TaskItemRow
              key={child.id}
              task={child}
              depth={depth + 1}
              onToggle={onToggle}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TaskPlan: React.FC<TaskPlanProps> = ({ title, tasks, onToggleTask, onClose, readOnly = false }) => {
  const { total, completed } = countTasks(tasks);
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-lg border border-claude-border dark:border-claude-darkBorder bg-claude-surface dark:bg-claude-darkSurface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-claude-border dark:border-claude-darkBorder bg-claude-surfaceMuted dark:bg-claude-darkSurfaceMuted">
        <div className="flex items-center gap-2">
          <ClipboardDocumentListIcon className="w-4 h-4 text-claude-accent" />
          <span className="text-sm font-medium text-claude-text dark:text-claude-darkText">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-claude-textSecondary dark:text-claude-darkTextSecondary">
            {completed}/{total} completed
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-claude-textSecondary dark:text-claude-darkTextSecondary hover:text-claude-text dark:hover:text-claude-darkText"
              aria-label="Close task plan"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-claude-surfaceInset dark:bg-claude-darkSurfaceInset">
        <div
          className="h-full bg-claude-accent transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Task list */}
      <div className="p-2">
        {tasks.map((task) => (
          <TaskItemRow
            key={task.id}
            task={task}
            depth={0}
            onToggle={onToggleTask}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskPlan;
