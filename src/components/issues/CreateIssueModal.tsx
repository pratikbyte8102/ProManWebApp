import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createIssue } from '../../api/issues';
import { getSprints } from '../../api/sprints';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { IssueType, Priority } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  projectId: string;
  defaultStatusId?: string;
  onClose: () => void;
}

export const CreateIssueModal: React.FC<Props> = ({ projectId, onClose }) => {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    type: 'TASK' as IssueType,
    title: '',
    description: '',
    priority: 'MEDIUM' as Priority,
    storyPoints: '',
    sprintId: '',
  });
  const mutation = useMutation({
    mutationFn: () => createIssue(projectId, {
      type: form.type,
      title: form.title,
      description: form.description || undefined,
      priority: form.priority,
      storyPoints: form.storyPoints ? Number(form.storyPoints) : undefined,
      sprintId: form.sprintId || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      toast.success('Issue created');
      onClose();
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create issue');
    },
  });

  const { data: sprints } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => getSprints(projectId),
  });

  return (
    <Modal open onClose={onClose} title="Create Issue" size="lg">
      <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-orange outline-none"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as IssueType }))}
            >
              {(['EPIC', 'STORY', 'TASK', 'BUG', 'SUBTASK'] as IssueType[]).map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Priority</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-orange outline-none"
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
            >
              {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as Priority[]).map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required maxLength={500} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-orange outline-none resize-none"
            rows={4}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>
        <Input label="Story Points" type="number" min="0" value={form.storyPoints} onChange={e => setForm(f => ({ ...f, storyPoints: e.target.value }))} />
        {sprints && sprints.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Sprint</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-orange outline-none"
              value={form.sprintId}
              onChange={e => setForm(f => ({ ...f, sprintId: e.target.value }))}
            >
              <option value="">No Sprint (Backlog)</option>
              {sprints.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Create Issue</Button>
        </div>
      </form>
    </Modal>
  );
};
