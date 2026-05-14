import { client } from './client';
import type { Project } from '../types';

export const getProjects = () => client.get<Project[]>('/api/projects').then(r => r.data);
export const getProject = (id: string) => client.get<Project>(`/api/projects/${id}`).then(r => r.data);
export const createProject = (data: { key: string; name: string; description?: string }) =>
  client.post<Project>('/api/projects', data).then(r => r.data);
export const updateProject = (id: string, data: { name?: string; description?: string }) =>
  client.patch<Project>(`/api/projects/${id}`, data).then(r => r.data);
export const deleteProject = (id: string) => client.delete(`/api/projects/${id}`);
export const addMember = (projectId: string, userId: string, role: string) =>
  client.post(`/api/projects/${projectId}/members`, { userId, role });
export const removeMember = (projectId: string, userId: string) =>
  client.delete(`/api/projects/${projectId}/members/${userId}`);
