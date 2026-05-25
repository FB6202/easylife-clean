export type AccessType = 'PRIVATE' | 'PUBLIC';

export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  accessType: AccessType;
  createdAt: string;
}

export interface CategoryRequest {
  name: string;
  description: string;
  color: string;
  icon: string;
  accessType: AccessType;
}

export interface CategoryFilter {
  name?: string;
  accessType?: AccessType;
}
