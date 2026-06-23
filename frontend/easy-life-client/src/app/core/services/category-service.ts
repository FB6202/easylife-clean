import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { CategoryResponse, CategoryFilter, CategoryRequest } from '../models/category.model';
import { PageResponse } from '../models/todo.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly base = `${environment.apiUrl}/api/v1/categories`;

  // ── State ──────────────────────────────────────────────────────────────────
  readonly categories = signal<CategoryResponse[]>([]);
  readonly allCategories = signal<CategoryResponse[]>([]);
  readonly selectedCategory = signal<CategoryResponse | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);

  // ── Derived ────────────────────────────────────────────────────────────────
  readonly privateCount = computed(
    () => this.allCategories().filter((c) => c.accessType === 'PRIVATE').length,
  );
  readonly publicCount = computed(
    () => this.allCategories().filter((c) => c.accessType === 'PUBLIC').length,
  );

  // ── loadAll (unpaged, für Dropdowns in anderen Modulen) ────────────────────
  loadAll(userId: number, page = 0, filter: CategoryFilter = {}): void {
    this.loading.set(true);

    let params = new HttpParams()
      .set('userId', userId)
      .set('page', page)
      .set('size', this.pageSize());

    if (filter.name) params = params.set('name', filter.name);
    if (filter.accessType) params = params.set('accessType', filter.accessType);

    this.http
      .get<PageResponse<CategoryResponse>>(this.base, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.categories.set(res.content);
          this.allCategories.set(res.content);
          this.totalPages.set(res.totalPages ?? 0);
          this.totalElements.set(res.totalElements ?? 0);
          this.currentPage.set(res.page ?? 0);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  // ── loadById ───────────────────────────────────────────────────────────────
  loadById(userId: number, id: number): void {
    this.loading.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .get<CategoryResponse>(`${this.base}/${id}`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cat) => {
          this.selectedCategory.set(cat);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  // ── loadAllFlat (alle Categories ohne Pagination, für Dropdowns) ───────────
  loadAllFlat(userId: number): void {
    const params = new HttpParams().set('userId', userId).set('page', 0).set('size', 100);

    this.http
      .get<PageResponse<CategoryResponse>>(this.base, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.allCategories.set(res?.content ?? []),
        error: () => this.allCategories.set([]),
      });
  }

  // ── create ─────────────────────────────────────────────────────────────────
  create(
    userId: number,
    request: CategoryRequest,
    onSuccess: () => void,
    onError: () => void,
  ): void {
    this.saving.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .post<CategoryResponse>(this.base, request, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => {
          this.categories.update((list) => [created, ...list]);
          this.allCategories.update((list) => [created, ...list]);
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
    request: CategoryRequest,
    onSuccess: () => void,
    onError: () => void,
  ): void {
    this.saving.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .put<CategoryResponse>(`${this.base}/${id}`, request, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.categories.update((list) => list.map((c) => (c.id === id ? updated : c)));
          this.allCategories.update((list) => list.map((c) => (c.id === id ? updated : c)));
          this.saving.set(false);
          onSuccess();
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
          this.categories.update((list) => list.filter((c) => c.id !== id));
          this.allCategories.update((list) => list.filter((c) => c.id !== id));
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
