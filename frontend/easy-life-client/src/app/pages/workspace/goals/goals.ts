import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import {
  FilterPanelComponent,
  FilterField,
  FilterValues,
} from '../../../shared/components/filter/filter';
import { GoalService } from '../../../core/services/goal-service';
import { CategoryService } from '../../../core/services/category-service';
import {
  GoalResponse,
  GoalFilter,
  GoalStatus,
  AccessType,
  GoalTaskResponse,
} from '../../../core/models/goal.model';
import { environment } from '../../../../environments/environment';
import { AiAgentService } from '../../../core/services/ai-agent';

interface GoalTaskForm {
  title: string;
  description: string;
  done: boolean;
  progressContribution: number;
  dueDate: string;
}

interface GoalForm {
  title: string;
  description: string;
  measurableTarget: string;
  targetValue: number;
  targetUnit: string;
  currentProgress: number;
  deadline: string;
  status: GoalStatus;
  accessType: AccessType;
  categoryIds: number[];
  tasks: GoalTaskForm[];
  imageFile: File | null;
}

@Component({
  selector: 'app-goals',
  imports: [CommonModule, FormsModule, PaginationComponent, FilterPanelComponent],
  templateUrl: './goals.html',
  styleUrl: './goals.scss',
})
export class GoalsComponent implements OnInit {
  private readonly userId = environment.userId;

  private readonly goalService = inject(GoalService);
  private readonly categoryService = inject(CategoryService);
  private readonly aiAgent = inject(AiAgentService);

  readonly statuses: GoalStatus[] = ['ACTIVE', 'COMPLETED', 'ABANDONED'];

  // ── Service State ──────────────────────────────────────────────────────────
  readonly paginatedGoals = this.goalService.goals;
  readonly currentPage = this.goalService.currentPage;
  readonly pageSize = this.goalService.pageSize;
  readonly totalPages = this.goalService.totalPages;
  readonly totalElements = this.goalService.totalElements;
  readonly activeCount = this.goalService.activeCount;
  readonly completedCount = this.goalService.completedCount;
  readonly abandonedCount = this.goalService.abandonedCount;

  readonly availableCategories = this.categoryService.allCategories;

  // ── Filter ─────────────────────────────────────────────────────────────────
  showFilter = signal(false);
  activeFilters = signal<FilterValues>({});

  readonly goalFilterFields = computed((): FilterField[] => [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      icon: 'flag',
      options: [
        { value: 'ACTIVE', label: 'Active', icon: 'radio_button_unchecked', color: '#43a047' },
        { value: 'COMPLETED', label: 'Completed', icon: 'check_circle', color: '#1976d2' },
        { value: 'ABANDONED', label: 'Abandoned', icon: 'cancel', color: '#9e9e9e' },
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
    { key: 'deadlineFrom', label: 'Deadline From', type: 'date', icon: 'calendar_today' },
    { key: 'deadlineTo', label: 'Deadline To', type: 'date', icon: 'calendar_today' },
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
      return (selected.includes(a.id) ? 0 : 1) - (selected.includes(b.id) ? 0 : 1);
    });
  });

  readonly sortedEditCategories = computed(() => {
    const cats = this.availableCategories();
    if (!Array.isArray(cats)) return [];
    const selected = this.editForm().categoryIds;
    return [...cats].sort((a, b) => {
      return (selected.includes(a.id) ? 0 : 1) - (selected.includes(b.id) ? 0 : 1);
    });
  });

  onFilterApply(values: FilterValues): void {
    this.activeFilters.set(values);
    const categoryIds = (values['categories'] as string[] | undefined)
      ?.map(Number)
      .filter((n) => !isNaN(n));
    this.goalService.loadAll(this.userId, 0, {
      status: (values['status'] as GoalStatus) || undefined,
      accessType: (values['access'] as AccessType) || undefined,
      deadlineFrom: (values['deadlineFrom'] as string) || undefined,
      deadlineTo: (values['deadlineTo'] as string) || undefined,
      categoryIds: categoryIds?.length ? categoryIds : undefined,
    });
    this.showFilter.set(false);
  }

  onFilterReset(): void {
    this.activeFilters.set({});
    this.goalService.loadAll(this.userId, 0);
    this.showFilter.set(false);
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  onPageChange(page: number): void {
    this.goalService.loadAll(this.userId, page, this.buildFilterFromActive());
  }

  onPageSizeChange(size: number): void {
    this.goalService.pageSize.set(size);
    this.goalService.loadAll(this.userId, 0, this.buildFilterFromActive());
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
    if (!Array.isArray(cats) || !cats.length) return [];
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

  // ── Image Upload ───────────────────────────────────────────────────────────
  getCreateImagePreview(): string | null {
    const file = this.createForm().imageFile;
    return file ? URL.createObjectURL(file) : null;
  }

  getEditImagePreview(): string | null {
    const f = this.editForm();
    if (f.imageFile) return URL.createObjectURL(f.imageFile);
    return this.selectedGoal()?.presignedImageUrl ?? null;
  }

  onCreateImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.createForm.update((f) => ({ ...f, imageFile: file }));
  }

  onEditImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.editForm.update((f) => ({ ...f, imageFile: file }));
  }

  // ── Task helpers ───────────────────────────────────────────────────────────
  addTaskToCreate(): void {
    this.createForm.update((f) => ({
      ...f,
      tasks: [
        ...f.tasks,
        { title: '', description: '', done: false, progressContribution: 0, dueDate: '' },
      ],
    }));
  }

  addTaskToEdit(): void {
    this.editForm.update((f) => ({
      ...f,
      tasks: [
        ...f.tasks,
        { title: '', description: '', done: false, progressContribution: 0, dueDate: '' },
      ],
    }));
  }

  updateCreateTask(index: number, field: keyof GoalTaskForm, value: any): void {
    this.createForm.update((f) => {
      const tasks = [...f.tasks];
      tasks[index] = { ...tasks[index], [field]: value };
      return { ...f, tasks };
    });
  }

  updateEditTask(index: number, field: keyof GoalTaskForm, value: any): void {
    this.editForm.update((f) => {
      const tasks = [...f.tasks];
      tasks[index] = { ...tasks[index], [field]: value };
      return { ...f, tasks };
    });
  }

  removeTaskFromCreate(index: number): void {
    this.createForm.update((f) => ({ ...f, tasks: f.tasks.filter((_, i) => i !== index) }));
  }

  removeTaskFromEdit(index: number): void {
    this.editForm.update((f) => ({ ...f, tasks: f.tasks.filter((_, i) => i !== index) }));
  }

  getCreateTaskTotal(): number {
    return this.createForm().tasks.reduce((sum, t) => sum + (t.progressContribution || 0), 0);
  }

  getEditTaskTotal(): number {
    return this.editForm().tasks.reduce((sum, t) => sum + (t.progressContribution || 0), 0);
  }

  // ── Modals ─────────────────────────────────────────────────────────────────
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  activeGoalMenu = signal<number | null>(null);
  selectedGoal = signal<GoalResponse | null>(null);

  private emptyForm(): GoalForm {
    return {
      title: '',
      description: '',
      measurableTarget: '',
      targetValue: 100,
      targetUnit: '%',
      currentProgress: 0,
      deadline: '',
      status: 'ACTIVE',
      accessType: 'PRIVATE',
      categoryIds: [],
      tasks: [],
      imageFile: null,
    };
  }

  createForm = signal<GoalForm>(this.emptyForm());
  editForm = signal<GoalForm>(this.emptyForm());

  openCreate(): void {
    this.createForm.set(this.emptyForm());
    this.showCatDropdown.set(false);
    this.showCreateModal.set(true);
  }

  submitCreate(): void {
    if (!this.createForm().title.trim()) return;
    console.log('TODO create goal:', this.createForm());
    this.showCreateModal.set(false);
  }

  openEdit(goal: GoalResponse): void {
    this.goalService.loadById(this.userId, goal.id);
    this.selectedGoal.set(goal);
    this.editForm.set({
      title: goal.title,
      description: goal.description ?? '',
      measurableTarget: goal.measurableTarget ?? '',
      targetValue: goal.targetValue,
      targetUnit: goal.targetUnit ?? '%',
      currentProgress: goal.currentProgress,
      deadline: goal.deadline ?? '',
      status: goal.status,
      accessType: goal.accessType,
      categoryIds: goal.categories?.map((c) => c.id) ?? [],
      tasks:
        goal.tasks?.map((t) => ({
          title: t.title,
          description: t.description ?? '',
          done: t.done,
          progressContribution: t.progressContribution,
          dueDate: t.dueDate ?? '',
        })) ?? [],
      imageFile: null,
    });
    this.showEditCatDropdown.set(false);
    this.activeGoalMenu.set(null);
    this.showEditModal.set(true);
  }

  submitEdit(): void {
    if (!this.editForm().title.trim()) return;
    console.log('TODO update goal:', this.selectedGoal()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  openDeleteConfirm(goal: GoalResponse): void {
    this.selectedGoal.set(goal);
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
    this.activeGoalMenu.set(null);
  }

  confirmDelete(): void {
    console.log('TODO delete goal:', this.selectedGoal()?.id);
    this.showDeleteConfirm.set(false);
    this.selectedGoal.set(null);
  }

  toggleGoalMenu(id: number, event: Event): void {
    event.stopPropagation();
    this.activeGoalMenu.update((cur) => (cur === id ? null : id));
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.activeGoalMenu.set(null);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getTasksDone(goal: GoalResponse): number {
    return goal.tasks?.filter((t) => t.done).length ?? 0;
  }

  getStatusLabel(status: GoalStatus): string {
    return { ACTIVE: 'Active', COMPLETED: 'Completed', ABANDONED: 'Abandoned' }[status];
  }

  getStatusClass(status: GoalStatus): string {
    return {
      ACTIVE: 'status--active',
      COMPLETED: 'status--completed',
      ABANDONED: 'status--abandoned',
    }[status];
  }

  getStatusIcon(status: GoalStatus): string {
    return { ACTIVE: 'radio_button_unchecked', COMPLETED: 'check_circle', ABANDONED: 'cancel' }[
      status
    ];
  }

  formatDeadline(dateStr: string | null): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d
      .toLocaleString('en', { month: 'short', day: 'numeric', year: 'numeric' })
      .toUpperCase();
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.goalService.loadAll(this.userId);
    this.categoryService.loadAllFlat(this.userId);
  }

  private buildFilterFromActive(): GoalFilter {
    const v = this.activeFilters();
    const categoryIds = (v['categories'] as string[] | undefined)
      ?.map(Number)
      .filter((n) => !isNaN(n));
    return {
      status: (v['status'] as GoalStatus) || undefined,
      accessType: (v['access'] as AccessType) || undefined,
      deadlineFrom: (v['deadlineFrom'] as string) || undefined,
      deadlineTo: (v['deadlineTo'] as string) || undefined,
      categoryIds: categoryIds?.length ? categoryIds : undefined,
    };
  }
}
