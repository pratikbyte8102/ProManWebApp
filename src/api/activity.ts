import { client } from './client';
import type { ActivityLog } from '../types';

export const getIssueActivity = (issueId: string) =>
  client.get<ActivityLog[]>(`/api/issues/${issueId}/activity`).then(r => r.data);
export const getProjectActivity = (projectId: string) =>
  client.get<ActivityLog[]>(`/api/projects/${projectId}/activity`).then(r => r.data);
