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

type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
type AccessType = 'PRIVATE' | 'PUBLIC';

interface CategoryPreview {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface GoalTask {
  id: number;
  title: string;
  description: string;
  done: boolean;
  progressContribution: number;
  dueDate: string;
}

interface Goal {
  id: number;
  title: string;
  description: string;
  imagePath: string | null;
  measurableTarget: string;
  targetValue: number;
  targetUnit: string;
  currentProgress: number;
  deadline: string;
  status: GoalStatus;
  accessType: AccessType;
  categories: CategoryPreview[];
  tasks: GoalTask[];
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
  tasks: Omit<GoalTask, 'id'>[];
  imageFile: File | null;
}

@Component({
  selector: 'app-goals',
  imports: [CommonModule, FormsModule, PaginationComponent, FilterPanelComponent],
  templateUrl: './goals.html',
  styleUrl: './goals.scss',
})
export class GoalsComponent {
  readonly availableCategories = signal<CategoryPreview[]>([
    { id: 1, name: 'Work', icon: 'work', color: '#1976d2' },
    { id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' },
    { id: 3, name: 'Health', icon: 'self_improvement', color: '#43a047' },
    { id: 4, name: 'Personal', icon: 'person', color: '#9c27b0' },
    { id: 5, name: 'Learning', icon: 'school', color: '#e91e63' },
  ]);

  readonly goals = signal<Goal[]>([
    { id: 1, title: 'Daily Mindful Movement', description: 'Incorporate at least 30 minutes of intentional physical activity every morning.', imagePath: null, measurableTarget: '365 milestones', targetValue: 365, targetUnit: 'milestones', currentProgress: 68, deadline: 'DEC 31, 2024', status: 'ACTIVE', accessType: 'PUBLIC', categories: [{ id: 3, name: 'Health', icon: 'self_improvement', color: '#43a047' }, { id: 4, name: 'Personal', icon: 'person', color: '#9c27b0' }], tasks: [{ id: 1, title: 'Morning yoga session', description: '', done: true, progressContribution: 10, dueDate: '' }, { id: 2, title: 'Evening walk 30min', description: '', done: true, progressContribution: 10, dueDate: '' }, { id: 3, title: 'Track daily steps', description: '', done: false, progressContribution: 5, dueDate: '' }] },
    { id: 2, title: 'Portfolio Diversification', description: 'Optimize investment portfolio by reallocating assets into green energy.', imagePath: null, measurableTarget: '7 milestones', targetValue: 7, targetUnit: 'milestones', currentProgress: 42, deadline: 'AUG 15, 2024', status: 'ACTIVE', accessType: 'PRIVATE', categories: [{ id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' }], tasks: [{ id: 1, title: 'Research ETF options', description: '', done: true, progressContribution: 15, dueDate: '' }] },
    { id: 3, title: 'Design System V2 Launch', description: 'Complete documentation and implementation of atomic design principles.', imagePath: null, measurableTarget: '12 milestones', targetValue: 12, targetUnit: 'milestones', currentProgress: 100, deadline: 'MAR 02, 2024', status: 'COMPLETED', accessType: 'PUBLIC', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], tasks: [{ id: 1, title: 'Create component library', description: '', done: true, progressContribution: 30, dueDate: '' }] },
    { id: 4, title: 'Learn Spanish B2', description: 'Reach B2 level in Spanish through daily practice and immersion.', imagePath: null, measurableTarget: '200 hours', targetValue: 200, targetUnit: 'hours', currentProgress: 35, deadline: 'DEC 31, 2025', status: 'ACTIVE', accessType: 'PUBLIC', categories: [{ id: 5, name: 'Learning', icon: 'school', color: '#e91e63' }, { id: 4, name: 'Personal', icon: 'person', color: '#9c27b0' }], tasks: [] },
    { id: 5, title: 'Build Easy Life MVP', description: 'Ship the full frontend and backend of Easy Life to first 100 users.', imagePath: null, measurableTarget: '100 users', targetValue: 100, targetUnit: 'users', currentProgress: 60, deadline: 'DEC 31, 2025', status: 'ACTIVE', accessType: 'PRIVATE', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], tasks: [] },
    { id: 6, title: 'Run a Half Marathon', description: 'Train consistently and complete a half marathon under 2 hours.', imagePath: null, measurableTarget: '21 km', targetValue: 21, targetUnit: 'km', currentProgress: 25, deadline: 'MAR 15, 2025', status: 'ACTIVE', accessType: 'PUBLIC', categories: [{ id: 3, name: 'Health', icon: 'self_improvement', color: '#43a047' }], tasks: [] },
    { id: 7, title: 'Read 24 Books', description: 'Two books per month across different genres.', imagePath: null, measurableTarget: '24 books', targetValue: 24, targetUnit: 'books', currentProgress: 100, deadline: 'DEC 31, 2023', status: 'COMPLETED', accessType: 'PUBLIC', categories: [{ id: 5, name: 'Learning', icon: 'school', color: '#e91e63' }], tasks: [] },
    { id: 8, title: 'Save Emergency Fund', description: 'Build 6 months of expenses as emergency reserve.', imagePath: null, measurableTarget: '15000 €', targetValue: 15000, targetUnit: '€', currentProgress: 53, deadline: 'JUN 30, 2025', status: 'ACTIVE', accessType: 'PRIVATE', categories: [{ id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' }], tasks: [] },
  ]);

  constructor(private aiAgent: AiAgentService) { }

  // ── Filter ─────────────────────────────────────────────
  showFilter = signal(false);
  activeFilters = signal<FilterValues>({});

  readonly goalFilterFields: FilterField[] = [
    { key: 'search', label: 'Search', type: 'text', icon: 'search', placeholder: 'Search goals...' },
    {
      key: 'status', label: 'Status', type: 'multiselect', icon: 'flag',
      options: [
        { value: 'ACTIVE', label: 'Active', icon: 'rocket_launch', color: '#43a047' },
        { value: 'COMPLETED', label: 'Completed', icon: 'check_circle', color: '#1976d2' },
        { value: 'ABANDONED', label: 'Abandoned', icon: 'cancel', color: '#757575' },
      ]
    },
    {
      key: 'accessType', label: 'Access', type: 'multiselect', icon: 'lock',
      options: [
        { value: 'PUBLIC', label: 'Public', icon: 'travel_explore', color: '#43a047' },
        { value: 'PRIVATE', label: 'Private', icon: 'lock', color: '#757575' },
      ]
    },
    {
      key: 'categories', label: 'Categories', type: 'multiselect-dropdown', icon: 'category',
      options: [
        { value: '1', label: 'Work', icon: 'work', color: '#1976d2' },
        { value: '2', label: 'Finance', icon: 'payments', color: '#f57c00' },
        { value: '3', label: 'Health', icon: 'self_improvement', color: '#43a047' },
        { value: '4', label: 'Personal', icon: 'person', color: '#9c27b0' },
        { value: '5', label: 'Learning', icon: 'school', color: '#e91e63' },
      ]
    },
    {
      key: 'progress', label: 'Progress', type: 'select', icon: 'trending_up',
      options: [
        { value: 'not_started', label: 'Not started (0%)' },
        { value: 'in_progress', label: 'In progress (1–99%)' },
        { value: 'completed', label: 'Completed (100%)' },
      ]
    },
    { key: 'deadline', label: 'Deadline Range', type: 'date-range', icon: 'calendar_today' },
    { key: 'hasImage', label: 'Has Cover Image', type: 'toggle', icon: 'image' },
  ];

  readonly activeFilterCount = computed(() =>
    Object.values(this.activeFilters()).filter(v => {
      if (!v || v === '') return false;
      if (Array.isArray(v)) return v.length > 0;
      return true;
    }).length
  );

  onFilterApply(values: FilterValues) { this.activeFilters.set(values); this.showFilter.set(false); }
  onFilterReset() { this.activeFilters.set({}); }

  // ── Pagination ─────────────────────────────────────────
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly totalElements = computed(() => this.goals().length);
  readonly totalPages = computed(() => Math.ceil(this.totalElements() / this.pageSize()));
  readonly paginatedGoals = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.goals().slice(start, start + this.pageSize());
  });
  onPageChange(page: number) { this.currentPage.set(page); }
  onPageSizeChange(size: number) { this.pageSize.set(size); this.currentPage.set(0); }
  onAiClick() { this.aiAgent.open(); }

  // ── Modals ─────────────────────────────────────────────
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  selectedGoal = signal<Goal | null>(null);

  readonly statuses: GoalStatus[] = ['ACTIVE', 'COMPLETED', 'ABANDONED'];

  readonly emptyForm = (): GoalForm => ({
    title: '', description: '', measurableTarget: '', targetValue: 0,
    targetUnit: '', currentProgress: 0, deadline: '', status: 'ACTIVE',
    accessType: 'PRIVATE', categoryIds: [], tasks: [], imageFile: null,
  });

  createForm = signal<GoalForm>(this.emptyForm());
  editForm = signal<GoalForm>(this.emptyForm());

  // ── Category Dropdown ──────────────────────────────────
  showCatDropdown = signal(false);
  showEditCatDropdown = signal(false);

  toggleCatDropdown(event: Event) {
    event.stopPropagation();
    this.showCatDropdown.update(v => !v);
    this.showEditCatDropdown.set(false);
  }

  toggleEditCatDropdown(event: Event) {
    event.stopPropagation();
    this.showEditCatDropdown.update(v => !v);
    this.showCatDropdown.set(false);
  }

  getCatDropdownLabel(categoryIds: number[]): string {
    if (categoryIds.length === 0) return 'Select categories...';
    if (categoryIds.length === 1)
      return this.availableCategories().find(c => c.id === categoryIds[0])?.name ?? '1 selected';
    return `${categoryIds.length} selected`;
  }

  getSelectedCatColors(categoryIds: number[]): string[] {
    return this.availableCategories()
      .filter(c => categoryIds.includes(c.id))
      .map(c => c.color)
      .slice(0, 3);
  }

  // ── Tasks ──────────────────────────────────────────────
  addTaskToCreate() {
    this.createForm.update(f => ({ ...f, tasks: [...f.tasks, { title: '', description: '', done: false, progressContribution: 0, dueDate: '' }] }));
  }

  removeTaskFromCreate(index: number) {
    this.createForm.update(f => ({ ...f, tasks: f.tasks.filter((_, i) => i !== index) }));
  }

  updateCreateTask(index: number, field: string, value: string | boolean | number) {
    this.createForm.update(f => { const tasks = [...f.tasks]; tasks[index] = { ...tasks[index], [field]: value }; return { ...f, tasks }; });
  }

  addTaskToEdit() {
    this.editForm.update(f => ({ ...f, tasks: [...f.tasks, { title: '', description: '', done: false, progressContribution: 0, dueDate: '' }] }));
  }

  removeTaskFromEdit(index: number) {
    this.editForm.update(f => ({ ...f, tasks: f.tasks.filter((_, i) => i !== index) }));
  }

  updateEditTask(index: number, field: string, value: string | boolean | number) {
    this.editForm.update(f => { const tasks = [...f.tasks]; tasks[index] = { ...tasks[index], [field]: value }; return { ...f, tasks }; });
  }

  // ── Categories Toggle ──────────────────────────────────
  toggleCreateCategory(id: number) {
    this.createForm.update(f => {
      const ids = f.categoryIds.includes(id)
        ? f.categoryIds.filter(i => i !== id)
        : f.categoryIds.length < 5 ? [...f.categoryIds, id] : f.categoryIds;
      return { ...f, categoryIds: ids };
    });
  }

  toggleEditCategory(id: number) {
    this.editForm.update(f => {
      const ids = f.categoryIds.includes(id)
        ? f.categoryIds.filter(i => i !== id)
        : f.categoryIds.length < 5 ? [...f.categoryIds, id] : f.categoryIds;
      return { ...f, categoryIds: ids };
    });
  }

  // ── CRUD ───────────────────────────────────────────────
  openCreate() {
    this.createForm.set(this.emptyForm());
    this.showCatDropdown.set(false);
    this.showCreateModal.set(true);
  }

  submitCreate() {
    if (!this.createForm().title.trim()) return;
    console.log('Create goal:', this.createForm());
    this.showCreateModal.set(false);
  }

  openEdit(goal: Goal) {
    this.selectedGoal.set(goal);
    this.editForm.set({
      title: goal.title, description: goal.description,
      measurableTarget: goal.measurableTarget, targetValue: goal.targetValue,
      targetUnit: goal.targetUnit, currentProgress: goal.currentProgress,
      deadline: goal.deadline, status: goal.status, accessType: goal.accessType,
      imageFile: null, categoryIds: goal.categories.map(c => c.id),
      tasks: goal.tasks.map(t => ({ title: t.title, description: t.description, done: t.done, progressContribution: t.progressContribution, dueDate: t.dueDate })),
    });
    this.showEditCatDropdown.set(false);
    this.showEditModal.set(true);
  }

  submitEdit() {
    if (!this.editForm().title.trim()) return;
    console.log('Update goal:', this.selectedGoal()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  openDeleteConfirm(goal: Goal) {
    this.selectedGoal.set(goal);
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    const id = this.selectedGoal()?.id;
    if (id) this.goals.update(g => g.filter(goal => goal.id !== id));
    this.showDeleteConfirm.set(false);
    this.selectedGoal.set(null);
  }

  // ── Helpers ────────────────────────────────────────────
  getTasksDone(goal: Goal): number { return goal.tasks.filter(t => t.done).length; }

  getStatusLabel(status: GoalStatus): string {
    return { ACTIVE: 'Active', COMPLETED: 'Completed', ABANDONED: 'Abandoned' }[status];
  }

  getStatusIcon(status: GoalStatus): string {
    return { ACTIVE: 'rocket_launch', COMPLETED: 'check_circle', ABANDONED: 'cancel' }[status];
  }

  getStatusClass(status: GoalStatus): string {
    return { ACTIVE: 'status--active', COMPLETED: 'status--completed', ABANDONED: 'status--abandoned' }[status];
  }

  onCreateImageSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.createForm.update(f => ({ ...f, imageFile: file }));
  }

  onEditImageSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.editForm.update(f => ({ ...f, imageFile: file }));
  }

  getCreateImagePreview(): string | null {
    const file = this.createForm().imageFile;
    return file ? URL.createObjectURL(file) : null;
  }

  getEditImagePreview(): string | null {
    const file = this.editForm().imageFile;
    if (file) return URL.createObjectURL(file);
    return this.selectedGoal()?.imagePath ?? null;
  }

  getCreateTaskTotal(): number {
    return this.createForm().tasks.reduce((sum, t) => sum + (t.progressContribution || 0), 0);
  }

  getEditTaskTotal(): number {
    return this.editForm().tasks.reduce((sum, t) => sum + (t.progressContribution || 0), 0);
  }
}