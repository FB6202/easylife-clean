import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import {
  FilterPanelComponent,
  FilterField,
  FilterValues,
} from '../../../shared/components/filter/filter';
import { FollowService } from '../../../core/services/follow-service';
import { AiAgentService } from '../../../core/services/ai-agent';
import { FollowUser } from '../../../core/models/follow.model';
import { environment } from '../../../../environments/environment';

type ActiveTab = 'following' | 'followers';

@Component({
  selector: 'app-following',
  imports: [CommonModule, PaginationComponent, FilterPanelComponent],
  templateUrl: './following.html',
  styleUrl: './following.scss',
})
export class FollowingComponent implements OnInit {
  private readonly userId = environment.userId;
  private readonly followService = inject(FollowService);
  private readonly aiAgent = inject(AiAgentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly username = this.route.snapshot.paramMap.get('username') ?? 'user';

  readonly activeTab = signal<ActiveTab>('following');

  // ── Mapped lists ───────────────────────────────────────────────────────────
  readonly following = computed(() =>
    this.followService
      .following()
      .map((f) => this.toFollowUser(f.id, f.followingId, f.followingUsername, f.status)),
  );

  readonly followers = computed(() =>
    this.followService
      .followers()
      .map((f) => this.toFollowUser(f.id, f.followerId, f.followerUsername, f.status)),
  );

  readonly pendingRequests = computed(() =>
    this.followService
      .pending()
      .map((f) => this.toFollowUser(f.id, f.followerId, f.followerUsername, f.status)),
  );

  readonly pendingCount = computed(() => this.pendingRequests().length);

  // ── Active list ────────────────────────────────────────────────────────────
  readonly activeList = computed(() =>
    this.activeTab() === 'following' ? this.following() : this.followers(),
  );

  // ── Filter ─────────────────────────────────────────────────────────────────
  showFilter = signal(false);
  activeFilters = signal<FilterValues>({});

  readonly followingFilterFields = computed((): FilterField[] => [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      icon: 'person',
      options: [
        { value: 'ACCEPTED', label: 'Following', icon: 'check_circle', color: '#43a047' },
        { value: 'PENDING', label: 'Requested', icon: 'hourglass_empty', color: '#f9a825' },
      ],
    },
  ]);

  readonly activeFilterCount = computed(
    () => Object.values(this.activeFilters()).filter((v) => v && v !== '').length,
  );

  readonly filteredList = computed(() => {
    const list = this.activeList();
    const status = this.activeFilters()['status'] as string | undefined;
    if (!status) return list;
    return list.filter((u) => u.status === status);
  });

  onFilterApply(values: FilterValues): void {
    this.activeFilters.set(values);
    this.showFilter.set(false);
  }

  onFilterReset(): void {
    this.activeFilters.set({});
    this.showFilter.set(false);
  }

  // ── Client-side Pagination ─────────────────────────────────────────────────
  readonly pageSize = signal(10);
  readonly currentPage = signal(0);

  readonly totalElements = computed(() => this.filteredList().length);
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalElements() / this.pageSize())),
  );

  readonly paginatedList = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.filteredList().slice(start, start + this.pageSize());
  });

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }
  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
  }
  onAiClick(): void {
    this.aiAgent.open();
  }

  // ── Tabs ───────────────────────────────────────────────────────────────────
  setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    this.currentPage.set(0);
    this.activeFilters.set({});
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  acceptRequest(followId: number): void {
    console.log('TODO accept:', followId);
  }

  declineRequest(followId: number): void {
    console.log('TODO decline:', followId);
  }

  cancelRequest(followId: number): void {
    console.log('TODO cancel:', followId);
  }

  unfollow(followId: number): void {
    console.log('TODO unfollow:', followId);
  }

  goToProfile(userId: number): void {
    this.router.navigate([`/workspace/${this.username}/following/user/${userId}`]);
  }

  goToSearch(): void {
    this.router.navigate([`/workspace/${this.username}/following/search`]);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.followService.loadAll(this.userId);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  private toFollowUser(
    followId: number,
    userId: number,
    username: string,
    status: any,
  ): FollowUser {
    return {
      followId,
      userId,
      username,
      displayName: this.formatUsername(username),
      initials: this.getInitials(username),
      avatarColor: this.getAvatarColor(username),
      status,
    };
  }

  private formatUsername(username: string): string {
    return username
      .replace(/[_.-]/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  private getInitials(username: string): string {
    const parts = username.replace(/[_.-]/g, ' ').trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return username.slice(0, 2).toUpperCase();
  }

  private getAvatarColor(username: string): string {
    const colors = [
      '#1976d2',
      '#43a047',
      '#f57c00',
      '#9c27b0',
      '#e91e63',
      '#00bcd4',
      '#ff5722',
      '#3f51b5',
    ];
    const hash = username.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }
}
