export type EventType = 'APPOINTMENT' | 'REMINDER' | 'TASK' | 'BIRTHDAY';
export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type AccessType = 'PRIVATE' | 'PUBLIC';

export interface CalendarEventResponse {
  id: number;
  title: string;
  description: string;
  location: string;
  eventColor: string;
  startDateTime: string;
  endDateTime: string;
  allDay: boolean;
  eventType: EventType;
  recurrence: RecurrenceType;
  accessType: AccessType;
  createdAt: string;
  categoryIds: number[];
}
