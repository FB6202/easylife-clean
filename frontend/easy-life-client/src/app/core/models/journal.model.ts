import { CategoryPreview } from './todo.model';

export type MoodLevel = 'GREAT' | 'GOOD' | 'OK' | 'BAD' | 'TERRIBLE';

export interface WeekPlanSummary {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
}

export interface JournalEntryResponse {
  id: number;
  title: string;
  mood: MoodLevel;
  wentWell: string | null;
  wentBad: string | null;
  learnings: string | null;
  gratitude: string | null;
  entryDate: string;
  createdAt: string;
  updatedAt: string | null;
  categories: CategoryPreview[] | null;
  weekPlanId: number | null;
  weekPlan: WeekPlanSummary | null;
}

export interface JournalFilter {
  mood?: MoodLevel;
  entryDateFrom?: string;
  entryDateTo?: string;
  categoryIds?: number[];
}
