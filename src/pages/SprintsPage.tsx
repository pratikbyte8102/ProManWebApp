import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSprints, createSprint, updateSprint, deleteSprint } from '../api/sprints';
import { getIssues } from '../api/issues';
import { getProject } from '../api/projects';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { PriorityBadge, TypeBadge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import type { Sprint, SprintStatus } from '../types';
import toast from 'react-hot-toast';

const statusColors: Record<SprintStatus, string> = {
  PLANNING: 'bg-gray-100 text-gray-600',
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

const CreateSprintModal: React.FC<{ projectId: string; onClose: () => void }> = ({ projectId, onClose }) => {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', goal: '', startDate: '', endDate: '' });
  const mutation = useMutation({
    mutationFn: () => createSprint(projectId, {
      name: form.name,
      goal: form.goal || undefined,
      startDate: form.startDate,
      endDate: form.endDate,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] });
      onClose();
      toast.success('Sprint created');
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed');
    },
  });
  return (
    <Modal open onClose={onClose} title="Create Sprint">
      <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="flex flex-col gap-4">
        <Input label="Sprint Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        <Input label="Goal" value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} />
        <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
        <Input label="End Date" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Create</Button>
        </div>
      </form>
    </Modal>
  );
};

export const SprintsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId!),
  });
  const { data: sprints, isLoading } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => getSprints(projectId!),
  });
  const { data: issuesData } = useQuery({
    queryKey: ['issues', projectId, 'sprint-view'],
    queryFn: () => getIssues(projectId!, { limit: 200 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sprint> }) => updateSprint(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sprints', projectId] }),
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSprint(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sprints', projectId] }),
  });

  const issuesBySprint = Object.fromEntries(
    (sprints || []).map(s => [
      s.id,
      (issuesData?.items || []).filter(i => i.sprintId === s.id),
    ])
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">{project?.name}</h1>
          <p className="text-sm text-gray-500">Sprints</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Create Sprint</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="flex flex-col gap-4">
          {sprints?.map(sprint => (
            <div key={sprint.id} className="bg-white rounded-xl border">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-800">{sprint.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[sprint.status]}`}>
                    {sprint.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {sprint.status === 'PLANNING' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateMutation.mutate({ id: sprint.id, data: { status: 'ACTIVE' } })}
                      loading={updateMutation.isPending}
                    >
                      Start Sprint
                    </Button>
                  )}
                  {sprint.status === 'ACTIVE' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateMutation.mutate({ id: sprint.id, data: { status: 'COMPLETED' } })}
                      loading={updateMutation.isPending}
                    >
                      Complete Sprint
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => { if (confirm('Delete sprint?')) deleteMutation.mutate(sprint.id); }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <div className="px-5 py-3 flex items-center gap-6 text-sm text-gray-500 border-b bg-gray-50 flex-wrap">
                {sprint.goal && <span className="italic">{sprint.goal}</span>}
                <span>{sprint.startDate} &rarr; {sprint.endDate}</span>
                <span>{issuesBySprint[sprint.id]?.length || 0} issues</span>
              </div>
              <div className="divide-y">
                {issuesBySprint[sprint.id]?.slice(0, 5).map(issue => (
                  <div key={issue.id} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                    <span className="font-mono text-xs text-gray-400 w-20 flex-shrink-0">{issue.issueKey}</span>
                    <TypeBadge type={issue.type} />
                    <span className="flex-1 truncate text-gray-700">{issue.title}</span>
                    <PriorityBadge priority={issue.priority} />
                  </div>
                ))}
                {(issuesBySprint[sprint.id]?.length ?? 0) > 5 && (
                  <div className="px-5 py-2 text-xs text-gray-400">
                    +{issuesBySprint[sprint.id].length - 5} more issues
                  </div>
                )}
                {!issuesBySprint[sprint.id]?.length && (
                  <div className="px-5 py-4 text-sm text-gray-400 text-center">No issues in this sprint</div>
                )}
              </div>
            </div>
          ))}
          {!sprints?.length && (
            <div className="text-center py-20 text-gray-400">
              <p className="font-medium">No sprints yet</p>
              <p className="text-sm mt-1">Create a sprint to start planning your work</p>
            </div>
          )}
        </div>
      )}

      {showCreate && <CreateSprintModal projectId={projectId!} onClose={() => setShowCreate(false)} />}
    </div>
  );
};
