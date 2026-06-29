import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { JournalEntryResponse, JournalFilter } from '../models/journal.model';
import { PageResponse } from '../models/todo.model';
import { LoadingService } from './loading';

@Injectable({ providedIn: 'root' })
export class JournalService {
  private readonly base = `${environment.apiUrl}/api/v1/journal`;

  private readonly http = inject(HttpClient);

  private readonly destroyRef = inject(DestroyRef);

  readonly entries = signal<JournalEntryResponse[]>([]);
  readonly selectedEntry = signal<JournalEntryResponse | null>(null);
  readonly loading = signal(false);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);

  readonly greatCount = computed(() => this.entries().filter((e) => e.mood === 'GREAT').length);
  readonly goodCount = computed(() => this.entries().filter((e) => e.mood === 'GOOD').length);

  loadAll(userId: number, page = 0, filter: JournalFilter = {}): void {
    this.loading.set(true);

    let params = new HttpParams()
      .set('userId', userId)
      .set('page', page)
      .set('size', this.pageSize());

    if (filter.mood) params = params.set('mood', filter.mood);
    if (filter.entryDateFrom) params = params.set('entryDateFrom', filter.entryDateFrom);
    if (filter.entryDateTo) params = params.set('entryDateTo', filter.entryDateTo);
    if (filter.categoryIds?.length) {
      filter.categoryIds.forEach((id) => (params = params.append('categoryIds', id)));
    }

    this.http
      .get<PageResponse<JournalEntryResponse>>(this.base, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.entries.set(res.content);
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
      .get<JournalEntryResponse>(`${this.base}/${id}`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entry) => {
          this.selectedEntry.set(entry);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
}
