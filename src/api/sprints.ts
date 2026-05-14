import { client } from './client';
import type { Sprint } from '../types';

export const getSprints = (projectId: string) =>
  client.get<Sprint[]>(`/api/projects/${projectId}/sprints`).then(r => r.data);
export const getSprint = (id: string) => client.get<Sprint>(`/api/sprints/${id}`).then(r => r.data);
export const createSprint = (projectId: string, data: { name: string; goal?: string; startDate: string; endDate: string }) =>
  client.post<Sprint>(`/api/projects/${projectId}/sprints`, data).then(r => r.data);
export const updateSprint = (id: string, data: Partial<Sprint>) =>
  client.patch<Sprint>(`/api/sprints/${id}`, data).then(r => r.data);
export const deleteSprint = (id: string) => client.delete(`/api/sprints/${id}`);
