import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import {
  FilterPanelComponent,
  FilterField,
  FilterValues,
} from '../../../shared/components/filter/filter';
import { DocumentService } from '../../../core/services/document-service';
import { CategoryService } from '../../../core/services/category-service';
import { AiAgentService } from '../../../core/services/ai-agent';
import { DocumentResponse, DocumentFilter, AccessType } from '../../../core/models/document.model';
import { environment } from '../../../../environments/environment';

type ViewMode = 'grid' | 'list';

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
export class DocumentsComponent implements OnInit {
  private readonly userId = environment.userId;
  private readonly documentService = inject(DocumentService);
  private readonly categoryService = inject(CategoryService);
  private readonly aiAgent = inject(AiAgentService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly viewMode = signal<ViewMode>('grid');

  // ── Service State ──────────────────────────────────────────────────────────
  readonly paginatedDocuments = this.documentService.documents;
  readonly currentPage = this.documentService.currentPage;
  readonly pageSize = this.documentService.pageSize;
  readonly totalPages = this.documentService.totalPages;
  readonly totalElements = this.documentService.totalElements;

  readonly availableCategories = this.categoryService.allCategories;

  // ── Stats ──────────────────────────────────────────────────────────────────
  readonly totalFiles = this.documentService.totalElements;

  readonly totalStorageFormatted = computed(() => {
    const total = this.paginatedDocuments().reduce((sum, d) => sum + (d.fileSizeBytes ?? 0), 0);
    return this.formatSize(total);
  });

  // ── Filter ─────────────────────────────────────────────────────────────────
  showFilter = signal(false);
  activeFilters = signal<FilterValues>({});

  readonly documentFilterFields = computed((): FilterField[] => [
    {
      key: 'fileType',
      label: 'File Type',
      type: 'select',
      icon: 'description',
      options: [
        // Documents
        { value: 'pdf', label: 'PDF', icon: 'picture_as_pdf', color: '#d32f2f' },
        { value: 'docx', label: 'Word', icon: 'description', color: '#1976d2' },
        { value: 'doc', label: 'Word (Legacy)', icon: 'description', color: '#1976d2' },
        { value: 'xlsx', label: 'Excel', icon: 'table_chart', color: '#43a047' },
        { value: 'xls', label: 'Excel (Legacy)', icon: 'table_chart', color: '#43a047' },
        { value: 'csv', label: 'CSV', icon: 'table_chart', color: '#43a047' },
        { value: 'pptx', label: 'PowerPoint', icon: 'slideshow', color: '#f57c00' },
        { value: 'ppt', label: 'PPT (Legacy)', icon: 'slideshow', color: '#f57c00' },
        { value: 'txt', label: 'Text', icon: 'article', color: '#757575' },
        // Images
        { value: 'png', label: 'PNG', icon: 'image', color: '#9c27b0' },
        { value: 'jpg', label: 'JPEG', icon: 'image', color: '#9c27b0' },
        { value: 'jpeg', label: 'JPEG', icon: 'image', color: '#9c27b0' },
        { value: 'webp', label: 'WebP', icon: 'image', color: '#9c27b0' },
        { value: 'gif', label: 'GIF', icon: 'image', color: '#9c27b0' },
        { value: 'svg', label: 'SVG', icon: 'image', color: '#9c27b0' },
        { value: 'heic', label: 'HEIC', icon: 'image', color: '#9c27b0' },
        // Video
        { value: 'mp4', label: 'MP4', icon: 'videocam', color: '#e91e63' },
        { value: 'mov', label: 'MOV', icon: 'videocam', color: '#e91e63' },
        { value: 'avi', label: 'AVI', icon: 'videocam', color: '#e91e63' },
        { value: 'mkv', label: 'MKV', icon: 'videocam', color: '#e91e63' },
        { value: 'webm', label: 'WebM', icon: 'videocam', color: '#e91e63' },
        // Audio
        { value: 'mp3', label: 'MP3', icon: 'music_note', color: '#00bcd4' },
        { value: 'wav', label: 'WAV', icon: 'music_note', color: '#00bcd4' },
        { value: 'aac', label: 'AAC', icon: 'music_note', color: '#00bcd4' },
        { value: 'flac', label: 'FLAC', icon: 'music_note', color: '#00bcd4' },
        { value: 'm4a', label: 'M4A', icon: 'music_note', color: '#00bcd4' },
        // Archives
        { value: 'zip', label: 'ZIP', icon: 'folder_zip', color: '#5d4037' },
        { value: 'rar', label: 'RAR', icon: 'folder_zip', color: '#5d4037' },
        { value: '7z', label: '7Z', icon: 'folder_zip', color: '#5d4037' },
        { value: 'tar', label: 'TAR', icon: 'folder_zip', color: '#5d4037' },
        // Code
        { value: 'json', label: 'JSON', icon: 'code', color: '#43a047' },
        { value: 'xml', label: 'XML', icon: 'code', color: '#f57c00' },
        { value: 'html', label: 'HTML', icon: 'code', color: '#e91e63' },
        { value: 'ts', label: 'TypeScript', icon: 'code', color: '#1976d2' },
        { value: 'js', label: 'JavaScript', icon: 'code', color: '#f9a825' },
      ],
    },
    {
      key: 'fileType',
      label: 'File Type',
      type: 'select',
      icon: 'description',
      options: [
        { value: 'pdf', label: 'PDF', icon: 'picture_as_pdf', color: '#d32f2f' },
        { value: 'docx', label: 'Word', icon: 'description', color: '#1976d2' },
        { value: 'xlsx', label: 'Excel', icon: 'table_chart', color: '#43a047' },
        { value: 'pptx', label: 'PowerPoint', icon: 'slideshow', color: '#f57c00' },
        { value: 'png', label: 'Image', icon: 'image', color: '#9c27b0' },
        { value: 'txt', label: 'Text', icon: 'article', color: '#757575' },
        { value: 'zip', label: 'Archive', icon: 'folder_zip', color: '#5d4037' },
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
    { key: 'uploadedFrom', label: 'Uploaded From', type: 'date', icon: 'calendar_today' },
    { key: 'uploadedTo', label: 'Uploaded To', type: 'date', icon: 'calendar_today' },
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
    this.documentService.loadAll(this.userId, 0, {
      fileType: (values['fileType'] as string) || undefined,
      accessType: (values['access'] as AccessType) || undefined,
      uploadedFrom: (values['uploadedFrom'] as string) || undefined,
      uploadedTo: (values['uploadedTo'] as string) || undefined,
      categoryIds: categoryIds?.length ? categoryIds : undefined,
    });
    this.showFilter.set(false);
  }

  onFilterReset(): void {
    this.activeFilters.set({});
    this.documentService.loadAll(this.userId, 0);
    this.showFilter.set(false);
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  onPageChange(page: number): void {
    this.documentService.loadAll(this.userId, page, this.buildFilterFromActive());
  }

  onPageSizeChange(size: number): void {
    this.documentService.pageSize.set(size);
    this.documentService.loadAll(this.userId, 0, this.buildFilterFromActive());
  }

  onAiClick(): void {
    this.aiAgent.open();
  }

  getSafeUrl(url: string | null): SafeResourceUrl | null {
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // ── Category Dropdowns ─────────────────────────────────────────────────────
  showCatDropdown = signal(false);
  showEditCatDropdown = signal(false);

  readonly sortedUploadCategories = computed(() => {
    const cats = this.availableCategories();
    if (!Array.isArray(cats)) return [];
    const selected = this.uploadForm().categoryIds;
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

  toggleUploadCategory(id: number): void {
    this.uploadForm.update((f) => ({
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

  // ── Upload Modal ───────────────────────────────────────────────────────────
  showUploadModal = signal(false);
  uploadedFile = signal<File | null>(null);
  uploadPreviewUrl = signal<string | null>(null);

  uploadForm = signal<DocumentForm>({
    title: '',
    description: '',
    accessType: 'PRIVATE',
    categoryIds: [],
  });

  openUpload(): void {
    this.uploadedFile.set(null);
    this.uploadPreviewUrl.set(null);
    this.uploadForm.set({ title: '', description: '', accessType: 'PRIVATE', categoryIds: [] });
    this.showCatDropdown.set(false);
    this.showUploadModal.set(true);
  }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.uploadedFile.set(file);
    if (!file) return;

    // Titel aus Dateiname ableiten wenn leer
    if (!this.uploadForm().title) {
      this.uploadForm.update((f) => ({
        ...f,
        title: file.name.replace(/\.[^/.]+$/, ''),
      }));
    }

    // Preview URL generieren
    if (
      file.type.startsWith('image/') ||
      file.type === 'application/pdf' ||
      file.type.startsWith('video/') ||
      file.type.startsWith('audio/')
    ) {
      this.uploadPreviewUrl.set(URL.createObjectURL(file));
    }
  }

  submitUpload(): void {
    if (!this.uploadedFile() || !this.uploadForm().title.trim()) return;
    console.log('TODO upload:', this.uploadedFile(), this.uploadForm());
    this.showUploadModal.set(false);
  }

  // ── Edit Modal ─────────────────────────────────────────────────────────────
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  selectedDocument = signal<DocumentResponse | null>(null);

  editForm = signal<DocumentForm>({
    title: '',
    description: '',
    accessType: 'PRIVATE',
    categoryIds: [],
  });

  openEdit(doc: DocumentResponse): void {
    this.documentService.loadById(this.userId, doc.id);
    this.selectedDocument.set(doc);
    this.editForm.set({
      title: doc.title,
      description: doc.description ?? '',
      accessType: doc.accessType,
      categoryIds: doc.categories?.map((c) => c.id) ?? [],
    });
    this.showEditCatDropdown.set(false);
    this.showEditModal.set(true);
  }

  submitEdit(): void {
    if (!this.editForm().title.trim()) return;
    console.log('TODO update doc:', this.selectedDocument()?.id, this.editForm());
    this.showEditModal.set(false);
  }

  openDeleteConfirm(doc: DocumentResponse, event?: Event): void {
    event?.stopPropagation();
    this.selectedDocument.set(doc);
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    console.log('TODO delete doc:', this.selectedDocument()?.id);
    this.showDeleteConfirm.set(false);
    this.selectedDocument.set(null);
  }

  async downloadDoc(doc: any, event: Event): Promise<void> {
    event.stopPropagation();
    if (!doc.presignedUrl) return;

    try {
      const response = await fetch(doc.presignedUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
    }
  }

  // ── File Helpers ───────────────────────────────────────────────────────────
  getFileIcon(fileType: string): string {
    const map: Record<string, string> = {
      pdf: 'picture_as_pdf',
      docx: 'description',
      doc: 'description',
      xlsx: 'table_chart',
      xls: 'table_chart',
      csv: 'table_chart',
      pptx: 'slideshow',
      ppt: 'slideshow',
      png: 'image',
      jpg: 'image',
      jpeg: 'image',
      webp: 'image',
      gif: 'image',
      svg: 'image',
      heic: 'image',
      mp4: 'videocam',
      mov: 'videocam',
      avi: 'videocam',
      mp3: 'music_note',
      wav: 'music_note',
      aac: 'music_note',
      zip: 'folder_zip',
      rar: 'folder_zip',
      json: 'code',
      xml: 'code',
      html: 'code',
      ts: 'code',
      js: 'code',
      txt: 'article',
    };
    return map[fileType?.toLowerCase()] ?? 'insert_drive_file';
  }

  getFileColor(fileType: string): string {
    const map: Record<string, string> = {
      pdf: '#d32f2f',
      docx: '#1976d2',
      doc: '#1976d2',
      xlsx: '#43a047',
      xls: '#43a047',
      csv: '#43a047',
      pptx: '#f57c00',
      ppt: '#f57c00',
      png: '#9c27b0',
      jpg: '#9c27b0',
      jpeg: '#9c27b0',
      webp: '#9c27b0',
      gif: '#9c27b0',
      svg: '#9c27b0',
      heic: '#9c27b0',
      mp4: '#e91e63',
      mov: '#e91e63',
      mp3: '#00bcd4',
      wav: '#00bcd4',
      zip: '#5d4037',
      rar: '#5d4037',
      json: '#43a047',
      ts: '#1976d2',
      js: '#f9a825',
      txt: '#757575',
    };
    return map[fileType?.toLowerCase()] ?? '#757575';
  }

  getFileTypeName(fileType: string): string {
    const map: Record<string, string> = {
      pdf: 'PDF Document',
      docx: 'Word Document',
      doc: 'Word Document',
      xlsx: 'Excel Spreadsheet',
      xls: 'Excel Spreadsheet',
      csv: 'CSV File',
      pptx: 'PowerPoint',
      ppt: 'PowerPoint',
      png: 'PNG Image',
      jpg: 'JPEG Image',
      jpeg: 'JPEG Image',
      webp: 'WebP Image',
      gif: 'GIF Image',
      svg: 'SVG Vector',
      heic: 'HEIC Image',
      mp4: 'MP4 Video',
      mov: 'MOV Video',
      avi: 'AVI Video',
      mp3: 'MP3 Audio',
      wav: 'WAV Audio',
      aac: 'AAC Audio',
      zip: 'ZIP Archive',
      rar: 'RAR Archive',
      json: 'JSON File',
      xml: 'XML File',
      html: 'HTML File',
      ts: 'TypeScript File',
      js: 'JavaScript File',
      txt: 'Text File',
    };
    return map[fileType?.toLowerCase()] ?? fileType?.toUpperCase() ?? 'File';
  }

  canPreview(fileType: string): boolean {
    return (
      this.isImage(fileType) ||
      fileType === 'pdf' ||
      this.isVideo(fileType) ||
      this.isAudio(fileType)
    );
  }

  isImage(fileType: string): boolean {
    return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'heic'].includes(fileType?.toLowerCase());
  }

  isVideo(fileType: string): boolean {
    return ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(fileType?.toLowerCase());
  }

  isAudio(fileType: string): boolean {
    return ['mp3', 'wav', 'aac', 'flac', 'm4a'].includes(fileType?.toLowerCase());
  }

  formatSize(bytes: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  formatUploadedAt(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en', {
      month: 'short',
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
    this.documentService.loadAll(this.userId);
    this.categoryService.loadAllFlat(this.userId);
  }

  private buildFilterFromActive(): DocumentFilter {
    const v = this.activeFilters();
    const categoryIds = (v['categories'] as string[] | undefined)
      ?.map(Number)
      .filter((n) => !isNaN(n));
    return {
      fileType: (v['fileType'] as string) || undefined,
      accessType: (v['access'] as AccessType) || undefined,
      uploadedFrom: (v['uploadedFrom'] as string) || undefined,
      uploadedTo: (v['uploadedTo'] as string) || undefined,
      categoryIds: categoryIds?.length ? categoryIds : undefined,
    };
  }
}
