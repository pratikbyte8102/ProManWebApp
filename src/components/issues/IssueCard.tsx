import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Issue } from '../../types';
import { PriorityBadge, TypeBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';

interface Props { issue: Issue; onClick: () => void; }

export const IssueCard: React.FC<Props> = ({ issue, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-lg border p-3 cursor-pointer hover:border-brand-orange hover:shadow-sm transition-all ${isDragging ? 'opacity-40 shadow-lg' : ''}`}
    >
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <TypeBadge type={issue.type} />
        <PriorityBadge priority={issue.priority} />
      </div>
      <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">{issue.title}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-400 font-mono">{issue.issueKey}</span>
        {issue.assignee && <Avatar name={issue.assignee.displayName} size="sm" />}
      </div>
      {issue.storyPoints != null && (
        <div className="mt-2 text-xs text-gray-400">{issue.storyPoints} pts</div>
      )}
    </div>
  );
};
