import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { ContactResponse, ContactFilter } from '../models/contact.model';
import { PageResponse } from '../models/todo.model';
import { LoadingService } from './loading';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly base = `${environment.apiUrl}/api/v1/contacts`;

  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly contacts = signal<ContactResponse[]>([]);
  readonly selectedContact = signal<ContactResponse | null>(null);
  readonly loading = signal(false);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);

  readonly businessCount = computed(
    () => this.contacts().filter((c) => c.relationshipType === 'BUSINESS').length,
  );
  readonly colleagueCount = computed(
    () => this.contacts().filter((c) => c.relationshipType === 'COLLEAGUE').length,
  );
  readonly mentorCount = computed(
    () => this.contacts().filter((c) => c.relationshipType === 'MENTOR').length,
  );

  loadAll(userId: number, page = 0, filter: ContactFilter = {}): void {
    this.loading.set(true);

    let params = new HttpParams()
      .set('userId', userId)
      .set('page', page)
      .set('size', this.pageSize());

    if (filter.relationshipType) params = params.set('relationshipType', filter.relationshipType);
    if (filter.company) params = params.set('company', filter.company);
    if (filter.categoryIds?.length) {
      filter.categoryIds.forEach((id) => (params = params.append('categoryIds', id)));
    }

    this.http
      .get<PageResponse<ContactResponse>>(this.base, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.contacts.set(res.content);
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
      .get<ContactResponse>(`${this.base}/${id}`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (contact) => {
          this.selectedContact.set(contact);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
