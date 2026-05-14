import { client } from './client';
import type { CustomFieldDefinition } from '../types';

export const getCustomFields = (projectId: string) =>
  client.get<CustomFieldDefinition[]>(`/api/projects/${projectId}/custom-fields`).then(r => r.data);
export const createCustomField = (projectId: string, data: { name: string; fieldType: string; required: boolean; options?: string[] }) =>
  client.post<CustomFieldDefinition>(`/api/projects/${projectId}/custom-fields`, data).then(r => r.data);
export const updateCustomField = (id: string, data: Partial<CustomFieldDefinition>) =>
  client.patch<CustomFieldDefinition>(`/api/custom-fields/${id}`, data).then(r => r.data);
export const deleteCustomField = (id: string) => client.delete(`/api/custom-fields/${id}`);
export const getIssueCustomFieldValues = (issueId: string) =>
  client.get(`/api/issues/${issueId}/custom-fields`).then(r => r.data);
export const setCustomFieldValue = (issueId: string, fieldDefinitionId: string, value: string) =>
  client.put(`/api/issues/${issueId}/custom-fields`, { fieldDefinitionId, value }).then(r => r.data);
