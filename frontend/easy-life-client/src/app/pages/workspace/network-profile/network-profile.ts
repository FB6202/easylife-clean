import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

type Tab = 'goals' | 'categories' | 'contacts';

@Component({
  selector: 'app-network-profile',
  imports: [CommonModule],
  templateUrl: './network-profile.html',
  styleUrl: './network-profile.scss'
})
export class NetworkProfileComponent {

  readonly username: string;
  readonly userId: string;
  readonly activeTab = signal<Tab>('goals');

  constructor(private router: Router, private route: ActivatedRoute) {
    this.username = this.route.snapshot.paramMap.get('username') ?? 'user';
    this.userId = this.route.snapshot.paramMap.get('userId') ?? '1';
  }

  readonly profile = {
    id: 1,
    firstname: 'Sarah',
    lastname: 'Creates',
    username: 'sarah_creates',
    bio: 'Product designer & creative director. Building beautiful things one pixel at a time. Passionate about design systems and user experience.',
    avatarColor: '#e91e63',
    initials: 'SC',
    followStatus: 'FOLLOWING' as const,
    followersCount: 142,
    followingCount: 87,
    publicGoals: 3,
    publicCategories: 7,
    joinedAt: 'Member since Jan 2024'
  };

  readonly goals = [
    { id: 1, title: 'Design System V3', description: 'Complete the next iteration of our design system with dark mode support.', pct: 72, status: 'ACTIVE', deadline: 'DEC 31, 2024', icon: 'palette', color: '#e91e63' },
    { id: 2, title: 'UX Certification', description: 'Complete the Google UX Design Certificate program.', pct: 45, status: 'ACTIVE', deadline: 'MAR 15, 2025', icon: 'school', color: '#9c27b0' },
    { id: 3, title: 'Launch Portfolio v2', description: 'Redesign and launch personal portfolio with case studies.', pct: 100, status: 'COMPLETED', deadline: 'OCT 01, 2024', icon: 'web', color: '#1976d2' },
  ];

  readonly categories = [
    { id: 1, name: 'Design Work', icon: 'design_services', color: '#e91e63', description: 'Client projects, design system, component libraries.' },
    { id: 2, name: 'Learning', icon: 'school', color: '#9c27b0', description: 'Courses, books, tutorials and skill development.' },
    { id: 3, name: 'Side Projects', icon: 'code', color: '#1976d2', description: 'Personal experiments and creative builds.' },
    { id: 4, name: 'Health', icon: 'self_improvement', color: '#43a047', description: 'Fitness tracking, mental health and wellness.' },
    { id: 5, name: 'Finance', icon: 'payments', color: '#f57c00', description: 'Personal budget, investments and savings goals.' },
    { id: 6, name: 'Travel', icon: 'flight', color: '#00bcd4', description: 'Trip planning, travel journals and adventures.' },
    { id: 7, name: 'Photography', icon: 'photo_camera', color: '#795548', description: 'Photography projects and portfolio work.' },
  ];

  readonly contacts = [
    { id: 1, firstname: 'Tom', lastname: 'Richards', position: 'Product Manager', company: 'TechCorp', initials: 'TR', avatarColor: '#1976d2', relationshipType: 'COLLEAGUE' },
    { id: 2, firstname: 'Anna', lastname: 'Weber', position: 'Frontend Engineer', company: 'Freelance', initials: 'AW', avatarColor: '#43a047', relationshipType: 'FRIEND' },
    { id: 3, firstname: 'Marc', lastname: 'Klein', position: 'CEO', company: 'Startup GmbH', initials: 'MK', avatarColor: '#f57c00', relationshipType: 'BUSINESS' },
  ];

  toggleFollow() {
    console.log('Toggle follow:', this.profile.username);
  }

  goBack() {
    this.router.navigate([`/workspace/${this.username}/following/search`]);
  }
}