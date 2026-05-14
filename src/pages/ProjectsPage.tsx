import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getProjects, createProject } from '../api/projects';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const CreateProjectModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const qc = useQueryClient();
  const [form, setForm] = useState({ key: '', name: '', description: '' });
  const mutation = useMutation({
    mutationFn: () => createProject({ key: form.key, name: form.name, description: form.description || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      onClose();
      toast.success('Project created');
      setForm({ key: '', name: '', description: '' });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });
  return (
    <Modal open={open} onClose={onClose} title="Create Project">
      <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="flex flex-col gap-4">
        <Input label="Project Key" value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value.toUpperCase() }))} placeholder="MYPROJ" maxLength={10} required />
        <Input label="Project Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-orange border-gray-300 resize-none"
            rows={3}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Create Project</Button>
        </div>
      </form>
    </Modal>
  );
};

export const ProjectsPage: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const { data: projects, isLoading } = useQuery({ queryKey: ['projects'], queryFn: getProjects });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your projects</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Project</Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map(p => (
            <Link key={p.id} to={`/projects/${p.id}/board`}
              className="bg-white rounded-xl border hover:border-brand-orange hover:shadow-md transition-all p-5 group">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-brand-orange transition-colors">
                  <span className="text-white text-xs font-bold">{p.key.slice(0, 3)}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{p.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{p.key}</p>
                  {p.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.description}</p>}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-gray-400">
                <span>by {p.owner.displayName}</span>
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
          {!projects?.length && (
            <div className="col-span-3 text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">📋</p>
              <p className="text-lg font-medium">No projects yet</p>
              <p className="text-sm mt-1">Create your first project to get started</p>
            </div>
          )}
        </div>
      )}
      <CreateProjectModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
};
