import { CategoryPreview } from './todo.model';

export type WeekPlanStatus = 'ACTIVE' | 'COMPLETED' | 'DRAFT' | 'ABANDONED';

export interface WeekPlanItemResponse {
  id: number;
  title: string;
  description: string | null;
  done: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface WeekPlanResponse {
  id: number;
  title: string;
  intention: string | null;
  startDate: string;
  endDate: string;
  status: WeekPlanStatus;
  reflection: string | null;
  createdAt: string;
  updatedAt: string | null;
  categories: CategoryPreview[] | null;
  items: WeekPlanItemResponse[];
  itemsDone: number;
  itemsTotal: number;
}

export interface WeekPlanFilter {
  status?: WeekPlanStatus;
  startDateFrom?: string;
  startDateTo?: string;
  categoryIds?: number[];
}
