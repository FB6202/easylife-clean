import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import {
  FilterPanelComponent,
  FilterField,
  FilterValues,
} from '../../../shared/components/filter/filter';
import { WeekPlanService } from '../../../core/services/weekplan-service';
import { CategoryService } from '../../../core/services/category-service';
import { TodoService } from '../../../core/services/todo-service';
import { AiAgentService } from '../../../core/services/ai-agent';
import {
  WeekPlanResponse,
  WeekPlanFilter,
  WeekPlanStatus,
} from '../../../core/models/weekplan.model';
import { environment } from '../../../../environments/environment';

interface WeekPlanFormItem {
  title: string;
  description: string;
  done: boolean;
  dueDate: string;
  createAsTask: boolean;
}

interface WeekPlanForm {
  title: string;
  intention: string;
  startDate: string;
  endDate: string;
  status: WeekPlanStatus;
  reflection: string;
  categoryIds: number[];
  items: WeekPlanFormItem[];
}

interface TaskPreview {
  id: number;
  title: string;
  dueDate: string;
  categoryColor: string;
  categoryIcon: string;
}

@Component({
  selector: 'app-weekplan',
  imports: [CommonModule, FormsModule, PaginationComponent, FilterPanelComponent],
  templateUrl: './weekplan.html',
  styleUrl: './weekplan.scss',
})
export class WeekplanComponent implements OnInit {
  private readonly userId = environment.userId;
  private readonly weekPlanService = inject(WeekPlanService);
  private readonly categoryService = inject(CategoryService);
  private readonly todoService = inject(TodoService);
  private readonly aiAgent = inject(AiAgentService);

  readonly statuses: WeekPlanStatus[] = ['ACTIVE', 'COMPLETED', 'DRAFT', 'ABANDONED'];

  // ── Service State ──────────────────────────────────────────────────────────
  readonly paginatedWeekplans = this.weekPlanService.weekPlans;
  readonly currentPage = this.weekPlanService.currentPage;
  readonly pageSize = this.weekPlanService.pageSize;
  readonly totalPages = this.weekPlanService.totalPages;
  readonly totalElements = this.weekPlanService.totalElements;

  readonly availableCategories = this.categoryService.allCategories;

  // ── Filter ─────────────────────────────────────────────────────────────────
  showFilter = signal(false);
  activeFilters = signal<FilterValues>({});

  readonly weekPlanFilterFields = computed((): FilterField[] => [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      icon: 'flag',
      options: [
        { value: 'ACTIVE', label: 'Active', icon: 'radio_button_unchecked', color: '#43a047' },
        { value: 'COMPLETED', label: 'Completed', icon: 'check_circle', color: '#1976d2' },
        { value: 'DRAFT', label: 'Draft', icon: 'edit_note', color: '#f9a825' },
        { value: 'ABANDONED', label: 'Abandoned', icon: 'cancel', color: '#9e9e9e' },
      ],
    },
    {
      key: 'categories',
      label: 'Categories',
      type: 'multiselect-dropdown',
      icon: 'category',
      options: this.availableCategories().map((c) => ({
        value: String(c.id),
        label: c.name,
        icon: c.icon,
        color: c.color,
      })),
    },
    { key: 'startDateFrom', label: 'Start From', type: 'date', icon: 'calendar_today' },
    { key: 'startDateTo', label: 'Start To', type: 'date', icon: 'calendar_today' },
  ]);

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
    const categoryIds = (values['categories'] as string[] | undefined)
      ?.map(Number)
      .filter((n) => !isNaN(n));
    this.weekPlanService.loadAll(this.userId, 0, {
      status: (values['status'] as WeekPlanStatus) || undefined,
      startDateFrom: (values['startDateFrom'] as string) || undefined,
      startDateTo: (values['startDateTo'] as string) || undefined,
      categoryIds: categoryIds?.length ? categoryIds : undefined,
    });
    this.showFilter.set(false);
  }

  onFilterReset(): void {
    this.activeFilters.set({});
    this.weekPlanService.loadAll(this.userId, 0);
    this.showFilter.set(false);
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  onPageChange(page: number): void {
    this.weekPlanService.loadAll(this.userId, page, this.buildFilterFromActive());
  }

  onPageSizeChange(size: number): void {
    this.weekPlanService.pageSize.set(size);
    this.weekPlanService.loadAll(this.userId, 0, this.buildFilterFromActive());
  }

  onAiClick(): void {
    this.aiAgent.open();
  }

  // ── Category Dropdown ──────────────────────────────────────────────────────
  showCatDropdown = signal(false);
  showEditCatDropdown = signal(false);

  readonly sortedCreateCategories = computed(() => {
    const cats = this.availableCategories();
    if (!Array.isArray(cats)) return [];
    const selected = this.createForm().categoryIds;
    return [...cats].sort(
      (a, b) => (selected.includes(a.id) ? 0 : 1) - (selected.includes(b.id) ? 0 : 1),
    );
  });

  readonly sortedEditCategories = computed(() => {
    const cats = this.availableCategories();
    if (!Array.isArray(cats)) return [];
    const selected = this.editForm().categoryIds;
    return [...cats].sort(
      (a, b) => (selected.includes(a.id) ? 0 : 1) - (selected.includes(b.id) ? 0 : 1),
    );
  });

  toggleCatDropdown(event: Event): void {
    event.stopPropagation();
    this.showCatDropdown.update((v) => !v);
    this.showEditCatDropdown.set(false);
  }

  toggleEditCatDropdown(event: Event): void {
    event.stopPropagation();
    this.showEditCatDropdown.update((v) => !v);
    this.showCatDropdown.set(false);
  }

  getCatDropdownLabel(categoryIds: number[]): string {
    if (!categoryIds.length) return 'Select categories...';
    const cats = this.availableCategories();
    if (!Array.isArray(cats)) return `${categoryIds.length} selected`;
    if (categoryIds.length === 1)
      return cats.find((c) => c.id === categoryIds[0])?.name ?? '1 selected';
    return `${categoryIds.length} selected`;
  }

  getSelectedCatColors(categoryIds: number[]): string[] {
    const cats = this.availableCategories();
    if (!Array.isArray(cats)) return [];
    return cats
      .filter((c) => categoryIds.includes(c.id))
      .map((c) => c.color)
      .slice(0, 3);
  }

  toggleCreateCategory(id: number): void {
    this.createForm.update((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((i) => i !== id)
        : [...f.categoryIds, id],
    }));
  }

  toggleEditCategory(id: number): void {
    this.editForm.update((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((i) => i !== id)
        : [...f.categoryIds, id],
    }));
  }

  // ── Task Picker ────────────────────────────────────────────────────────────
  showTaskPicker = signal<'create' | 'edit' | null>(null);
  taskSearchQuery = signal('');

  readonly filteredTasks = computed((): TaskPreview[] => {
    const q = this.taskSearchQuery().toLowerCase().trim();
    const todos = this.todoService.todos();
    return todos
      .filter((t) => t.status !== 'DONE')
      .filter((t) => !q || t.title.toLowerCase().includes(q))
      .map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate ?? '',
        categoryColor: t.categories?.[0]?.color ?? '#757575',
        categoryIcon: t.categories?.[0]?.icon ?? 'category',
      }));
  });

  openTaskPicker(mode: 'create' | 'edit', event: Event): void {
    event.stopPropagation();
    this.showTaskPicker.update((v) => (v === mode ? null : mode));
    this.taskSearchQuery.set('');
  }

  isTaskAlreadyAdded(title: string, mode: 'create' | 'edit'): boolean {
    const items = mode === 'create' ? this.createForm().items : this.editForm().items;
    return items.some((i) => i.title === title);
  }

  addItemFromTask(task: TaskPreview, mode: 'create' | 'edit'): void {
    const newItem: WeekPlanFormItem = {
      title: task.title,
      description: '',
      done: false,
      dueDate: task.dueDate,
      createAsTask: false,
    };
    if (mode === 'create') {
      this.createForm.update((f) => ({ ...f, items: [...f.items, newItem] }));
    } else {
      this.editForm.update((f) => ({ ...f, items: [...f.items, newItem] }));
    }
  }

  // ── Task Toggle & Bulk ─────────────────────────────────────────────────────
  toggleCreateAsTask(index: number, mode: 'create' | 'edit'): void {
    if (mode === 'create') {
      this.createForm.update((f) => {
        const items = [...f.items];
        items[index] = { ...items[index], createAsTask: !items[index].createAsTask };
        return { ...f, items };
      });
    } else {
      this.editForm.update((f) => {
        const items = [...f.items];
        items[index] = { ...items[index], createAsTask: !items[index].createAsTask };
        return { ...f, items };
      });
    }
  }

  convertAllToTasks(mode: 'create' | 'edit'): void {
    const allOn = mode === 'create' ? this.createAllAsTask() : this.editAllAsTask();
    if (mode === 'create') {
      this.createForm.update((f) => ({
        ...f,
        items: f.items.map((i) => ({ ...i, createAsTask: !allOn })),
      }));
    } else {
      this.editForm.update((f) => ({
        ...f,
        items: f.items.map((i) => ({ ...i, createAsTask: !allOn })),
      }));
    }
  }

  readonly createAllAsTask = computed(
    () =>
      this.createForm().items.length > 0 && this.createForm().items.every((i) => i.createAsTask),
  );

  readonly editAllAsTask = computed(
    () => this.editForm().items.length > 0 && this.editForm().items.every((i) => i.createAsTask),
  );

  readonly createTaskCount = computed(
    () => this.createForm().items.filter((i) => i.createAsTask).length,
  );

  readonly editTaskCount = computed(
    () => this.editForm().items.filter((i) => i.createAsTask).length,
  );

  // ── Modals ─────────────────────────────────────────────────────────────────
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  selectedPlan = signal<WeekPlanResponse | null>(null);

  private emptyForm(): WeekPlanForm {
    return {
      title: '',
      intention: '',
      startDate: '',
      endDate: '',
      status: 'DRAFT',
      reflection: '',
      categoryIds: [],
      items: [],
    };
  }

  createForm = signal<WeekPlanForm>(this.emptyForm());
  editForm = signal<WeekPlanForm>(this.emptyForm());

  openCreate(): void {
    this.createForm.set(this.emptyForm());
    this.showCatDropdown.set(false);
    this.showTaskPicker.set(null);
    this.showCreateModal.set(true);
  }

  submitCreate(): void {
    if (!this.createForm().title.trim()) return;
    console.log('TODO create weekplan:', this.createForm());
    this.showCreateModal.set(false);
  }

  openEdit(plan: WeekPlanResponse): void {
    this.weekPlanService.loadById(this.userId, plan.id);
    this.selectedPlan.set(plan);
    this.editForm.set({
      title: plan.title,
      intention: plan.intention ?? '',
      startDate: plan.startDate ?? '',
      endDate: plan.endDate ?? '',
      status: plan.status,
      reflection: plan.reflection ?? '',
      categoryIds: plan.categories?.map((c) => c.id) ?? [],
      items:
        plan.items?.map((i) => ({
          title: i.title,
          description: i.description ?? '',
          done: i.done,
          dueDate: i.dueDate ?? '',
          createAsTask: false,
        })) ?? [],
    });
    this.showEditCatDropdown.set(false);
    this.showTaskPicker.set(null);
    this.showEditModal.set(true);
  }

  submitEdit(): void {
    if (!this.editForm().title.trim()) return;
    console.log('TODO update weekplan:', this.selectedPlan()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  openDeleteConfirm(): void {
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    console.log('TODO delete weekplan:', this.selectedPlan()?.id);
    this.showDeleteConfirm.set(false);
    this.selectedPlan.set(null);
  }

  // ── Item Helpers ───────────────────────────────────────────────────────────
  addItemToCreate(): void {
    this.createForm.update((f) => ({
      ...f,
      items: [
        ...f.items,
        { title: '', description: '', done: false, dueDate: '', createAsTask: false },
      ],
    }));
  }

  addItemToEdit(): void {
    this.editForm.update((f) => ({
      ...f,
      items: [
        ...f.items,
        { title: '', description: '', done: false, dueDate: '', createAsTask: false },
      ],
    }));
  }

  removeItemFromCreate(index: number): void {
    this.createForm.update((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  }

  removeItemFromEdit(index: number): void {
    this.editForm.update((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  }

  updateCreateItem(index: number, field: string, value: any): void {
    this.createForm.update((f) => {
      const items = [...f.items];
      items[index] = { ...items[index], [field]: value };
      return { ...f, items };
    });
  }

  updateEditItem(index: number, field: string, value: any): void {
    this.editForm.update((f) => {
      const items = [...f.items];
      items[index] = { ...items[index], [field]: value };
      return { ...f, items };
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getStatusLabel(status: WeekPlanStatus): string {
    return { ACTIVE: 'Active', COMPLETED: 'Completed', DRAFT: 'Draft', ABANDONED: 'Abandoned' }[
      status
    ];
  }

  getStatusClass(status: WeekPlanStatus): string {
    return {
      ACTIVE: 'status--active',
      COMPLETED: 'status--completed',
      DRAFT: 'status--draft',
      ABANDONED: 'status--abandoned',
    }[status];
  }

  getStatusIcon(status: WeekPlanStatus): string {
    return {
      ACTIVE: 'radio_button_unchecked',
      COMPLETED: 'check_circle',
      DRAFT: 'edit_note',
      ABANDONED: 'cancel',
    }[status];
  }

  getProgressLabel(status: WeekPlanStatus): string {
    return { ACTIVE: 'Progress', COMPLETED: 'Completed', DRAFT: 'Items', ABANDONED: 'Done' }[
      status
    ];
  }

  getProgressPercent(done: number, total: number): number {
    if (!total) return 0;
    return Math.round((done / total) * 100);
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00')
      .toLocaleString('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      .toUpperCase();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showCatDropdown.set(false);
    this.showEditCatDropdown.set(false);
    this.showTaskPicker.set(null);
  }

  ngOnInit(): void {
    this.weekPlanService.loadAll(this.userId);
    this.categoryService.loadAllFlat(this.userId);
    this.todoService.loadAll(this.userId);
  }

  private buildFilterFromActive(): WeekPlanFilter {
    const v = this.activeFilters();
    const categoryIds = (v['categories'] as string[] | undefined)
      ?.map(Number)
      .filter((n) => !isNaN(n));
    return {
      status: (v['status'] as WeekPlanStatus) || undefined,
      startDateFrom: (v['startDateFrom'] as string) || undefined,
      startDateTo: (v['startDateTo'] as string) || undefined,
      categoryIds: categoryIds?.length ? categoryIds : undefined,
    };
  }
}
