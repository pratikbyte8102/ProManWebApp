import { client } from './client';
import type { User } from '../types';

export const getWatchers = (issueId: string) =>
  client.get<User[]>(`/api/issues/${issueId}/watchers`).then(r => r.data);
export const watch = (issueId: string) => client.post(`/api/issues/${issueId}/watch`);
export const unwatch = (issueId: string) => client.delete(`/api/issues/${issueId}/watch`);
