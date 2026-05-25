import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { GoalResponse, GoalFilter } from '../models/goal.model';
import { PageResponse } from '../models/todo.model';

@Injectable({ providedIn: 'root' })
export class GoalService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly base = `${environment.apiUrl}/api/v1/goals`;

  // ── State ──────────────────────────────────────────────────────────────────
  readonly goals = signal<GoalResponse[]>([]);
  readonly selectedGoal = signal<GoalResponse | null>(null);
  readonly loading = signal(false);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);

  // ── Derived ────────────────────────────────────────────────────────────────
  readonly activeCount = computed(() => this.goals().filter((g) => g.status === 'ACTIVE').length);
  readonly completedCount = computed(
    () => this.goals().filter((g) => g.status === 'COMPLETED').length,
  );
  readonly abandonedCount = computed(
    () => this.goals().filter((g) => g.status === 'ABANDONED').length,
  );

  // ── findAll ────────────────────────────────────────────────────────────────
  loadAll(userId: number, page = 0, filter: GoalFilter = {}): void {
    this.loading.set(true);

    let params = new HttpParams()
      .set('userId', userId)
      .set('page', page)
      .set('size', this.pageSize());

    if (filter.status) params = params.set('status', filter.status);
    if (filter.accessType) params = params.set('accessType', filter.accessType);
    if (filter.deadlineFrom) params = params.set('deadlineFrom', filter.deadlineFrom);
    if (filter.deadlineTo) params = params.set('deadlineTo', filter.deadlineTo);
    if (filter.categoryIds?.length) {
      filter.categoryIds.forEach((id) => (params = params.append('categoryIds', id)));
    }

    this.http
      .get<PageResponse<GoalResponse>>(this.base, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.goals.set(res.content);
          this.totalPages.set(res.totalPages ?? 0);
          this.totalElements.set(res.totalElements ?? 0);
          this.currentPage.set(res.page ?? 0);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  // ── findById ───────────────────────────────────────────────────────────────
  loadById(userId: number, id: number): void {
    this.loading.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .get<GoalResponse>(`${this.base}/${id}`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (goal) => {
          this.selectedGoal.set(goal);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
