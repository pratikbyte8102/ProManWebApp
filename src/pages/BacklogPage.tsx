import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIssues, deleteIssue } from '../api/issues';
import { getStatuses } from '../api/workflow';
import { getProject } from '../api/projects';
import { PriorityBadge, TypeBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { CreateIssueModal } from '../components/issues/CreateIssueModal';
import { IssueDetail } from '../components/issues/IssueDetail';
import { Spinner } from '../components/ui/Spinner';
import type { Issue, IssueType, Priority } from '../types';
import toast from 'react-hot-toast';

export const BacklogPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId!),
  });
  const { data: issuesData, isLoading } = useQuery({
    queryKey: ['issues', projectId, 'backlog'],
    queryFn: () => getIssues(projectId!, { limit: 100 }),
  });
  const { data: statuses } = useQuery({
    queryKey: ['statuses', projectId],
    queryFn: () => getStatuses(projectId!),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteIssue(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Deleted');
    },
  });

  const statusMap = Object.fromEntries((statuses || []).map(s => [s.id, s]));
  const issues = issuesData?.items || [];
  const filtered = issues.filter(i =>
    (!filterType || i.type === filterType) &&
    (!filterPriority || i.priority === filterPriority)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">{project?.name}</h1>
          <p className="text-sm text-gray-500">{project?.key} · Backlog ({filtered.length} issues)</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Create Issue</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-orange"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          {(['EPIC', 'STORY', 'TASK', 'BUG', 'SUBTASK'] as IssueType[]).map(t => <option key={t}>{t}</option>)}
        </select>
        <select
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-orange"
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as Priority[]).map(p => <option key={p}>{p}</option>)}
        </select>
        {(filterType || filterPriority) && (
          <Button size="sm" variant="ghost" onClick={() => { setFilterType(''); setFilterPriority(''); }}>Clear</Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3 w-24">Key</th>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3 w-24">Type</th>
                <th className="text-left px-4 py-3 w-24">Priority</th>
                <th className="text-left px-4 py-3 w-32">Status</th>
                <th className="text-left px-4 py-3 w-32">Assignee</th>
                <th className="text-left px-4 py-3 w-16">SP</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(issue => (
                <tr
                  key={issue.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedIssue(issue)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{issue.issueKey}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{issue.title}</td>
                  <td className="px-4 py-3"><TypeBadge type={issue.type} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={issue.priority} /></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      statusMap[issue.statusId]?.category === 'DONE' ? 'bg-green-100 text-green-700' :
                      statusMap[issue.statusId]?.category === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {issue.statusName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {issue.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar name={issue.assignee.displayName} size="sm" />
                        <span className="text-xs truncate max-w-[80px]">{issue.assignee.displayName}</span>
                      </div>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{issue.storyPoints ?? '—'}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(issue.id); }}
                      className="text-gray-300 hover:text-red-500 text-lg leading-none"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">No issues found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <CreateIssueModal projectId={projectId!} onClose={() => setShowCreate(false)} />}
      {selectedIssue && (
        <IssueDetail
          issueId={selectedIssue.id}
          projectId={projectId!}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
};
