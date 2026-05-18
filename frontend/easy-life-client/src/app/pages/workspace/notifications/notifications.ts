import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import {
  FilterPanelComponent,
  FilterField,
  FilterValues,
} from '../../../shared/components/filter/filter';
import { AiAgentService } from '../../../core/services/ai-agent';

type NotificationType = 'REMINDER' | 'INFO' | 'WARNING' | 'SUCCESS';
type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH';
type ReferenceType =
  | 'TODO'
  | 'GOAL'
  | 'EVENT'
  | 'DOCUMENT'
  | 'CONTACT'
  | 'JOURNAL_ENTRY'
  | 'WEEK_PLAN';

interface ReferenceOption {
  id: number;
  label: string;
  type: ReferenceType;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  referenceType: ReferenceType | null;
  referenceId: number | null;
  alreadyRead: boolean;
  scheduledAt: string;
  sentAt: string;
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
export class NotificationsComponent {
  readonly activeFilter = signal<NotificationType | 'ALL'>('ALL');

  // Mock reference items – later from API
  readonly referenceOptions = signal<ReferenceOption[]>([
    { id: 1, label: 'Review Annual Financial Report Q4', type: 'TODO' },
    { id: 2, label: 'Monthly Team Synergy Workshop', type: 'TODO' },
    { id: 3, label: 'Daily Mindful Movement', type: 'GOAL' },
    { id: 4, label: 'Portfolio Diversification', type: 'GOAL' },
    { id: 5, label: 'Team Standup', type: 'EVENT' },
    { id: 6, label: 'Quarterly Review', type: 'EVENT' },
    { id: 7, label: 'Scaling the Creative Horizon', type: 'WEEK_PLAN' },
    { id: 8, label: 'Deep Work Foundations', type: 'WEEK_PLAN' },
    { id: 9, label: 'Quarterly Financial Statement 2024', type: 'DOCUMENT' },
    { id: 10, label: 'Eleanor Vance', type: 'CONTACT' },
  ]);

  readonly referenceTypeOptions: { value: ReferenceType; label: string; icon: string }[] = [
    { value: 'TODO', label: 'Task', icon: 'check_circle' },
    { value: 'GOAL', label: 'Goal', icon: 'flag' },
    { value: 'EVENT', label: 'Calendar Event', icon: 'event' },
    { value: 'WEEK_PLAN', label: 'Week Plan', icon: 'view_week' },
    { value: 'DOCUMENT', label: 'Document', icon: 'description' },
    { value: 'CONTACT', label: 'Contact', icon: 'person' },
    { value: 'JOURNAL_ENTRY', label: 'Journal Entry', icon: 'menu_book' },
  ];

  readonly notifications = signal<Notification[]>([
    {
      id: 1,
      title: 'Goal Accomplished: Q3 Review',
      message: 'You have successfully completed 100% of your primary goals for this quarter.',
      type: 'SUCCESS',
      channel: 'IN_APP',
      referenceType: 'GOAL',
      referenceId: 1,
      alreadyRead: false,
      scheduledAt: '',
      sentAt: 'Today, 9:41 AM',
    },
    {
      id: 2,
      title: 'Storage Limit Approaching',
      message: 'Your document storage is at 85% capacity. Consider upgrading your plan.',
      type: 'WARNING',
      channel: 'IN_APP',
      referenceType: 'DOCUMENT',
      referenceId: 9,
      alreadyRead: true,
      scheduledAt: '',
      sentAt: 'Yesterday, 4:20 PM',
    },
    {
      id: 3,
      title: 'Upcoming Project Sync',
      message: "Sync meeting for 'Easy Life Rebrand' starts in 15 minutes.",
      type: 'REMINDER',
      channel: 'IN_APP',
      referenceType: 'EVENT',
      referenceId: 5,
      alreadyRead: false,
      scheduledAt: '',
      sentAt: 'Yesterday, 10:00 AM',
    },
    {
      id: 4,
      title: 'New Follower',
      message: '@max_builder started following you.',
      type: 'INFO',
      channel: 'IN_APP',
      referenceType: 'CONTACT',
      referenceId: 10,
      alreadyRead: true,
      scheduledAt: '',
      sentAt: 'Oct 23, 2023',
    },
    {
      id: 5,
      title: 'Follow Request Accepted',
      message: '@sarah_creates accepted your follow request.',
      type: 'SUCCESS',
      channel: 'IN_APP',
      referenceType: null,
      referenceId: null,
      alreadyRead: false,
      scheduledAt: '',
      sentAt: 'Oct 22, 2023',
    },
    {
      id: 6,
      title: 'Weekly Journal Reminder',
      message: "You haven't written a journal entry this week.",
      type: 'REMINDER',
      channel: 'IN_APP',
      referenceType: 'JOURNAL_ENTRY',
      referenceId: null,
      alreadyRead: true,
      scheduledAt: '',
      sentAt: 'Oct 21, 2023',
    },
    {
      id: 7,
      title: 'Goal Deadline Tomorrow',
      message:
        "Your goal 'Portfolio Diversification' is due tomorrow. You're at 42% — push for a final sprint!",
      type: 'REMINDER',
      channel: 'IN_APP',
      referenceType: 'GOAL',
      referenceId: 2,
      alreadyRead: false,
      scheduledAt: '',
      sentAt: 'Oct 20, 2023',
    },
    {
      id: 8,
      title: 'Document Shared With You',
      message: "Moritz shared 'Q4 Strategy Deck' with you. Review and leave comments.",
      type: 'INFO',
      channel: 'IN_APP',
      referenceType: 'DOCUMENT',
      referenceId: 1,
      alreadyRead: true,
      scheduledAt: '',
      sentAt: 'Oct 19, 2023',
    },
    {
      id: 9,
      title: 'Week Plan Starts Tomorrow',
      message: "Your week plan 'Q4 Strategy & Planning' starts tomorrow. Are you ready?",
      type: 'REMINDER',
      channel: 'IN_APP',
      referenceType: 'WEEK_PLAN',
      referenceId: 3,
      alreadyRead: false,
      scheduledAt: '',
      sentAt: 'Oct 18, 2023',
    },
    {
      id: 10,
      title: 'System Maintenance Tonight',
      message:
        'Easy Life will undergo scheduled maintenance from 2am to 4am CET. No data will be lost.',
      type: 'WARNING',
      channel: 'IN_APP',
      referenceType: null,
      referenceId: null,
      alreadyRead: true,
      scheduledAt: '',
      sentAt: 'Oct 17, 2023',
    },
    {
      id: 11,
      title: 'New Journal Streak: 7 Days',
      message: "You've journaled 7 days in a row. Keep the momentum going!",
      type: 'SUCCESS',
      channel: 'IN_APP',
      referenceType: 'JOURNAL_ENTRY',
      referenceId: null,
      alreadyRead: true,
      scheduledAt: '',
      sentAt: 'Oct 16, 2023',
    },
    {
      id: 12,
      title: 'Storage Upgraded Successfully',
      message: 'Your plan upgrade was successful. You now have 10 GB of storage available.',
      type: 'SUCCESS',
      channel: 'IN_APP',
      referenceType: null,
      referenceId: null,
      alreadyRead: true,
      scheduledAt: '',
      sentAt: 'Oct 15, 2023',
    },
  ]);

  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  readonly totalElements = computed(() => this.filteredNotifications().length);
  readonly totalPages = computed(() => Math.ceil(this.totalElements() / this.pageSize()));

  readonly paginatedNotifications = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.filteredNotifications().slice(start, start + this.pageSize());
  });

  onPageChange(page: number) {
    this.currentPage.set(page);
  }
  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(0);
  }

  showFilter = signal(false);
  activeFilters = signal<FilterValues>({});

  readonly notificationFilterFields: FilterField[] = [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      icon: 'search',
      placeholder: 'Search notifications...',
    },
    {
      key: 'type',
      label: 'Type',
      type: 'multiselect',
      icon: 'notifications',
      options: [
        { value: 'REMINDER', label: 'Reminder', icon: 'alarm', color: '#f9a825' },
        { value: 'INFO', label: 'Info', icon: 'info', color: '#1976d2' },
        { value: 'WARNING', label: 'Warning', icon: 'warning', color: '#f57c00' },
        { value: 'SUCCESS', label: 'Success', icon: 'check_circle', color: '#43a047' },
      ],
    },
    {
      key: 'channel',
      label: 'Channel',
      type: 'multiselect',
      icon: 'send',
      options: [
        { value: 'IN_APP', label: 'In App', icon: 'notifications', color: '#43a047' },
        { value: 'EMAIL', label: 'Email', icon: 'email', color: '#1976d2' },
        { value: 'PUSH', label: 'Push', icon: 'phone_iphone', color: '#9c27b0' },
      ],
    },
    {
      key: 'referenceType',
      label: 'Linked To',
      type: 'multiselect',
      icon: 'link',
      options: [
        { value: 'TODO', label: 'Task', icon: 'check_circle', color: '#43a047' },
        { value: 'GOAL', label: 'Goal', icon: 'flag', color: '#f57c00' },
        { value: 'EVENT', label: 'Calendar Event', icon: 'event', color: '#1976d2' },
        { value: 'WEEK_PLAN', label: 'Week Plan', icon: 'view_week', color: '#9c27b0' },
        { value: 'DOCUMENT', label: 'Document', icon: 'description', color: '#f44336' },
        { value: 'CONTACT', label: 'Contact', icon: 'person', color: '#00bcd4' },
        { value: 'JOURNAL_ENTRY', label: 'Journal', icon: 'menu_book', color: '#e91e63' },
      ],
    },
    {
      key: 'alreadyRead',
      label: 'Read Status',
      type: 'select',
      icon: 'mark_email_read',
      options: [
        { value: 'unread', label: 'Unread only' },
        { value: 'read', label: 'Read only' },
      ],
    },
    {
      key: 'scheduledAt',
      label: 'Scheduled Date Range',
      type: 'date-range',
      icon: 'calendar_today',
    },
  ];

  constructor(private aiAgent: AiAgentService) { }

  readonly unreadCount = computed(() => this.notifications().filter((n) => !n.alreadyRead).length);

  readonly countByType = computed(() => {
    const all = this.notifications();
    return {
      REMINDER: all.filter((n) => n.type === 'REMINDER' && !n.alreadyRead).length,
      INFO: all.filter((n) => n.type === 'INFO' && !n.alreadyRead).length,
      WARNING: all.filter((n) => n.type === 'WARNING' && !n.alreadyRead).length,
      SUCCESS: all.filter((n) => n.type === 'SUCCESS' && !n.alreadyRead).length,
    };
  });

  readonly filteredNotifications = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'ALL') return this.notifications();
    return this.notifications().filter((n) => n.type === filter);
  });

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

  readonly activeFilterCount = computed(
    () =>
      Object.values(this.activeFilters()).filter((v) => {
        if (!v || v === '') return false;
        if (Array.isArray(v)) return v.length > 0;
        return true;
      }).length,
  );

  onFilterApply(values: FilterValues) {
    this.activeFilters.set(values);
    this.showFilter.set(false);
    console.log('Notification filter applied:', values);
  }

  onFilterReset() {
    this.activeFilters.set({});
  }

  // Modals
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  selectedNotification = signal<Notification | null>(null);

  readonly emptyForm = (): NotificationForm => ({
    title: '',
    message: '',
    type: 'REMINDER',
    channels: ['IN_APP'],
    referenceType: null,
    referenceId: null,
    scheduledAt: '',
  });

  createForm = signal<NotificationForm>(this.emptyForm());
  editForm = signal<NotificationForm>(this.emptyForm());

  readonly notificationTypes: NotificationType[] = ['REMINDER', 'INFO', 'WARNING', 'SUCCESS'];
  readonly channelOptions: { value: NotificationChannel; label: string; icon: string }[] = [
    { value: 'IN_APP', label: 'In App', icon: 'notifications' },
    { value: 'EMAIL', label: 'Email', icon: 'email' },
    { value: 'PUSH', label: 'Push', icon: 'phone_iphone' },
  ];

  showCreateChannelDropdown = signal(false);
  showEditChannelDropdown = signal(false);

  toggleChannelDropdown(form: 'create' | 'edit', event: Event) {
    event.stopPropagation();
    if (form === 'create') {
      this.showCreateChannelDropdown.update(v => !v);
      this.showEditChannelDropdown.set(false);
    } else {
      this.showEditChannelDropdown.update(v => !v);
      this.showCreateChannelDropdown.set(false);
    }
  }

  getChannelLabel(channels: NotificationChannel[]): string {
    if (channels.length === 0) return 'Select channels...';
    if (channels.length === 1)
      return this.channelOptions.find(c => c.value === channels[0])?.label ?? '1 selected';
    return `${channels.length} channels`;
  }

  // ── Create ─────────────────────────────────────────────
  openCreate() {
    this.createForm.set(this.emptyForm());
    this.showCreateModal.set(true);
  }

  submitCreate() {
    if (!this.createForm().title.trim()) return;
    console.log('Create notification:', this.createForm());
    this.showCreateModal.set(false);
  }

  // ── Edit ───────────────────────────────────────────────
  openEdit(notification: Notification) {
    this.selectedNotification.set(notification);
    this.editForm.set({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      channels: [notification.channel],
      referenceType: notification.referenceType,
      referenceId: notification.referenceId,
      scheduledAt: notification.scheduledAt,
    });

    this.markRead(notification.id);
    this.showEditModal.set(true);
  }

  toggleChannel(channel: NotificationChannel, form: 'create' | 'edit') {
    const target = form === 'create' ? this.createForm : this.editForm;
    target.update(f => {
      const already = f.channels.includes(channel);
      // mindestens ein Channel muss aktiv bleiben
      if (already && f.channels.length === 1) return f;
      const channels = already
        ? f.channels.filter(c => c !== channel)
        : [...f.channels, channel];
      return { ...f, channels };
    });
  }

  submitEdit() {
    if (!this.editForm().title.trim()) return;
    console.log('Update notification:', this.selectedNotification()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  // ── Delete ─────────────────────────────────────────────
  openDeleteConfirm() {
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    const id = this.selectedNotification()?.id;
    if (id) this.notifications.update((n) => n.filter((notif) => notif.id !== id));
    this.showDeleteConfirm.set(false);
    this.selectedNotification.set(null);
  }

  // ── Read ───────────────────────────────────────────────
  markAllRead() {
    this.notifications.update((list) => list.map((n) => ({ ...n, alreadyRead: true })));
  }

  markRead(id: number) {
    this.notifications.update((list) =>
      list.map((n) => (n.id === id ? { ...n, alreadyRead: true } : n)),
    );
  }

  setFilter(filter: NotificationType | 'ALL') {
    this.activeFilter.set(filter);
    this.currentPage.set(0);
  }

  // ── Helpers ────────────────────────────────────────────
  getTypeIcon(type: NotificationType): string {
    const map: Record<NotificationType, string> = {
      REMINDER: 'alarm',
      INFO: 'info',
      WARNING: 'warning',
      SUCCESS: 'check_circle',
    };
    return map[type];
  }

  getTypeClass(type: NotificationType): string {
    const map: Record<NotificationType, string> = {
      REMINDER: 'type--reminder',
      INFO: 'type--info',
      WARNING: 'type--warning',
      SUCCESS: 'type--success',
    };
    return map[type];
  }

  getTypeLabel(type: NotificationType): string {
    const map: Record<NotificationType, string> = {
      REMINDER: 'Reminder',
      INFO: 'Info',
      WARNING: 'Warning',
      SUCCESS: 'Success',
    };
    return map[type];
  }

  getReferenceLabel(type: ReferenceType): string {
    const map: Record<ReferenceType, string> = {
      TODO: 'Task',
      GOAL: 'Goal',
      EVENT: 'Calendar',
      DOCUMENT: 'Document',
      CONTACT: 'People',
      JOURNAL_ENTRY: 'Journal',
      WEEK_PLAN: 'My Week',
    };
    return map[type];
  }

  getReferenceIcon(type: ReferenceType): string {
    const opt = this.referenceTypeOptions.find((o) => o.value === type);
    return opt?.icon ?? 'link';
  }

  onRefTypeChange(type: ReferenceType | null, form: 'create' | 'edit') {
    if (form === 'create') {
      this.createForm.update((f) => ({ ...f, referenceType: type, referenceId: null }));
    } else {
      this.editForm.update((f) => ({ ...f, referenceType: type, referenceId: null }));
    }
  }

  onAiClick() {
    this.aiAgent.open();
  }
}
