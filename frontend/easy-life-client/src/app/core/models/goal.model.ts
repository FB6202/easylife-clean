import { CategoryPreview } from './todo.model';
import { PageResponse } from './todo.model';

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
export type AccessType = 'PRIVATE' | 'PUBLIC';

export interface GoalTaskResponse {
  id: number;
  title: string;
  description: string;
  done: boolean;
  progressContribution: number;
  dueDate: string | null;
  createdAt: string;
}

export interface GoalResponse {
  id: number;
  title: string;
  description: string;
  measurableTarget: string;
  targetValue: number;
  targetUnit: string;
  currentProgress: number;
  deadline: string | null;
  status: GoalStatus;
  accessType: AccessType;
  createdAt: string;
  categories: CategoryPreview[] | null;
  tasks: GoalTaskResponse[];
  presignedImageUrl: string | null;
}

export interface GoalFilter {
  status?: GoalStatus;
  accessType?: AccessType;
  deadlineFrom?: string;
  deadlineTo?: string;
  categoryIds?: number[];
}

export interface GoalRequest {
  title: string;
  description: string;
  measurableTarget: string;
  targetValue: number;
  targetUnit: string;
  currentProgress: number;
  deadline: string | null;
  status: GoalStatus;
  accessType: AccessType;
  categoryIds: number[];
}

export interface GoalTaskRequest {
  title: string;
  description: string;
  done: boolean;
  progressContribution: number;
  dueDate: string | null;
}
