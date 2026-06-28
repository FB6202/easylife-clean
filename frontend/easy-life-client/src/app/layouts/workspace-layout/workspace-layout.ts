import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { SettingsModalComponent } from '../../shared/components/settings-modal/settings-modal';
import { UserService } from '../../core/services/user-service';
import { environment } from '../../../environments/environment';
import { AiAgentWidgetComponent } from '../../shared/components/ai-agent/ai-agent';
import { LoadingService } from '../../core/services/loading';

@Component({
  selector: 'app-workspace-layout',
  imports: [CommonModule, RouterModule, SettingsModalComponent, AiAgentWidgetComponent],
  templateUrl: './workspace-layout.html',
  styleUrl: './workspace-layout.scss',
})
export class WorkspaceLayoutComponent implements OnInit {
  private readonly userService = inject(UserService);
  readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  sidebarCollapsed = signal(false);
  showSettings = signal(false);

  // ── User ───────────────────────────────────────────────
  readonly currentUser = this.userService.currentUser;

  readonly displayName = computed(
    () => this.currentUser()?.profile?.firstname ?? this.currentUser()?.username ?? 'there',
  );

  readonly username = this.route.snapshot.paramMap.get('username') ?? 'user';

  // ── Nav Items ──────────────────────────────────────────
  readonly managementItems = [
    { route: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { route: 'tasks', label: 'Tasks', icon: 'check_circle' },
    { route: 'categories', label: 'Categories', icon: 'category' },
    { route: 'goals', label: 'Goals', icon: 'flag' },
    { route: 'calendar', label: 'Calendar', icon: 'calendar_month' },
    { route: 'documents', label: 'Documents', icon: 'description' },
    { route: 'my-week', label: 'My Week', icon: 'view_week' },
    { route: 'journal', label: 'Journal', icon: 'menu_book' },
  ];

  readonly accountItems = [
    { route: 'profile', label: 'Profile', icon: 'person', badge: false },
    { route: 'network', label: 'People', icon: 'people', badge: false },
    { route: 'following', label: 'Network', icon: 'person_add', badge: false },
    { route: 'notifications', label: 'Notifications', icon: 'notifications', badge: true },
  ];

  readonly unreadNotificationCount = signal(0); // TODO: NotificationService

  // ── Lifecycle ──────────────────────────────────────────
  ngOnInit(): void {
    if (!this.userService.currentUser()) {
      this.userService.loadById(environment.userId);
    }
  }

  isRouteActive(route: string): boolean {
    return this.router.url.includes(`/${route}`);
  }

  // ── Methods ────────────────────────────────────────────
  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  navigateToProfile(section?: string): void {
    this.router.navigate([`/workspace/${this.username}/profile`]).then(() => {
      if (section) {
        setTimeout(() => {
          const el = document.getElementById(section);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
    });
  }

  onSettingsNavigate(event: { path: string; section?: string }): void {
    this.showSettings.set(false);
    if (event.section) {
      this.navigateToProfile(event.section);
    } else {
      this.router.navigate([`/workspace/${this.username}/${event.path}`]);
    }
  }
}
