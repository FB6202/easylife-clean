import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { FilterPanelComponent, FilterField, FilterValues } from '../../../shared/components/filter/filter';
import { AiAgentService } from '../../../core/services/ai-agent';

type TodoStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';
type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OPTIONAL';
type AccessType = 'PRIVATE' | 'PUBLIC';

interface CategoryPreview {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  categories: CategoryPreview[];
  status: TodoStatus;
  priority: Priority;
  accessType: AccessType;
  dueDay: string;
  dueMonth: string;
  dueYear: string;
  dueDate: string;
  done: boolean;
}

interface TaskForm {
  title: string;
  description: string;
  status: TodoStatus;
  priority: Priority;
  accessType: AccessType;
  dueDate: string;
  categoryIds: number[];
}

@Component({
  selector: 'app-tasks',
  imports: [CommonModule, FormsModule, PaginationComponent, FilterPanelComponent],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss'
})
export class TasksComponent {

  constructor(private aiAgent: AiAgentService) { }

  readonly priorities: Priority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'OPTIONAL'];
  readonly statuses: TodoStatus[] = ['OPEN', 'IN_PROGRESS', 'DONE'];

  readonly availableCategories = signal<CategoryPreview[]>([
    { id: 1, name: 'Work', icon: 'work', color: '#1976d2' },
    { id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' },
    { id: 3, name: 'Health', icon: 'self_improvement', color: '#43a047' },
    { id: 4, name: 'Personal', icon: 'person', color: '#9c27b0' },
    { id: 5, name: 'Learning', icon: 'school', color: '#e91e63' },
  ]);

  readonly tasks = signal<Task[]>([
    { id: 1, title: 'Review Annual Financial Report Q4', description: 'Analyze the fiscal growth trends for this quarter', categories: [{ id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' }, { id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], status: 'IN_PROGRESS', priority: 'HIGH', accessType: 'PRIVATE', dueDay: '24', dueMonth: 'OCT', dueYear: '2025', dueDate: '2025-10-24', done: false },
    { id: 2, title: 'Monthly Team Synergy Workshop', description: 'Interactive session focusing on team collaboration', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }, { id: 3, name: 'Health', icon: 'self_improvement', color: '#43a047' }], status: 'OPEN', priority: 'MEDIUM', accessType: 'PUBLIC', dueDay: '02', dueMonth: 'NOV', dueYear: '2025', dueDate: '2025-11-02', done: false },
    { id: 3, title: 'Product Website Refresh Design', description: 'Finalizing the visual identity and component library', categories: [{ id: 4, name: 'Personal', icon: 'person', color: '#9c27b0' }], status: 'DONE', priority: 'LOW', accessType: 'PUBLIC', dueDay: '12', dueMonth: 'OCT', dueYear: '2025', dueDate: '2025-10-12', done: true },
    { id: 4, title: 'R&D Lab Protocol Audit', description: 'Safety inspection and documentation review', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }, { id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' }], status: 'IN_PROGRESS', priority: 'HIGH', accessType: 'PRIVATE', dueDay: '28', dueMonth: 'OCT', dueYear: '2025', dueDate: '2025-10-28', done: false },
    { id: 5, title: 'Finalize Q4 Marketing Budget', description: 'Allocate budgets across channels for Q4 campaign', categories: [{ id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' }], status: 'OPEN', priority: 'CRITICAL', accessType: 'PRIVATE', dueDay: '15', dueMonth: 'NOV', dueYear: '2025', dueDate: '2025-11-15', done: false },
    { id: 6, title: 'Onboard New Developer', description: 'Set up environment and review onboarding docs', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], status: 'OPEN', priority: 'MEDIUM', accessType: 'PRIVATE', dueDay: '05', dueMonth: 'NOV', dueYear: '2025', dueDate: '2025-11-05', done: false },
    { id: 7, title: 'Redesign Email Newsletter Template', description: 'Update to match new brand guidelines', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }, { id: 4, name: 'Personal', icon: 'person', color: '#9c27b0' }], status: 'OPEN', priority: 'LOW', accessType: 'PUBLIC', dueDay: '20', dueMonth: 'NOV', dueYear: '2025', dueDate: '2025-11-20', done: false },
    { id: 8, title: 'Run End-to-End Test Suite', description: 'Full regression test before the release', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], status: 'OPEN', priority: 'HIGH', accessType: 'PRIVATE', dueDay: '10', dueMonth: 'NOV', dueYear: '2025', dueDate: '2025-11-10', done: false },
    { id: 9, title: 'Investor Update Presentation', description: 'Prepare Q3 highlights for investor meeting', categories: [{ id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' }, { id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], status: 'OPEN', priority: 'CRITICAL', accessType: 'PRIVATE', dueDay: '08', dueMonth: 'NOV', dueYear: '2025', dueDate: '2025-11-08', done: false },
    { id: 10, title: 'Update Privacy Policy', description: 'Align with new GDPR requirements', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], status: 'DONE', priority: 'MEDIUM', accessType: 'PUBLIC', dueDay: '01', dueMonth: 'OCT', dueYear: '2025', dueDate: '2025-10-01', done: true },
  ]);

  // ── Pagination ─────────────────────────────────────────
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly totalElements = computed(() => this.tasks().length);
  readonly totalPages = computed(() => Math.ceil(this.totalElements() / this.pageSize()));
  readonly paginatedTasks = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.tasks().slice(start, start + this.pageSize());
  });
  onPageChange(page: number) { this.currentPage.set(page); }
  onPageSizeChange(size: number) { this.pageSize.set(size); this.currentPage.set(0); }
  onAiClick() { this.aiAgent.open() }

  // ── Stats ──────────────────────────────────────────────
  readonly pendingCount = computed(() => this.tasks().filter(t => t.status === 'OPEN').length);
  readonly inProgressCount = computed(() => this.tasks().filter(t => t.status === 'IN_PROGRESS').length);
  readonly doneCount = computed(() => this.tasks().filter(t => t.status === 'DONE').length);
  readonly totalPending = this.pendingCount;
  readonly totalInProgress = this.inProgressCount;
  readonly totalDone = this.doneCount;

  readonly productivityScore = computed(() => {
    const total = this.tasks().length;
    if (total === 0) return 0;
    return Math.round((this.doneCount() / total) * 10 * 10) / 10;
  });

  readonly productivityLabel = computed(() => {
    const score = this.productivityScore();
    if (score >= 9) return 'Elite';
    if (score >= 7) return 'High';
    if (score >= 5) return 'Good';
    return 'Building';
  });

  // ── Filter ─────────────────────────────────────────────
  showFilter = signal(false);
  activeFilters = signal<FilterValues>({});

  readonly taskFilterFields: FilterField[] = [
    { key: 'search', label: 'Search', type: 'text', icon: 'search', placeholder: 'Search tasks...' },
    {
      key: 'status', label: 'Status', type: 'multiselect', icon: 'radio_button_checked',
      options: [
        { value: 'OPEN', label: 'Open', icon: 'radio_button_unchecked', color: '#1976d2' },
        { value: 'IN_PROGRESS', label: 'Ongoing', icon: 'pending', color: '#f9a825' },
        { value: 'DONE', label: 'Done', icon: 'check_circle', color: '#43a047' },
      ]
    },
    {
      key: 'priority', label: 'Priority', type: 'multiselect', icon: 'flag',
      options: [
        { value: 'CRITICAL', label: 'Critical', color: '#d32f2f' },
        { value: 'HIGH', label: 'High', color: '#f57c00' },
        { value: 'MEDIUM', label: 'Medium', color: '#f9a825' },
        { value: 'LOW', label: 'Low', color: '#1976d2' },
        { value: 'OPTIONAL', label: 'Optional', color: '#757575' },
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
      key: 'access', label: 'Access', type: 'multiselect', icon: 'lock',
      options: [
        { value: 'PRIVATE', label: 'Private', icon: 'lock', color: '#757575' },
        { value: 'PUBLIC', label: 'Public', icon: 'travel_explore', color: '#43a047' },
      ]
    },
    { key: 'dueDate', label: 'Due Date Range', type: 'date-range', icon: 'calendar_today' },
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

  // ── Modals ─────────────────────────────────────────────
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  showDoneConfirm = signal(false);
  activeMenu = signal<number | null>(null);
  selectedTask = signal<Task | null>(null);

  createForm = signal<TaskForm>({
    title: '', description: '', status: 'OPEN', priority: 'MEDIUM',
    accessType: 'PRIVATE', dueDate: '', categoryIds: []
  });

  editForm = signal<TaskForm>({
    title: '', description: '', status: 'OPEN', priority: 'MEDIUM',
    accessType: 'PRIVATE', dueDate: '', categoryIds: []
  });

  openCreate() {
    this.createForm.set({ title: '', description: '', status: 'OPEN', priority: 'MEDIUM', accessType: 'PRIVATE', dueDate: '', categoryIds: [] });
    this.showCatDropdown.set(false);
    this.showCreateModal.set(true);
  }

  submitCreate() {
    if (!this.createForm().title.trim()) return;
    console.log('Create task:', this.createForm());
    this.showCreateModal.set(false);
  }

  openEdit(task: Task) {
    this.selectedTask.set(task);
    this.editForm.set({
      title: task.title, description: task.description,
      status: task.status, priority: task.priority,
      accessType: task.accessType, dueDate: task.dueDate,
      categoryIds: task.categories.map(c => c.id)
    });
    this.showEditCatDropdown.set(false);
    this.showEditModal.set(true);
    this.activeMenu.set(null);
  }

  submitEdit() {
    if (!this.editForm().title.trim()) return;
    console.log('Update task:', this.selectedTask()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  openDoneConfirm(task: Task) {
    this.selectedTask.set(task);
    this.showDoneConfirm.set(true);
    this.activeMenu.set(null);
  }

  confirmDone() {
    const id = this.selectedTask()?.id;
    if (id) this.tasks.update(ts => ts.map(t => t.id === id ? { ...t, status: 'DONE', done: true } : t));
    this.showDoneConfirm.set(false);
    this.selectedTask.set(null);
  }

  openDeleteConfirm(task: Task) {
    this.selectedTask.set(task);
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
    this.activeMenu.set(null);
  }

  confirmDelete() {
    const id = this.selectedTask()?.id;
    if (id) this.tasks.update(ts => ts.filter(t => t.id !== id));
    this.showDeleteConfirm.set(false);
    this.selectedTask.set(null);
  }

  toggleMenu(id: number, event: Event) {
    event.stopPropagation();
    this.activeMenu.update(current => current === id ? null : id);
  }

  toggleCreateCategory(id: number) {
    this.createForm.update(f => ({
      ...f,
      categoryIds: f.categoryIds.includes(id) ? f.categoryIds.filter(i => i !== id) : [...f.categoryIds, id]
    }));
  }

  toggleEditCategory(id: number) {
    this.editForm.update(f => ({
      ...f,
      categoryIds: f.categoryIds.includes(id) ? f.categoryIds.filter(i => i !== id) : [...f.categoryIds, id]
    }));
  }

  getStatusLabel(status: TodoStatus): string {
    return { OPEN: 'Open', IN_PROGRESS: 'Ongoing', DONE: 'Done' }[status];
  }

  getStatusClass(status: TodoStatus): string {
    return { OPEN: 'status--open', IN_PROGRESS: 'status--in-progress', DONE: 'status--done' }[status];
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
}