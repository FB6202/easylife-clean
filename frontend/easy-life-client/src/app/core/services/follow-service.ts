import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { FollowResponse } from '../models/follow.model';
import { LoadingService } from './loading';

@Injectable({ providedIn: 'root' })
export class FollowService {
  private readonly base = `${environment.apiUrl}/api/v1/follows`;

  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly following = signal<FollowResponse[]>([]);
  readonly followers = signal<FollowResponse[]>([]);
  readonly pending = signal<FollowResponse[]>([]);
  readonly loading = signal(false);

  loadAll(userId: number): void {
    this.loading.set(true);

    const params = new HttpParams().set('userId', userId);

    this.http
      .get<FollowResponse[]>(`${this.base}/following`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r) => this.following.set(r), error: () => {} });

    this.http
      .get<FollowResponse[]>(`${this.base}/followers`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r) => this.followers.set(r), error: () => {} });

    this.http
      .get<FollowResponse[]>(`${this.base}/pending`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.pending.set(r);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
}
