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

type MoodLevel = 'GREAT' | 'GOOD' | 'OKAY' | 'BAD' | 'TERRIBLE';

interface CategoryPreview {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface WeekPlanSummary {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
}

interface JournalEntry {
  id: number;
  title: string;
  mood: MoodLevel;
  wentWell: string;
  wentBad: string;
  learnings: string | null;
  gratitude: string | null;
  entryDate: string;
  entryDay: string;
  entryMonth: string;
  entryYear: string;
  categories: CategoryPreview[];
  weekPlan: WeekPlanSummary | null;
  wordCount: number;
  readMinutes: number;
}

interface JournalForm {
  title: string;
  mood: MoodLevel;
  wentWell: string;
  wentBad: string;
  learnings: string;
  gratitude: string;
  entryDate: string;
  categoryIds: number[];
  weekPlanId: number | null;
}

@Component({
  selector: 'app-journal',
  imports: [CommonModule, FormsModule, PaginationComponent, FilterPanelComponent],
  templateUrl: './journal.html',
  styleUrl: './journal.scss',
})
export class JournalComponent {
  readonly availableCategories = signal<CategoryPreview[]>([
    { id: 1, name: 'Work', icon: 'work', color: '#1976d2' },
    { id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' },
    { id: 3, name: 'Health', icon: 'self_improvement', color: '#43a047' },
    { id: 4, name: 'Personal', icon: 'person', color: '#9c27b0' },
    { id: 5, name: 'Learning', icon: 'school', color: '#e91e63' },
  ]);

  // Mock WeekPlans for linking – later from API
  readonly availableWeekPlans = signal<WeekPlanSummary[]>([
    { id: 1, title: 'Scaling the Creative Horizon', startDate: 'Oct 23', endDate: 'Oct 29, 2023' },
    { id: 2, title: 'Deep Work Foundations', startDate: 'Oct 16', endDate: 'Oct 22, 2023' },
    { id: 3, title: 'Q4 Strategy & Planning', startDate: 'Oct 30', endDate: 'Nov 05, 2023' },
  ]);

  readonly entries = signal<JournalEntry[]>([
    {
      id: 1,
      title: 'Quarterly Review & Future Strategy',
      mood: 'GREAT',
      wentWell:
        'Successfully finalized the product roadmap for Q4 and received enthusiastic feedback from the team.',
      wentBad:
        'Communication with the remote design team felt lagged, resulting in two misaligned deliverables.',
      learnings: 'Clear async communication protocols are essential for distributed teams.',
      gratitude: 'Grateful for the team that pushed through despite the challenges.',
      entryDate: 'Oct 12, 2023',
      entryDay: '12',
      entryMonth: 'OCT',
      entryYear: '2023',
      categories: [
        { id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' },
        { id: 1, name: 'Work', icon: 'work', color: '#1976d2' },
      ],
      weekPlan: {
        id: 2,
        title: 'Deep Work Foundations',
        startDate: 'Oct 16',
        endDate: 'Oct 22, 2023',
      },
      wordCount: 2400,
      readMinutes: 15,
    },
    {
      id: 2,
      title: 'Mindful Morning & Technical Debt',
      mood: 'GOOD',
      wentWell:
        'The deep-work block in the morning was incredibly productive; cleared through the backlog.',
      wentBad:
        'Skipped lunch to meet a minor deadline, which led to a significant energy crash in the afternoon.',
      learnings: 'Always protect lunch breaks — energy management is productivity management.',
      gratitude: null,
      entryDate: 'Oct 11, 2023',
      entryDay: '11',
      entryMonth: 'OCT',
      entryYear: '2023',
      categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }],
      weekPlan: {
        id: 2,
        title: 'Deep Work Foundations',
        startDate: 'Oct 16',
        endDate: 'Oct 22, 2023',
      },
      wordCount: 1120,
      readMinutes: 8,
    },
    {
      id: 3,
      title: 'Cross-Functional Friction Points',
      mood: 'OKAY',
      wentWell:
        'Connected with Sarah from Marketing over coffee; we found a better way to align on content.',
      wentBad:
        'Realized the scope of the animation project was under-estimated; need to reset expectations.',
      learnings: null,
      gratitude: "Grateful for Sarah's patience and collaborative mindset.",
      entryDate: 'Oct 10, 2023',
      entryDay: '10',
      entryMonth: 'OCT',
      entryYear: '2023',
      categories: [
        { id: 4, name: 'Personal', icon: 'person', color: '#9c27b0' },
        { id: 1, name: 'Work', icon: 'work', color: '#1976d2' },
      ],
      weekPlan: null,
      wordCount: 850,
      readMinutes: 5,
    },
    {
      id: 4,
      title: 'Energy & Focus Reset Day',
      mood: 'BAD',
      wentWell: 'Managed to complete the most urgent deliverable despite low energy.',
      wentBad: 'Distracted by social media and news for too long in the morning. Lost 2 hours.',
      learnings: 'Keep the phone out of reach for the first hour after waking.',
      gratitude: 'Grateful for a quiet evening to recharge.',
      entryDate: 'Oct 09, 2023',
      entryDay: '09',
      entryMonth: 'OCT',
      entryYear: '2023',
      categories: [{ id: 3, name: 'Health', icon: 'self_improvement', color: '#43a047' }],
      weekPlan: null,
      wordCount: 620,
      readMinutes: 4,
    },
    {
      id: 5,
      title: 'Deep Work & Flow State',
      mood: 'GREAT',
      wentWell:
        'Entered a genuine flow state for 3 hours. Built the entire auth module without interruption.',
      wentBad: 'Missed a scheduled call because I was too focused. Need to set alarms.',
      learnings: 'Flow state is fragile — protect it like a meeting.',
      gratitude: 'Grateful for the quiet office on a Friday afternoon.',
      entryDate: 'Oct 06, 2023',
      entryDay: '06',
      entryMonth: 'OCT',
      entryYear: '2023',
      categories: [
        { id: 1, name: 'Work', icon: 'work', color: '#1976d2' },
        { id: 5, name: 'Learning', icon: 'school', color: '#e91e63' },
      ],
      weekPlan: {
        id: 1,
        title: 'Scaling the Creative Horizon',
        startDate: 'Oct 23',
        endDate: 'Oct 29, 2023',
      },
      wordCount: 1840,
      readMinutes: 12,
    },
    {
      id: 6,
      title: 'Weekend Reflection & Planning',
      mood: 'GOOD',
      wentWell: 'Did a proper weekly review and set clear intentions for next week.',
      wentBad: 'Spent too much time on admin tasks instead of actual planning.',
      learnings: 'Use a template for weekly reviews to make them faster.',
      gratitude: 'Grateful for a long walk in nature with clear headspace.',
      entryDate: 'Oct 07, 2023',
      entryDay: '07',
      entryMonth: 'OCT',
      entryYear: '2023',
      categories: [{ id: 4, name: 'Personal', icon: 'person', color: '#9c27b0' }],
      weekPlan: {
        id: 1,
        title: 'Scaling the Creative Horizon',
        startDate: 'Oct 23',
        endDate: 'Oct 29, 2023',
      },
      wordCount: 980,
      readMinutes: 6,
    },
    {
      id: 7,
      title: 'Client Feedback Session',
      mood: 'OKAY',
      wentWell:
        'Client was happy with the overall direction and gave specific actionable feedback.',
      wentBad:
        'Three of the features we built were deemed out of scope. Painful but necessary pivot.',
      learnings: 'Validate assumptions early — building the wrong thing is the costliest mistake.',
      gratitude: null,
      entryDate: 'Oct 05, 2023',
      entryDay: '05',
      entryMonth: 'OCT',
      entryYear: '2023',
      categories: [
        { id: 1, name: 'Work', icon: 'work', color: '#1976d2' },
        { id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' },
      ],
      weekPlan: null,
      wordCount: 1350,
      readMinutes: 9,
    },
    {
      id: 8,
      title: 'New Habit Stack Attempt',
      mood: 'GOOD',
      wentWell: 'Completed all three morning habits: journaling, exercise and cold shower.',
      wentBad: 'The cold shower took 10 minutes of mental prep. Still not natural.',
      learnings: 'Habit stacking works best when the anchor habit is already solid.',
      gratitude: 'Grateful for a productive Monday that set the tone for the week.',
      entryDate: 'Oct 02, 2023',
      entryDay: '02',
      entryMonth: 'OCT',
      entryYear: '2023',
      categories: [
        { id: 3, name: 'Health', icon: 'self_improvement', color: '#43a047' },
        { id: 4, name: 'Personal', icon: 'person', color: '#9c27b0' },
      ],
      weekPlan: null,
      wordCount: 760,
      readMinutes: 5,
    },
  ]);

  readonly currentPage = signal(0);
  readonly pageSize = signal(5);

  readonly totalElements = computed(() => this.entries().length);
  readonly totalPages = computed(() => Math.ceil(this.totalElements() / this.pageSize()));

  readonly paginatedEntries = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.entries().slice(start, start + this.pageSize());
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

  readonly journalFilterFields: FilterField[] = [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      icon: 'search',
      placeholder: 'Search journal entries...',
    },
    {
      key: 'mood',
      label: 'Mood',
      type: 'multiselect',
      icon: 'sentiment_satisfied',
      options: [
        { value: 'GREAT', label: 'Great', icon: 'sentiment_very_satisfied', color: '#43a047' },
        { value: 'GOOD', label: 'Good', icon: 'sentiment_satisfied', color: '#1976d2' },
        { value: 'OKAY', label: 'Okay', icon: 'sentiment_neutral', color: '#f9a825' },
        { value: 'BAD', label: 'Bad', icon: 'sentiment_dissatisfied', color: '#f57c00' },
        {
          value: 'TERRIBLE',
          label: 'Terrible',
          icon: 'sentiment_very_dissatisfied',
          color: '#d32f2f',
        },
      ],
    },
    {
      key: 'categories',
      label: 'Categories',
      type: 'multiselect-dropdown',
      icon: 'category',
      options: [
        { value: '1', label: 'Work', icon: 'work', color: '#1976d2' },
        { value: '2', label: 'Finance', icon: 'payments', color: '#f57c00' },
        { value: '3', label: 'Health', icon: 'self_improvement', color: '#43a047' },
        { value: '4', label: 'Personal', icon: 'person', color: '#9c27b0' },
        { value: '5', label: 'Learning', icon: 'school', color: '#e91e63' },
      ],
    },
    {
      key: 'entryDate',
      label: 'Entry Date Range',
      type: 'date-range',
      icon: 'calendar_today',
    },
    {
      key: 'hasLearnings',
      label: 'Has Learnings',
      type: 'toggle',
      icon: 'lightbulb',
    },
    {
      key: 'hasGratitude',
      label: 'Has Gratitude',
      type: 'toggle',
      icon: 'favorite',
    },
    {
      key: 'linkedToWeekPlan',
      label: 'Linked to Week Plan',
      type: 'toggle',
      icon: 'view_week',
    },
  ];

  constructor(private aiAgent: AiAgentService) { }

  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  selectedEntry = signal<JournalEntry | null>(null);

  readonly moods: MoodLevel[] = ['GREAT', 'GOOD', 'OKAY', 'BAD', 'TERRIBLE'];

  readonly emptyForm = (): JournalForm => ({
    title: '',
    mood: 'GOOD',
    wentWell: '',
    wentBad: '',
    learnings: '',
    gratitude: '',
    entryDate: new Date().toISOString().split('T')[0],
    categoryIds: [],
    weekPlanId: null,
  });

  createForm = signal<JournalForm>(this.emptyForm());
  editForm = signal<JournalForm>(this.emptyForm());

  // ── Categories ─────────────────────────────────────────
  toggleCreateCategory(id: number) {
    this.createForm.update((f) => {
      const ids = f.categoryIds.includes(id)
        ? f.categoryIds.filter((i) => i !== id)
        : f.categoryIds.length < 5
          ? [...f.categoryIds, id]
          : f.categoryIds;
      return { ...f, categoryIds: ids };
    });
  }

  toggleEditCategory(id: number) {
    this.editForm.update((f) => {
      const ids = f.categoryIds.includes(id)
        ? f.categoryIds.filter((i) => i !== id)
        : f.categoryIds.length < 5
          ? [...f.categoryIds, id]
          : f.categoryIds;
      return { ...f, categoryIds: ids };
    });
  }

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
    console.log('Journal filter applied:', values);
  }

  onFilterReset() {
    this.activeFilters.set({});
  }

  // ── Create ─────────────────────────────────────────────
  openCreate() {
    this.createForm.set(this.emptyForm());
    this.showCatDropdown.set(false);
    this.showCreateModal.set(true);
  }

  submitCreate() {
    if (!this.createForm().title.trim()) return;
    console.log('Create journal entry:', this.createForm());
    this.showCreateModal.set(false);
  }

  // ── Edit ───────────────────────────────────────────────
  openEdit(entry: JournalEntry) {
    this.selectedEntry.set(entry);
    this.editForm.set({
      title: entry.title, mood: entry.mood,
      wentWell: entry.wentWell, wentBad: entry.wentBad,
      learnings: entry.learnings ?? '', gratitude: entry.gratitude ?? '',
      entryDate: entry.entryDate,
      categoryIds: entry.categories.map(c => c.id),
      weekPlanId: entry.weekPlan?.id ?? null,
    });
    this.showEditCatDropdown.set(false);
    this.showEditModal.set(true);
  }

  submitEdit() {
    if (!this.editForm().title.trim()) return;
    console.log('Update entry:', this.selectedEntry()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  // ── Delete ─────────────────────────────────────────────
  openDeleteConfirm() {
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    const id = this.selectedEntry()?.id;
    if (id) this.entries.update((e) => e.filter((entry) => entry.id !== id));
    this.showDeleteConfirm.set(false);
    this.selectedEntry.set(null);
  }

  // ── WeekPlan Linking ───────────────────────────────────
  getWeekPlanLabel(id: number | null): string {
    if (!id) return 'No week plan linked';
    const plan = this.availableWeekPlans().find((p) => p.id === id);
    return plan ? `${plan.title} (${plan.startDate} – ${plan.endDate})` : 'Unknown';
  }

  // ── Helpers ────────────────────────────────────────────
  getMoodIcon(mood: MoodLevel): string {
    const map: Record<MoodLevel, string> = {
      GREAT: 'sentiment_very_satisfied',
      GOOD: 'sentiment_satisfied',
      OKAY: 'sentiment_neutral',
      BAD: 'sentiment_dissatisfied',
      TERRIBLE: 'sentiment_very_dissatisfied',
    };
    return map[mood];
  }

  getMoodColor(mood: MoodLevel): string {
    const map: Record<MoodLevel, string> = {
      GREAT: '#43a047',
      GOOD: '#1976d2',
      OKAY: '#f9a825',
      BAD: '#f57c00',
      TERRIBLE: '#d32f2f',
    };
    return map[mood];
  }

  getMoodLabel(mood: MoodLevel): string {
    const map: Record<MoodLevel, string> = {
      GREAT: 'Great',
      GOOD: 'Good',
      OKAY: 'Okay',
      BAD: 'Bad',
      TERRIBLE: 'Terrible',
    };
    return map[mood];
  }

  onAiClick() {
    this.aiAgent.open();
  }
}
