import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { CategoryResponse, CategoryFilter } from '../models/category.model';
import { PageResponse } from '../models/todo.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly base = `${environment.apiUrl}/api/v1/categories`;

  // ── State ──────────────────────────────────────────────────────────────────
  readonly categories = signal<CategoryResponse[]>([]);
  readonly selectedCategory = signal<CategoryResponse | null>(null);
  readonly loading = signal(false);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  // Separates Signal für Dropdowns — unabhängig von der paginierten Liste
  readonly allCategories = signal<CategoryResponse[]>([]);

  // ── Derived ────────────────────────────────────────────────────────────────
  readonly publicCount = computed(
    () => this.categories().filter((c) => c.accessType === 'PUBLIC').length,
  );
  readonly privateCount = computed(
    () => this.categories().filter((c) => c.accessType === 'PRIVATE').length,
  );

  // ── findAll ────────────────────────────────────────────────────────────────
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

  // Lädt ALLE Categories ohne Pagination (für Dropdowns in anderen Komponenten)
  loadAllFlat(userId: number): void {
    const params = new HttpParams().set('userId', userId).set('page', 0).set('size', 100);

    this.http
      .get<PageResponse<CategoryResponse>>(this.base, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.allCategories.set(res?.content ?? []),
        error: () => {},
      });
  }
}
