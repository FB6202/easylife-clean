import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { CalendarEventResponse, EventType } from '../models/calendar.model';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly base = `${environment.apiUrl}/api/v1/calendar`;

  // ── State ──────────────────────────────────────────────────────────────────
  readonly events = signal<CalendarEventResponse[]>([]);
  readonly selectedEvent = signal<CalendarEventResponse | null>(null);
  readonly loading = signal(false);

  // ── Derived ────────────────────────────────────────────────────────────────
  readonly appointmentCount = computed(
    () => this.events().filter((e) => e.eventType === 'APPOINTMENT').length,
  );
  readonly reminderCount = computed(
    () => this.events().filter((e) => e.eventType === 'REMINDER').length,
  );

  // ── findAll ────────────────────────────────────────────────────────────────
  loadAll(userId: number): void {
    this.loading.set(true);
    const params = new HttpParams().set('userId', userId);

    this.http
      .get<CalendarEventResponse[]>(this.base, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (events) => {
          this.events.set(events);
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
      .get<CalendarEventResponse>(`${this.base}/${id}`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event) => {
          this.selectedEvent.set(event);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  // ── findAllBetween — für Monats-/Wochennavigation ─────────────────────────
  loadRange(userId: number, from: Date, to: Date): void {
    this.loading.set(true);

    const fmt = (d: Date) => d.toISOString().slice(0, 19); // YYYY-MM-DDTHH:mm:ss

    const params = new HttpParams().set('userId', userId).set('from', fmt(from)).set('to', fmt(to));

    this.http
      .get<CalendarEventResponse[]>(`${this.base}/range`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (events) => {
          this.events.set(events);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  // ── findAllByEventType — für Type-Filter Button ───────────────────────────
  loadByType(userId: number, eventType: EventType): void {
    this.loading.set(true);

    const params = new HttpParams().set('userId', userId).set('eventType', eventType);

    this.http
      .get<CalendarEventResponse[]>(`${this.base}/type`, { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (events) => {
          this.events.set(events);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
