import { PageResponse } from './todo.model';

export type NotificationType = 'REMINDER' | 'INFO' | 'WARNING' | 'SUCCESS';
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH';
export type ReferenceType =
  | 'TODO'
  | 'GOAL'
  | 'EVENT'
  | 'DOCUMENT'
  | 'CONTACT'
  | 'JOURNAL_ENTRY'
  | 'WEEK_PLAN';

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  referenceType: ReferenceType | null;
  referenceId: number | null;
  alreadyRead: boolean;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface NotificationFilter {
  type?: NotificationType;
  channel?: NotificationChannel;
  alreadyRead?: boolean;
  referenceType?: ReferenceType;
}
