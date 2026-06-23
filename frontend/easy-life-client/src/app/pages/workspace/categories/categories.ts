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
  readonly categoryService = inject(CategoryService);
  private readonly aiAgent = inject(AiAgentService);

  // ── Service State ──────────────────────────────────────────────────────────
  readonly paginatedCategories = this.categoryService.categories;
  readonly currentPage = this.categoryService.currentPage;
  readonly pageSize = this.categoryService.pageSize;
  readonly totalPages = this.categoryService.totalPages;
  readonly totalElements = this.categoryService.totalElements;
  readonly loading = this.categoryService.loading;
  readonly saving = this.categoryService.saving;
  readonly deleting = this.categoryService.deleting;

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

  // Inline Feedback
  createError = signal(false);
  editError = signal(false);
  deleteError = signal(false);

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
    this.createError.set(false);
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
    this.createError.set(false);
    const f = this.createForm();
    const request: CategoryRequest = {
      name: f.name,
      description: f.description,
      color: f.color,
      icon: f.icon,
      accessType: f.accessType,
    };
    this.categoryService.create(
      this.userId,
      request,
      () => this.showCreateModal.set(false),
      () => this.createError.set(true),
    );
  }

  openEdit(cat: CategoryResponse, event?: Event): void {
    event?.stopPropagation();
    this.categoryService.loadById(this.userId, cat.id);
    this.iconSearchQuery.set('');
    this.editError.set(false);
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
    if (!this.editForm().name.trim() || !this.selectedCategory()) return;
    this.editError.set(false);
    const f = this.editForm();
    const request: CategoryRequest = {
      name: f.name,
      description: f.description,
      color: f.color,
      icon: f.icon,
      accessType: f.accessType,
    };
    this.categoryService.update(
      this.userId,
      this.selectedCategory()!.id,
      request,
      () => this.showEditModal.set(false),
      () => this.editError.set(true),
    );
  }

  openDeleteConfirm(cat: CategoryResponse, event?: Event): void {
    event?.stopPropagation();
    this.selectedCategory.set(cat);
    this.deleteError.set(false);
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    if (!this.selectedCategory()) return;
    this.deleteError.set(false);
    this.categoryService.delete(
      this.userId,
      this.selectedCategory()!.id,
      () => {
        this.showDeleteConfirm.set(false);
        this.selectedCategory.set(null);
      },
      () => this.deleteError.set(true),
    );
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
    '#bf360c',
    '#d84315',
    '#e64a19',
    '#f4511e',
    '#ff7043',
    '#ffab91',
    '#f57f17',
    '#f9a825',
    '#fbc02d',
    '#fdd835',
    '#ffee58',
    '#fff9c4',
    '#33691e',
    '#558b2f',
    '#689f38',
    '#7cb342',
    '#8bc34a',
    '#c5e1a5',
    '#1a237e',
    '#283593',
    '#303f9f',
    '#3949ab',
    '#3f51b5',
    '#7986cb',
    '#b2ebf2',
    '#e0f7fa',
    '#f06292',
    '#fce4ec',
  ];

  readonly allIcons: string[] = [
    'category',
    'work',
    'home',
    'fitness_center',
    'favorite',
    'school',
    'attach_money',
    'local_dining',
    'directions_car',
    'flight',
    'music_note',
    'sports_esports',
    'self_improvement',
    'book',
    'shopping_cart',
    'star',
    'explore',
    'palette',
    'code',
    'science',
    'health_and_safety',
    'flag',
    'calendar_month',
    'task_alt',
    'chat_bubble',
    'groups',
    'person',
    'settings',
    'notifications',
    'lock',
    'travel_explore',
    'public',
    'architecture',
    'auto_stories',
    'balance',
    'bar_chart',
    'beach_access',
    'bed',
    'bolt',
    'brush',
    'bug_report',
    'business',
    'campaign',
    'card_giftcard',
    'child_care',
    'cloud',
    'coffee',
    'construction',
    'pedal_bike',
    'data_usage',
    'design_services',
    'devices',
    'diamond',
    'directions_bike',
    'directions_run',
    'eco',
    'edit',
    'emoji_events',
    'emoji_nature',
    'energy_savings_leaf',
    'extension',
    'face',
    'factory',
    'family_restroom',
    'fastfood',
    'filter_drama',
    'forest',
    'functions',
    'yard',
    'gavel',
    'grass',
    'handshake',
    'hiking',
    'history',
    'hotel',
    'hub',
    'inventory',
    'kayaking',
    'kitchen',
    'label',
    'language',
    'layers',
    'laptop',
    'leaderboard',
    'lightbulb',
    'link',
    'local_florist',
    'local_hospital',
    'local_library',
    'location_on',
    'loyalty',
    'manage_accounts',
    'map',
    'medications',
    'memory',
    'mic',
    'military_tech',
    'monitor_heart',
    'mood',
    'movie',
    'nature',
    'nightlife',
    'outdoor_grill',
    'park',
    'payment',
    'pets',
    'photo_camera',
    'piano',
    'podcasts',
    'pool',
    'psychology',
    'public_off',
    'push_pin',
    'quiz',
    'radio',
    'receipt_long',
    'recycling',
    'restaurant',
    'rocket_launch',
    'rowing',
    'savings',
    'security',
    'sentiment_satisfied',
    'share',
    'shield',
    'signal_cellular_alt',
    'skateboarding',
    'smartphone',
    'smoking_rooms',
    'solar_power',
    'spa',
    'sports',
    'sports_basketball',
    'sports_soccer',
    'stadia_controller',
    'stairs',
    'store',
    'subscriptions',
    'support',
    'surfing',
    'swap_horiz',
    'table_restaurant',
    'terrain',
    'timer',
    'today',
    'topic',
    'toys',
    'track_changes',
    'translate',
    'trending_up',
    'tsunami',
    'tune',
    'tv',
    'umbrella',
    'volunteer_activism',
    'wallet',
    'wb_sunny',
    'weekend',
    'monitor_weight',
    'wifi',
    'workspace_premium',
  ];

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.showCreateModal.set(false);
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(false);
    this.showFilter.set(false);
  }
}
