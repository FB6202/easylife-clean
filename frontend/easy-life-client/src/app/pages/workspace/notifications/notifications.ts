import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import {
  FilterPanelComponent,
  FilterField,
  FilterValues,
} from '../../../shared/components/filter/filter';
import { NotificationService } from '../../../core/services/notification-service';
import { TodoService } from '../../../core/services/todo-service';
import { GoalService } from '../../../core/services/goal-service';
import { CalendarService } from '../../../core/services/calendar-service';
import { AiAgentService } from '../../../core/services/ai-agent';
import {
  NotificationResponse,
  NotificationFilter,
  NotificationType,
  NotificationChannel,
  ReferenceType,
} from '../../../core/models/notification.model';
import { environment } from '../../../../environments/environment';

interface ChannelOption {
  value: NotificationChannel;
  label: string;
  icon: string;
}
interface RefTypeOption {
  value: ReferenceType;
  label: string;
  icon: string;
}
interface RefItem {
  id: number;
  label: string;
  type: ReferenceType;
}

interface NotificationForm {
  title: string;
  message: string;
  type: NotificationType;
  channels: NotificationChannel[];
  referenceType: ReferenceType | null;
  referenceId: number | null;
  scheduledAt: string;
}

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, FormsModule, PaginationComponent, FilterPanelComponent],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class NotificationsComponent implements OnInit {
  private readonly userId = environment.userId;
  private readonly notificationService = inject(NotificationService);
  private readonly todoService = inject(TodoService);
  private readonly goalService = inject(GoalService);
  private readonly calendarService = inject(CalendarService);
  private readonly aiAgent = inject(AiAgentService);

  readonly notificationTypes: NotificationType[] = ['REMINDER', 'INFO', 'WARNING', 'SUCCESS'];

  readonly channelOptions: ChannelOption[] = [
    { value: 'IN_APP', label: 'In App', icon: 'notifications' },
    { value: 'EMAIL', label: 'Email', icon: 'email' },
    { value: 'PUSH', label: 'Push', icon: 'phone_android' },
  ];

  readonly referenceTypeOptions: RefTypeOption[] = [
    { value: 'TODO', label: 'Task', icon: 'check_circle' },
    { value: 'GOAL', label: 'Goal', icon: 'flag' },
    { value: 'EVENT', label: 'Event', icon: 'event' },
    { value: 'DOCUMENT', label: 'Document', icon: 'description' },
    { value: 'CONTACT', label: 'Contact', icon: 'person' },
    { value: 'JOURNAL_ENTRY', label: 'Journal', icon: 'menu_book' },
    { value: 'WEEK_PLAN', label: 'Week Plan', icon: 'view_week' },
  ];

  // ── Service State ──────────────────────────────────────────────────────────
  readonly paginatedNotifications = this.notificationService.notifications;
  readonly currentPage = this.notificationService.currentPage;
  readonly pageSize = this.notificationService.pageSize;
  readonly totalPages = this.notificationService.totalPages;
  readonly totalElements = this.notificationService.totalElements;
  readonly unreadCount = this.notificationService.unreadCount;

  // ── Active filter chip ─────────────────────────────────────────────────────
  readonly activeFilter = signal<NotificationType | 'ALL'>('ALL');

  readonly countByType = computed(() => {
    const ns = this.paginatedNotifications();
    return {
      REMINDER: ns.filter((n) => n.type === 'REMINDER' && !n.alreadyRead).length,
      WARNING: ns.filter((n) => n.type === 'WARNING' && !n.alreadyRead).length,
      SUCCESS: ns.filter((n) => n.type === 'SUCCESS' && !n.alreadyRead).length,
      INFO: ns.filter((n) => n.type === 'INFO' && !n.alreadyRead).length,
    };
  });

  readonly filteredNotifications = computed(() => {
    const filter = this.activeFilter();
    const ns = this.paginatedNotifications();
    return filter === 'ALL' ? ns : ns.filter((n) => n.type === filter);
  });

  setFilter(filter: NotificationType | 'ALL'): void {
    this.activeFilter.set(filter);
    if (filter !== 'ALL') {
      this.notificationService.loadAll(this.userId, 0, {
        ...this.buildFilterFromActive(),
        type: filter,
      });
    } else {
      this.notificationService.loadAll(this.userId, 0, this.buildFilterFromActive());
    }
  }

  // ── Filter Panel ───────────────────────────────────────────────────────────
  showFilter = signal(false);
  activeFilters = signal<FilterValues>({});

  readonly notificationFilterFields = computed((): FilterField[] => [
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      icon: 'notifications',
      options: [
        { value: 'REMINDER', label: 'Reminder', icon: 'alarm', color: '#f9a825' },
        { value: 'INFO', label: 'Info', icon: 'info', color: '#1976d2' },
        { value: 'WARNING', label: 'Warning', icon: 'warning', color: '#f57c00' },
        { value: 'SUCCESS', label: 'Success', icon: 'check_circle', color: '#43a047' },
      ],
    },
    {
      key: 'alreadyRead',
      label: 'Status',
      type: 'select',
      icon: 'mark_email_read',
      options: [
        { value: 'false', label: 'Unread', icon: 'mark_email_unread', color: '#1976d2' },
        { value: 'true', label: 'Read', icon: 'mark_email_read', color: '#757575' },
      ],
    },
    {
      key: 'referenceType',
      label: 'Linked To',
      type: 'select',
      icon: 'link',
      options: this.referenceTypeOptions.map((r) => ({
        value: r.value,
        label: r.label,
        icon: r.icon,
        color: '#757575',
      })),
    },
  ]);

  readonly activeFilterCount = computed(
    () => Object.values(this.activeFilters()).filter((v) => v && v !== '').length,
  );

  onFilterApply(values: FilterValues): void {
    this.activeFilters.set(values);
    const alreadyRead =
      values['alreadyRead'] === 'true'
        ? true
        : values['alreadyRead'] === 'false'
          ? false
          : undefined;
    this.notificationService.loadAll(this.userId, 0, {
      type: (values['type'] as NotificationType) || undefined,
      referenceType: (values['referenceType'] as ReferenceType) || undefined,
      alreadyRead,
    });
    this.showFilter.set(false);
  }

  onFilterReset(): void {
    this.activeFilters.set({});
    this.activeFilter.set('ALL');
    this.notificationService.loadAll(this.userId, 0);
    this.showFilter.set(false);
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  onPageChange(page: number): void {
    this.notificationService.loadAll(this.userId, page, this.buildFilterFromActive());
  }

  onPageSizeChange(size: number): void {
    this.notificationService.pageSize.set(size);
    this.notificationService.loadAll(this.userId, 0, this.buildFilterFromActive());
  }

  onAiClick(): void {
    this.aiAgent.open();
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  markAllRead(): void {
    console.log('TODO markAllAsRead');
  }

  markAsRead(id: number, event: Event): void {
    event.stopPropagation();
    console.log('TODO markAsRead:', id);
  }

  // ── Channel Dropdown ───────────────────────────────────────────────────────
  showCreateChannelDropdown = signal(false);
  showEditChannelDropdown = signal(false);

  toggleChannelDropdown(mode: 'create' | 'edit', event: Event): void {
    event.stopPropagation();
    if (mode === 'create') {
      this.showCreateChannelDropdown.update((v) => !v);
      this.showEditChannelDropdown.set(false);
    } else {
      this.showEditChannelDropdown.update((v) => !v);
      this.showCreateChannelDropdown.set(false);
    }
  }

  toggleChannel(value: NotificationChannel, mode: 'create' | 'edit'): void {
    const form = mode === 'create' ? this.createForm : this.editForm;
    form.update((f) => ({
      ...f,
      channels: f.channels.includes(value)
        ? f.channels.filter((c) => c !== value)
        : [...f.channels, value],
    }));
  }

  getChannelLabel(channels: NotificationChannel[]): string {
    if (!channels.length) return 'Select channels...';
    return channels
      .map((c) => this.channelOptions.find((o) => o.value === c)?.label ?? c)
      .join(', ');
  }

  // ── Reference Options (from loaded services) ───────────────────────────────
  readonly referenceOptions = computed((): RefItem[] => [
    ...this.todoService.todos().map((t) => ({
      id: t.id,
      label: t.title,
      type: 'TODO' as ReferenceType,
    })),
    ...this.goalService.goals().map((g) => ({
      id: g.id,
      label: g.title,
      type: 'GOAL' as ReferenceType,
    })),
    ...this.calendarService.events().map((e) => ({
      id: e.id,
      label: e.title,
      type: 'EVENT' as ReferenceType,
    })),
  ]);

  readonly filteredReferenceOptions = computed(() => {
    const type = this.createForm().referenceType;
    if (!type) return [];
    return this.referenceOptions().filter((r) => r.type === type);
  });

  readonly filteredEditReferenceOptions = computed(() => {
    const type = this.editForm().referenceType;
    if (!type) return [];
    return this.referenceOptions().filter((r) => r.type === type);
  });

  onRefTypeChange(type: ReferenceType | null, mode: 'create' | 'edit'): void {
    const form = mode === 'create' ? this.createForm : this.editForm;
    form.update((f) => ({ ...f, referenceType: type, referenceId: null }));
  }

  // ── Modals ─────────────────────────────────────────────────────────────────
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  selectedNotification = signal<NotificationResponse | null>(null);

  private emptyForm(): NotificationForm {
    return {
      title: '',
      message: '',
      type: 'REMINDER',
      channels: ['IN_APP'],
      referenceType: null,
      referenceId: null,
      scheduledAt: '',
    };
  }

  createForm = signal<NotificationForm>(this.emptyForm());
  editForm = signal<NotificationForm>(this.emptyForm());

  openCreate(): void {
    this.createForm.set(this.emptyForm());
    this.showCreateChannelDropdown.set(false);
    this.showCreateModal.set(true);
  }

  submitCreate(): void {
    if (!this.createForm().title.trim()) return;
    console.log('TODO create notification:', this.createForm());
    this.showCreateModal.set(false);
  }

  openEdit(notif: NotificationResponse): void {
    this.selectedNotification.set(notif);
    this.editForm.set({
      title: notif.title,
      message: notif.message,
      type: notif.type,
      channels: notif.channel ? [notif.channel] : ['IN_APP'],
      referenceType: notif.referenceType ?? null,
      referenceId: notif.referenceId ?? null,
      scheduledAt: notif.scheduledAt?.slice(0, 16) ?? '',
    });
    this.showEditChannelDropdown.set(false);
    this.showEditModal.set(true);
  }

  submitEdit(): void {
    if (!this.editForm().title.trim()) return;
    console.log('TODO update notification:', this.selectedNotification()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  openDeleteConfirm(): void {
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    console.log('TODO delete notification:', this.selectedNotification()?.id);
    this.showDeleteConfirm.set(false);
    this.selectedNotification.set(null);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getTypeIcon(type: NotificationType): string {
    return { REMINDER: 'alarm', INFO: 'info', WARNING: 'warning', SUCCESS: 'check_circle' }[type];
  }

  getTypeClass(type: NotificationType): string {
    return 'notif-type--' + type.toLowerCase();
  }

  getTypeLabel(type: NotificationType): string {
    return { REMINDER: 'Reminder', INFO: 'Info', WARNING: 'Warning', SUCCESS: 'Success' }[type];
  }

  getReferenceLabel(type: ReferenceType): string {
    return this.referenceTypeOptions.find((r) => r.value === type)?.label ?? type;
  }

  formatDateTime(dateStr: string | null): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showCreateChannelDropdown.set(false);
    this.showEditChannelDropdown.set(false);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.notificationService.loadAll(this.userId);
    this.notificationService.loadUnreadCount(this.userId);
    this.todoService.loadAll(this.userId);
    this.goalService.loadAll(this.userId);
    this.calendarService.loadAll(this.userId);
  }

  private buildFilterFromActive(): NotificationFilter {
    const v = this.activeFilters();
    const alreadyRead =
      v['alreadyRead'] === 'true' ? true : v['alreadyRead'] === 'false' ? false : undefined;
    return {
      type: (v['type'] as NotificationType) || undefined,
      referenceType: (v['referenceType'] as ReferenceType) || undefined,
      alreadyRead,
    };
  }
}
