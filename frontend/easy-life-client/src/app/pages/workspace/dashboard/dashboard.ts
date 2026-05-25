import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core/services/user-service';
import { AiAgentService } from '../../../core/services/ai-agent';
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
  private readonly aiAgent = inject(AiAgentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly username = this.route.snapshot.paramMap.get('username') ?? 'user';

  showWidgetManager = signal(false);

  // ── User ───────────────────────────────────────────────
  readonly currentUser = this.userService.currentUser;

  readonly greetingName = computed(
    () => this.currentUser()?.profile?.firstname ?? this.currentUser()?.username ?? 'there',
  );

  // ── Greeting ───────────────────────────────────────────
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

  // ── Widget Config ──────────────────────────────────────
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

  isWidgetEnabled(id: string): boolean {
    return this.widgetConfigs().find((w) => w.id === id)?.enabled ?? false;
  }

  toggleWidget(id: string): void {
    this.widgetConfigs.update((configs) =>
      configs.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w)),
    );
  }

  // ── Mock Data (TODO: durch Services ersetzen) ──────────
  readonly tasks = [
    {
      id: 1,
      title: 'Review Annual Financial Report Q4',
      due: 'OCT 24',
      dueClass: 'soon',
      status: 'in-progress',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Monthly Team Synergy Workshop',
      due: 'NOV 2',
      dueClass: 'normal',
      status: 'open',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Finalize Q4 Marketing Budget',
      due: 'NOV 15',
      dueClass: 'normal',
      status: 'open',
      priority: 'critical',
    },
  ];

  readonly events = [
    {
      id: 1,
      title: 'Product Roadmap Review',
      time: '10:00 AM',
      location: 'Conference Room B',
      color: '#1976d2',
    },
    {
      id: 2,
      title: 'Design System Sync',
      time: '2:30 PM',
      location: 'Remote – Zoom',
      color: '#43a047',
    },
    {
      id: 3,
      title: 'Investor Update Call',
      time: '4:00 PM',
      location: 'Remote – Meet',
      color: '#f57c00',
    },
  ];

  readonly goals = [
    {
      id: 1,
      title: 'Daily Mindful Movement',
      pct: 68,
      icon: 'directions_run',
      deadline: 'DEC 31, 2024',
    },
    {
      id: 2,
      title: 'Portfolio Diversification',
      pct: 42,
      icon: 'trending_up',
      deadline: 'AUG 15, 2024',
    },
    { id: 3, title: 'Learn Spanish B2', pct: 35, icon: 'school', deadline: 'DEC 31, 2025' },
  ];

  readonly weekplan = {
    title: 'Scaling the Creative Horizon',
    intention: 'Focus on intentional output over reactive checking.',
    status: 'ACTIVE',
    itemsDone: 2,
    itemsTotal: 4,
    pct: 50,
  };

  readonly categories = [
    { id: 1, name: 'Work', icon: 'work', color: '#1976d2', count: 'Tasks · Goals · Docs' },
    { id: 2, name: 'Finance', icon: 'payments', color: '#f57c00', count: 'Budget · Goals' },
    { id: 3, name: 'Health', icon: 'self_improvement', color: '#43a047', count: 'Goals · Journal' },
    { id: 4, name: 'Learning', icon: 'school', color: '#e91e63', count: 'Goals · Tasks' },
  ];

  readonly notifications = [
    {
      id: 1,
      title: 'Goal Deadline Tomorrow',
      message: 'Portfolio Diversification is due tomorrow!',
      type: 'reminder',
      time: 'Just now',
      unread: true,
    },
    {
      id: 2,
      title: 'Week Plan Starts Tomorrow',
      message: "Your week 'Q4 Strategy' starts tomorrow.",
      type: 'info',
      time: '2h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'New Journal Streak: 7 Days',
      message: "You've journaled 7 days in a row!",
      type: 'success',
      time: '5h ago',
      unread: false,
    },
  ];

  readonly journalEntries = [
    {
      id: 1,
      title: 'Quarterly Review & Future Strategy',
      mood: 'GREAT',
      date: 'Oct 12',
      wordCount: 2400,
    },
    {
      id: 2,
      title: 'Mindful Morning & Technical Debt',
      mood: 'GOOD',
      date: 'Oct 11',
      wordCount: 1120,
    },
    {
      id: 3,
      title: 'Cross-Functional Friction Points',
      mood: 'OKAY',
      date: 'Oct 10',
      wordCount: 850,
    },
  ];

  readonly contacts = [
    {
      id: 1,
      firstname: 'Sarah',
      lastname: 'Creates',
      avatarColor: '#e91e63',
      initials: 'SC',
      position: 'Product Designer',
      followStatus: 'FOLLOWING',
    },
    {
      id: 2,
      firstname: 'Felix',
      lastname: 'Dev',
      avatarColor: '#43a047',
      initials: 'FD',
      position: 'Full-Stack Engineer',
      followStatus: 'FOLLOWING',
    },
    {
      id: 3,
      firstname: 'Lena',
      lastname: 'Builds',
      avatarColor: '#9c27b0',
      initials: 'LB',
      position: 'Startup Founder',
      followStatus: 'NONE',
    },
  ];

  readonly followingStats = { following: 8, followers: 6, pendingRequests: 3 };

  // ── Lifecycle ──────────────────────────────────────────
  ngOnInit(): void {
    // User wird in workspace-layout geladen — hier nur prüfen
    if (!this.userService.currentUser()) {
      this.userService.loadById(environment.userId);
    }
  }

  // ── Methods ────────────────────────────────────────────
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

  navigateTo(route: string): void {
    this.router.navigate([`/workspace/${this.username}/${route}`]);
  }

  onAiClick(): void {
    this.aiAgent.open();
  }
}
