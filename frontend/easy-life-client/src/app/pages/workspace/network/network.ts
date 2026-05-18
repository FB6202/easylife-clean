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

type RelationshipType = 'FRIEND' | 'COLLEAGUE' | 'BUSINESS' | 'MENTOR' | 'OTHER';

interface CategoryPreview {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface NetworkTag {
  id: number;
  label: string;
}

interface Contact {
  id: number;
  firstname: string;
  lastname: string;
  company: string;
  position: string;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  notes: string;
  tags: NetworkTag[];
  skills: string[];
  lastContactedAt: string;
  relationshipType: RelationshipType;
  categories: CategoryPreview[];
  initials: string;
  avatarColor: string;
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
  tagIds: number[];
}

@Component({
  selector: 'app-network',
  imports: [CommonModule, FormsModule, PaginationComponent, FilterPanelComponent],
  templateUrl: './network.html',
  styleUrl: './network.scss',
})
export class NetworkComponent {
  readonly availableCategories = signal<CategoryPreview[]>([
    { id: 1, name: 'Work', icon: 'work', color: '#1976d2' },
    { id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' },
    { id: 3, name: 'Health', icon: 'self_improvement', color: '#43a047' },
    { id: 4, name: 'Personal', icon: 'person', color: '#9c27b0' },
    { id: 5, name: 'Learning', icon: 'school', color: '#e91e63' },
  ]);

  readonly availableTags = signal<NetworkTag[]>([
    { id: 1, label: 'All Contacts' },
    { id: 2, label: 'Business' },
    { id: 3, label: 'Colleague' },
    { id: 4, label: 'Mentor' },
    { id: 5, label: 'Friend' },
    { id: 6, label: 'Other' },
  ]);

  readonly activeTagId = signal<number>(1);

  readonly contacts = signal<Contact[]>([
    {
      id: 1,
      firstname: 'Eleanor',
      lastname: 'Vance',
      company: 'Global Systems',
      position: 'Director of Operations',
      email: 'eleanor@globalsystems.com',
      phone: '+49 123 456789',
      linkedinUrl: 'https://linkedin.com/in/eleanor-vance',
      websiteUrl: null,
      notes: 'Met at the Q3 business summit. Very insightful on operational scaling.',
      tags: [{ id: 2, label: 'Business' }],
      skills: ['Operations', 'Scaling', 'Leadership', 'Strategy'],
      lastContactedAt: '2 days ago',
      relationshipType: 'BUSINESS',
      categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }],
      initials: 'EV',
      avatarColor: '#1976d2',
    },
    {
      id: 2,
      firstname: 'Marcus',
      lastname: 'Thorne',
      company: 'Easy Life',
      position: 'Lead Designer',
      email: 'marcus@easylife.app',
      phone: null,
      linkedinUrl: null,
      websiteUrl: 'https://marcusthorne.design',
      notes: 'Colleague and design partner. Great eye for detail.',
      tags: [{ id: 3, label: 'Colleague' }],
      skills: ['UI Design', 'Figma', 'Design Systems', 'Prototyping'],
      lastContactedAt: 'Today',
      relationshipType: 'COLLEAGUE',
      categories: [
        { id: 1, name: 'Work', icon: 'work', color: '#1976d2' },
        { id: 4, name: 'Personal', icon: 'person', color: '#9c27b0' },
      ],
      initials: 'MT',
      avatarColor: '#43a047',
    },
    {
      id: 3,
      firstname: 'Sasha',
      lastname: 'Petrov',
      company: 'Silver Oak Ventures',
      position: 'Venture Partner',
      email: 'sasha@silveroak.vc',
      phone: '+49 987 654321',
      linkedinUrl: 'https://linkedin.com/in/sasha-petrov',
      websiteUrl: null,
      notes: 'Mentor with deep expertise in early-stage startups and fundraising.',
      tags: [{ id: 4, label: 'Mentor' }],
      skills: ['Venture Capital', 'Fundraising', 'Product Strategy', 'Mentorship'],
      lastContactedAt: '1 month ago',
      relationshipType: 'MENTOR',
      categories: [
        { id: 1, name: 'Work', icon: 'work', color: '#1976d2' },
        { id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' },
      ],
      initials: 'SP',
      avatarColor: '#9c27b0',
    },
    {
      id: 4,
      firstname: 'Julian',
      lastname: 'Beck',
      company: 'Beck Strategies',
      position: 'Principal Consultant',
      email: 'julian@beckstrategies.com',
      phone: '+49 555 123456',
      linkedinUrl: 'https://linkedin.com/in/julian-beck',
      websiteUrl: 'https://beckstrategies.com',
      notes: 'Business consultant with focus on mid-market growth strategies.',
      tags: [{ id: 2, label: 'Business' }],
      skills: ['Consulting', 'Growth Strategy', 'B2B Sales', 'Market Analysis'],
      lastContactedAt: '2 weeks ago',
      relationshipType: 'BUSINESS',
      categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }],
      initials: 'JB',
      avatarColor: '#f57c00',
    },
    {
      id: 5,
      firstname: 'Aria',
      lastname: 'Stark',
      company: 'Freelance',
      position: 'Creative Consultant',
      email: 'aria@freelance.com',
      phone: null,
      linkedinUrl: null,
      websiteUrl: null,
      notes: 'Friend and creative collaborator. Works on brand identity projects.',
      tags: [{ id: 5, label: 'Friend' }],
      skills: ['Branding', 'Creative Direction', 'Copywriting'],
      lastContactedAt: '3 days ago',
      relationshipType: 'FRIEND',
      categories: [{ id: 4, name: 'Personal', icon: 'person', color: '#9c27b0' }],
      initials: 'AS',
      avatarColor: '#e91e63',
    },
    {
      id: 6,
      firstname: 'Nina',
      lastname: 'Vogel',
      company: 'Vogel Media',
      position: 'Creative Director',
      email: 'nina@vogelmedia.de',
      phone: '+49 162 9876543',
      linkedinUrl: 'https://linkedin.com/in/nina-vogel',
      websiteUrl: 'https://vogelmedia.de',
      notes: 'Met at the Hamburg design conference. Very inspiring work.',
      tags: [{ id: 2, label: 'Business' }],
      skills: ['Creative Direction', 'Motion Design', 'Brand Strategy'],
      lastContactedAt: '1 week ago',
      relationshipType: 'BUSINESS',
      categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }],
      initials: 'NV',
      avatarColor: '#00bcd4',
    },
    {
      id: 7,
      firstname: 'Tom',
      lastname: 'Richter',
      company: 'Freelance',
      position: 'Backend Engineer',
      email: 'tom@richterdev.de',
      phone: null,
      linkedinUrl: null,
      websiteUrl: 'https://richterdev.de',
      notes: 'Helped with early backend architecture. Sharp engineer.',
      tags: [{ id: 3, label: 'Colleague' }],
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
      lastContactedAt: '3 weeks ago',
      relationshipType: 'COLLEAGUE',
      categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }],
      initials: 'TR',
      avatarColor: '#43a047',
    },
    {
      id: 8,
      firstname: 'Lena',
      lastname: 'Hartmann',
      company: 'Hartmann Consulting',
      position: 'Strategy Consultant',
      email: 'lena@hartmann-consulting.com',
      phone: '+49 174 1234567',
      linkedinUrl: 'https://linkedin.com/in/lena-hartmann',
      websiteUrl: null,
      notes: 'Brilliant strategist. Great for sanity checks on business decisions.',
      tags: [{ id: 4, label: 'Mentor' }],
      skills: ['Strategy', 'Business Development', 'Coaching', 'OKRs'],
      lastContactedAt: '2 weeks ago',
      relationshipType: 'MENTOR',
      categories: [
        { id: 1, name: 'Work', icon: 'work', color: '#1976d2' },
        { id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' },
      ],
      initials: 'LH',
      avatarColor: '#9c27b0',
    },
    {
      id: 9,
      firstname: 'Max',
      lastname: 'Fischer',
      company: 'TechBridge GmbH',
      position: 'Product Manager',
      email: 'max@techbridge.de',
      phone: null,
      linkedinUrl: 'https://linkedin.com/in/max-fischer',
      websiteUrl: null,
      notes: 'Ex-colleague from a previous startup. Great PM instincts.',
      tags: [{ id: 3, label: 'Colleague' }],
      skills: ['Product Management', 'Agile', 'Roadmapping', 'User Research'],
      lastContactedAt: 'Yesterday',
      relationshipType: 'COLLEAGUE',
      categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }],
      initials: 'MF',
      avatarColor: '#f57c00',
    },
    {
      id: 10,
      firstname: 'Sophie',
      lastname: 'Braun',
      company: 'Braun & Partner',
      position: 'Tax Advisor',
      email: 'sophie@braunpartner.de',
      phone: '+49 89 7654321',
      linkedinUrl: null,
      websiteUrl: 'https://braunpartner.de',
      notes: 'Our tax advisor. Very reliable and thorough.',
      tags: [{ id: 2, label: 'Business' }],
      skills: ['Tax Law', 'Financial Planning', 'GDPR Compliance'],
      lastContactedAt: '1 month ago',
      relationshipType: 'BUSINESS',
      categories: [{ id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' }],
      initials: 'SB',
      avatarColor: '#e91e63',
    },
  ]);

  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  readonly totalElements = computed(() => this.filteredContacts().length);
  readonly totalPages = computed(() => Math.ceil(this.totalElements() / this.pageSize()));

  readonly paginatedContacts = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.filteredContacts().slice(start, start + this.pageSize());
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

  readonly networkFilterFields: FilterField[] = [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      icon: 'search',
      placeholder: 'Search by name, company or position...',
    },
    {
      key: 'relationshipType',
      label: 'Relationship Type',
      type: 'multiselect',
      icon: 'people',
      options: [
        { value: 'FRIEND', label: 'Friend', color: '#f57c00' },
        { value: 'COLLEAGUE', label: 'Colleague', color: '#43a047' },
        { value: 'BUSINESS', label: 'Business', color: '#1976d2' },
        { value: 'MENTOR', label: 'Mentor', color: '#9c27b0' },
        { value: 'OTHER', label: 'Other', color: '#757575' },
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
      key: 'hasEmail',
      label: 'Has Email',
      type: 'toggle',
      icon: 'email',
    },
    {
      key: 'hasPhone',
      label: 'Has Phone',
      type: 'toggle',
      icon: 'phone',
    },
    {
      key: 'hasLinkedIn',
      label: 'Has LinkedIn',
      type: 'toggle',
      icon: 'person',
    },
    {
      key: 'hasNotes',
      label: 'Has Notes',
      type: 'toggle',
      icon: 'notes',
    },
  ];

  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  selectedContact = signal<Contact | null>(null);
  newSkillInput = signal('');

  readonly relationshipTypes: RelationshipType[] = [
    'FRIEND',
    'COLLEAGUE',
    'BUSINESS',
    'MENTOR',
    'OTHER',
  ];

  readonly emptyForm = (): ContactForm => ({
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
    relationshipType: 'OTHER',
    categoryIds: [],
    tagIds: [],
  });

  constructor(private aiAgent: AiAgentService) { }

  createForm = signal<ContactForm>(this.emptyForm());
  editForm = signal<ContactForm>(this.emptyForm());

  readonly filteredContacts = computed(() => {
    const activeTag = this.activeTagId();
    if (activeTag === 1) return this.contacts();
    const tag = this.availableTags().find((t) => t.id === activeTag);
    if (!tag) return this.contacts();
    return this.contacts().filter((c) => c.tags.some((t) => t.label === tag.label));
  });

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
    console.log('Network filter applied:', values);
  }

  onFilterReset() {
    this.activeFilters.set({});
  }

  // ── Skills ─────────────────────────────────────────────
  addSkillToCreate() {
    const skill = this.newSkillInput().trim();
    if (!skill) return;
    if (this.createForm().skills.includes(skill)) {
      this.newSkillInput.set('');
      return;
    }
    this.createForm.update((f) => ({ ...f, skills: [...f.skills, skill] }));
    this.newSkillInput.set('');
  }

  removeSkillFromCreate(skill: string) {
    this.createForm.update((f) => ({
      ...f,
      skills: f.skills.filter((s) => s !== skill),
    }));
  }

  addSkillToEdit() {
    const skill = this.newSkillInput().trim();
    if (!skill) return;
    if (this.editForm().skills.includes(skill)) {
      this.newSkillInput.set('');
      return;
    }
    this.editForm.update((f) => ({ ...f, skills: [...f.skills, skill] }));
    this.newSkillInput.set('');
  }

  removeSkillFromEdit(skill: string) {
    this.editForm.update((f) => ({
      ...f,
      skills: f.skills.filter((s) => s !== skill),
    }));
  }

  onSkillKeydown(event: KeyboardEvent, form: 'create' | 'edit') {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      form === 'create' ? this.addSkillToCreate() : this.addSkillToEdit();
    }
  }

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

  // ── CRUD ───────────────────────────────────────────────
  openCreate() {
    this.createForm.set(this.emptyForm());
    this.newSkillInput.set('');
    this.showCatDropdown.set(false);
    this.showCreateModal.set(true);
  }

  submitCreate() {
    if (!this.createForm().firstname.trim()) return;
    console.log('Create contact:', this.createForm());
    this.showCreateModal.set(false);
  }

  openEdit(contact: Contact) {
    this.selectedContact.set(contact);
    this.newSkillInput.set('');
    this.editForm.set({
      firstname: contact.firstname, lastname: contact.lastname,
      company: contact.company, position: contact.position,
      email: contact.email ?? '', phone: contact.phone ?? '',
      linkedinUrl: contact.linkedinUrl ?? '', websiteUrl: contact.websiteUrl ?? '',
      notes: contact.notes, skills: [...contact.skills],
      relationshipType: contact.relationshipType,
      categoryIds: contact.categories.map(c => c.id),
      tagIds: contact.tags.map(t => t.id),
    });
    this.showEditCatDropdown.set(false);
    this.showEditModal.set(true);
  }

  submitEdit() {
    if (!this.editForm().firstname.trim()) return;
    console.log('Update contact:', this.selectedContact()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  openDeleteConfirm() {
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    const id = this.selectedContact()?.id;
    if (id) this.contacts.update((c) => c.filter((contact) => contact.id !== id));
    this.showDeleteConfirm.set(false);
    this.selectedContact.set(null);
  }

  setActiveTag(id: number) {
    this.activeTagId.set(id);
  }

  onAiClick() {
    this.aiAgent.open();
  }

  getRelationshipClass(type: RelationshipType): string {
    const map: Record<RelationshipType, string> = {
      BUSINESS: 'type--business',
      COLLEAGUE: 'type--colleague',
      MENTOR: 'type--mentor',
      FRIEND: 'type--friend',
      OTHER: 'type--other',
    };
    return map[type];
  }

  getRelationshipLabel(type: RelationshipType): string {
    const map: Record<RelationshipType, string> = {
      BUSINESS: 'Business',
      COLLEAGUE: 'Colleague',
      MENTOR: 'Mentor',
      FRIEND: 'Friend',
      OTHER: 'Other',
    };
    return map[type];
  }
}
