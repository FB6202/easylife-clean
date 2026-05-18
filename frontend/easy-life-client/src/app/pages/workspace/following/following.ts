import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FilterPanelComponent,
  FilterField,
  FilterValues,
} from '../../../shared/components/filter/filter';
import { AiAgentService } from '../../../core/services/ai-agent';

type FollowStatus = 'ACCEPTED' | 'PENDING';

interface FollowUser {
  id: number;
  username: string;
  displayName: string;
  initials: string;
  avatarColor: string;
  status: FollowStatus;
}

interface PendingRequest {
  id: number;
  username: string;
  displayName: string;
  initials: string;
  avatarColor: string;
}

type ActiveTab = 'following' | 'followers';

@Component({
  selector: 'app-following',
  imports: [CommonModule, PaginationComponent, FilterPanelComponent],
  templateUrl: './following.html',
  styleUrl: './following.scss',
})
export class FollowingComponent {
  readonly activeTab = signal<ActiveTab>('following');

  // Bestehende pendingRequests bleiben + ergänzen:
  readonly pendingRequests = signal([
    {
      id: 1,
      username: 'max_builder',
      firstname: 'Max',
      lastname: 'Builder',
      avatarColor: '#1976d2',
      initials: 'MB',
      requestedAt: '2 days ago',
    },
    {
      id: 2,
      username: 'nina_creates',
      firstname: 'Nina',
      lastname: 'Creates',
      avatarColor: '#e91e63',
      initials: 'NC',
      requestedAt: '5 days ago',
    },
    {
      id: 3,
      username: 'tom_dev',
      firstname: 'Tom',
      lastname: 'Dev',
      avatarColor: '#43a047',
      initials: 'TD',
      requestedAt: '1 week ago',
    },
  ]);

  // Bestehende following + followers ergänzen:
  readonly following = signal([
    {
      id: 1,
      username: 'sarah_creates',
      firstname: 'Sarah',
      lastname: 'Creates',
      avatarColor: '#e91e63',
      initials: 'SC',
      followStatus: 'FOLLOWING',
      publicGoals: 3,
      publicCategories: 7,
    },
    {
      id: 2,
      username: 'felix_dev',
      firstname: 'Felix',
      lastname: 'Dev',
      avatarColor: '#43a047',
      initials: 'FD',
      followStatus: 'FOLLOWING',
      publicGoals: 8,
      publicCategories: 5,
    },
    {
      id: 3,
      username: 'moritz_pm',
      firstname: 'Moritz',
      lastname: 'PM',
      avatarColor: '#f57c00',
      initials: 'MP',
      followStatus: 'REQUESTED',
      publicGoals: 4,
      publicCategories: 3,
    },
    {
      id: 4,
      username: 'lena_builds',
      firstname: 'Lena',
      lastname: 'Builds',
      avatarColor: '#9c27b0',
      initials: 'LB',
      followStatus: 'FOLLOWING',
      publicGoals: 6,
      publicCategories: 4,
    },
    {
      id: 5,
      username: 'jan_strategy',
      firstname: 'Jan',
      lastname: 'Strategy',
      avatarColor: '#00bcd4',
      initials: 'JS',
      followStatus: 'FOLLOWING',
      publicGoals: 2,
      publicCategories: 6,
    },
    {
      id: 6,
      username: 'anna_design',
      firstname: 'Anna',
      lastname: 'Design',
      avatarColor: '#ff5722',
      initials: 'AD',
      followStatus: 'FOLLOWING',
      publicGoals: 5,
      publicCategories: 3,
    },
    {
      id: 7,
      username: 'peter_vc',
      firstname: 'Peter',
      lastname: 'VC',
      avatarColor: '#3f51b5',
      initials: 'PV',
      followStatus: 'REQUESTED',
      publicGoals: 9,
      publicCategories: 2,
    },
    {
      id: 8,
      username: 'mia_founder',
      firstname: 'Mia',
      lastname: 'Founder',
      avatarColor: '#795548',
      initials: 'MF',
      followStatus: 'FOLLOWING',
      publicGoals: 7,
      publicCategories: 5,
    },
  ]);

  readonly followers = signal([
    {
      id: 1,
      username: 'max_builder',
      firstname: 'Max',
      lastname: 'Builder',
      avatarColor: '#1976d2',
      initials: 'MB',
      followStatus: 'FOLLOWING',
      publicGoals: 6,
      publicCategories: 4,
    },
    {
      id: 2,
      username: 'julia_ops',
      firstname: 'Julia',
      lastname: 'Ops',
      avatarColor: '#43a047',
      initials: 'JO',
      followStatus: 'FOLLOWING',
      publicGoals: 3,
      publicCategories: 2,
    },
    {
      id: 3,
      username: 'ben_product',
      firstname: 'Ben',
      lastname: 'Product',
      avatarColor: '#f57c00',
      initials: 'BP',
      followStatus: 'NONE',
      publicGoals: 5,
      publicCategories: 3,
    },
    {
      id: 4,
      username: 'clara_ux',
      firstname: 'Clara',
      lastname: 'UX',
      avatarColor: '#e91e63',
      initials: 'CU',
      followStatus: 'NONE',
      publicGoals: 4,
      publicCategories: 6,
    },
    {
      id: 5,
      username: 'david_finance',
      firstname: 'David',
      lastname: 'Finance',
      avatarColor: '#9c27b0',
      initials: 'DF',
      followStatus: 'FOLLOWING',
      publicGoals: 2,
      publicCategories: 1,
    },
    {
      id: 6,
      username: 'sophie_growth',
      firstname: 'Sophie',
      lastname: 'Growth',
      avatarColor: '#00bcd4',
      initials: 'SG',
      followStatus: 'NONE',
      publicGoals: 8,
      publicCategories: 4,
    },
  ]);

  readonly username: string;
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);


  readonly activeList = computed(() =>
    this.activeTab() === 'following' ? this.following() : this.followers(),
  );

  readonly totalElements = computed(() => this.activeList().length);
  readonly totalPages = computed(() => Math.ceil(this.totalElements() / this.pageSize()));

  readonly paginatedList = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.activeList().slice(start, start + this.pageSize());
  });

  onPageChange(page: number) {
    this.currentPage.set(page);
  }
  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(0);
  }

  constructor(private router: Router, private route: ActivatedRoute, private aiAgent: AiAgentService) {
    this.username = this.route.snapshot.paramMap.get('username') ?? 'user';
  }

  showFilter = signal(false);
  activeFilters = signal<FilterValues>({});

  readonly followingFilterFields: FilterField[] = [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      icon: 'search',
      placeholder: 'Search by name or username...',
    },
    {
      key: 'tab',
      label: 'View',
      type: 'select',
      icon: 'people',
      options: [
        { value: 'following', label: 'Following' },
        { value: 'followers', label: 'Followers' },
      ],
    },
    {
      key: 'followStatus',
      label: 'Follow Status',
      type: 'multiselect',
      icon: 'person_add',
      options: [
        { value: 'FOLLOWING', label: 'Following', icon: 'how_to_reg', color: '#43a047' },
        { value: 'REQUESTED', label: 'Requested', icon: 'schedule', color: '#f9a825' },
      ],
    },
    {
      key: 'hasPublicGoals',
      label: 'Has Public Goals',
      type: 'toggle',
      icon: 'flag',
    },
    {
      key: 'hasPublicContacts',
      label: 'Has Public Contacts',
      type: 'toggle',
      icon: 'people',
    },
  ];

  readonly pendingCount = computed(() => this.pendingRequests().length);

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
    console.log('Following filter applied:', values);
  }

  onFilterReset() {
    this.activeFilters.set({});
  }

  acceptRequest(id: number) {
    this.pendingRequests.update((r) => r.filter((p) => p.id !== id));
  }

  declineRequest(id: number) {
    this.pendingRequests.update((r) => r.filter((p) => p.id !== id));
  }

  unfollow(id: number) {
    this.following.update((f) => f.filter((u) => u.id !== id));
  }

  cancelRequest(id: number) {
    this.following.update((f) => f.filter((u) => u.id !== id));
  }

  setTab(tab: ActiveTab) {
    this.activeTab.set(tab);
    this.currentPage.set(0);
  }

  onAiClick() {
    this.aiAgent.open();
  }

  goToSearch() {
    const username = this.route.snapshot.paramMap.get('username');
    this.router.navigate([`/workspace/${username}/following/search`]);
  }

  goToProfile(userId: number) {
    this.router.navigate([`/workspace/${this.username}/following/user/${userId}`]);
  }
}
