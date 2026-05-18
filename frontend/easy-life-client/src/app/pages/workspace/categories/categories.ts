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

type AccessType = 'PRIVATE' | 'PUBLIC';

interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  accessType: AccessType;
  createdAt: string;
}

interface CategoryForm {
  name: string;
  description: string;
  color: string;
  icon: string;
  accessType: AccessType;
}

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormsModule, PaginationComponent, FilterPanelComponent],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class CategoriesComponent {
  readonly categories = signal<Category[]>([
    {
      id: 1,
      name: 'Business Strategy',
      description: 'Quarterly roadmaps, stakeholder meetings and growth planning.',
      color: '#43a047',
      icon: 'work',
      accessType: 'PUBLIC',
      createdAt: 'Oct 12',
    },
    {
      id: 2,
      name: 'Financial Goals',
      description: 'Personal investment tracking, budget and savings.',
      color: '#1976d2',
      icon: 'payments',
      accessType: 'PRIVATE',
      createdAt: 'Sep 28',
    },
    {
      id: 3,
      name: 'Content Pipeline',
      description: 'Editorial calendars, blog drafts and publishing schedule.',
      color: '#f57c00',
      icon: 'edit_note',
      accessType: 'PUBLIC',
      createdAt: 'Aug 14',
    },
    {
      id: 4,
      name: 'Lifestyle & Focus',
      description: 'Wellness tracking, hobby projects and personal growth.',
      color: '#9c27b0',
      icon: 'self_improvement',
      accessType: 'PRIVATE',
      createdAt: 'Nov 02',
    },
    {
      id: 5,
      name: 'Project Alpha',
      description: 'Core development sprint for the new product release.',
      color: '#f44336',
      icon: 'rocket_launch',
      accessType: 'PRIVATE',
      createdAt: 'Dec 20',
    },
    {
      id: 6,
      name: 'R&D Lab',
      description: 'Experimental features, technical research and prototypes.',
      color: '#00bcd4',
      icon: 'biotech',
      accessType: 'PUBLIC',
      createdAt: 'Jan 05',
    },
    {
      id: 7,
      name: 'Learning & Growth',
      description: 'Books, courses, podcasts and continuous education.',
      color: '#e91e63',
      icon: 'school',
      accessType: 'PUBLIC',
      createdAt: 'Feb 10',
    },
    {
      id: 8,
      name: 'Health & Wellness',
      description: 'Fitness tracking, nutrition logs and mental health.',
      color: '#4caf50',
      icon: 'fitness_center',
      accessType: 'PRIVATE',
      createdAt: 'Mar 15',
    },
    {
      id: 9,
      name: 'Travel & Adventures',
      description: 'Trip planning, travel journals and destination wishlist.',
      color: '#ff9800',
      icon: 'flight',
      accessType: 'PUBLIC',
      createdAt: 'Apr 22',
    },
    {
      id: 10,
      name: 'Side Projects',
      description: 'Personal experiments, open source and creative builds.',
      color: '#607d8b',
      icon: 'code',
      accessType: 'PRIVATE',
      createdAt: 'May 01',
    },
    {
      id: 11,
      name: 'Networking',
      description: 'Professional connections, events and community involvement.',
      color: '#3f51b5',
      icon: 'groups',
      accessType: 'PUBLIC',
      createdAt: 'May 18',
    },
    {
      id: 12,
      name: 'Mindfulness',
      description: 'Meditation, journaling and daily reflection practice.',
      color: '#795548',
      icon: 'self_improvement',
      accessType: 'PRIVATE',
      createdAt: 'Jun 03',
    },
  ]);

  constructor(private aiAgent: AiAgentService) { }

  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  readonly totalElements = computed(() => this.categories().length);
  readonly totalPages = computed(() => Math.ceil(this.totalElements() / this.pageSize()));

  readonly paginatedCategories = computed(() => {
    const all = this.categories();
    const start = this.currentPage() * this.pageSize();
    // Reserve last slot for Add New card
    return all.slice(start, start + this.pageSize());
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

  readonly categoryFilterFields: FilterField[] = [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      icon: 'search',
      placeholder: 'Search categories...',
    },
    {
      key: 'accessType',
      label: 'Access',
      type: 'multiselect',
      icon: 'lock',
      options: [
        { value: 'PUBLIC', label: 'Public', icon: 'travel_explore', color: '#43a047' },
        { value: 'PRIVATE', label: 'Private', icon: 'lock', color: '#757575' },
      ],
    },
    {
      key: 'color',
      label: 'Color',
      type: 'multiselect',
      icon: 'palette',
      options: [
        { value: 'green', label: 'Green', color: '#43a047' },
        { value: 'blue', label: 'Blue', color: '#1976d2' },
        { value: 'red', label: 'Red', color: '#d32f2f' },
        { value: 'orange', label: 'Orange', color: '#f57c00' },
        { value: 'purple', label: 'Purple', color: '#7b1fa2' },
        { value: 'pink', label: 'Pink', color: '#c2185b' },
        { value: 'teal', label: 'Teal', color: '#00796b' },
        { value: 'cyan', label: 'Cyan', color: '#0097a7' },
      ],
    },
    {
      key: 'createdAt',
      label: 'Created',
      type: 'date-range',
      icon: 'calendar_today',
    },
  ];

  readonly availableColors: string[] = [
    '#1b5e20',
    '#2e7d32',
    '#388e3c',
    '#43a047',
    '#66bb6a',
    '#a5d6a7',
    '#0d47a1',
    '#1565c0',
    '#1976d2',
    '#1e88e5',
    '#42a5f5',
    '#90caf9',
    '#b71c1c',
    '#c62828',
    '#d32f2f',
    '#e53935',
    '#ef5350',
    '#ef9a9a',
    '#e65100',
    '#ef6c00',
    '#f57c00',
    '#fb8c00',
    '#ffa726',
    '#ffcc80',
    '#4a148c',
    '#6a1b9a',
    '#7b1fa2',
    '#8e24aa',
    '#ab47bc',
    '#ce93d8',
    '#880e4f',
    '#ad1457',
    '#c2185b',
    '#d81b60',
    '#e91e63',
    '#f48fb1',
    '#004d40',
    '#00695c',
    '#00796b',
    '#00897b',
    '#009688',
    '#26a69a',
    '#006064',
    '#00838f',
    '#0097a7',
    '#00acc1',
    '#00bcd4',
    '#80deea',
    '#bf360c',
    '#d84315',
    '#e64a19',
    '#f4511e',
    '#ff5722',
    '#ff8a65',
    '#212121',
    '#424242',
    '#616161',
    '#757575',
    '#9e9e9e',
    '#bdbdbd',
    // Gelb / Amber
    '#f57f17',
    '#f9a825',
    '#fbc02d',
    '#fdd835',
    '#ffee58',
    '#fff176',
    // Lime / Hellgrün
    '#33691e',
    '#558b2f',
    '#689f38',
    '#7cb342',
    '#8bc34a',
    '#aed581',
    // Indigo
    '#1a237e',
    '#283593',
    '#303f9f',
    '#3949ab',
    '#5c6bc0',
    '#9fa8da',
    // Brown
    '#3e2723',
    '#4e342e',
    '#5d4037',
    '#6d4c41',
    '#795548',
    '#a1887f',
    // Blue Grey
    '#263238',
    '#37474f',
    '#455a64',
    '#546e7a',
    '#78909c',
    '#b0bec5',
  ];

  readonly allIcons: string[] = [
    // Work & Business
    'work', 'business_center', 'corporate_fare', 'domain', 'apartment',
    'store', 'storefront', 'inventory', 'inventory_2', 'receipt_long',
    'request_quote', 'paid', 'point_of_sale', 'handshake', 'contract',
    'assignment', 'task_alt', 'checklist', 'fact_check', 'rule',

    // Finance & Money
    'payments', 'attach_money', 'savings', 'account_balance', 'account_balance_wallet',
    'trending_up', 'trending_down', 'bar_chart', 'pie_chart', 'show_chart',
    'candlestick_chart', 'currency_exchange', 'credit_card', 'price_check',
    'money_off', 'wallet', 'local_atm', 'toll', 'monetization_on',

    // Health & Wellness
    'health_and_safety', 'medical_services', 'local_hospital', 'medication',
    'monitor_heart', 'ecg_heart', 'favorite', 'spa', 'self_improvement',
    'fitness_center', 'sports_gymnastics', 'accessibility_new', 'psychology',
    'neurology', 'vaccines', 'bloodtype', 'dentistry', 'ophthalmology',

    // Education & Learning
    'school', 'book', 'auto_stories', 'library_books', 'menu_book',
    'edit_note', 'draw', 'science', 'biotech', 'calculate',
    'functions', 'history_edu', 'class', 'quiz', 'grading',
    'emoji_events', 'military_tech', 'workspace_premium', 'stars',

    // Technology & Code
    'code', 'terminal', 'computer', 'devices', 'smartphone',
    'tablet', 'memory', 'storage', 'cloud', 'cloud_sync',
    'dns', 'router', 'wifi', 'cable', 'developer_mode',
    'api', 'database', 'data_object', 'javascript', 'html',

    // Communication
    'email', 'chat', 'forum', 'message', 'sms',
    'phone', 'video_call', 'call', 'contact_mail', 'contact_phone',
    'public', 'language', 'share', 'rss_feed', 'campaign',
    'notifications', 'notification_important', 'inbox', 'send', 'reply',

    // People & Social
    'person', 'people', 'groups', 'group_work', 'diversity_3',
    'manage_accounts', 'supervised_user_circle', 'family_restroom', 'child_care',
    'elderly', 'wc', 'volunteer_activism', 'social_distance',

    // Home & Lifestyle
    'home', 'house', 'villa', 'cottage', 'cabin',
    'bed', 'kitchen', 'bathroom', 'living', 'yard',
    'cleaning_services', 'home_repair_service', 'construction', 'build',
    'plumbing', 'electrical_services',

    // Food & Drink
    'restaurant', 'restaurant_menu', 'fastfood', 'local_pizza', 'lunch_dining',
    'dinner_dining', 'breakfast_dining', 'coffee', 'local_cafe', 'local_bar',
    'wine_bar', 'cake', 'icecream', 'bakery_dining', 'ramen_dining',
    'set_meal', 'grocery', 'nutrition', 'blender', 'cooking',

    // Travel & Transport
    'travel_explore', 'flight', 'hotel', 'directions_car', 'train',
    'directions_bus', 'directions_bike', 'motorcycle', 'sailing', 'hiking',
    'luggage', 'beach_access', 'map', 'explore', 'near_me',
    'location_on', 'tour', 'connecting_airports', 'commute',

    // Sports & Recreation
    'sports_soccer', 'sports_basketball', 'sports_tennis', 'sports_baseball',
    'sports_football', 'sports_volleyball', 'sports_golf', 'sports_esports',
    'sports_martial_arts', 'pool', 'surfing', 'kayaking', 'paragliding',
    'snowboarding', 'skateboarding', 'sports', 'trophy', 'stadium',

    // Arts & Creativity
    'palette', 'brush', 'format_paint', 'color_lens', 'architecture',
    'design_services', 'photo_camera', 'videocam', 'music_note', 'piano',
    'movie', 'live_tv', 'theater_comedy', 'headphones', 'mic',
    'radio', 'library_music', 'queue_music', 'lyrics',

    // Nature & Environment
    'nature', 'park', 'forest', 'eco', 'grass',
    'local_florist', 'energy_savings_leaf', 'water', 'air', 'wb_sunny',
    'nights_stay', 'storm', 'tsunami', 'volcano', 'pets',
    'cruelty_free', 'compost', 'recycling', 'solar_power', 'wind_power',

    // Organization & Productivity
    'folder', 'folder_open', 'category', 'label', 'tag',
    'bookmark', 'bookmarks', 'push_pin', 'sticky_note_2', 'note',
    'description', 'article', 'newspaper', 'feed', 'list',
    'view_list', 'dashboard', 'widgets', 'extension', 'hub',
    'calendar_month', 'event', 'schedule', 'alarm', 'timer',
    'hourglass_empty', 'lightbulb', 'tips_and_updates', 'flag', 'rocket_launch',

    // Security & Settings
    'lock', 'security', 'shield', 'privacy_tip', 'admin_panel_settings',
    'settings', 'tune', 'manage_search', 'find_in_page', 'verified',
    'gpp_good', 'key', 'password', 'fingerprint',

    // Misc / General
    'star', 'grade', 'new_releases', 'celebration', 'redeem',
    'card_giftcard', 'local_offer', 'sell', 'loyalty', 'diamond',
    'workspace_premium', 'auto_awesome', 'bolt', 'flare', 'whatshot',
  ];

  iconSearchQuery = signal('');

  readonly filteredIcons = computed(() => {
    const q = this.iconSearchQuery().toLowerCase().trim();
    if (!q) return this.allIcons;
    return this.allIcons.filter((icon) => icon.includes(q));
  });

  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  selectedCategory = signal<Category | null>(null);

  createForm = signal<CategoryForm>({
    name: '',
    description: '',
    color: '#43a047',
    icon: 'category',
    accessType: 'PRIVATE',
  });

  editForm = signal<CategoryForm>({
    name: '',
    description: '',
    color: '#43a047',
    icon: 'category',
    accessType: 'PRIVATE',
  });

  openCreate() {
    this.iconSearchQuery.set('');
    this.createForm.set({
      name: '',
      description: '',
      color: '#43a047',
      icon: 'category',
      accessType: 'PRIVATE',
    });
    this.showCreateModal.set(true);
  }

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
    console.log('Category filter applied:', values);
    // later: reload categories with filter params
  }

  onFilterReset() {
    this.activeFilters.set({});
  }

  submitCreate() {
    if (!this.createForm().name.trim()) return;
    console.log('Create:', this.createForm());
    this.showCreateModal.set(false);
  }

  openEdit(cat: Category, event?: Event) {
    event?.stopPropagation();
    this.iconSearchQuery.set('');
    this.selectedCategory.set(cat);
    this.editForm.set({
      name: cat.name,
      description: cat.description,
      color: cat.color,
      icon: cat.icon,
      accessType: cat.accessType,
    });
    this.showEditModal.set(true);
  }

  submitEdit() {
    if (!this.editForm().name.trim()) return;
    console.log('Update:', this.selectedCategory()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  openDeleteConfirm(cat: Category, event?: Event) {
    event?.stopPropagation();
    this.selectedCategory.set(cat);
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    const id = this.selectedCategory()?.id;
    if (id) this.categories.update((c) => c.filter((cat) => cat.id !== id));
    this.showDeleteConfirm.set(false);
    this.selectedCategory.set(null);
  }

  onAiClick() {
    this.aiAgent.open();
  }
}
