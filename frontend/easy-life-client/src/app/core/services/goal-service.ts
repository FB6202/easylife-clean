import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import {
  GoalResponse,
  GoalFilter,
  GoalRequest,
  GoalTaskRequest,
  GoalTaskResponse,
} from '../models/goal.model';
import { PageResponse } from '../models/todo.model';
import { LoadingService } from './loading';

@Injectable({ providedIn: 'root' })
export class GoalService {
  private readonly base = `${environment.apiUrl}/api/v1/goals`;

  private readonly http = inject(HttpClient);
  private readonly loadingService = inject(LoadingService);

  private readonly destroyRef = inject(DestroyRef);

  // ── State ──────────────────────────────────────────────────────────────────
  readonly goals = signal<GoalResponse[]>([]);
  readonly selectedGoal = signal<GoalResponse | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly uploadingImage = signal(false);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);

  // ── Derived ────────────────────────────────────────────────────────────────
  readonly activeCount = computed(() => this.goals().filter((g) => g.status === 'ACTIVE').length);
  readonly completedCount = computed(
    () => this.goals().filter((g) => g.status === 'COMPLETED').length,
  );

  // ── loadAll ────────────────────────────────────────────────────────────────
  loadAll(userId: number, page = 0, filter: GoalFilter = {}): void {
    this.loading.set(true);
    this.loadingService.start();

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
          this.loadingService.stop();
        },
        error: () => {
          this.loading.set(false);
          this.loadingService.stop();
        },
      });
  }

  // ── loadById ───────────────────────────────────────────────────────────────
  loadById(userId: number, id: number, onSuccess?: (goal: GoalResponse) => void): void {
    this.loading.set(true);
    this.loadingService.start();

    const params = new HttpParams().set('userId', userId);

    this.http
      .get<GoalResponse>(`${this.base}/${id}`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (goal) => {
          this.selectedGoal.set(goal);
          this.loading.set(false);
          onSuccess?.(goal);
          this.loadingService.stop();
        },
        error: () => {
          this.loading.set(false);
          this.loadingService.stop();
        },
      });
  }

  // ── create ─────────────────────────────────────────────────────────────────
  create(
    userId: number,
    request: GoalRequest,
    onSuccess: (created: GoalResponse) => void,
    onError: () => void,
  ): void {
    this.saving.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .post<GoalResponse>(this.base, request, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => {
          this.goals.update((list) => [created, ...list]);
          this.totalElements.update((n) => n + 1);
          this.saving.set(false);
          onSuccess(created);
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
    request: GoalRequest,
    onSuccess: (updated: GoalResponse) => void,
    onError: () => void,
  ): void {
    this.saving.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .put<GoalResponse>(`${this.base}/${id}`, request, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.goals.update((list) => list.map((g) => (g.id === id ? updated : g)));
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
          this.goals.update((list) => list.filter((g) => g.id !== id));
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

  // ── addTask ────────────────────────────────────────────────────────────────
  addTask(
    userId: number,
    goalId: number,
    request: GoalTaskRequest,
    onSuccess: (task: GoalTaskResponse) => void,
    onError: () => void,
  ): void {
    this.saving.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .post<GoalTaskResponse>(`${this.base}/${goalId}/tasks`, request, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => {
          this.saving.set(false);
          onSuccess(task);
        },
        error: () => {
          this.saving.set(false);
          onError();
        },
      });
  }

  // ── updateTask ─────────────────────────────────────────────────────────────
  updateTask(
    userId: number,
    goalId: number,
    taskId: number,
    request: GoalTaskRequest,
    onSuccess: (task: GoalTaskResponse) => void,
    onError: () => void,
  ): void {
    this.saving.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .put<GoalTaskResponse>(`${this.base}/${goalId}/tasks/${taskId}`, request, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => {
          this.saving.set(false);
          onSuccess(task);
        },
        error: () => {
          this.saving.set(false);
          onError();
        },
      });
  }

  // ── deleteTask ─────────────────────────────────────────────────────────────
  deleteTask(
    userId: number,
    goalId: number,
    taskId: number,
    onSuccess: () => void,
    onError: () => void,
  ): void {
    this.deleting.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .delete<void>(`${this.base}/${goalId}/tasks/${taskId}`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleting.set(false);
          onSuccess();
        },
        error: () => {
          this.deleting.set(false);
          onError();
        },
      });
  }

  // ── uploadImage ────────────────────────────────────────────────────────────
  // 1) presigned-url holen → 2) direkt zu S3 → 3) confirm PATCH
  async uploadImage(
    userId: number,
    goalId: number,
    file: File,
    onSuccess: (updated: GoalResponse) => void,
    onError: () => void,
  ): Promise<void> {
    this.uploadingImage.set(true);

    const urlParams = new HttpParams()
      .set('userId', userId)
      .set('fileName', file.name)
      .set('contentType', file.type);

    this.http
      .post<string>(`${this.base}/${goalId}/image/presigned-url`, null, {
        params: urlParams,
        responseType: 'text' as 'json',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async (presignedUrl) => {
          try {
            // direkt zu S3 uploaden (kein Angular HttpClient — kein Auth-Header mitsenden)
            const s3Response = await fetch(presignedUrl, {
              method: 'PUT',
              body: file,
              headers: { 'Content-Type': file.type },
            });

            if (!s3Response.ok) {
              this.uploadingImage.set(false);
              onError();
              return;
            }

            // imagePath = key aus der presigned URL (alles vor '?')
            const imagePath = new URL(presignedUrl).pathname.substring(1);

            const confirmParams = new HttpParams().set('userId', userId);
            this.http
              .patch<GoalResponse>(`${this.base}/${goalId}/image/confirm`, imagePath, {
                params: confirmParams,
              })
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (updated) => {
                  this.goals.update((list) => list.map((g) => (g.id === goalId ? updated : g)));
                  this.uploadingImage.set(false);
                  onSuccess(updated);
                },
                error: () => {
                  this.uploadingImage.set(false);
                  onError();
                },
              });
          } catch {
            this.uploadingImage.set(false);
            onError();
          }
        },
        error: () => {
          this.uploadingImage.set(false);
          onError();
        },
      });
  }

  // ── removeImage ────────────────────────────────────────────────────────────
  removeImage(
    userId: number,
    goalId: number,
    onSuccess: (updated: GoalResponse) => void,
    onError: () => void,
  ): void {
    this.saving.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .delete<GoalResponse>(`${this.base}/${goalId}/image`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.goals.update((list) => list.map((g) => (g.id === goalId ? updated : g)));
          this.saving.set(false);
          onSuccess(updated);
        },
        error: () => {
          this.saving.set(false);
          onError();
        },
      });
  }
}
