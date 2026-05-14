import React from 'react';
import type { Priority, IssueType } from '../../types';

const priorityStyles: Record<Priority, string> = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW: 'bg-green-100 text-green-700 border-green-200',
};

const typeStyles: Record<IssueType, string> = {
  EPIC: 'bg-purple-100 text-purple-700',
  STORY: 'bg-green-100 text-green-700',
  TASK: 'bg-blue-100 text-blue-700',
  BUG: 'bg-red-100 text-red-700',
  SUBTASK: 'bg-gray-100 text-gray-600',
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${priorityStyles[priority]}`}>
    {priority}
  </span>
);

export const TypeBadge: React.FC<{ type: IssueType }> = ({ type }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeStyles[type]}`}>
    {type}
  </span>
);
