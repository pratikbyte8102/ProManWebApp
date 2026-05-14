import { client } from './client';
import type { Issue, CursorPage, IssueType, Priority } from '../types';

export interface IssueFilters {
  cursor?: string;
  limit?: number;
  statusId?: string;
  assigneeId?: string;
  sprintId?: string;
  type?: IssueType;
  priority?: Priority;
  statusCategory?: string;
}

export const getIssues = (projectId: string, filters: IssueFilters = {}) =>
  client.get<CursorPage<Issue>>(`/api/projects/${projectId}/issues`, { params: filters }).then(r => r.data);

export const getIssue = (id: string) => client.get<Issue>(`/api/issues/${id}`).then(r => r.data);

export const createIssue = (projectId: string, data: {
  type: IssueType; title: string; description?: string; priority: Priority;
  assigneeId?: string; sprintId?: string; parentId?: string; storyPoints?: number; labels?: string[];
}) => client.post<Issue>(`/api/projects/${projectId}/issues`, data).then(r => r.data);

export const updateIssue = (id: string, data: Partial<Issue> & { version: number }) =>
  client.patch<Issue>(`/api/issues/${id}`, data).then(r => r.data);

export const deleteIssue = (id: string) => client.delete(`/api/issues/${id}`);

export const transitionIssue = (id: string, toStatusId: string) =>
  client.post<Issue>(`/api/issues/${id}/transition`, { toStatusId }).then(r => r.data);

export const getTransitions = (id: string) =>
  client.get(`/api/issues/${id}/transitions`).then(r => r.data);

export const removeFromSprint = (id: string) =>
  client.delete<Issue>(`/api/issues/${id}/sprint`).then(r => r.data);
