export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';
export type ProjectRole = 'ADMIN' | 'MEMBER' | 'VIEWER';
export type IssueType = 'EPIC' | 'STORY' | 'TASK' | 'BUG' | 'SUBTASK';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type StatusCategory = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type SprintStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED';
export type NotificationType = 'ASSIGNED' | 'MENTIONED' | 'STATUS_CHANGED' | 'COMMENT_ADDED';
export type FieldType = 'TEXT' | 'NUMBER' | 'DROPDOWN' | 'DATE';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  createdAt: string;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string | null;
  owner: User;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStatus {
  id: string;
  projectId: string;
  name: string;
  category: StatusCategory;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  issueKey: string;
  issueNumber: number;
  projectId: string;
  type: IssueType;
  title: string;
  description: string | null;
  statusId: string;
  statusName: string;
  priority: Priority;
  assignee: User | null;
  reporter: User;
  sprintId: string | null;
  parentId: string | null;
  storyPoints: number | null;
  labels: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string | null;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  issueId: string;
  author: User;
  parentCommentId: string | null;
  body: string;
  mentions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  issueId: string | null;
  userId: string;
  displayName: string;
  action: string;
  fieldChanged: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  issueId: string;
  issueKey: string;
  actorId: string;
  actorDisplayName: string;
  read: boolean;
  createdAt: string;
}

export interface CustomFieldDefinition {
  id: string;
  projectId: string;
  name: string;
  fieldType: FieldType;
  options: string[] | null;
  required: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTransition {
  id: string;
  projectId: string;
  fromStatusId: string;
  toStatusId: string;
  autoAssignRole: string | null;
  requiredFields: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ProjectMember {
  user: User;
  role: ProjectRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
