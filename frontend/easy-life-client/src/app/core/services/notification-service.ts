import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { NotificationResponse, NotificationFilter } from '../models/notification.model';
import { PageResponse } from '../models/todo.model';
import { LoadingService } from './loading';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly base = `${environment.apiUrl}/api/v1/notifications`;

  private readonly http = inject(HttpClient);

  private readonly destroyRef = inject(DestroyRef);

  readonly notifications = signal<NotificationResponse[]>([]);
  readonly loading = signal(false);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);
  readonly unreadCount = signal(0);

  readonly unreadNotifications = computed(() => this.notifications().filter((n) => !n.alreadyRead));

  loadAll(userId: number, page = 0, filter: NotificationFilter = {}): void {
    this.loading.set(true);

    let params = new HttpParams()
      .set('userId', userId)
      .set('page', page)
      .set('size', this.pageSize());

    if (filter.type) params = params.set('type', filter.type);
    if (filter.channel) params = params.set('channel', filter.channel);
    if (filter.referenceType) params = params.set('referenceType', filter.referenceType);
    if (filter.alreadyRead !== undefined)
      params = params.set('alreadyRead', String(filter.alreadyRead));

    this.http
      .get<PageResponse<NotificationResponse>>(this.base, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.notifications.set(res.content);
          this.totalPages.set(res.totalPages ?? 0);
          this.totalElements.set(res.totalElements ?? 0);
          this.currentPage.set(res.page ?? 0);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  loadUnreadCount(userId: number): void {
    const params = new HttpParams().set('userId', userId);
    this.http
      .get<number>(`${this.base}/unread/count`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (count) => this.unreadCount.set(count), error: () => {} });
  }
}
