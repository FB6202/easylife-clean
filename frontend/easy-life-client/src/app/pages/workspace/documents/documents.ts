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

type ViewMode = 'grid' | 'list';
type AccessType = 'PRIVATE' | 'PUBLIC';
type FileType =
  | 'pdf' | 'docx' | 'doc' | 'xlsx' | 'xls' | 'pptx' | 'ppt' | 'txt' | 'csv'
  | 'png' | 'jpg' | 'jpeg' | 'webp' | 'gif' | 'svg' | 'heic'
  | 'mp4' | 'mov' | 'avi' | 'mkv' | 'webm'
  | 'mp3' | 'wav' | 'aac' | 'flac' | 'm4a'
  | 'zip' | 'rar' | '7z' | 'tar'
  | 'json' | 'xml' | 'html' | 'css' | 'ts' | 'js';

interface CategoryPreview {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface Document {
  id: number;
  title: string;
  description: string;
  filePath: string;
  fileType: FileType;
  fileSizeBytes: number;
  accessType: AccessType;
  uploadedAt: string;
  categories: CategoryPreview[];
  previewUrl: string | null;
}

interface DocumentForm {
  title: string;
  description: string;
  accessType: AccessType;
  categoryIds: number[];
}

@Component({
  selector: 'app-documents',
  imports: [CommonModule, FormsModule, PaginationComponent, FilterPanelComponent],
  templateUrl: './documents.html',
  styleUrl: './documents.scss',
})
export class DocumentsComponent {

  readonly viewMode = signal<ViewMode>('grid');

  readonly availableCategories = signal<CategoryPreview[]>([
    { id: 1, name: 'Work', icon: 'work', color: '#1976d2' },
    { id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' },
    { id: 3, name: 'Personal', icon: 'person', color: '#9c27b0' },
    { id: 4, name: 'Health', icon: 'self_improvement', color: '#43a047' },
  ]);

  readonly documents = signal<Document[]>([
    { id: 1, title: 'Quarterly Financial Statement 2024', description: 'Q4 financial report with full P&L breakdown.', filePath: '/docs/q4-financial.pdf', fileType: 'pdf', fileSizeBytes: 2400000, accessType: 'PRIVATE', uploadedAt: 'Aug 15, 2024', categories: [{ id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' }], previewUrl: null },
    { id: 2, title: 'Product Design Manifesto v2', description: 'Design principles and component guidelines.', filePath: '/docs/design-manifesto.docx', fileType: 'docx', fileSizeBytes: 850000, accessType: 'PUBLIC', uploadedAt: 'Oct 12, 2023', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], previewUrl: null },
    { id: 3, title: 'Brand Assets Package 2024', description: 'Logos, colors and brand guidelines.', filePath: '/docs/brand-assets.png', fileType: 'png', fileSizeBytes: 18500000, accessType: 'PRIVATE', uploadedAt: 'Sep 01, 2024', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], previewUrl: null },
    { id: 4, title: 'User Feedback Analysis', description: 'Compiled survey results from Q3 2024.', filePath: '/docs/feedback.xlsx', fileType: 'xlsx', fileSizeBytes: 1200000, accessType: 'PUBLIC', uploadedAt: 'Aug 28, 2024', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }, { id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' }], previewUrl: null },
    { id: 5, title: 'Product Demo Recording', description: 'Full demo walkthrough for Acme Corp.', filePath: '/docs/demo.mp4', fileType: 'mp4', fileSizeBytes: 245000000, accessType: 'PRIVATE', uploadedAt: 'Jul 12, 2024', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], previewUrl: null },
    { id: 6, title: 'Podcast Interview Raw', description: 'Unedited recording from the ProductPeople podcast.', filePath: '/docs/podcast.mp3', fileType: 'mp3', fileSizeBytes: 87000000, accessType: 'PRIVATE', uploadedAt: 'Jun 30, 2024', categories: [{ id: 4, name: 'Health', icon: 'self_improvement', color: '#43a047' }], previewUrl: null },
    { id: 7, title: 'Office Renovation Photos', description: 'Before and after renovation pictures.', filePath: '/docs/renovation.jpg', fileType: 'jpg', fileSizeBytes: 42000000, accessType: 'PRIVATE', uploadedAt: 'May 15, 2024', categories: [{ id: 3, name: 'Personal', icon: 'person', color: '#9c27b0' }], previewUrl: null },
    { id: 8, title: 'Technical Architecture Overview', description: 'System design and infrastructure documentation for Easy Life.', filePath: '/docs/architecture.pdf', fileType: 'pdf', fileSizeBytes: 1800000, accessType: 'PRIVATE', uploadedAt: 'Apr 10, 2024', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], previewUrl: null },
    { id: 9, title: 'Marketing Campaign Q1 2024', description: 'Full campaign brief and creative assets for Q1.', filePath: '/docs/marketing-q1.pptx', fileType: 'pptx', fileSizeBytes: 34000000, accessType: 'PRIVATE', uploadedAt: 'Mar 01, 2024', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }, { id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' }], previewUrl: null },
    { id: 10, title: 'Personal Budget 2024', description: 'Monthly budget tracking and savings overview.', filePath: '/docs/budget-2024.xlsx', fileType: 'xlsx', fileSizeBytes: 450000, accessType: 'PRIVATE', uploadedAt: 'Jan 01, 2024', categories: [{ id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' }, { id: 3, name: 'Personal', icon: 'person', color: '#9c27b0' }], previewUrl: null },
    { id: 11, title: 'Easy Life Brand Guidelines', description: 'Color palette, typography and usage rules for the Easy Life brand.', filePath: '/docs/brand-guidelines.pdf', fileType: 'pdf', fileSizeBytes: 6700000, accessType: 'PUBLIC', uploadedAt: 'Feb 14, 2024', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], previewUrl: null },
    { id: 12, title: 'Weekly Workout Tracker', description: 'Spreadsheet to track weekly gym sessions and progress.', filePath: '/docs/workout-tracker.xlsx', fileType: 'xlsx', fileSizeBytes: 230000, accessType: 'PRIVATE', uploadedAt: 'Jan 15, 2024', categories: [{ id: 4, name: 'Health', icon: 'self_improvement', color: '#43a047' }], previewUrl: null },
    { id: 13, title: 'API Documentation v2', description: 'Full REST API reference for Easy Life backend endpoints.', filePath: '/docs/api-docs.html', fileType: 'html', fileSizeBytes: 890000, accessType: 'PUBLIC', uploadedAt: 'Mar 22, 2024', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], previewUrl: null },
    { id: 14, title: 'Interview Recording – UX Research', description: 'Raw audio recording of 5 user interviews for product research.', filePath: '/docs/ux-interviews.m4a', fileType: 'm4a', fileSizeBytes: 145000000, accessType: 'PRIVATE', uploadedAt: 'Apr 05, 2024', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], previewUrl: null },
    { id: 15, title: 'Team Offsite Photos', description: 'Photo collection from the Berlin offsite in March.', filePath: '/docs/offsite-march.jpg', fileType: 'jpg', fileSizeBytes: 78000000, accessType: 'PRIVATE', uploadedAt: 'Mar 18, 2024', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }, { id: 3, name: 'Personal', icon: 'person', color: '#9c27b0' }], previewUrl: null },
    { id: 16, title: 'Investor Pitch Deck', description: 'Seed round pitch deck for Easy Life Series A.', filePath: '/docs/pitch-deck.pptx', fileType: 'pptx', fileSizeBytes: 22000000, accessType: 'PRIVATE', uploadedAt: 'May 01, 2024', categories: [{ id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' }, { id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], previewUrl: null },
    { id: 17, title: 'App Store Screenshots', description: 'Final screenshots and preview images for iOS App Store submission.', filePath: '/docs/app-store.png', fileType: 'png', fileSizeBytes: 9400000, accessType: 'PUBLIC', uploadedAt: 'May 10, 2024', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], previewUrl: null },
    { id: 18, title: 'Legal Entity Documents', description: 'GmbH founding documents and shareholder agreements.', filePath: '/docs/legal.zip', fileType: 'zip', fileSizeBytes: 3200000, accessType: 'PRIVATE', uploadedAt: 'Dec 01, 2023', categories: [{ id: 2, name: 'Finance', icon: 'payments', color: '#f57c00' }], previewUrl: null },
    { id: 19, title: 'Product Walkthrough Video', description: 'Full feature walkthrough for the Easy Life onboarding flow.', filePath: '/docs/walkthrough.mp4', fileType: 'mp4', fileSizeBytes: 310000000, accessType: 'PUBLIC', uploadedAt: 'May 15, 2024', categories: [{ id: 1, name: 'Work', icon: 'work', color: '#1976d2' }], previewUrl: null },
    { id: 20, title: 'Health Check Report 2023', description: 'Annual health checkup results and doctor notes.', filePath: '/docs/health-report.pdf', fileType: 'pdf', fileSizeBytes: 1100000, accessType: 'PRIVATE', uploadedAt: 'Nov 30, 2023', categories: [{ id: 4, name: 'Health', icon: 'self_improvement', color: '#43a047' }, { id: 3, name: 'Personal', icon: 'person', color: '#9c27b0' }], previewUrl: null },
  ]);

  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly totalElements = computed(() => this.documents().length);
  readonly totalPages = computed(() => Math.ceil(this.totalElements() / this.pageSize()));
  readonly paginatedDocuments = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.documents().slice(start, start + this.pageSize());
  });
  onPageChange(page: number) { this.currentPage.set(page); }
  onPageSizeChange(size: number) { this.pageSize.set(size); this.currentPage.set(0); }

  // ── Row Menu ───────────────────────────────────────────────
  openMenuId = signal<number | null>(null);

  toggleMenu(id: number, event: Event) {
    event.stopPropagation();
    this.openMenuId.update(v => (v === id ? null : id));
  }

  closeMenu() {
    this.openMenuId.set(null);
  }

  quickToggleAccess(doc: Document, event: Event) {
    event.stopPropagation();
    this.documents.update(list =>
      list.map(d =>
        d.id === doc.id
          ? { ...d, accessType: d.accessType === 'PRIVATE' ? 'PUBLIC' : 'PRIVATE' }
          : d,
      ),
    );
    this.openMenuId.set(null);
  }

  quickDelete(doc: Document, event: Event) {
    event.stopPropagation();
    this.selectedDocument.set(doc);
    this.openMenuId.set(null);
    this.showDeleteConfirm.set(true);
  }

  readonly totalStorageBytes = computed(() =>
    this.documents().reduce((acc, d) => acc + d.fileSizeBytes, 0)
  );
  readonly totalStorageFormatted = computed(() => {
    const gb = this.totalStorageBytes() / 1e9;
    return gb >= 1 ? gb.toFixed(1) + ' GB' : (this.totalStorageBytes() / 1e6).toFixed(0) + ' MB';
  });
  readonly totalFiles = computed(() => this.totalElements());

  constructor(private aiAgent: AiAgentService) { }

  // ── Filter ─────────────────────────────────────────────
  showFilter = signal(false);
  activeFilters = signal<FilterValues>({});

  readonly documentFilterFields: FilterField[] = [
    { key: 'search', label: 'Search', type: 'text', icon: 'search', placeholder: 'Search documents...' },
    {
      key: 'fileType', label: 'File Type', type: 'multiselect-dropdown', icon: 'description',
      options: [
        { value: 'pdf', label: 'PDF', icon: 'picture_as_pdf', color: '#f44336' },
        { value: 'docx', label: 'Word', icon: 'description', color: '#1976d2' },
        { value: 'xlsx', label: 'Excel', icon: 'table_chart', color: '#43a047' },
        { value: 'pptx', label: 'PowerPoint', icon: 'slideshow', color: '#f57c00' },
        { value: 'txt', label: 'Text', icon: 'article', color: '#9e9e9e' },
        { value: 'csv', label: 'CSV', icon: 'grid_on', color: '#00897b' },
        { value: 'png', label: 'Image', icon: 'image', color: '#f57c00' },
        { value: 'mp4', label: 'Video', icon: 'videocam', color: '#e53935' },
        { value: 'mp3', label: 'Audio', icon: 'music_note', color: '#8e24aa' },
        { value: 'zip', label: 'Archive', icon: 'folder_zip', color: '#5e35b1' },
        { value: 'json', label: 'Code / Data', icon: 'data_object', color: '#f9a825' },
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
        { value: '3', label: 'Personal', icon: 'person', color: '#9c27b0' },
        { value: '4', label: 'Health', icon: 'self_improvement', color: '#43a047' },
      ]
    },
    { key: 'uploadedAt', label: 'Upload Date Range', type: 'date-range', icon: 'calendar_today' },
    {
      key: 'sizeRange', label: 'File Size', type: 'select', icon: 'storage',
      options: [
        { value: 'small', label: 'Small (< 1 MB)' },
        { value: 'medium', label: 'Medium (1–10 MB)' },
        { value: 'large', label: 'Large (10–100 MB)' },
        { value: 'xlarge', label: 'Extra Large (> 100 MB)' },
      ]
    },
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
  showUploadModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  selectedDocument = signal<Document | null>(null);
  uploadedFile = signal<File | null>(null);
  uploadPreviewUrl = signal<string | null>(null);

  editForm = signal<DocumentForm>({ title: '', description: '', accessType: 'PRIVATE', categoryIds: [] });
  uploadForm = signal<DocumentForm>({ title: '', description: '', accessType: 'PRIVATE', categoryIds: [] });

  openUpload() {
    this.uploadedFile.set(null);
    this.uploadPreviewUrl.set(null);
    this.uploadForm.set({ title: '', description: '', accessType: 'PRIVATE', categoryIds: [] });
    this.showCatDropdown.set(false);
    this.showUploadModal.set(true);
  }

  onFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadedFile.set(file);
    if (!this.uploadForm().title)
      this.uploadForm.update(f => ({ ...f, title: file.name.replace(/\.[^/.]+$/, '') }));
    const isPreviewable = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf', 'video/mp4', 'video/quicktime', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/mp4'].includes(file.type);
    this.uploadPreviewUrl.set(isPreviewable ? URL.createObjectURL(file) : null);
  }

  submitUpload() {
    if (!this.uploadedFile() || !this.uploadForm().title.trim()) return;
    console.log('Upload:', this.uploadedFile(), this.uploadForm());
    this.showUploadModal.set(false);
  }

  toggleUploadCategory(id: number) {
    this.uploadForm.update(f => {
      const ids = f.categoryIds.includes(id)
        ? f.categoryIds.filter(i => i !== id)
        : f.categoryIds.length < 5 ? [...f.categoryIds, id] : f.categoryIds;
      return { ...f, categoryIds: ids };
    });
  }

  openEdit(doc: Document) {
    this.selectedDocument.set(doc);
    this.editForm.set({ title: doc.title, description: doc.description, accessType: doc.accessType, categoryIds: doc.categories.map(c => c.id) });
    this.showEditCatDropdown.set(false);
    this.showEditModal.set(true);
  }

  submitEdit() {
    if (!this.editForm().title.trim()) return;
    console.log('Update doc:', this.selectedDocument()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  toggleEditCategory(id: number) {
    this.editForm.update(f => {
      const ids = f.categoryIds.includes(id)
        ? f.categoryIds.filter(i => i !== id)
        : f.categoryIds.length < 5 ? [...f.categoryIds, id] : f.categoryIds;
      return { ...f, categoryIds: ids };
    });
  }

  openDeleteConfirm(doc: Document) {
    this.selectedDocument.set(doc);
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    const id = this.selectedDocument()?.id;
    if (id) this.documents.update(d => d.filter(doc => doc.id !== id));
    this.showDeleteConfirm.set(false);
    this.selectedDocument.set(null);
  }

  downloadDoc(doc: Document, event: Event) {
    event.stopPropagation();
    console.log('Download:', doc.filePath);
  }

  canPreview(fileType: FileType): boolean {
    return ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'mp4', 'mov', 'webm', 'mp3', 'wav', 'aac', 'm4a'].includes(fileType);
  }

  isImage(fileType: FileType): boolean {
    return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'heic'].includes(fileType);
  }

  isVideo(fileType: FileType): boolean {
    return ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(fileType);
  }

  isAudio(fileType: FileType): boolean {
    return ['mp3', 'wav', 'aac', 'flac', 'm4a'].includes(fileType);
  }

  getFileIcon(type: FileType): string {
    const map: Partial<Record<FileType, string>> = {
      pdf: 'picture_as_pdf', docx: 'description', doc: 'description',
      xlsx: 'table_chart', xls: 'table_chart', pptx: 'slideshow', ppt: 'slideshow',
      txt: 'article', csv: 'grid_on', png: 'image', jpg: 'image', jpeg: 'image',
      webp: 'image', gif: 'gif_box', svg: 'polyline', heic: 'image',
      mp4: 'videocam', mov: 'videocam', avi: 'videocam', mkv: 'videocam', webm: 'videocam',
      mp3: 'music_note', wav: 'music_note', aac: 'music_note', flac: 'music_note', m4a: 'music_note',
      zip: 'folder_zip', rar: 'folder_zip', '7z': 'folder_zip', tar: 'folder_zip',
      json: 'data_object', xml: 'code', html: 'html', css: 'css', ts: 'code', js: 'javascript',
    };
    return map[type] ?? 'insert_drive_file';
  }

  getFileColor(type: FileType): string {
    const map: Partial<Record<FileType, string>> = {
      pdf: '#f44336', docx: '#1976d2', doc: '#1976d2', xlsx: '#43a047', xls: '#43a047',
      pptx: '#f57c00', ppt: '#f57c00', txt: '#9e9e9e', csv: '#00897b',
      png: '#f57c00', jpg: '#f57c00', jpeg: '#f57c00', webp: '#ff7043', gif: '#ab47bc',
      svg: '#26c6da', heic: '#f57c00', mp4: '#e53935', mov: '#e53935', avi: '#e53935',
      mkv: '#b71c1c', webm: '#c62828', mp3: '#8e24aa', wav: '#7b1fa2', aac: '#6a1b9a',
      flac: '#4a148c', m4a: '#9c27b0', zip: '#5e35b1', rar: '#512da8', '7z': '#4527a0',
      tar: '#673ab7', json: '#f9a825', xml: '#0288d1', html: '#e64a19', css: '#1565c0',
      ts: '#1976d2', js: '#f9a825',
    };
    return map[type] ?? '#757575';
  }

  getFileTypeName(type: FileType): string {
    const map: Partial<Record<FileType, string>> = {
      pdf: 'PDF Document', docx: 'Word Document', doc: 'Word Document',
      xlsx: 'Excel Spreadsheet', xls: 'Excel Spreadsheet', pptx: 'PowerPoint', ppt: 'PowerPoint',
      txt: 'Text File', csv: 'CSV Spreadsheet', png: 'PNG Image', jpg: 'JPEG Image',
      jpeg: 'JPEG Image', webp: 'WebP Image', gif: 'GIF Image', svg: 'SVG Vector', heic: 'HEIC Image',
      mp4: 'MP4 Video', mov: 'MOV Video', avi: 'AVI Video', mkv: 'MKV Video', webm: 'WebM Video',
      mp3: 'MP3 Audio', wav: 'WAV Audio', aac: 'AAC Audio', flac: 'FLAC Audio', m4a: 'M4A Audio',
      zip: 'ZIP Archive', rar: 'RAR Archive', '7z': '7-Zip Archive', tar: 'TAR Archive',
      json: 'JSON File', xml: 'XML File', html: 'HTML File', css: 'CSS File',
      ts: 'TypeScript File', js: 'JavaScript File',
    };
    return map[type] ?? 'File';
  }

  formatSize(bytes: number): string {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
    return (bytes / 1e3).toFixed(0) + ' KB';
  }

  onAiClick() { this.aiAgent.open(); }
}