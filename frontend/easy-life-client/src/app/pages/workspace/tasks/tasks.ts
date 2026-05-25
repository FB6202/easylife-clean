import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import {
  FilterPanelComponent,
  FilterField,
  FilterValues,
} from '../../../shared/components/filter/filter';
import { TodoService } from '../../../core/services/todo-service';
import {
  TodoResponse,
  TodoFilter,
  CategoryPreview,
  AccessType,
} from '../../../core/models/todo.model';
import { environment } from '../../../../environments/environment';
import { AiAgentService } from '../../../core/services/ai-agent';
import { CategoryService } from '../../../core/services/category-service';
import { CategoryResponse as CategoryResponseModel } from '../../../core/models/category.model';

type TodoStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';
type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OPTIONAL';

interface TaskForm {
  title: string;
  description: string;
  status: TodoStatus;
  priority: Priority;
  accessType: 'PRIVATE' | 'PUBLIC';
  dueDate: string;
  categoryIds: number[];
}

@Component({
  selector: 'app-tasks',
  imports: [CommonModule, FormsModule, PaginationComponent, FilterPanelComponent],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class TasksComponent implements OnInit {
  private readonly userId = environment.userId;

  private readonly todoService = inject(TodoService);
  private readonly categoryService = inject(CategoryService);
  private readonly aiAgent = inject(AiAgentService);

  readonly priorities: Priority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'OPTIONAL'];
  readonly statuses: TodoStatus[] = ['OPEN', 'IN_PROGRESS', 'DONE'];

  // ── Service State (read-only Zugriff) ──────────────────────────────────────
  readonly paginatedTasks = this.todoService.todos;
  readonly currentPage = this.todoService.currentPage;
  readonly pageSize = this.todoService.pageSize;
  readonly totalPages = this.todoService.totalPages;
  readonly totalElements = this.todoService.totalElements;
  readonly pendingCount = this.todoService.pendingCount;
  readonly inProgressCount = this.todoService.inProgressCount;
  readonly doneCount = this.todoService.doneCount;

  // ── Derived ────────────────────────────────────────────────────────────────
  readonly productivityScore = computed(() => {
    const total = this.totalElements();
    if (!total) return 0;
    return Math.round((this.doneCount() / total) * 10 * 10) / 10;
  });

  readonly productivityLabel = computed(() => {
    const s = this.productivityScore();
    if (s >= 9) return 'Elite';
    if (s >= 7) return 'High';
    if (s >= 5) return 'Good';
    return 'Building';
  });

  // ── Categories (wird vom API geladen) ──────────────────────────────────────
  readonly availableCategories = this.categoryService.allCategories;

  // ── Filter ─────────────────────────────────────────────────────────────────
  showFilter = signal(false);
  activeFilters = signal<FilterValues>({});

  readonly taskFilterFields = computed((): FilterField[] => [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      icon: 'radio_button_checked',
      options: [
        { value: 'OPEN', label: 'Open', icon: 'radio_button_unchecked', color: '#1976d2' },
        { value: 'IN_PROGRESS', label: 'Ongoing', icon: 'pending', color: '#f9a825' },
        { value: 'DONE', label: 'Done', icon: 'check_circle', color: '#43a047' },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select',
      icon: 'flag',
      options: [
        { value: 'CRITICAL', label: 'Critical', color: '#d32f2f' },
        { value: 'HIGH', label: 'High', color: '#f57c00' },
        { value: 'MEDIUM', label: 'Medium', color: '#f9a825' },
        { value: 'LOW', label: 'Low', color: '#1976d2' },
        { value: 'OPTIONAL', label: 'Optional', color: '#757575' },
      ],
    },
    {
      key: 'access',
      label: 'Access',
      type: 'select',
      icon: 'lock',
      options: [
        { value: 'PRIVATE', label: 'Private', icon: 'lock', color: '#757575' },
        { value: 'PUBLIC', label: 'Public', icon: 'travel_explore', color: '#43a047' },
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
    { key: 'dueDateFrom', label: 'Due Date From', type: 'date', icon: 'calendar_today' },
    { key: 'dueDateTo', label: 'Due Date To', type: 'date', icon: 'calendar_today' },
  ]);

  readonly activeFilterCount = computed(
    () =>
      Object.values(this.activeFilters()).filter((v) => {
        if (!v || v === '') return false;
        if (Array.isArray(v)) return v.length > 0;
        return true;
      }).length,
  );

  readonly sortedCreateCategories = computed(() => {
    const cats = this.availableCategories();
    if (!Array.isArray(cats)) return [];
    const selected = this.createForm().categoryIds;
    return [...cats].sort((a, b) => {
      const aSelected = selected.includes(a.id) ? 0 : 1;
      const bSelected = selected.includes(b.id) ? 0 : 1;
      return aSelected - bSelected;
    });
  });

  readonly sortedEditCategories = computed(() => {
    const cats = this.availableCategories();
    if (!Array.isArray(cats)) return [];
    const selected = this.editForm().categoryIds;
    return [...cats].sort((a, b) => {
      const aSelected = selected.includes(a.id) ? 0 : 1;
      const bSelected = selected.includes(b.id) ? 0 : 1;
      return aSelected - bSelected;
    });
  });

  onFilterApply(values: FilterValues): void {
    this.activeFilters.set(values);

    const categoryIds = (values['categories'] as string[] | undefined)
      ?.map(Number)
      .filter((n) => !isNaN(n));

    const filter: TodoFilter = {
      status: (values['status'] as TodoStatus) || undefined,
      priority: (values['priority'] as Priority) || undefined,
      accessType: (values['access'] as AccessType) || undefined,
      dueDateFrom: (values['dueDateFrom'] as string) || undefined,
      dueDateTo: (values['dueDateTo'] as string) || undefined,
      categoryIds: categoryIds?.length ? categoryIds : undefined,
    };

    this.todoService.loadAll(this.userId, 0, filter);
    this.showFilter.set(false);
  }

  onFilterReset(): void {
    this.activeFilters.set({});
    this.todoService.loadAll(this.userId, 0);
    this.showFilter.set(false);
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  onPageSizeChange(size: number): void {
    this.todoService.pageSize.set(size);
    this.todoService.loadAll(this.userId, 0, this.buildFilterFromActive());
  }

  onPageChange(page: number): void {
    this.todoService.loadAll(this.userId, page, this.buildFilterFromActive());
  }

  onAiClick(): void {
    this.aiAgent.open();
  }

  // ── Category Dropdown ──────────────────────────────────────────────────────
  showCatDropdown = signal(false);
  showEditCatDropdown = signal(false);

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

  getSelectedCatColors(categoryIds: number[]): string[] {
    const cats = this.availableCategories();
    if (!Array.isArray(cats) || !cats.length) return [];
    return cats
      .filter((c) => categoryIds.includes(c.id))
      .map((c) => c.color)
      .slice(0, 3);
  }

  getCatDropdownLabel(categoryIds: number[]): string {
    if (!categoryIds.length) return 'Select categories...';
    const cats = this.availableCategories();
    if (!Array.isArray(cats)) return `${categoryIds.length} selected`;
    if (categoryIds.length === 1)
      return cats.find((c) => c.id === categoryIds[0])?.name ?? '1 selected';
    return `${categoryIds.length} selected`;
  }

  // ── Modal State ────────────────────────────────────────────────────────────
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  showDoneConfirm = signal(false);
  activeMenu = signal<number | null>(null);
  selectedTask = signal<TodoResponse | null>(null);

  createForm = signal<TaskForm>({
    title: '',
    description: '',
    status: 'OPEN',
    priority: 'MEDIUM',
    accessType: 'PRIVATE',
    dueDate: '',
    categoryIds: [],
  });

  editForm = signal<TaskForm>({
    title: '',
    description: '',
    status: 'OPEN',
    priority: 'MEDIUM',
    accessType: 'PRIVATE',
    dueDate: '',
    categoryIds: [],
  });

  // ── Create (TODO: todoService.create() sobald implementiert) ───────────────
  openCreate(): void {
    this.createForm.set({
      title: '',
      description: '',
      status: 'OPEN',
      priority: 'MEDIUM',
      accessType: 'PRIVATE',
      dueDate: '',
      categoryIds: [],
    });
    this.showCatDropdown.set(false);
    this.showCreateModal.set(true);
  }

  submitCreate(): void {
    if (!this.createForm().title.trim()) return;
    // TODO: this.todoService.create(this.userId, this.createForm());
    console.log('TODO create:', this.createForm());
    this.showCreateModal.set(false);
  }

  // ── Edit (findById wird aufgerufen für frischen Stand) ────────────────────
  openEdit(task: TodoResponse): void {
    this.todoService.loadById(this.userId, task.id);
    this.selectedTask.set(task);
    this.editForm.set({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      accessType: task.accessType,
      dueDate: task.dueDate ?? '',
      categoryIds: task.categories?.map((c) => c.id) ?? [],
    });
    this.showEditCatDropdown.set(false);
    this.showEditModal.set(true);
    this.activeMenu.set(null);
  }

  submitEdit(): void {
    if (!this.editForm().title.trim()) return;
    // TODO: this.todoService.update(this.userId, this.selectedTask()!.id, this.editForm());
    console.log('TODO update:', this.selectedTask()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  // ── Done (TODO: todoService.update() sobald implementiert) ────────────────
  openDoneConfirm(task: TodoResponse): void {
    this.selectedTask.set(task);
    this.showDoneConfirm.set(true);
    this.activeMenu.set(null);
  }

  confirmDone(): void {
    // TODO: this.todoService.update(this.userId, id, { ...task, status: 'DONE' });
    console.log('TODO mark done:', this.selectedTask()?.id);
    this.showDoneConfirm.set(false);
    this.selectedTask.set(null);
  }

  // ── Delete (TODO: todoService.delete() sobald implementiert) ──────────────
  openDeleteConfirm(task: TodoResponse): void {
    this.selectedTask.set(task);
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
    this.activeMenu.set(null);
  }

  confirmDelete(): void {
    // TODO: this.todoService.delete(this.userId, this.selectedTask()!.id);
    console.log('TODO delete:', this.selectedTask()?.id);
    this.showDeleteConfirm.set(false);
    this.selectedTask.set(null);
  }

  // ── Menu & Category Toggles ────────────────────────────────────────────────
  toggleMenu(id: number, event: Event): void {
    event.stopPropagation();
    this.activeMenu.update((current) => (current === id ? null : id));
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

  // ── Helpers ────────────────────────────────────────────────────────────────
  formatDueDate(dateStr: string | null): { day: string; month: string; year: string } {
    if (!dateStr) return { day: '--', month: '---', year: '----' };
    const d = new Date(dateStr + 'T00:00:00');
    return {
      day: d.getDate().toString().padStart(2, '0'),
      month: d.toLocaleString('en', { month: 'short' }).toUpperCase(),
      year: d.getFullYear().toString(),
    };
  }

  getStatusLabel(status: TodoStatus): string {
    return { OPEN: 'Open', IN_PROGRESS: 'Ongoing', DONE: 'Done' }[status];
  }

  getStatusClass(status: TodoStatus): string {
    return { OPEN: 'status--open', IN_PROGRESS: 'status--in-progress', DONE: 'status--done' }[
      status
    ];
  }

  getStatusIcon(status: TodoStatus): string {
    return { OPEN: 'radio_button_unchecked', IN_PROGRESS: 'pending', DONE: 'check_circle' }[status];
  }

  getPriorityLabel(priority: Priority): string {
    return priority.charAt(0) + priority.slice(1).toLowerCase();
  }

  getPriorityClass(priority: Priority): string {
    return 'priority--' + priority.toLowerCase();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.activeMenu.set(null);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.todoService.loadAll(this.userId);
    this.categoryService.loadAllFlat(this.userId);
  }

  // ── Private ────────────────────────────────────────────────────────────────
  private buildFilterFromActive(): TodoFilter {
    const v = this.activeFilters();
    const categoryIds = (v['categories'] as string[] | undefined)
      ?.map(Number)
      .filter((n) => !isNaN(n));
    return {
      status: (v['status'] as TodoStatus) || undefined,
      priority: (v['priority'] as Priority) || undefined,
      accessType: (v['access'] as AccessType) || undefined,
      dueDateFrom: (v['dueDateFrom'] as string) || undefined,
      dueDateTo: (v['dueDateTo'] as string) || undefined,
      categoryIds: categoryIds?.length ? categoryIds : undefined,
    };
  }
}
