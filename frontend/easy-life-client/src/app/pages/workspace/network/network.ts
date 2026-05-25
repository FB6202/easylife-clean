import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import {
  FilterPanelComponent,
  FilterField,
  FilterValues,
} from '../../../shared/components/filter/filter';
import { ContactService } from '../../../core/services/contact-service';
import { CategoryService } from '../../../core/services/category-service';
import { AiAgentService } from '../../../core/services/ai-agent';
import {
  ContactResponse,
  ContactFilter,
  RelationshipType,
} from '../../../core/models/contact.model';
import { environment } from '../../../../environments/environment';

interface NetworkTag {
  id: number;
  label: string;
  type: RelationshipType | null;
}

interface ContactForm {
  firstname: string;
  lastname: string;
  company: string;
  position: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  websiteUrl: string;
  notes: string;
  skills: string[];
  relationshipType: RelationshipType;
  categoryIds: number[];
}

@Component({
  selector: 'app-network',
  imports: [CommonModule, FormsModule, PaginationComponent, FilterPanelComponent],
  templateUrl: './network.html',
  styleUrl: './network.scss',
})
export class NetworkComponent implements OnInit {
  private readonly userId = environment.userId;
  private readonly contactService = inject(ContactService);
  private readonly categoryService = inject(CategoryService);
  private readonly aiAgent = inject(AiAgentService);

  readonly relationshipTypes: RelationshipType[] = [
    'FRIEND',
    'COLLEAGUE',
    'BUSINESS',
    'MENTOR',
    'OTHER',
  ];

  // ── Service State ──────────────────────────────────────────────────────────
  readonly paginatedContacts = this.contactService.contacts;
  readonly currentPage = this.contactService.currentPage;
  readonly pageSize = this.contactService.pageSize;
  readonly totalPages = this.contactService.totalPages;
  readonly totalElements = this.contactService.totalElements;

  readonly availableCategories = this.categoryService.allCategories;

  // ── Quick Tag Filter ───────────────────────────────────────────────────────
  readonly availableTags = signal<NetworkTag[]>([
    { id: 0, label: 'All Contacts', type: null },
    { id: 1, label: 'Business', type: 'BUSINESS' },
    { id: 2, label: 'Colleague', type: 'COLLEAGUE' },
    { id: 3, label: 'Mentor', type: 'MENTOR' },
    { id: 4, label: 'Friend', type: 'FRIEND' },
    { id: 5, label: 'Other', type: 'OTHER' },
  ]);

  readonly activeTagId = signal<number>(0);

  setActiveTag(id: number): void {
    this.activeTagId.set(id);
    const tag = this.availableTags().find((t) => t.id === id);
    if (tag?.type) {
      this.contactService.loadAll(this.userId, 0, {
        ...this.buildFilterFromActive(),
        relationshipType: tag.type,
      });
    } else {
      const { relationshipType, ...rest } = this.buildFilterFromActive();
      this.contactService.loadAll(this.userId, 0, rest);
    }
  }

  // ── Filter ─────────────────────────────────────────────────────────────────
  showFilter = signal(false);
  activeFilters = signal<FilterValues>({});

  readonly networkFilterFields = computed((): FilterField[] => [
    {
      key: 'relationshipType',
      label: 'Relationship',
      type: 'select',
      icon: 'people',
      options: [
        { value: 'BUSINESS', label: 'Business', color: '#1976d2' },
        { value: 'COLLEAGUE', label: 'Colleague', color: '#43a047' },
        { value: 'MENTOR', label: 'Mentor', color: '#9c27b0' },
        { value: 'FRIEND', label: 'Friend', color: '#f57c00' },
        { value: 'OTHER', label: 'Other', color: '#757575' },
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
    this.contactService.loadAll(this.userId, 0, {
      relationshipType: (values['relationshipType'] as RelationshipType) || undefined,
      categoryIds: categoryIds?.length ? categoryIds : undefined,
    });
    this.showFilter.set(false);
  }

  onFilterReset(): void {
    this.activeFilters.set({});
    this.activeTagId.set(0);
    this.contactService.loadAll(this.userId, 0);
    this.showFilter.set(false);
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  onPageChange(page: number): void {
    this.contactService.loadAll(this.userId, page, this.buildFilterFromActive());
  }

  onPageSizeChange(size: number): void {
    this.contactService.pageSize.set(size);
    this.contactService.loadAll(this.userId, 0, this.buildFilterFromActive());
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

  // ── Skills Input ───────────────────────────────────────────────────────────
  newSkillInput = signal('');

  onSkillKeydown(event: KeyboardEvent, mode: 'create' | 'edit'): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      mode === 'create' ? this.addSkillToCreate() : this.addSkillToEdit();
    }
  }

  addSkillToCreate(): void {
    const val = this.newSkillInput().trim();
    if (!val) return;
    if (!this.createForm().skills.includes(val)) {
      this.createForm.update((f) => ({ ...f, skills: [...f.skills, val] }));
    }
    this.newSkillInput.set('');
  }

  addSkillToEdit(): void {
    const val = this.newSkillInput().trim();
    if (!val) return;
    if (!this.editForm().skills.includes(val)) {
      this.editForm.update((f) => ({ ...f, skills: [...f.skills, val] }));
    }
    this.newSkillInput.set('');
  }

  removeSkillFromCreate(skill: string): void {
    this.createForm.update((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
  }

  removeSkillFromEdit(skill: string): void {
    this.editForm.update((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
  }

  // ── Modals ─────────────────────────────────────────────────────────────────
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  selectedContact = signal<ContactResponse | null>(null);

  private emptyForm(): ContactForm {
    return {
      firstname: '',
      lastname: '',
      company: '',
      position: '',
      email: '',
      phone: '',
      linkedinUrl: '',
      websiteUrl: '',
      notes: '',
      skills: [],
      relationshipType: 'BUSINESS',
      categoryIds: [],
    };
  }

  createForm = signal<ContactForm>(this.emptyForm());
  editForm = signal<ContactForm>(this.emptyForm());

  openCreate(): void {
    this.createForm.set(this.emptyForm());
    this.newSkillInput.set('');
    this.showCatDropdown.set(false);
    this.showCreateModal.set(true);
  }

  submitCreate(): void {
    if (!this.createForm().firstname.trim()) return;
    console.log('TODO create contact:', this.createForm());
    this.showCreateModal.set(false);
  }

  openEdit(contact: ContactResponse): void {
    this.contactService.loadById(this.userId, contact.id);
    this.selectedContact.set(contact);
    this.editForm.set({
      firstname: contact.firstname,
      lastname: contact.lastname,
      company: contact.company ?? '',
      position: contact.position ?? '',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      linkedinUrl: contact.linkedinUrl ?? '',
      websiteUrl: contact.websiteUrl ?? '',
      notes: contact.notes ?? '',
      skills: this.parseTags(contact.tags),
      relationshipType: contact.relationshipType,
      categoryIds: contact.categories?.map((c) => c.id) ?? [],
    });
    this.newSkillInput.set('');
    this.showEditCatDropdown.set(false);
    this.showEditModal.set(true);
  }

  submitEdit(): void {
    if (!this.editForm().firstname.trim()) return;
    console.log('TODO update contact:', this.selectedContact()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  openDeleteConfirm(): void {
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    console.log('TODO delete contact:', this.selectedContact()?.id);
    this.showDeleteConfirm.set(false);
    this.selectedContact.set(null);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getInitials(contact: ContactResponse): string {
    return ((contact.firstname?.[0] ?? '') + (contact.lastname?.[0] ?? '')).toUpperCase();
  }

  getAvatarColor(contact: ContactResponse): string {
    const colors = [
      '#1976d2',
      '#43a047',
      '#f57c00',
      '#9c27b0',
      '#e91e63',
      '#00bcd4',
      '#ff5722',
      '#3f51b5',
    ];
    const hash = (contact.firstname + contact.lastname)
      .split('')
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  parseTags(tags: string | null): string[] {
    if (!tags?.trim()) return [];
    return tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  getRelationshipLabel(type: RelationshipType): string {
    return {
      FRIEND: 'Friend',
      COLLEAGUE: 'Colleague',
      BUSINESS: 'Business',
      MENTOR: 'Mentor',
      OTHER: 'Other',
    }[type];
  }

  getRelationshipClass(type: RelationshipType): string {
    return 'type--' + type.toLowerCase();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showCatDropdown.set(false);
    this.showEditCatDropdown.set(false);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.contactService.loadAll(this.userId);
    this.categoryService.loadAllFlat(this.userId);
  }

  private buildFilterFromActive(): ContactFilter {
    const v = this.activeFilters();
    const categoryIds = (v['categories'] as string[] | undefined)
      ?.map(Number)
      .filter((n) => !isNaN(n));
    return {
      relationshipType: (v['relationshipType'] as RelationshipType) || undefined,
      categoryIds: categoryIds?.length ? categoryIds : undefined,
    };
  }
}
