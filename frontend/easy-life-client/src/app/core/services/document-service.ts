import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { DocumentResponse, DocumentFilter, DocumentRequest } from '../models/document.model';
import { PageResponse } from '../models/todo.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly base = `${environment.apiUrl}/api/v1/documents`;

  readonly documents = signal<DocumentResponse[]>([]);
  readonly selectedDoc = signal<DocumentResponse | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
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

  // ── loadAll ────────────────────────────────────────────────────────────────
  loadAll(userId: number, page = 0, filter: DocumentFilter = {}): void {
    this.loading.set(true);

    let params = new HttpParams()
      .set('userId', userId)
      .set('page', page)
      .set('size', this.pageSize());

    if (filter.fileType) params = params.set('fileType', filter.fileType);
    if (filter.accessType) params = params.set('accessType', filter.accessType);
    if (filter.uploadedFrom) params = params.set('uploadedFrom', filter.uploadedFrom + 'T00:00:00');
    if (filter.uploadedTo) params = params.set('uploadedTo', filter.uploadedTo + 'T23:59:59');
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

  // ── loadById ───────────────────────────────────────────────────────────────
  loadById(userId: number, id: number, onSuccess?: (doc: DocumentResponse) => void): void {
    this.loading.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .get<DocumentResponse>(`${this.base}/${id}`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (doc) => {
          this.selectedDoc.set(doc);
          this.loading.set(false);
          onSuccess?.(doc);
        },
        error: () => this.loading.set(false),
      });
  }

  // ── upload (presigned → S3 → confirm) ─────────────────────────────────────
  async upload(
    userId: number,
    file: File,
    form: { title: string; description: string; accessType: string; categoryIds: number[] },
    onSuccess: (created: DocumentResponse) => void,
    onError: () => void,
  ): Promise<void> {
    this.saving.set(true);

    const urlParams = new HttpParams()
      .set('userId', userId)
      .set('fileName', file.name)
      .set('contentType', file.type);

    this.http
      .post<string>(`${this.base}/presigned-url`, null, {
        params: urlParams,
        responseType: 'text' as 'json',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async (presignedUrl) => {
          try {
            const s3Response = await fetch(presignedUrl, {
              method: 'PUT',
              body: file,
              headers: { 'Content-Type': file.type },
            });

            if (!s3Response.ok) {
              this.saving.set(false);
              onError();
              return;
            }

            const filePath = new URL(presignedUrl).pathname.substring(1);
            const fileType = file.name.split('.').pop()?.toLowerCase() ?? '';

            const confirmParams = new HttpParams().set('userId', userId).set('filePath', filePath);

            this.http
              .post<DocumentResponse>(
                `${this.base}/confirm-upload`,
                {
                  title: form.title,
                  description: form.description,
                  fileType,
                  fileSizeBytes: file.size,
                  accessType: form.accessType,
                  categoryIds: form.categoryIds,
                },
                { params: confirmParams },
              )
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (created) => {
                  this.documents.update((list) => [created, ...list]);
                  this.totalElements.update((n) => n + 1);
                  this.saving.set(false);
                  onSuccess(created);
                },
                error: () => {
                  this.saving.set(false);
                  onError();
                },
              });
          } catch {
            this.saving.set(false);
            onError();
          }
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
    request: DocumentRequest,
    onSuccess: (updated: DocumentResponse) => void,
    onError: () => void,
  ): void {
    this.saving.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .put<DocumentResponse>(`${this.base}/${id}`, request, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.documents.update((list) => list.map((d) => (d.id === id ? updated : d)));
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
          this.documents.update((list) => list.filter((d) => d.id !== id));
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
