import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { TodoResponse, TodoRequest, PageResponse, TodoFilter } from '../models/todo.model';
import { LoadingService } from './loading';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly base = `${environment.apiUrl}/api/v1/todos`;

  private readonly http = inject(HttpClient);

  private readonly destroyRef = inject(DestroyRef);

  // ── State ──────────────────────────────────────────────────────────────────
  readonly todos = signal<TodoResponse[]>([]);
  readonly selectedTodo = signal<TodoResponse | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);

  // ── Derived ────────────────────────────────────────────────────────────────
  readonly pendingCount = computed(() => this.todos().filter((t) => t.status === 'OPEN').length);
  readonly inProgressCount = computed(
    () => this.todos().filter((t) => t.status === 'IN_PROGRESS').length,
  );
  readonly doneCount = computed(() => this.todos().filter((t) => t.status === 'DONE').length);

  // ── findAll ────────────────────────────────────────────────────────────────
  loadAll(userId: number, page = 0, filter: TodoFilter = {}): void {
    this.loading.set(true);

    let params = new HttpParams()
      .set('userId', userId)
      .set('page', page)
      .set('size', this.pageSize());

    if (filter.status) params = params.set('status', filter.status);
    if (filter.priority) params = params.set('priority', filter.priority);
    if (filter.accessType) params = params.set('accessType', filter.accessType);
    if (filter.dueDateFrom) params = params.set('dueDateFrom', filter.dueDateFrom);
    if (filter.dueDateTo) params = params.set('dueDateTo', filter.dueDateTo);

    if (filter.categoryIds?.length) {
      filter.categoryIds.forEach((id) => {
        params = params.append('categoryIds', id);
      });
    }

    this.http
      .get<PageResponse<TodoResponse>>(this.base, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.todos.set(res.content);
          this.totalPages.set(res.totalPages);
          this.totalElements.set(res.totalElements);
          this.currentPage.set(res.page ?? 0);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  // ── findById ───────────────────────────────────────────────────────────────
  loadById(userId: number, id: number): void {
    this.loading.set(true);

    const params = new HttpParams().set('userId', userId);

    this.http
      .get<TodoResponse>(`${this.base}/${id}`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (todo) => {
          this.selectedTodo.set(todo);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  // ── create ─────────────────────────────────────────────────────────────────
  create(userId: number, request: TodoRequest, onSuccess: () => void, onError: () => void): void {
    this.saving.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .post<TodoResponse>(this.base, request, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => {
          this.todos.update((list) => [created, ...list]);
          this.totalElements.update((n) => n + 1);
          this.saving.set(false);
          onSuccess();
        },
        error: () => {
          this.saving.set(false);
          onError();
        },
      });
  }

  // ── update ─────────────────────────────────────────────────────────────────
  update(
    userId: number,
    id: number,
    request: TodoRequest,
    onSuccess: (updated: TodoResponse) => void,
    onError: () => void,
  ): void {
    this.saving.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .put<TodoResponse>(`${this.base}/${id}`, request, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.todos.update((list) => list.map((t) => (t.id === id ? updated : t)));
          this.saving.set(false);
          onSuccess(updated);
        },
        error: () => {
          this.saving.set(false);
          onError();
        },
      });
  }

  // ── delete ─────────────────────────────────────────────────────────────────
  delete(userId: number, id: number, onSuccess: () => void, onError: () => void): void {
    this.deleting.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .delete<void>(`${this.base}/${id}`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.todos.update((list) => list.filter((t) => t.id !== id));
          this.totalElements.update((n) => Math.max(0, n - 1));
          this.deleting.set(false);
          onSuccess();
        },
        error: () => {
          this.deleting.set(false);
          onError();
        },
      });
  }
}
