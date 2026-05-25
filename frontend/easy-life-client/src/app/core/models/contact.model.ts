import { CategoryPreview } from './todo.model';

export type RelationshipType = 'FRIEND' | 'COLLEAGUE' | 'BUSINESS' | 'MENTOR' | 'OTHER';

export interface ContactNoteResponse {
  id: number;
  content: string;
  createdAt: string;
}

export interface ContactResponse {
  id: number;
  firstname: string;
  lastname: string;
  company: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  notes: string | null;
  tags: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  relationshipType: RelationshipType;
  contactNotes: ContactNoteResponse[];
  categories: CategoryPreview[] | null;
}

export interface ContactFilter {
  relationshipType?: RelationshipType;
  company?: string;
  categoryIds?: number[];
}
