import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import {
  FilterPanelComponent,
  FilterField,
  FilterValues,
} from '../../../shared/components/filter/filter';
import { CategoryService } from '../../../core/services/category-service';
import {
  CategoryResponse,
  CategoryRequest,
  CategoryFilter,
  AccessType,
} from '../../../core/models/category.model';
import { environment } from '../../../../environments/environment';
import { AiAgentService } from '../../../core/services/ai-agent';

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
export class CategoriesComponent implements OnInit {
  private readonly userId = environment.userId;
  private readonly categoryService = inject(CategoryService);
  private readonly aiAgent = inject(AiAgentService);

  // ── Service State ──────────────────────────────────────────────────────────
  readonly paginatedCategories = this.categoryService.categories;
  readonly currentPage = this.categoryService.currentPage;
  readonly pageSize = this.categoryService.pageSize;
  readonly totalPages = this.categoryService.totalPages;
  readonly totalElements = this.categoryService.totalElements;

  // ── Filter ─────────────────────────────────────────────────────────────────
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
      type: 'select',
      icon: 'lock',
      options: [
        { value: 'PUBLIC', label: 'Public', icon: 'travel_explore', color: '#43a047' },
        { value: 'PRIVATE', label: 'Private', icon: 'lock', color: '#757575' },
      ],
    },
  ];

  readonly activeFilterCount = computed(
    () =>
      Object.values(this.activeFilters()).filter((v) => {
        if (!v || v === '') return false;
        if (Array.isArray(v)) return v.length > 0;
        return true;
      }).length,
  );

  onFilterApply(values: FilterValues): void {
    this.activeFilters.set(values);
    this.categoryService.loadAll(this.userId, 0, {
      name: (values['search'] as string) || undefined,
      accessType: (values['accessType'] as AccessType) || undefined,
    });
    this.showFilter.set(false);
  }

  onFilterReset(): void {
    this.activeFilters.set({});
    this.categoryService.loadAll(this.userId, 0);
    this.showFilter.set(false);
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  onPageChange(page: number): void {
    this.categoryService.loadAll(this.userId, page, this.buildFilterFromActive());
  }

  onPageSizeChange(size: number): void {
    this.categoryService.pageSize.set(size);
    this.categoryService.loadAll(this.userId, 0, this.buildFilterFromActive());
  }

  onAiClick(): void {
    this.aiAgent.open();
  }

  // ── Modals ─────────────────────────────────────────────────────────────────
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  selectedCategory = signal<CategoryResponse | null>(null);

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

  // ── Icon & Color Picker ────────────────────────────────────────────────────
  iconSearchQuery = signal('');

  readonly filteredIcons = computed(() => {
    const q = this.iconSearchQuery().toLowerCase().trim();
    if (!q) return this.allIcons;
    return this.allIcons.filter((icon) => icon.includes(q));
  });

  // ── CRUD ───────────────────────────────────────────────────────────────────
  openCreate(): void {
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

  submitCreate(): void {
    if (!this.createForm().name.trim()) return;
    // TODO: categoryService.create(this.userId, this.createForm());
    console.log('TODO create:', this.createForm());
    this.showCreateModal.set(false);
  }

  openEdit(cat: CategoryResponse, event?: Event): void {
    event?.stopPropagation();
    this.categoryService.loadById(this.userId, cat.id);
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

  submitEdit(): void {
    if (!this.editForm().name.trim()) return;
    // TODO: categoryService.update(this.userId, this.selectedCategory()!.id, this.editForm());
    console.log('TODO update:', this.selectedCategory()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  openDeleteConfirm(cat: CategoryResponse, event?: Event): void {
    event?.stopPropagation();
    this.selectedCategory.set(cat);
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    // TODO: categoryService.delete(this.userId, this.selectedCategory()!.id);
    console.log('TODO delete:', this.selectedCategory()?.id);
    this.showDeleteConfirm.set(false);
    this.selectedCategory.set(null);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  formatCreatedAt(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en', { month: 'short', day: 'numeric' });
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.categoryService.loadAll(this.userId);
  }

  // ── Private ────────────────────────────────────────────────────────────────
  private buildFilterFromActive(): CategoryFilter {
    const v = this.activeFilters();
    return {
      name: (v['search'] as string) || undefined,
      accessType: (v['accessType'] as AccessType) || undefined,
    };
  }

  // ── Colors & Icons ─────────────────────────────────────────────────────────
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
    '#212121',
    '#424242',
    '#616161',
    '#757575',
    '#9e9e9e',
    '#bdbdbd',
    '#f57f17',
    '#f9a825',
    '#fbc02d',
    '#fdd835',
    '#ffee58',
    '#fff176',
    '#1a237e',
    '#283593',
    '#303f9f',
    '#3949ab',
    '#5c6bc0',
    '#9fa8da',
    '#3e2723',
    '#4e342e',
    '#5d4037',
    '#6d4c41',
    '#795548',
    '#a1887f',
    '#263238',
    '#37474f',
    '#455a64',
    '#546e7a',
    '#78909c',
    '#b0bec5',
  ];

  readonly allIcons: string[] = [
    'work',
    'business_center',
    'corporate_fare',
    'domain',
    'apartment',
    'store',
    'storefront',
    'inventory',
    'inventory_2',
    'receipt_long',
    'request_quote',
    'paid',
    'point_of_sale',
    'handshake',
    'contract',
    'assignment',
    'task_alt',
    'checklist',
    'fact_check',
    'rule',
    'payments',
    'attach_money',
    'savings',
    'account_balance',
    'account_balance_wallet',
    'trending_up',
    'trending_down',
    'bar_chart',
    'pie_chart',
    'show_chart',
    'candlestick_chart',
    'currency_exchange',
    'credit_card',
    'price_check',
    'money_off',
    'wallet',
    'local_atm',
    'toll',
    'monetization_on',
    'health_and_safety',
    'medical_services',
    'local_hospital',
    'medication',
    'monitor_heart',
    'ecg_heart',
    'favorite',
    'spa',
    'self_improvement',
    'fitness_center',
    'sports_gymnastics',
    'accessibility_new',
    'psychology',
    'school',
    'book',
    'auto_stories',
    'library_books',
    'menu_book',
    'edit_note',
    'draw',
    'science',
    'biotech',
    'calculate',
    'functions',
    'history_edu',
    'class',
    'quiz',
    'grading',
    'emoji_events',
    'military_tech',
    'workspace_premium',
    'stars',
    'code',
    'terminal',
    'computer',
    'devices',
    'smartphone',
    'tablet',
    'memory',
    'storage',
    'cloud',
    'cloud_sync',
    'dns',
    'router',
    'wifi',
    'cable',
    'developer_mode',
    'api',
    'database',
    'data_object',
    'email',
    'chat',
    'forum',
    'message',
    'sms',
    'phone',
    'video_call',
    'call',
    'contact_mail',
    'contact_phone',
    'public',
    'language',
    'share',
    'rss_feed',
    'campaign',
    'notifications',
    'notification_important',
    'inbox',
    'send',
    'reply',
    'person',
    'people',
    'groups',
    'group_work',
    'diversity_3',
    'manage_accounts',
    'supervised_user_circle',
    'family_restroom',
    'home',
    'house',
    'villa',
    'cottage',
    'cabin',
    'bed',
    'kitchen',
    'bathroom',
    'living',
    'yard',
    'cleaning_services',
    'home_repair_service',
    'construction',
    'build',
    'restaurant',
    'restaurant_menu',
    'fastfood',
    'local_pizza',
    'lunch_dining',
    'coffee',
    'local_cafe',
    'local_bar',
    'wine_bar',
    'cake',
    'travel_explore',
    'flight',
    'hotel',
    'directions_car',
    'train',
    'directions_bus',
    'directions_bike',
    'motorcycle',
    'sailing',
    'hiking',
    'luggage',
    'beach_access',
    'map',
    'explore',
    'near_me',
    'location_on',
    'sports_soccer',
    'sports_basketball',
    'sports_tennis',
    'sports_baseball',
    'sports_football',
    'sports_esports',
    'sports_martial_arts',
    'pool',
    'surfing',
    'palette',
    'brush',
    'format_paint',
    'color_lens',
    'architecture',
    'design_services',
    'photo_camera',
    'videocam',
    'music_note',
    'piano',
    'movie',
    'live_tv',
    'theater_comedy',
    'headphones',
    'mic',
    'nature',
    'park',
    'forest',
    'eco',
    'grass',
    'local_florist',
    'energy_savings_leaf',
    'water',
    'air',
    'wb_sunny',
    'nights_stay',
    'pets',
    'recycling',
    'solar_power',
    'wind_power',
    'folder',
    'folder_open',
    'category',
    'label',
    'tag',
    'bookmark',
    'bookmarks',
    'push_pin',
    'sticky_note_2',
    'note',
    'description',
    'article',
    'newspaper',
    'feed',
    'list',
    'dashboard',
    'widgets',
    'extension',
    'hub',
    'calendar_month',
    'event',
    'schedule',
    'alarm',
    'timer',
    'hourglass_empty',
    'lightbulb',
    'tips_and_updates',
    'flag',
    'rocket_launch',
    'lock',
    'security',
    'shield',
    'privacy_tip',
    'admin_panel_settings',
    'settings',
    'tune',
    'verified',
    'gpp_good',
    'key',
    'fingerprint',
    'star',
    'grade',
    'new_releases',
    'celebration',
    'redeem',
    'card_giftcard',
    'local_offer',
    'sell',
    'loyalty',
    'diamond',
    'auto_awesome',
    'bolt',
    'flare',
    'whatshot',
  ];
}
