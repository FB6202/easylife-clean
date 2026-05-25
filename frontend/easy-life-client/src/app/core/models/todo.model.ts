export type TodoStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OPTIONAL';
export type AccessType = 'PRIVATE' | 'PUBLIC';

export interface CategoryPreview {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface TodoResponse {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: TodoStatus;
  accessType: AccessType;
  dueDate: string | null;
  weekPlanId: number | null;
  categories: CategoryPreview[] | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface TodoRequest {
  title: string;
  description: string;
  priority: Priority;
  status: TodoStatus;
  accessType: AccessType;
  dueDate: string | null;
  categoryIds: number[];
}

export interface PageResponse<T> {
  content: T[];
  page: number; // war: number (field heißt 'page' nicht 'number')
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TodoFilter {
  status?: TodoStatus;
  priority?: Priority;
  accessType?: AccessType;
  dueDateFrom?: string;
  dueDateTo?: string;
  categoryIds?: number[];
}
