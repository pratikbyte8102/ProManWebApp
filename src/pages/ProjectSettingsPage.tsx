import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProject, updateProject, deleteProject } from '../api/projects';
import {
  getStatuses, createStatus, deleteStatus,
  getTransitions, createTransition, deleteTransition,
} from '../api/workflow';
import { getCustomFields, createCustomField, deleteCustomField } from '../api/customFields';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import type { StatusCategory, FieldType } from '../types';
import toast from 'react-hot-toast';

type Tab = 'general' | 'workflow' | 'customfields';

const categoryDot: Record<string, string> = {
  DONE: 'bg-green-500',
  IN_PROGRESS: 'bg-blue-500',
  TODO: 'bg-gray-400',
};

export const ProjectSettingsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('general');

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId!),
  });
  const { data: statuses } = useQuery({
    queryKey: ['statuses', projectId],
    queryFn: () => getStatuses(projectId!),
    enabled: tab === 'workflow',
  });
  const { data: transitions } = useQuery({
    queryKey: ['workflow-transitions', projectId],
    queryFn: () => getTransitions(projectId!),
    enabled: tab === 'workflow',
  });
  const { data: customFields } = useQuery({
    queryKey: ['custom-fields', projectId],
    queryFn: () => getCustomFields(projectId!),
    enabled: tab === 'customfields',
  });

  // ── General tab state ──────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description ?? '');
    }
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: () => updateProject(projectId!, { name, description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Saved');
    },
    onError: () => toast.error('Failed to save'),
  });

  const deleteProjMutation = useMutation({
    mutationFn: () => deleteProject(projectId!),
    onSuccess: () => {
      navigate('/projects');
      toast.success('Project deleted');
    },
    onError: () => toast.error('Failed to delete project'),
  });

  // ── Workflow tab state ─────────────────────────────────────────────────────
  const [newStatus, setNewStatus] = useState({ name: '', category: 'TODO' as StatusCategory });
  const [newTransition, setNewTransition] = useState({ fromStatusId: '', toStatusId: '' });

  const sortedStatuses = [...(statuses ?? [])].sort((a, b) => a.position - b.position);
  const statusMap = Object.fromEntries(sortedStatuses.map(s => [s.id, s.name]));

  const createStatusMutation = useMutation({
    mutationFn: () =>
      createStatus(projectId!, {
        name: newStatus.name,
        category: newStatus.category,
        position: sortedStatuses.length + 1,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['statuses', projectId] });
      setNewStatus({ name: '', category: 'TODO' });
      toast.success('Status created');
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? 'Failed');
    },
  });

  const deleteStatusMutation = useMutation({
    mutationFn: (id: string) => deleteStatus(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['statuses', projectId] }),
    onError: () => toast.error('Cannot delete status in use'),
  });

  const createTransitionMutation = useMutation({
    mutationFn: () => createTransition(projectId!, newTransition),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflow-transitions', projectId] });
      setNewTransition({ fromStatusId: '', toStatusId: '' });
      toast.success('Transition added');
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? 'Failed');
    },
  });

  const deleteTransitionMutation = useMutation({
    mutationFn: (id: string) => deleteTransition(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workflow-transitions', projectId] }),
  });

  // ── Custom Fields tab state ────────────────────────────────────────────────
  const [newField, setNewField] = useState({ name: '', fieldType: 'TEXT' as FieldType, required: false });

  const createFieldMutation = useMutation({
    mutationFn: () => createCustomField(projectId!, newField),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custom-fields', projectId] });
      setNewField({ name: '', fieldType: 'TEXT', required: false });
      toast.success('Field created');
    },
    onError: () => toast.error('Failed to create field'),
  });

  const deleteFieldMutation = useMutation({
    mutationFn: (id: string) => deleteCustomField(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-fields', projectId] }),
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-800">Project Settings</h1>
        <p className="text-sm text-gray-500">{project?.key} · {project?.name}</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {(['general', 'workflow', 'customfields'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-navy-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'customfields' ? 'Custom Fields' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── General ── */}
      {tab === 'general' && (
        <div className="bg-white rounded-xl border p-6 flex flex-col gap-4">
          <Input label="Project Name" value={name} onChange={e => setName(e.target.value)} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-orange resize-none"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <Button
            onClick={() => updateMutation.mutate()}
            loading={updateMutation.isPending}
            className="w-fit"
          >
            Save Changes
          </Button>

          <div className="pt-4 border-t">
            <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-500 mb-3">
              Permanently delete this project and all its data. This cannot be undone.
            </p>
            <Button
              variant="danger"
              loading={deleteProjMutation.isPending}
              onClick={() => {
                if (confirm('Delete project and ALL its data? This cannot be undone.')) {
                  deleteProjMutation.mutate();
                }
              }}
            >
              Delete Project
            </Button>
          </div>
        </div>
      )}

      {/* ── Workflow ── */}
      {tab === 'workflow' && (
        <div className="flex flex-col gap-6">
          {/* Statuses */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold text-gray-800 mb-4">Statuses</h3>
            <div className="flex flex-col gap-2 mb-4">
              {sortedStatuses.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${categoryDot[s.category] ?? 'bg-gray-400'}`} />
                    <span className="font-medium text-gray-800">{s.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{s.category}</span>
                  </div>
                  <button
                    onClick={() => deleteStatusMutation.mutate(s.id)}
                    className="text-gray-300 hover:text-red-500 text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
              {!sortedStatuses.length && (
                <p className="text-sm text-gray-400 text-center py-4">No statuses yet</p>
              )}
            </div>
            <form
              onSubmit={e => { e.preventDefault(); createStatusMutation.mutate(); }}
              className="flex gap-2"
            >
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-brand-orange"
                placeholder="Status name"
                value={newStatus.name}
                onChange={e => setNewStatus(f => ({ ...f, name: e.target.value }))}
                required
              />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-orange"
                value={newStatus.category}
                onChange={e => setNewStatus(f => ({ ...f, category: e.target.value as StatusCategory }))}
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
              <Button type="submit" loading={createStatusMutation.isPending}>Add</Button>
            </form>
          </div>

          {/* Transitions */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold text-gray-800 mb-1">Transitions</h3>
            <p className="text-xs text-gray-400 mb-4">
              Define which status changes are allowed. Issues can only move between statuses with a transition.
            </p>
            <div className="flex flex-col gap-2 mb-4">
              {(transitions ?? []).map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                  <span className="text-gray-700">
                    <span className="font-medium">{statusMap[t.fromStatusId] ?? t.fromStatusId}</span>
                    <span className="text-gray-400 mx-2">→</span>
                    <span className="font-medium">{statusMap[t.toStatusId] ?? t.toStatusId}</span>
                  </span>
                  <button
                    onClick={() => deleteTransitionMutation.mutate(t.id)}
                    className="text-gray-300 hover:text-red-500 text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
              {!(transitions ?? []).length && (
                <p className="text-sm text-gray-400 text-center py-4">No transitions defined</p>
              )}
            </div>
            <form
              onSubmit={e => { e.preventDefault(); createTransitionMutation.mutate(); }}
              className="flex gap-2"
            >
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-brand-orange"
                value={newTransition.fromStatusId}
                onChange={e => setNewTransition(f => ({ ...f, fromStatusId: e.target.value }))}
                required
              >
                <option value="">From status...</option>
                {sortedStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-brand-orange"
                value={newTransition.toStatusId}
                onChange={e => setNewTransition(f => ({ ...f, toStatusId: e.target.value }))}
                required
              >
                <option value="">To status...</option>
                {sortedStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <Button type="submit" loading={createTransitionMutation.isPending}>Add</Button>
            </form>
          </div>
        </div>
      )}

      {/* ── Custom Fields ── */}
      {tab === 'customfields' && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold text-gray-800 mb-1">Custom Fields</h3>
          <p className="text-xs text-gray-400 mb-4">
            Define extra fields that appear on every issue in this project.
          </p>
          <div className="flex flex-col gap-2 mb-4">
            {customFields?.map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-800">{f.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{f.fieldType}</span>
                  {f.required && <span className="text-xs text-red-500 font-medium">Required</span>}
                </div>
                <button
                  onClick={() => deleteFieldMutation.mutate(f.id)}
                  className="text-gray-300 hover:text-red-500 text-xl leading-none"
                >
                  ×
                </button>
              </div>
            ))}
            {!customFields?.length && (
              <p className="text-sm text-gray-400 text-center py-4">No custom fields yet</p>
            )}
          </div>
          <form
            onSubmit={e => { e.preventDefault(); createFieldMutation.mutate(); }}
            className="flex gap-2 flex-wrap"
          >
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-32 outline-none focus:ring-2 focus:ring-brand-orange"
              placeholder="Field name"
              value={newField.name}
              onChange={e => setNewField(f => ({ ...f, name: e.target.value }))}
              required
            />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-orange"
              value={newField.fieldType}
              onChange={e => setNewField(f => ({ ...f, fieldType: e.target.value as FieldType }))}
            >
              {(['TEXT', 'NUMBER', 'DROPDOWN', 'DATE'] as FieldType[]).map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600 px-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newField.required}
                onChange={e => setNewField(f => ({ ...f, required: e.target.checked }))}
              />
              Required
            </label>
            <Button type="submit" loading={createFieldMutation.isPending}>Add Field</Button>
          </form>
        </div>
      )}
    </div>
  );
};
