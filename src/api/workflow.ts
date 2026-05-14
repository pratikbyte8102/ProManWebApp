import { client } from './client';
import type { WorkflowStatus, WorkflowTransition } from '../types';

export const getStatuses = (projectId: string) =>
  client.get<WorkflowStatus[]>(`/api/projects/${projectId}/workflow/statuses`).then(r => r.data);
export const createStatus = (projectId: string, data: { name: string; category: string; position: number }) =>
  client.post<WorkflowStatus>(`/api/projects/${projectId}/workflow/statuses`, data).then(r => r.data);
export const deleteStatus = (id: string) => client.delete(`/api/workflow/statuses/${id}`);

export const getTransitions = (projectId: string) =>
  client.get<WorkflowTransition[]>(`/api/projects/${projectId}/workflow/transitions`).then(r => r.data);
export const createTransition = (projectId: string, data: { fromStatusId: string; toStatusId: string; requiredFields?: string[] }) =>
  client.post(`/api/projects/${projectId}/workflow/transitions`, data).then(r => r.data);
export const deleteTransition = (id: string) => client.delete(`/api/workflow/transitions/${id}`);
