import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

interface SearchResult {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  bio: string;
  avatarColor: string;
  initials: string;
  publicGoals: number;
  publicCategories: number;
  followStatus: 'NONE' | 'FOLLOWING' | 'REQUESTED';
  mutualConnections: number;
}

@Component({
  selector: 'app-network-search',
  imports: [CommonModule, FormsModule],
  templateUrl: './network-search.html',
  styleUrl: './network-search.scss'
})
export class NetworkSearchComponent {

  readonly username: string;
  searchQuery = signal('');
  isSearching = signal(false);
  hasSearched = signal(false);

  constructor(private router: Router, private route: ActivatedRoute) {
    this.username = this.route.snapshot.paramMap.get('username') ?? 'user';
  }

  readonly allResults = signal<SearchResult[]>([
    { id: 1, username: 'sarah_creates', firstname: 'Sarah', lastname: 'Creates', bio: 'Product designer & creative director. Building beautiful things one pixel at a time.', avatarColor: '#e91e63', initials: 'SC', publicGoals: 3, publicCategories: 7, followStatus: 'FOLLOWING', mutualConnections: 4 },
    { id: 2, username: 'felix_dev', firstname: 'Felix', lastname: 'Dev', bio: 'Full-stack developer. Loves clean code, good coffee and building side projects.', avatarColor: '#43a047', initials: 'FD', publicGoals: 8, publicCategories: 5, followStatus: 'FOLLOWING', mutualConnections: 2 },
    { id: 3, username: 'lena_builds', firstname: 'Lena', lastname: 'Builds', bio: 'Startup founder & product strategist. Helping teams ship faster.', avatarColor: '#9c27b0', initials: 'LB', publicGoals: 6, publicCategories: 4, followStatus: 'NONE', mutualConnections: 1 },
    { id: 4, username: 'tom_strategy', firstname: 'Tom', lastname: 'Strategy', bio: 'Business strategist and advisor. OKRs, systems thinking and growth.', avatarColor: '#1976d2', initials: 'TS', publicGoals: 4, publicCategories: 3, followStatus: 'NONE', mutualConnections: 3 },
    { id: 5, username: 'mia_founder', firstname: 'Mia', lastname: 'Founder', bio: 'Serial entrepreneur. Currently building a SaaS for remote teams.', avatarColor: '#795548', initials: 'MF', publicGoals: 7, publicCategories: 5, followStatus: 'REQUESTED', mutualConnections: 0 },
    { id: 6, username: 'jan_data', firstname: 'Jan', lastname: 'Data', bio: 'Data engineer at scale. Making sense of big data, one pipeline at a time.', avatarColor: '#00bcd4', initials: 'JD', publicGoals: 2, publicCategories: 2, followStatus: 'NONE', mutualConnections: 2 },
  ]);

  readonly filteredResults = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.allResults();
    return this.allResults().filter(r =>
      r.firstname.toLowerCase().includes(q) ||
      r.lastname.toLowerCase().includes(q) ||
      r.username.toLowerCase().includes(q) ||
      r.bio.toLowerCase().includes(q)
    );
  });

  onSearch() {
    if (!this.searchQuery().trim()) return;
    this.isSearching.set(true);
    this.hasSearched.set(true);
    setTimeout(() => this.isSearching.set(false), 400);
  }

  onSearchInput(value: string) {
    this.searchQuery.set(value);
    if (value.trim()) this.hasSearched.set(true);
  }

  toggleFollow(result: SearchResult) {
    this.allResults.update(results =>
      results.map(r => r.id === result.id ? {
        ...r,
        followStatus: r.followStatus === 'NONE' ? 'REQUESTED' :
          r.followStatus === 'REQUESTED' ? 'NONE' : 'FOLLOWING'
      } : r)
    );
  }

  goToProfile(userId: number) {
    this.router.navigate([`/workspace/${this.username}/network/user/${userId}`]);
  }

  goBack() {
    this.router.navigate([`/workspace/${this.username}/following`]);
  }
}