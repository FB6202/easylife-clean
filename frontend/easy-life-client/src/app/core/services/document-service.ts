import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { DocumentResponse, DocumentFilter } from '../models/document.model';
import { PageResponse } from '../models/todo.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly base = `${environment.apiUrl}/api/v1/documents`;

  readonly documents = signal<DocumentResponse[]>([]);
  readonly selectedDoc = signal<DocumentResponse | null>(null);
  readonly loading = signal(false);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);

  readonly pdfCount = computed(() => this.documents().filter((d) => d.fileType === 'pdf').length);
  readonly imageCount = computed(
    () =>
      this.documents().filter((d) =>
        ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'heic'].includes(d.fileType),
      ).length,
  );

  loadAll(userId: number, page = 0, filter: DocumentFilter = {}): void {
    this.loading.set(true);

    let params = new HttpParams()
      .set('userId', userId)
      .set('page', page)
      .set('size', this.pageSize());

    if (filter.fileType) params = params.set('fileType', filter.fileType);
    if (filter.accessType) params = params.set('accessType', filter.accessType);
    if (filter.uploadedFrom) params = params.set('uploadedFrom', filter.uploadedFrom);
    if (filter.uploadedTo) params = params.set('uploadedTo', filter.uploadedTo);
    if (filter.categoryIds?.length) {
      filter.categoryIds.forEach((id) => (params = params.append('categoryIds', id)));
    }

    this.http
      .get<PageResponse<DocumentResponse>>(this.base, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.documents.set(res.content);
          this.totalPages.set(res.totalPages ?? 0);
          this.totalElements.set(res.totalElements ?? 0);
          this.currentPage.set(res.page ?? 0);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  loadById(userId: number, id: number): void {
    this.loading.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .get<DocumentResponse>(`${this.base}/${id}`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (doc) => {
          this.selectedDoc.set(doc);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
