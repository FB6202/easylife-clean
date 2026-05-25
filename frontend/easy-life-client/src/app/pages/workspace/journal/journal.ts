import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import {
  FilterPanelComponent,
  FilterField,
  FilterValues,
} from '../../../shared/components/filter/filter';
import { JournalService } from '../../../core/services/journal-service';
import { CategoryService } from '../../../core/services/category-service';
import { WeekPlanService } from '../../../core/services/weekplan-service';
import { AiAgentService } from '../../../core/services/ai-agent';
import { JournalEntryResponse, JournalFilter, MoodLevel } from '../../../core/models/journal.model';
import { environment } from '../../../../environments/environment';

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
export class JournalComponent implements OnInit {
  private readonly userId = environment.userId;
  private readonly journalService = inject(JournalService);
  private readonly categoryService = inject(CategoryService);
  private readonly weekPlanService = inject(WeekPlanService);
  private readonly aiAgent = inject(AiAgentService);

  readonly moods: MoodLevel[] = ['GREAT', 'GOOD', 'OK', 'BAD', 'TERRIBLE'];

  // ── Service State ──────────────────────────────────────────────────────────
  readonly paginatedEntries = this.journalService.entries;
  readonly currentPage = this.journalService.currentPage;
  readonly pageSize = this.journalService.pageSize;
  readonly totalPages = this.journalService.totalPages;
  readonly totalElements = this.journalService.totalElements;

  readonly availableCategories = this.categoryService.allCategories;
  readonly availableWeekPlans = this.weekPlanService.weekPlans;

  // ── Filter ─────────────────────────────────────────────────────────────────
  showFilter = signal(false);
  activeFilters = signal<FilterValues>({});

  readonly journalFilterFields = computed((): FilterField[] => [
    {
      key: 'mood',
      label: 'Mood',
      type: 'select',
      icon: 'sentiment_satisfied',
      options: [
        { value: 'GREAT', label: 'Great', icon: 'sentiment_very_satisfied', color: '#43a047' },
        { value: 'GOOD', label: 'Good', icon: 'sentiment_satisfied', color: '#1976d2' },
        { value: 'OK', label: 'Okay', icon: 'sentiment_neutral', color: '#f9a825' },
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
      options: this.availableCategories().map((c) => ({
        value: String(c.id),
        label: c.name,
        icon: c.icon,
        color: c.color,
      })),
    },
    { key: 'entryDateFrom', label: 'Date From', type: 'date', icon: 'calendar_today' },
    { key: 'entryDateTo', label: 'Date To', type: 'date', icon: 'calendar_today' },
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
    this.journalService.loadAll(this.userId, 0, {
      mood: (values['mood'] as MoodLevel) || undefined,
      entryDateFrom: (values['entryDateFrom'] as string) || undefined,
      entryDateTo: (values['entryDateTo'] as string) || undefined,
      categoryIds: categoryIds?.length ? categoryIds : undefined,
    });
    this.showFilter.set(false);
  }

  onFilterReset(): void {
    this.activeFilters.set({});
    this.journalService.loadAll(this.userId, 0);
    this.showFilter.set(false);
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  onPageChange(page: number): void {
    this.journalService.loadAll(this.userId, page, this.buildFilterFromActive());
  }

  onPageSizeChange(size: number): void {
    this.journalService.pageSize.set(size);
    this.journalService.loadAll(this.userId, 0, this.buildFilterFromActive());
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

  // ── Modals ─────────────────────────────────────────────────────────────────
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  selectedEntry = signal<JournalEntryResponse | null>(null);

  private emptyForm(): JournalForm {
    return {
      title: '',
      mood: 'GOOD',
      wentWell: '',
      wentBad: '',
      learnings: '',
      gratitude: '',
      entryDate: new Date().toISOString().split('T')[0],
      categoryIds: [],
      weekPlanId: null,
    };
  }

  createForm = signal<JournalForm>(this.emptyForm());
  editForm = signal<JournalForm>(this.emptyForm());

  openCreate(): void {
    this.createForm.set(this.emptyForm());
    this.showCatDropdown.set(false);
    this.showCreateModal.set(true);
  }

  submitCreate(): void {
    if (!this.createForm().title.trim()) return;
    console.log('TODO create journal entry:', this.createForm());
    this.showCreateModal.set(false);
  }

  openEdit(entry: JournalEntryResponse): void {
    this.journalService.loadById(this.userId, entry.id);
    this.selectedEntry.set(entry);
    this.editForm.set({
      title: entry.title,
      mood: entry.mood,
      wentWell: entry.wentWell ?? '',
      wentBad: entry.wentBad ?? '',
      learnings: entry.learnings ?? '',
      gratitude: entry.gratitude ?? '',
      entryDate: entry.entryDate ?? '',
      categoryIds: entry.categories?.map((c) => c.id) ?? [],
      weekPlanId: entry.weekPlanId ?? null,
    });
    this.showEditCatDropdown.set(false);
    this.showEditModal.set(true);
  }

  submitEdit(): void {
    if (!this.editForm().title.trim()) return;
    console.log('TODO update journal entry:', this.selectedEntry()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  openDeleteConfirm(entry?: JournalEntryResponse): void {
    if (entry) this.selectedEntry.set(entry);
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    console.log('TODO delete journal entry:', this.selectedEntry()?.id);
    this.showDeleteConfirm.set(false);
    this.selectedEntry.set(null);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getMoodIcon(mood: MoodLevel): string {
    return {
      GREAT: 'sentiment_very_satisfied',
      GOOD: 'sentiment_satisfied',
      OK: 'sentiment_neutral',
      BAD: 'sentiment_dissatisfied',
      TERRIBLE: 'sentiment_very_dissatisfied',
    }[mood];
  }

  getMoodColor(mood: MoodLevel): string {
    return {
      GREAT: '#43a047',
      GOOD: '#1976d2',
      OK: '#f9a825',
      BAD: '#f57c00',
      TERRIBLE: '#d32f2f',
    }[mood];
  }

  getMoodLabel(mood: MoodLevel): string {
    return { GREAT: 'Great', GOOD: 'Good', OK: 'Okay', BAD: 'Bad', TERRIBLE: 'Terrible' }[mood];
  }

  getWordCount(entry: JournalEntryResponse): number {
    const text = [entry.wentWell, entry.wentBad, entry.learnings, entry.gratitude]
      .filter(Boolean)
      .join(' ');
    return text.split(/\s+/).filter(Boolean).length;
  }

  getReadMinutes(entry: JournalEntryResponse): number {
    return Math.max(1, Math.ceil(this.getWordCount(entry) / 200));
  }

  formatEntryDate(dateStr: string): { day: string; month: string; year: string } {
    if (!dateStr) return { day: '--', month: '---', year: '----' };
    const d = new Date(dateStr + 'T00:00:00');
    return {
      day: d.getDate().toString().padStart(2, '0'),
      month: d.toLocaleString('en', { month: 'short' }).toUpperCase(),
      year: d.getFullYear().toString(),
    };
  }

  formatFullDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleString('en', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showCatDropdown.set(false);
    this.showEditCatDropdown.set(false);
  }

  ngOnInit(): void {
    this.journalService.loadAll(this.userId);
    this.categoryService.loadAllFlat(this.userId);
    this.weekPlanService.loadAll(this.userId);
  }

  private buildFilterFromActive(): JournalFilter {
    const v = this.activeFilters();
    const categoryIds = (v['categories'] as string[] | undefined)
      ?.map(Number)
      .filter((n) => !isNaN(n));
    return {
      mood: (v['mood'] as MoodLevel) || undefined,
      entryDateFrom: (v['entryDateFrom'] as string) || undefined,
      entryDateTo: (v['entryDateTo'] as string) || undefined,
      categoryIds: categoryIds?.length ? categoryIds : undefined,
    };
  }
}
