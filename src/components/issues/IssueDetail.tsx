import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIssue, updateIssue, transitionIssue, getTransitions, deleteIssue, removeFromSprint } from '../../api/issues';
import { getWatchers, watch, unwatch } from '../../api/watchers';
import { getSprints } from '../../api/sprints';
import { CommentList } from '../comments/CommentList';
import { ActivityFeed } from '../activity/ActivityFeed';
import { PriorityBadge, TypeBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface Props {
  issueId: string;
  projectId: string;
  onClose: () => void;
}

interface TransitionEntry {
  toStatusId: string;
  toStatusName: string;
}

interface TransitionGroup {
  fromStatusId: string;
  fromStatusName: string;
  allowedTransitions: TransitionEntry[];
}

export const IssueDetail: React.FC<Props> = ({ issueId, projectId, onClose }) => {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  const { data: issue, isLoading } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => getIssue(issueId),
  });

  const { data: transitionsRaw } = useQuery({
    queryKey: ['transitions', issueId],
    queryFn: () => getTransitions(issueId),
  });

  const { data: watchers } = useQuery({
    queryKey: ['watchers', issueId],
    queryFn: () => getWatchers(issueId),
  });

  const { data: sprints } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => getSprints(projectId),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateIssue(issueId, { ...(data as Partial<typeof issue>), version: issue!.version } as Parameters<typeof updateIssue>[1]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issue', issueId] }),
    onError: (e: { response?: { data?: { message?: string } } }) =>
      toast.error(e.response?.data?.message ?? 'Update failed'),
  });

  const transitionMutation = useMutation({
    mutationFn: (toStatusId: string) => transitionIssue(issueId, toStatusId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
    },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      toast.error(e.response?.data?.message ?? 'Transition failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteIssue(issueId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      onClose();
      toast.success('Issue deleted');
    },
  });

  const watchMutation = useMutation({
    mutationFn: () => watch(issueId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchers', issueId] }),
    onError: () => toast.error('Already watching'),
  });

  const unwatchMutation = useMutation({
    mutationFn: () => unwatch(issueId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchers', issueId] }),
  });

  const sprintMutation = useMutation({
    mutationFn: (sprintId: string | null) =>
      sprintId
        ? updateIssue(issueId, { sprintId, version: issue!.version })
        : removeFromSprint(issueId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Sprint updated');
    },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      toast.error(e.response?.data?.message ?? 'Failed to update sprint'),
  });

  if (isLoading || !issue) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
        onClick={onClose}
      >
        <div className="bg-white rounded-xl p-8" onClick={e => e.stopPropagation()}>
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  const allTransitions: TransitionEntry[] = [];
  if (Array.isArray(transitionsRaw)) {
    (transitionsRaw as TransitionGroup[]).forEach(t => {
      t.allowedTransitions?.forEach(at => {
        if (!allTransitions.find(x => x.toStatusId === at.toStatusId)) {
          allTransitions.push(at);
        }
      });
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:rounded-xl sm:max-w-4xl max-h-screen sm:max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-mono text-gray-500">{issue.issueKey}</span>
            <TypeBadge type={issue.type} />
            <PriorityBadge priority={issue.priority} />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (confirm('Delete this issue?')) deleteMutation.mutate();
              }}
            >
              Delete
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Main content */}
          <div className="flex-1 p-6">
            {editingTitle ? (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  updateMutation.mutate({ title: titleValue });
                  setEditingTitle(false);
                }}
              >
                <input
                  className="w-full text-xl font-bold border-b-2 border-brand-orange outline-none pb-1 mb-4"
                  value={titleValue}
                  onChange={e => setTitleValue(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2 mb-4">
                  <Button size="sm" type="submit" loading={updateMutation.isPending}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    onClick={() => setEditingTitle(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <h2
                className="text-xl font-bold text-gray-900 mb-4 cursor-pointer hover:text-brand-orange"
                onClick={() => {
                  setTitleValue(issue.title);
                  setEditingTitle(true);
                }}
                title="Click to edit"
              >
                {issue.title}
              </h2>
            )}

            {/* Status transitions */}
            {allTransitions.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Transition to
                </p>
                <div className="flex flex-wrap gap-2">
                  {allTransitions.map(t => (
                    <Button
                      key={t.toStatusId}
                      size="sm"
                      variant="secondary"
                      onClick={() => transitionMutation.mutate(t.toStatusId)}
                      loading={transitionMutation.isPending}
                    >
                      {t.toStatusName}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Description
              </p>
              {issue.description ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{issue.description}</p>
              ) : (
                <span className="text-gray-400 italic text-sm">No description</span>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b flex gap-4 mb-4">
              {(['comments', 'activity'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? 'border-brand-orange text-brand-orange'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {activeTab === 'comments' ? (
              <CommentList issueId={issueId} />
            ) : (
              <ActivityFeed issueId={issueId} />
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l p-6 bg-gray-50 flex-shrink-0">
            <div className="flex flex-col gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Status
                </p>
                <span className="font-medium text-gray-800">{issue.statusName}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Assignee
                </p>
                {issue.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar name={issue.assignee.displayName} size="sm" />
                    <span>{issue.assignee.displayName}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">Unassigned</span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Sprint
                </p>
                {sprints && sprints.length > 0 ? (
                  <select
                    className="border border-gray-300 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-brand-orange w-full"
                    value={issue.sprintId ?? ''}
                    onChange={e => sprintMutation.mutate(e.target.value || null)}
                    disabled={sprintMutation.isPending}
                  >
                    <option value="">No Sprint (Backlog)</option>
                    {sprints.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.status})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-400">No sprints</span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Reporter
                </p>
                <div className="flex items-center gap-2">
                  <Avatar name={issue.reporter.displayName} size="sm" />
                  <span>{issue.reporter.displayName}</span>
                </div>
              </div>
              {issue.storyPoints != null && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Story Points
                  </p>
                  <span className="font-medium">{issue.storyPoints}</span>
                </div>
              )}
              {issue.labels.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Labels
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {issue.labels.map(l => (
                      <span
                        key={l}
                        className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Watchers
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {watchers?.map(w => (
                    <Avatar key={w.id} name={w.displayName} size="sm" />
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="ghost" onClick={() => watchMutation.mutate()}>
                    Watch
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => unwatchMutation.mutate()}>
                    Unwatch
                  </Button>
                </div>
              </div>
              <div className="pt-2 border-t text-xs text-gray-400">
                <p>Created {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</p>
                <p>Updated {formatDistanceToNow(new Date(issue.updatedAt), { addSuffix: true })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
