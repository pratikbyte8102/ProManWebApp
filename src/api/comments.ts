import { client } from './client';
import type { Comment } from '../types';

export const getComments = (issueId: string) =>
  client.get<Comment[]>(`/api/issues/${issueId}/comments`).then(r => r.data);
export const createComment = (issueId: string, body: string, parentCommentId?: string) =>
  client.post<Comment>(`/api/issues/${issueId}/comments`, { body, parentCommentId }).then(r => r.data);
export const updateComment = (id: string, body: string) =>
  client.patch<Comment>(`/api/comments/${id}`, { body }).then(r => r.data);
export const deleteComment = (id: string) => client.delete(`/api/comments/${id}`);
