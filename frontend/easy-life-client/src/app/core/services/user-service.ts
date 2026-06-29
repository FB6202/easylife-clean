import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { UserResponse, UserSearchResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly base = `${environment.apiUrl}/api/users`;

  private readonly http = inject(HttpClient);

  private readonly destroyRef = inject(DestroyRef);

  readonly currentUser = signal<UserResponse | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly searchResults = signal<UserSearchResponse[]>([]);
  readonly searchLoading = signal(false);

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
        error: () => {
          this.loading.set(false);
        },
      });
  }

  updateProfile(
    id: number,
    request: {
      firstname: string;
      lastname: string;
      bio: string;
      profileImagePath: string | null;
      mobileNumber: string;
    },
  ): Promise<boolean> {
    this.saving.set(true);
    return new Promise((resolve) => {
      this.http
        .put<any>(`${this.base}/${id}/profile`, request)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (profile) => {
            this.currentUser.update((u) =>
              u ? { ...u, profile: { ...u.profile!, ...profile } } : u,
            );
            this.saving.set(false);
            resolve(true);
          },
          error: () => {
            this.saving.set(false);
            resolve(false);
          },
        });
    });
  }

  updateAddress(
    id: number,
    request: {
      country: string;
      street: string;
      number: string;
      additionalAddressInfo: string;
      zipCode: string;
      city: string;
    },
  ): Promise<boolean> {
    this.saving.set(true);
    return new Promise((resolve) => {
      this.http
        .put<any>(`${this.base}/${id}/address`, request)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (address) => {
            this.currentUser.update((u) =>
              u ? { ...u, profile: { ...u.profile!, address: { ...address } } } : u,
            );
            this.saving.set(false);
            resolve(true);
          },
          error: () => {
            this.saving.set(false);
            resolve(false);
          },
        });
    });
  }

  updateSettings(
    id: number,
    request: {
      language: string;
      webColorTheme: string;
      mobileColorTheme: string;
      emailNotifications: boolean;
      pushNotifications: boolean;
      widgetTasksEnabled: boolean;
      widgetCalendarEnabled: boolean;
      widgetGoalsEnabled: boolean;
      widgetWeekplanEnabled: boolean;
      widgetCategoriesEnabled: boolean;
      widgetNotificationsEnabled: boolean;
      widgetJournalEnabled: boolean;
      widgetNetworkEnabled: boolean;
      widgetFollowingEnabled: boolean;
    },
  ): Promise<boolean> {
    this.saving.set(true);
    return new Promise((resolve) => {
      this.http
        .put<any>(`${this.base}/${id}/settings`, request)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (settings) => {
            this.currentUser.update((u) =>
              u ? { ...u, settings: { ...u.settings!, ...settings } } : u,
            );
            this.saving.set(false);
            resolve(true);
          },
          error: () => {
            this.saving.set(false);
            resolve(false);
          },
        });
    });
  }

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
