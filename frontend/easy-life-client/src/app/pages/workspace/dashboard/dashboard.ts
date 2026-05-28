import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core/services/user-service';
import { AiAgentService } from '../../../core/services/ai-agent';
import { DashboardService } from '../../../core/services/dashboard-service';
import { environment } from '../../../../environments/environment';

interface WidgetConfig {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly dashboardService = inject(DashboardService);
  private readonly aiAgent = inject(AiAgentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly username = this.route.snapshot.paramMap.get('username') ?? 'user';

  showWidgetManager = signal(false);

  readonly currentUser = this.userService.currentUser;

  readonly greetingName = computed(
    () => this.currentUser()?.profile?.firstname ?? this.currentUser()?.username ?? 'there',
  );

  readonly greeting = this.getGreeting();

  readonly today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  private getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  readonly widgetConfigs = signal<WidgetConfig[]>([
    { id: 'tasks', label: 'Daily Actions', icon: 'check_circle', enabled: true },
    { id: 'calendar', label: 'Calendar', icon: 'calendar_month', enabled: true },
    { id: 'goals', label: 'Goals', icon: 'flag', enabled: true },
    { id: 'weekplan', label: 'My Week', icon: 'view_week', enabled: true },
    { id: 'categories', label: 'Categories', icon: 'category', enabled: true },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', enabled: true },
    { id: 'journal', label: 'Journal', icon: 'menu_book', enabled: false },
    { id: 'network', label: 'People', icon: 'people', enabled: false },
    { id: 'following', label: 'Network', icon: 'person_add', enabled: false },
  ]);

  readonly enabledWidgets = computed(() => this.widgetConfigs().filter((w) => w.enabled));
  readonly enabledCount = computed(() => this.enabledWidgets().length);

  readonly loading = this.dashboardService.loading;
  readonly error = this.dashboardService.error;

  get tasks() {
    return this.dashboardService.dashboardData()?.tasks ?? [];
  }
  get events() {
    return this.dashboardService.dashboardData()?.events ?? [];
  }
  get goals() {
    return this.dashboardService.dashboardData()?.goals ?? [];
  }
  get categories() {
    return this.dashboardService.dashboardData()?.categories ?? [];
  }
  get notifications() {
    return this.dashboardService.dashboardData()?.notifications ?? [];
  }
  get journalEntries() {
    return this.dashboardService.dashboardData()?.journal ?? [];
  }
  get contacts() {
    return this.dashboardService.dashboardData()?.contacts ?? [];
  }

  get weekplan() {
    const wp = this.dashboardService.dashboardData()?.weekplan;
    if (!wp) return null;
    return { ...wp, pct: wp.itemsTotal > 0 ? Math.round((wp.itemsDone / wp.itemsTotal) * 100) : 0 };
  }

  get followingStats() {
    return (
      this.dashboardService.dashboardData()?.followStats ?? {
        following: 0,
        followers: 0,
        pendingRequests: 0,
      }
    );
  }

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user?.settings) this.syncWidgetConfigFromSettings(user.settings);
    });

    effect(() => {
      const user = this.currentUser();
      const enabled = this.enabledWidgets().map((w) => w.id);
      if (user && enabled.length > 0) {
        this.dashboardService.loadDashboardData(user.id, enabled);
      }
    });
  }

  private syncWidgetConfigFromSettings(settings: any): void {
    this.widgetConfigs.update((configs) =>
      configs.map((w) => {
        const key = `widget${w.id.charAt(0).toUpperCase() + w.id.slice(1)}Enabled`;
        const val = (settings as any)[key];
        return { ...w, enabled: val ?? w.enabled };
      }),
    );
  }

  isWidgetEnabled(id: string): boolean {
    return this.widgetConfigs().find((w) => w.id === id)?.enabled ?? false;
  }

  toggleWidget(id: string): void {
    this.widgetConfigs.update((configs) =>
      configs.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w)),
    );
  }

  ngOnInit(): void {
    if (!this.userService.currentUser()) this.userService.loadById(environment.userId);
  }

  getMoodIcon(mood: string): string {
    const map: Record<string, string> = {
      GREAT: 'sentiment_very_satisfied',
      GOOD: 'sentiment_satisfied',
      OKAY: 'sentiment_neutral',
      BAD: 'sentiment_dissatisfied',
      TERRIBLE: 'sentiment_very_dissatisfied',
    };
    return map[mood] ?? 'sentiment_neutral';
  }

  getMoodColor(mood: string): string {
    const map: Record<string, string> = {
      GREAT: '#43a047',
      GOOD: '#1976d2',
      OKAY: '#f9a825',
      BAD: '#f57c00',
      TERRIBLE: '#d32f2f',
    };
    return map[mood] ?? '#9e9e9e';
  }

  formatDate(dateString: string): { month: string; day: string } {
    const d = new Date(dateString);
    return {
      month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: d.getDate().toString().padStart(2, '0'),
    };
  }

  formatTime(dateTimeString: string): string {
    return new Date(dateTimeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  getContactInitials(contact: any): string {
    return (
      ((contact.firstname?.charAt(0) ?? '') + (contact.lastname?.charAt(0) ?? '')).toUpperCase() ||
      '?'
    );
  }

  navigateTo(route: string): void {
    this.router.navigate([`/workspace/${this.username}/${route}`]);
  }

  onAiClick(): void {
    this.aiAgent.open();
  }
}
