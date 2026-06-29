import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { WeekPlanResponse, WeekPlanFilter } from '../models/weekplan.model';
import { PageResponse } from '../models/todo.model';
import { LoadingService } from './loading';

@Injectable({ providedIn: 'root' })
export class WeekPlanService {
  private readonly base = `${environment.apiUrl}/api/v1/weekplans`;

  private readonly http = inject(HttpClient);

  private readonly destroyRef = inject(DestroyRef);

  readonly weekPlans = signal<WeekPlanResponse[]>([]);
  readonly selectedPlan = signal<WeekPlanResponse | null>(null);
  readonly loading = signal(false);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  readonly activeCount = computed(
    () => this.weekPlans().filter((w) => w.status === 'ACTIVE').length,
  );
  readonly completedCount = computed(
    () => this.weekPlans().filter((w) => w.status === 'COMPLETED').length,
  );
  readonly draftCount = computed(() => this.weekPlans().filter((w) => w.status === 'DRAFT').length);

  loadAll(userId: number, page = 0, filter: WeekPlanFilter = {}): void {
    this.loading.set(true);

    let params = new HttpParams()
      .set('userId', userId)
      .set('page', page)
      .set('size', this.pageSize());

    if (filter.status) params = params.set('status', filter.status);
    if (filter.startDateFrom) params = params.set('startDateFrom', filter.startDateFrom);
    if (filter.startDateTo) params = params.set('startDateTo', filter.startDateTo);
    if (filter.categoryIds?.length) {
      filter.categoryIds.forEach((id) => (params = params.append('categoryIds', id)));
    }

    this.http
      .get<PageResponse<WeekPlanResponse>>(this.base, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.weekPlans.set(res.content);
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

  loadById(userId: number, id: number): void {
    this.loading.set(true);

    const params = new HttpParams().set('userId', userId);

    this.http
      .get<WeekPlanResponse>(`${this.base}/${id}`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (plan) => {
          this.selectedPlan.set(plan);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
}
