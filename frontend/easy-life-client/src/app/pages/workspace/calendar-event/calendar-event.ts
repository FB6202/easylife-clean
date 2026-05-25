import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarService } from '../../../core/services/calendar-service';
import { CategoryService } from '../../../core/services/category-service';
import { AiAgentService } from '../../../core/services/ai-agent';
import {
  CalendarEventResponse,
  EventType,
  RecurrenceType,
  AccessType,
} from '../../../core/models/calendar.model';
import { environment } from '../../../../environments/environment';

type ViewMode = 'month' | 'week' | 'day';

interface EventForm {
  title: string;
  description: string;
  location: string;
  eventColor: string;
  startDateTime: string;
  endDateTime: string;
  allDay: boolean;
  eventType: EventType;
  recurrence: RecurrenceType;
  accessType: AccessType;
  categoryIds: number[];
}

interface DayCell {
  date: Date;
  currentMonth: boolean;
  isToday: boolean;
  events: CalendarEventResponse[];
}

interface WeekDay {
  date: Date;
  isToday: boolean;
  events: CalendarEventResponse[];
}

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar-event.html',
  styleUrl: './calendar-event.scss',
})
export class CalendarComponent implements OnInit {
  private readonly userId = environment.userId;
  private readonly calendarService = inject(CalendarService);
  private readonly categoryService = inject(CategoryService);
  private readonly aiAgent = inject(AiAgentService);

  readonly today = new Date();
  readonly viewMode = signal<ViewMode>('month');
  readonly activeFilter = signal<EventType | 'ALL'>('ALL');
  readonly currentDate = signal(new Date());
  readonly selectedDate = signal(new Date());

  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  selectedEvent = signal<CalendarEventResponse | null>(null);

  showCatDropdown = signal(false);
  showEditCatDropdown = signal(false);

  readonly availableCategories = this.categoryService.allCategories;

  // ── Static data ────────────────────────────────────────────────────────────
  readonly weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  readonly hours = Array.from({ length: 24 }, (_, i) => i);

  readonly eventTypes: { type: EventType; icon: string; label: string }[] = [
    { type: 'APPOINTMENT', icon: 'event', label: 'Appointments' },
    { type: 'REMINDER', icon: 'notifications', label: 'Reminders' },
    { type: 'TASK', icon: 'check_circle', label: 'Tasks' },
    { type: 'BIRTHDAY', icon: 'cake', label: 'Birthdays' },
  ];

  readonly eventColors = [
    '#43a047',
    '#1976d2',
    '#f57c00',
    '#9c27b0',
    '#f44336',
    '#00bcd4',
    '#e91e63',
    '#ff5722',
    '#3f51b5',
    '#009688',
  ];

  readonly recurrenceOptions: { value: RecurrenceType; label: string }[] = [
    { value: 'NONE', label: 'No Recurrence' },
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'YEARLY', label: 'Yearly' },
  ];

  // ── Service State ──────────────────────────────────────────────────────────
  readonly filteredEvents = computed(() => {
    const filter = this.activeFilter();
    const events = this.calendarService.events();
    return filter === 'ALL' ? events : events.filter((e) => e.eventType === filter);
  });

  // ── Header ─────────────────────────────────────────────────────────────────
  headerLabel(): string {
    return { month: 'MONTHLY VIEW', week: 'WEEKLY VIEW', day: 'DAILY VIEW' }[this.viewMode()];
  }

  headerTitle(): string {
    const d = this.currentDate();
    const v = this.viewMode();
    if (v === 'month') return d.toLocaleString('en', { month: 'long', year: 'numeric' });
    if (v === 'week') {
      const days = this.currentWeekDays();
      const first = days[0].date;
      const last = days[6].date;
      return `${first.toLocaleString('en', { month: 'short', day: 'numeric' })} – ${last.toLocaleString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return d.toLocaleString('en', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  upcomingCount(): number {
    return this.filteredEvents().filter((e) => new Date(e.startDateTime) >= this.today).length;
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  prev(): void {
    const d = new Date(this.currentDate());
    const v = this.viewMode();
    if (v === 'month') {
      d.setMonth(d.getMonth() - 1);
      this.reloadForMonth(d);
    }
    if (v === 'week') {
      d.setDate(d.getDate() - 7);
    }
    if (v === 'day') {
      d.setDate(d.getDate() - 1);
      this.selectedDate.set(new Date(d));
    }
    this.currentDate.set(d);
  }

  next(): void {
    const d = new Date(this.currentDate());
    const v = this.viewMode();
    if (v === 'month') {
      d.setMonth(d.getMonth() + 1);
      this.reloadForMonth(d);
    }
    if (v === 'week') {
      d.setDate(d.getDate() + 7);
    }
    if (v === 'day') {
      d.setDate(d.getDate() + 1);
      this.selectedDate.set(new Date(d));
    }
    this.currentDate.set(d);
  }

  goToday(): void {
    const t = new Date(this.today);
    this.currentDate.set(t);
    this.selectedDate.set(t);
    this.reloadForMonth(t);
  }

  setView(mode: ViewMode): void {
    this.viewMode.set(mode);
    if (mode === 'day') {
      this.selectedDate.set(new Date(this.currentDate()));
    }
  }

  setFilter(filter: EventType | 'ALL'): void {
    this.activeFilter.set(filter);
    if (filter !== 'ALL') {
      this.calendarService.loadByType(this.userId, filter);
    } else {
      this.reloadForMonth(this.currentDate());
    }
  }

  // ── Month Grid ─────────────────────────────────────────────────────────────
  readonly calendarDays = computed((): DayCell[] => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const events = this.filteredEvents();
    const cells: DayCell[] = [];

    let startDay = first.getDay() - 1;
    if (startDay < 0) startDay = 6; // Sunday fix

    for (let i = 0; i < startDay; i++) {
      const d = new Date(year, month, 1 - startDay + i);
      cells.push({ date: d, currentMonth: false, isToday: false, events: [] });
    }

    for (let d = 1; d <= last.getDate(); d++) {
      const cellDate = new Date(year, month, d);
      cells.push({
        date: cellDate,
        currentMonth: true,
        isToday: this.isSameDay(cellDate, this.today),
        events: events.filter((e) => this.isSameDay(new Date(e.startDateTime), cellDate)),
      });
    }

    return cells;
  });

  isSelectedDay(date: Date): boolean {
    return this.isSameDay(date, this.selectedDate());
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  selectDay(date: Date): void {
    this.selectedDate.set(date);
    this.currentDate.set(new Date(date));
  }

  // ── Selected Day Panel ─────────────────────────────────────────────────────
  selectedDayLabel(): string {
    return this.selectedDate().toLocaleString('en', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  isSelectedDateToday(): boolean {
    return this.isSameDay(this.selectedDate(), this.today);
  }

  selectedDayEvents(): CalendarEventResponse[] {
    return this.filteredEvents()
      .filter((e) => this.isSameDay(new Date(e.startDateTime), this.selectedDate()))
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
  }

  // ── Week View ──────────────────────────────────────────────────────────────
  readonly currentWeekDays = computed((): WeekDay[] => {
    const date = this.currentDate();
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    const events = this.filteredEvents();

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        date: d,
        isToday: this.isSameDay(d, this.today),
        events: events.filter((e) => this.isSameDay(new Date(e.startDateTime), d)),
      };
    });
  });

  // ── Day View ───────────────────────────────────────────────────────────────
  readonly dayEvents = computed((): CalendarEventResponse[] =>
    this.filteredEvents()
      .filter((e) => this.isSameDay(new Date(e.startDateTime), this.selectedDate()))
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()),
  );

  // ── Time Helpers ───────────────────────────────────────────────────────────
  formatHour(hour: number): string {
    return hour === 0
      ? '12 AM'
      : hour < 12
        ? `${hour} AM`
        : hour === 12
          ? '12 PM'
          : `${hour - 12} PM`;
  }

  formatDayShort(date: Date): string {
    return date.toLocaleString('en', { weekday: 'short', day: 'numeric' });
  }

  getEventTopPercent(startDateTime: string): number {
    const d = new Date(startDateTime);
    return ((d.getHours() * 60 + d.getMinutes()) / (24 * 60)) * 100;
  }

  getEventHeightPercent(startDateTime: string, endDateTime: string): number {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
    return Math.max((duration / (24 * 60)) * 100, 2);
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  }

  getEventTypeIcon(type: EventType): string {
    return {
      APPOINTMENT: 'event',
      REMINDER: 'notifications',
      TASK: 'check_circle',
      BIRTHDAY: 'cake',
    }[type];
  }

  // ── Color Pickers ──────────────────────────────────────────────────────────
  createFormColors(): string[] {
    const cats = this.availableCategories();
    const ids = this.createForm().categoryIds;
    if (!Array.isArray(cats) || !ids.length) return this.eventColors;
    return [...new Set(cats.filter((c) => ids.includes(c.id)).map((c) => c.color))];
  }

  editFormColors(): string[] {
    const cats = this.availableCategories();
    const ids = this.editForm().categoryIds;
    if (!Array.isArray(cats) || !ids.length) return this.eventColors;
    return [...new Set(cats.filter((c) => ids.includes(c.id)).map((c) => c.color))];
  }

  // ── Category Helpers ───────────────────────────────────────────────────────
  toggleCatDropdown(event: Event): void {
    event.stopPropagation();
    this.showCatDropdown.update((v) => !v);
    this.showEditCatDropdown.set(false);
  }

  toggleEditCatDropdown(event: Event): void {
    event.stopPropagation();
    this.showEditCatDropdown.update((v) => !v);
    this.showCatDropdown.set(false);
  }

  getCatDropdownLabel(categoryIds: number[]): string {
    if (!categoryIds.length) return 'Select categories...';
    const cats = this.availableCategories();
    if (!Array.isArray(cats)) return `${categoryIds.length} selected`;
    if (categoryIds.length === 1)
      return cats.find((c) => c.id === categoryIds[0])?.name ?? '1 selected';
    return `${categoryIds.length} selected`;
  }

  getSelectedCatColors(categoryIds: number[]): string[] {
    const cats = this.availableCategories();
    if (!Array.isArray(cats)) return [];
    return cats
      .filter((c) => categoryIds.includes(c.id))
      .map((c) => c.color)
      .slice(0, 3);
  }

  toggleCreateCategory(id: number): void {
    const cats = this.availableCategories();
    this.createForm.update((f) => {
      const isRemoving = f.categoryIds.includes(id);
      const newIds = isRemoving ? f.categoryIds.filter((i) => i !== id) : [...f.categoryIds, id];

      // Auto-Set Farbe
      const newColors = Array.isArray(cats)
        ? [...new Set(cats.filter((c) => newIds.includes(c.id)).map((c) => c.color))]
        : [];

      let newColor = f.eventColor;
      if (newColors.length && !newColors.includes(f.eventColor)) {
        // Aktuelle Farbe nicht mehr in verfügbaren → erste Kategorie-Farbe
        newColor = newColors[0];
      } else if (!newIds.length) {
        // Alle Kategorien entfernt → Default
        newColor = this.eventColors[0];
      } else if (!isRemoving && f.eventColor === this.eventColors[0]) {
        // Erste Kategorie gewählt und noch Default → auto-set
        newColor = cats.find((c) => c.id === id)?.color ?? f.eventColor;
      }

      return { ...f, categoryIds: newIds, eventColor: newColor };
    });
  }

  toggleEditCategory(id: number): void {
    const cats = this.availableCategories();
    this.editForm.update((f) => {
      const isRemoving = f.categoryIds.includes(id);
      const newIds = isRemoving ? f.categoryIds.filter((i) => i !== id) : [...f.categoryIds, id];

      const newColors = Array.isArray(cats)
        ? [...new Set(cats.filter((c) => newIds.includes(c.id)).map((c) => c.color))]
        : [];

      let newColor = f.eventColor;
      if (newColors.length && !newColors.includes(f.eventColor)) {
        newColor = newColors[0];
      } else if (!newIds.length) {
        newColor = this.eventColors[0];
      } else if (!isRemoving && f.eventColor === this.eventColors[0]) {
        newColor = cats.find((c) => c.id === id)?.color ?? f.eventColor;
      }

      return { ...f, categoryIds: newIds, eventColor: newColor };
    });
  }

  // ── Modals ─────────────────────────────────────────────────────────────────
  createForm = signal<EventForm>({
    title: '',
    description: '',
    location: '',
    eventColor: '#43a047',
    startDateTime: '',
    endDateTime: '',
    allDay: false,
    eventType: 'APPOINTMENT',
    recurrence: 'NONE',
    accessType: 'PRIVATE',
    categoryIds: [],
  });

  editForm = signal<EventForm>({
    title: '',
    description: '',
    location: '',
    eventColor: '#43a047',
    startDateTime: '',
    endDateTime: '',
    allDay: false,
    eventType: 'APPOINTMENT',
    recurrence: 'NONE',
    accessType: 'PRIVATE',
    categoryIds: [],
  });

  openCreate(date?: Date): void {
    const start = date ? this.toDateTimeLocal(date) : '';
    this.createForm.set({
      title: '',
      description: '',
      location: '',
      eventColor: '#43a047',
      startDateTime: start,
      endDateTime: start,
      allDay: false,
      eventType: 'APPOINTMENT',
      recurrence: 'NONE',
      accessType: 'PRIVATE',
      categoryIds: [],
    });
    this.showCatDropdown.set(false);
    this.showCreateModal.set(true);
  }

  submitCreate(): void {
    if (!this.createForm().title.trim()) return;
    console.log('TODO create event:', this.createForm());
    this.showCreateModal.set(false);
  }

  openEdit(event: CalendarEventResponse, clickEvent?: Event): void {
    clickEvent?.stopPropagation();
    this.calendarService.loadById(this.userId, event.id);
    this.selectedEvent.set(event);
    this.editForm.set({
      title: event.title,
      description: event.description ?? '',
      location: event.location ?? '',
      eventColor: event.eventColor,
      startDateTime: event.startDateTime?.slice(0, 16) ?? '',
      endDateTime: event.endDateTime?.slice(0, 16) ?? '',
      allDay: event.allDay,
      eventType: event.eventType,
      recurrence: event.recurrence,
      accessType: event.accessType,
      categoryIds: event.categoryIds ?? [],
    });
    this.showEditCatDropdown.set(false);
    this.showEditModal.set(true);
  }

  submitEdit(): void {
    if (!this.editForm().title.trim()) return;
    console.log('TODO update event:', this.selectedEvent()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  openDeleteConfirm(): void {
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    console.log('TODO delete event:', this.selectedEvent()?.id);
    this.showDeleteConfirm.set(false);
    this.selectedEvent.set(null);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.reloadForMonth(this.today);
    this.categoryService.loadAllFlat(this.userId);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showCatDropdown.set(false);
    this.showEditCatDropdown.set(false);
  }

  // ── Private ────────────────────────────────────────────────────────────────
  private reloadForMonth(date: Date): void {
    const from = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
    const to = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
    this.calendarService.loadRange(this.userId, from, to);
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private toDateTimeLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
