import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ViewMode = 'month' | 'week' | 'day';
type EventType = 'APPOINTMENT' | 'REMINDER' | 'TASK' | 'BIRTHDAY';
type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
type AccessType = 'PRIVATE' | 'PUBLIC';

interface CategoryPreview {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface CalendarEvent {
  id: number;
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
  date: Date;
  categoryIds: number[];
}

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
  events: CalendarEvent[];
}

interface WeekDay {
  date: Date;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar-event.html',
  styleUrl: './calendar-event.scss',
})
export class CalendarComponent {
  readonly today = new Date(2026, 3, 29);
  readonly viewMode = signal<ViewMode>('month');
  readonly activeFilter = signal<EventType | 'ALL'>('ALL');
  readonly currentDate = signal(new Date(this.today));
  readonly selectedDate = signal(new Date(this.today));

  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);

  selectedEvent = signal<CalendarEvent | null>(null);

  // ── Category Dropdown ──────────────────────────────────
  showCatDropdown = signal(false);
  showEditCatDropdown = signal(false);

  readonly availableCategories = signal<CategoryPreview[]>([
    { id: 1, name: 'Work', icon: 'work', color: '#1976d2' },
    { id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' },
    { id: 3, name: 'Health', icon: 'self_improvement', color: '#43a047' },
    { id: 4, name: 'Personal', icon: 'person', color: '#9c27b0' },
    { id: 5, name: 'Learning', icon: 'school', color: '#e91e63' },
  ]);

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
    { value: 'NONE', label: 'Does not repeat' },
    { value: 'DAILY', label: 'Every day' },
    { value: 'WEEKLY', label: 'Every week' },
    { value: 'MONTHLY', label: 'Every month' },
    { value: 'YEARLY', label: 'Every year' },
  ];

  readonly weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  readonly hours = Array.from({ length: 24 }, (_, i) => i);

  readonly allEvents = signal<CalendarEvent[]>([
    {
      id: 1,
      title: 'Team Standup',
      description: 'Daily sync with the dev team',
      location: 'Google Meet',
      eventColor: '#43a047',
      startDateTime: '09:00',
      endDateTime: '09:30',
      allDay: false,
      eventType: 'APPOINTMENT',
      recurrence: 'DAILY',
      accessType: 'PUBLIC',
      date: new Date(2026, 3, 29),
      categoryIds: [1],
    },
    {
      id: 2,
      title: 'Quarterly Review',
      description: 'Q1 2026 results and Q2 planning session',
      location: 'Conference Room B',
      eventColor: '#1976d2',
      startDateTime: '14:00',
      endDateTime: '15:30',
      allDay: false,
      eventType: 'APPOINTMENT',
      recurrence: 'NONE',
      accessType: 'PRIVATE',
      date: new Date(2026, 3, 29),
      categoryIds: [1, 2],
    },
    {
      id: 3,
      title: 'Deploy Backend v2',
      description: 'Production deployment window',
      location: '',
      eventColor: '#f57c00',
      startDateTime: '22:00',
      endDateTime: '23:00',
      allDay: false,
      eventType: 'TASK',
      recurrence: 'NONE',
      accessType: 'PRIVATE',
      date: new Date(2026, 3, 29),
      categoryIds: [1],
    },
    {
      id: 4,
      title: 'Mom Birthday',
      description: '',
      location: '',
      eventColor: '#e91e63',
      startDateTime: '',
      endDateTime: '',
      allDay: true,
      eventType: 'BIRTHDAY',
      recurrence: 'YEARLY',
      accessType: 'PRIVATE',
      date: new Date(2026, 3, 30),
      categoryIds: [4],
    },
    {
      id: 5,
      title: 'Design Review',
      description: 'Review new UI mockups with the team',
      location: 'Figma',
      eventColor: '#9c27b0',
      startDateTime: '10:00',
      endDateTime: '11:00',
      allDay: false,
      eventType: 'APPOINTMENT',
      recurrence: 'NONE',
      accessType: 'PUBLIC',
      date: new Date(2026, 3, 28),
      categoryIds: [1],
    },
    {
      id: 6,
      title: 'Gym Session',
      description: 'Leg day',
      location: 'Gym',
      eventColor: '#43a047',
      startDateTime: '07:00',
      endDateTime: '08:30',
      allDay: false,
      eventType: 'REMINDER',
      recurrence: 'WEEKLY',
      accessType: 'PRIVATE',
      date: new Date(2026, 3, 28),
      categoryIds: [3],
    },
    {
      id: 7,
      title: 'Sprint Planning',
      description: 'Plan Sprint 12',
      location: 'Zoom',
      eventColor: '#1976d2',
      startDateTime: '09:00',
      endDateTime: '10:30',
      allDay: false,
      eventType: 'APPOINTMENT',
      recurrence: 'NONE',
      accessType: 'PUBLIC',
      date: new Date(2026, 3, 27),
      categoryIds: [1],
    },
    {
      id: 8,
      title: 'Dentist Appointment',
      description: 'Routine checkup',
      location: 'Dr. Müller',
      eventColor: '#00bcd4',
      startDateTime: '16:00',
      endDateTime: '17:00',
      allDay: false,
      eventType: 'APPOINTMENT',
      recurrence: 'NONE',
      accessType: 'PRIVATE',
      date: new Date(2026, 3, 30),
      categoryIds: [3],
    },
    {
      id: 9,
      title: 'Read: Atomic Habits',
      description: 'Daily reading session',
      location: '',
      eventColor: '#ff5722',
      startDateTime: '21:00',
      endDateTime: '21:30',
      allDay: false,
      eventType: 'REMINDER',
      recurrence: 'DAILY',
      accessType: 'PRIVATE',
      date: new Date(2026, 3, 29),
      categoryIds: [3],
    },
    {
      id: 10,
      title: 'Client Demo',
      description: 'Product demo for Acme Corp',
      location: 'Zoom',
      eventColor: '#1976d2',
      startDateTime: '15:00',
      endDateTime: '16:00',
      allDay: false,
      eventType: 'APPOINTMENT',
      recurrence: 'NONE',
      accessType: 'PUBLIC',
      date: new Date(2026, 3, 27),
      categoryIds: [1],
    },
    {
      id: 11,
      title: 'Weekly Journal',
      description: 'Weekly reflection and journal entry',
      location: '',
      eventColor: '#9c27b0',
      startDateTime: '20:00',
      endDateTime: '20:30',
      allDay: false,
      eventType: 'REMINDER',
      recurrence: 'WEEKLY',
      accessType: 'PRIVATE',
      date: new Date(2026, 3, 29),
      categoryIds: [4],
    },
    {
      id: 12,
      title: 'Moritz Call',
      description: 'Product strategy discussion',
      location: 'Phone',
      eventColor: '#ff5722',
      startDateTime: '18:00',
      endDateTime: '18:30',
      allDay: false,
      eventType: 'APPOINTMENT',
      recurrence: 'NONE',
      accessType: 'PRIVATE',
      date: new Date(2026, 3, 28),
      categoryIds: [],
    },
  ]);

  readonly emptyForm = (): EventForm => ({
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

  createForm = signal<EventForm>(this.emptyForm());
  editForm = signal<EventForm>(this.emptyForm());

  // ── Header ─────────────────────────────────────────────
  readonly headerTitle = computed(() => {
    const d = this.currentDate();
    const view = this.viewMode();
    if (view === 'month') {
      return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }
    if (view === 'week') {
      const week = this.currentWeekDays();
      const first = week[0].date;
      const last = week[6].date;
      const sameMonth = first.getMonth() === last.getMonth();
      if (sameMonth) {
        return `${first.toLocaleString('en-US', { month: 'long' })} ${first.getDate()} – ${last.getDate()}, ${first.getFullYear()}`;
      }
      return `${first.toLocaleString('en-US', { month: 'short' })} ${first.getDate()} – ${last.toLocaleString('en-US', { month: 'short' })} ${last.getDate()}, ${last.getFullYear()}`;
    }
    return d.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  });

  readonly headerLabel = computed(() => {
    const view = this.viewMode();
    if (view === 'month') return `SCHEDULE ${this.currentDate().getFullYear()}`;
    if (view === 'week') return 'WEEK VIEW';
    return 'DAY VIEW';
  });

  readonly upcomingCount = computed(() => {
    const d = this.currentDate();
    const view = this.viewMode();
    if (view === 'month') {
      return this.allEvents().filter(
        (e) => e.date.getMonth() === d.getMonth() && e.date.getFullYear() === d.getFullYear(),
      ).length;
    }
    if (view === 'week') {
      const week = this.currentWeekDays();
      const first = week[0].date;
      const last = week[6].date;
      return this.allEvents().filter((e) => e.date >= first && e.date <= last).length;
    }
    return this.eventsForDay(d).length;
  });

  // ── Selected Day Panel ─────────────────────────────────
  readonly selectedDayLabel = computed(() => {
    const d = this.selectedDate();
    return d.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  });

  readonly selectedDayEvents = computed(() => this.eventsForDay(this.selectedDate()));

  readonly isSelectedDateToday = computed(() => this.isSameDay(this.selectedDate(), this.today));

  // ── Month View ─────────────────────────────────────────
  readonly calendarDays = computed((): DayCell[] => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days: DayCell[] = [];

    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, currentMonth: false, isToday: false, events: [] });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const cellDate = new Date(year, month, d);
      const isToday = this.isSameDay(cellDate, this.today);
      const events = this.eventsForDay(cellDate);
      days.push({ date: cellDate, currentMonth: true, isToday, events });
    }

    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const cellDate = new Date(year, month + 1, d);
      days.push({ date: cellDate, currentMonth: false, isToday: false, events: [] });
    }

    return days;
  });

  // ── Week View ──────────────────────────────────────────
  readonly currentWeekDays = computed((): WeekDay[] => {
    const d = this.currentDate();
    const dow = d.getDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + mondayOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      return { date, isToday: this.isSameDay(date, this.today), events: this.eventsForDay(date) };
    });
  });

  // ── Day View ───────────────────────────────────────────
  readonly dayEvents = computed(() =>
    this.eventsForDay(this.currentDate()).sort((a, b) =>
      (a.startDateTime ?? '').localeCompare(b.startDateTime ?? ''),
    ),
  );

  // ── Navigation ─────────────────────────────────────────
  prev() {
    const d = this.currentDate();
    const view = this.viewMode();
    if (view === 'month') {
      this.currentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
    } else if (view === 'week') {
      this.currentDate.set(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7));
    } else {
      this.currentDate.set(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
    }
  }

  next() {
    const d = this.currentDate();
    const view = this.viewMode();
    if (view === 'month') {
      this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
    } else if (view === 'week') {
      this.currentDate.set(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));
    } else {
      this.currentDate.set(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
    }
  }

  goToday() {
    this.currentDate.set(new Date(this.today));
    this.selectedDate.set(new Date(this.today));
  }

  setView(mode: ViewMode) {
    this.viewMode.set(mode);
  }

  setFilter(type: EventType | 'ALL') {
    this.activeFilter.set(type);
  }

  // ── Day Selection (Month View) ─────────────────────────
  selectDay(date: Date) {
    this.selectedDate.set(date);
  }

  isSelectedDay(date: Date): boolean {
    return this.isSameDay(date, this.selectedDate());
  }

  // ── Category Dropdown Methods ──────────────────────────
  toggleCatDropdown(event: Event) {
    event.stopPropagation();
    this.showCatDropdown.update(v => !v);
    this.showEditCatDropdown.set(false);
  }

  toggleEditCatDropdown(event: Event) {
    event.stopPropagation();
    this.showEditCatDropdown.update(v => !v);
    this.showCatDropdown.set(false);
  }

  toggleCreateCategory(id: number) {
    this.createForm.update(f => {
      const ids = f.categoryIds.includes(id)
        ? f.categoryIds.filter(i => i !== id)
        : f.categoryIds.length < 5 ? [...f.categoryIds, id] : f.categoryIds;
      const newForm = { ...f, categoryIds: ids };
      // Auto-set color from first selected category
      if (ids.length > 0) {
        const firstCat = this.availableCategories().find(c => c.id === ids[0]);
        if (firstCat) newForm.eventColor = firstCat.color;
      } else {
        newForm.eventColor = '#43a047';
      }
      return newForm;
    });
  }

  toggleEditCategory(id: number) {
    this.editForm.update(f => {
      const ids = f.categoryIds.includes(id)
        ? f.categoryIds.filter(i => i !== id)
        : f.categoryIds.length < 5 ? [...f.categoryIds, id] : f.categoryIds;
      const newForm = { ...f, categoryIds: ids };
      if (ids.length > 0) {
        const firstCat = this.availableCategories().find(c => c.id === ids[0]);
        if (firstCat) newForm.eventColor = firstCat.color;
      } else {
        newForm.eventColor = '#43a047';
      }
      return newForm;
    });
  }

  getCatDropdownLabel(categoryIds: number[]): string {
    if (categoryIds.length === 0) return 'Select categories...';
    if (categoryIds.length === 1)
      return this.availableCategories().find(c => c.id === categoryIds[0])?.name ?? '1 selected';
    return `${categoryIds.length} selected`;
  }

  getSelectedCatColors(categoryIds: number[]): string[] {
    return this.availableCategories()
      .filter(c => categoryIds.includes(c.id))
      .map(c => c.color)
      .slice(0, 3);
  }

  readonly createFormColors = computed(() => {
    const ids = this.createForm().categoryIds;
    if (ids.length === 0) return this.eventColors;
    const catColors = this.availableCategories()
      .filter(c => ids.includes(c.id))
      .map(c => c.color);
    return catColors;
  });

  readonly editFormColors = computed(() => {
    const ids = this.editForm().categoryIds;
    if (ids.length === 0) return this.eventColors;
    const catColors = this.availableCategories()
      .filter(c => ids.includes(c.id))
      .map(c => c.color);
    return catColors;
  });

  // ── Create ─────────────────────────────────────────────
  openCreate() {
    this.createForm.set(this.emptyForm());
    this.showCatDropdown.set(false);
    this.showCreateModal.set(true);
  }

  submitCreate() {
    if (!this.createForm().title.trim()) return;
    console.log('Create event:', this.createForm());
    this.showCreateModal.set(false);
  }

  // ── Edit ───────────────────────────────────────────────
  openEdit(event: CalendarEvent, $event?: Event) {
    $event?.stopPropagation();
    this.selectedEvent.set(event);
    this.editForm.set({
      title: event.title,
      description: event.description,
      location: event.location,
      eventColor: event.eventColor,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      allDay: event.allDay,
      eventType: event.eventType,
      recurrence: event.recurrence,
      accessType: event.accessType,
      categoryIds: event.categoryIds,
    });
    this.showEditCatDropdown.set(false);
    this.showEditModal.set(true);
  }

  submitEdit() {
    if (!this.editForm().title.trim()) return;
    console.log('Update event:', this.selectedEvent()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  openDeleteConfirm() {
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    const id = this.selectedEvent()?.id;
    if (id) this.allEvents.update((e) => e.filter((ev) => ev.id !== id));
    this.showDeleteConfirm.set(false);
    this.showEditModal.set(false);
    this.selectedEvent.set(null);
  }

  deleteEvent() {
    const id = this.selectedEvent()?.id;
    if (id) this.allEvents.update((e) => e.filter((ev) => ev.id !== id));
    this.showEditModal.set(false);
    this.selectedEvent.set(null);
  }

  // ── Helpers ────────────────────────────────────────────
  eventsForDay(date: Date): CalendarEvent[] {
    return this.allEvents().filter((e) => this.isSameDay(e.date, date));
  }

  isSameDay(a: Date, b: Date): boolean {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }

  isWeekend(date: Date): boolean {
    return date.getDay() === 0 || date.getDay() === 6;
  }

  formatDayShort(date: Date): string {
    return date.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
  }

  formatHour(hour: number): string {
    return hour === 0
      ? '12 AM'
      : hour < 12
        ? `${hour} AM`
        : hour === 12
          ? '12 PM'
          : `${hour - 12} PM`;
  }

  getEventTopPercent(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return ((h * 60 + m) / (24 * 60)) * 100;
  }

  getEventHeightPercent(time: string, endTime: string): number {
    const [h1, m1] = time.split(':').map(Number);
    const [h2, m2] = endTime.split(':').map(Number);
    const duration = h2 * 60 + m2 - (h1 * 60 + m1);
    return (duration / (24 * 60)) * 100;
  }

  getEventTypeIcon(type: EventType): string {
    const map: Record<EventType, string> = {
      APPOINTMENT: 'event',
      REMINDER: 'notifications',
      TASK: 'check_circle',
      BIRTHDAY: 'cake',
    };
    return map[type];
  }
}