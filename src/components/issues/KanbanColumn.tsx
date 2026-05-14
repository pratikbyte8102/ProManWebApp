import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Issue, WorkflowStatus } from '../../types';
import { IssueCard } from './IssueCard';

interface Props {
  status: WorkflowStatus;
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onAddIssue: (statusId: string) => void;
}

const categoryColor: Record<string, string> = {
  TODO: 'bg-gray-400', IN_PROGRESS: 'bg-blue-500', DONE: 'bg-green-500',
};

export const KanbanColumn: React.FC<Props> = ({ status, issues, onIssueClick, onAddIssue }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status.id });
  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2.5 h-2.5 rounded-full ${categoryColor[status.category] ?? 'bg-gray-400'}`} />
        <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{status.name}</h3>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{issues.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 min-h-24 rounded-xl p-2 transition-colors ${isOver ? 'bg-blue-50' : 'bg-gray-100'}`}
      >
        <SortableContext items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map(issue => (
            <IssueCard key={issue.id} issue={issue} onClick={() => onIssueClick(issue)} />
          ))}
        </SortableContext>
        <button
          onClick={() => onAddIssue(status.id)}
          className="text-xs text-gray-400 hover:text-brand-orange hover:bg-white rounded-lg py-2 transition-colors text-left px-2"
        >
          + Add issue
        </button>
      </div>
    </div>
  );
};
