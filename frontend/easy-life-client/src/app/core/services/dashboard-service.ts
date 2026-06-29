import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TodoResponse } from '../models/todo.model';
import { CalendarEventResponse } from '../models/calendar.model';
import { GoalResponse } from '../models/goal.model';
import { WeekPlanResponse } from '../models/weekplan.model';
import { CategoryResponse } from '../models/category.model';
import { NotificationResponse } from '../models/notification.model';
import { JournalEntryResponse } from '../models/journal.model';
import { ContactResponse } from '../models/contact.model';
import { LoadingService } from './loading';

export interface FollowStatsResponse {
  following: number;
  followers: number;
  pendingRequests: number;
}

export interface DashboardData {
  tasks: TodoResponse[];
  events: CalendarEventResponse[];
  goals: GoalResponse[];
  weekplan: WeekPlanResponse | null;
  categories: CategoryResponse[];
  notifications: NotificationResponse[];
  journal: JournalEntryResponse[];
  contacts: ContactResponse[];
  followStats: FollowStatsResponse;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;

  private readonly http = inject(HttpClient);

  // Signal für die geladenen Dashboard-Daten
  readonly dashboardData = signal<DashboardData | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadDashboardData(userId: number, enabledWidgets: string[]): void {
    this.loading.set(true);

    this.error.set(null);

    const requests: { [key: string]: Observable<any> } = {};

    // Nur aktivierte Widgets laden
    if (enabledWidgets.includes('tasks')) {
      requests['tasks'] = this.loadTasks(userId);
    }
    if (enabledWidgets.includes('calendar')) {
      requests['events'] = this.loadCalendarEvents(userId);
    }
    if (enabledWidgets.includes('goals')) {
      requests['goals'] = this.loadGoals(userId);
    }
    if (enabledWidgets.includes('weekplan')) {
      requests['weekplan'] = this.loadWeekplan(userId);
    }
    if (enabledWidgets.includes('categories')) {
      requests['categories'] = this.loadCategories(userId);
    }
    if (enabledWidgets.includes('notifications')) {
      requests['notifications'] = this.loadNotifications(userId);
    }
    if (enabledWidgets.includes('journal')) {
      requests['journal'] = this.loadJournal(userId);
    }
    if (enabledWidgets.includes('network')) {
      requests['contacts'] = this.loadContacts(userId);
    }
    if (enabledWidgets.includes('following')) {
      requests['followStats'] = this.loadFollowStats(userId);
    }

    forkJoin(requests)
      .pipe(
        map((results) => ({
          tasks: results['tasks'] || [],
          events: results['events'] || [],
          goals: results['goals'] || [],
          weekplan: results['weekplan'] || null,
          categories: results['categories'] || [],
          notifications: results['notifications'] || [],
          journal: results['journal'] || [],
          contacts: results['contacts'] || [],
          followStats: results['followStats'] || { following: 0, followers: 0, pendingRequests: 0 },
        })),
        catchError((err) => {
          this.error.set('Failed to load dashboard data');

          console.error('Dashboard load error:', err);
          return of({
            tasks: [],
            events: [],
            goals: [],
            weekplan: null,
            categories: [],
            notifications: [],
            journal: [],
            contacts: [],
            followStats: { following: 0, followers: 0, pendingRequests: 0 },
          });
        }),
      )
      .subscribe((data) => {
        this.dashboardData.set(data);
        this.loading.set(false);
      });
  }

  private loadTasks(userId: number): Observable<TodoResponse[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http
      .get<TodoResponse[]>(`${this.baseUrl}/todos/dashboard`, { params })
      .pipe(catchError(() => of([])));
  }

  private loadCalendarEvents(userId: number): Observable<CalendarEventResponse[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http
      .get<CalendarEventResponse[]>(`${this.baseUrl}/calendar/dashboard`, { params })
      .pipe(catchError(() => of([])));
  }

  private loadGoals(userId: number): Observable<GoalResponse[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http
      .get<GoalResponse[]>(`${this.baseUrl}/goals/dashboard`, { params })
      .pipe(catchError(() => of([])));
  }

  private loadWeekplan(userId: number): Observable<WeekPlanResponse | null> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http
      .get<WeekPlanResponse>(`${this.baseUrl}/weekplans/dashboard`, { params })
      .pipe(catchError(() => of(null)));
  }

  private loadCategories(userId: number): Observable<CategoryResponse[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http
      .get<CategoryResponse[]>(`${this.baseUrl}/categories/dashboard`, { params })
      .pipe(catchError(() => of([])));
  }

  private loadNotifications(userId: number): Observable<NotificationResponse[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http
      .get<NotificationResponse[]>(`${this.baseUrl}/notifications/dashboard`, { params })
      .pipe(catchError(() => of([])));
  }

  private loadJournal(userId: number): Observable<JournalEntryResponse[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http
      .get<JournalEntryResponse[]>(`${this.baseUrl}/journal/dashboard`, { params })
      .pipe(catchError(() => of([])));
  }

  private loadContacts(userId: number): Observable<ContactResponse[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http
      .get<ContactResponse[]>(`${this.baseUrl}/contacts/dashboard`, { params })
      .pipe(catchError(() => of([])));
  }

  private loadFollowStats(userId: number): Observable<FollowStatsResponse> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http
      .get<FollowStatsResponse>(`${this.baseUrl}/follows/dashboard/stats`, { params })
      .pipe(catchError(() => of({ following: 0, followers: 0, pendingRequests: 0 })));
  }
}
