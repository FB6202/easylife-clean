import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { UserResponse, UserSearchResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly base = `${environment.apiUrl}/api/users`;

  // ── State ──────────────────────────────────────────────────────────────────
  readonly currentUser = signal<UserResponse | null>(null);
  readonly loading = signal(false);
  readonly searchResults = signal<UserSearchResponse[]>([]);
  readonly searchLoading = signal(false);

  // ── findById — wird für Profil-Seite genutzt ───────────────────────────────
  loadById(id: number): void {
    this.loading.set(true);
    this.http
      .get<UserResponse>(`${this.base}/${id}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.currentUser.set(user);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  // ── findByKeycloakId — später wenn Keycloak aktiv ─────────────────────────
  loadByKeycloakId(keycloakId: string): void {
    this.loading.set(true);
    this.http
      .get<UserResponse>(`${this.base}/keycloak/${keycloakId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.currentUser.set(user);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  // ── search — später für Network/Search Seite ──────────────────────────────
  search(query: string, requesterId: number): void {
    if (!query.trim()) {
      this.searchResults.set([]);
      return;
    }
    this.searchLoading.set(true);
    const params = new HttpParams().set('query', query).set('requesterId', requesterId);

    this.http
      .get<UserSearchResponse[]>(`${this.base}/search`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (results) => {
          this.searchResults.set(results);
          this.searchLoading.set(false);
        },
        error: () => this.searchLoading.set(false),
      });
  }
}
