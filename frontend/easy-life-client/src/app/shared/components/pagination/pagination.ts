import { Component, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly totalElements = input.required<number>();
  readonly pageSize = input<number>(10);
  readonly showAiButton = input<boolean>(true);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();
  readonly aiClick = output<void>();

  readonly pageSizeOptions = [5, 10, 15, 20];
  readonly customSizeInput = signal('');
  readonly showCustomInput = signal(false);

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 0) return [];
    if (total <= 5) return Array.from({ length: total }, (_, i) => i);

    const pages: (number | 'ellipsis')[] = [];
    pages.push(0);

    if (total <= 7) {
      for (let i = 1; i < total - 1; i++) pages.push(i);
    } else if (current <= 2) {
      pages.push(1, 2, 3, 'ellipsis');
    } else if (current >= total - 3) {
      pages.push('ellipsis', total - 4, total - 3, total - 2, total - 1);
      return pages.slice(0, pages.length - 0);
    } else {
      pages.push('ellipsis', current - 1, current, current + 1, 'ellipsis');
    }

    if (total > 1) pages.push(total - 1);
    return pages;
  });

  readonly startItem = computed(() =>
    this.totalElements() === 0 ? 0 : this.currentPage() * this.pageSize() + 1,
  );

  readonly endItem = computed(() =>
    Math.min((this.currentPage() + 1) * this.pageSize(), this.totalElements()),
  );

  goTo(page: number) {
    if (page < 0 || page >= this.totalPages() || page === this.currentPage()) return;
    this.pageChange.emit(page);
  }

  prev() {
    this.goTo(this.currentPage() - 1);
  }
  next() {
    this.goTo(this.currentPage() + 1);
  }

  onSizeChange(size: number) {
    this.showCustomInput.set(false);
    this.customSizeInput.set('');
    this.pageSizeChange.emit(size);
    this.pageChange.emit(0);
  }

  onCustomSizeClick() {
    this.showCustomInput.set(true);
    this.customSizeInput.set('');
  }

  onCustomSizeConfirm() {
    const val = parseInt(this.customSizeInput(), 10);
    if (!isNaN(val) && val > 0 && val <= 500) {
      this.pageSizeChange.emit(val);
      this.pageChange.emit(0);
    }
    this.showCustomInput.set(false);
    this.customSizeInput.set('');
  }

  onCustomSizeKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.onCustomSizeConfirm();
    if (event.key === 'Escape') {
      this.showCustomInput.set(false);
      this.customSizeInput.set('');
    }
  }

  onAiClick() {
    this.aiClick.emit();
  }

  isEllipsis(page: number | 'ellipsis'): boolean {
    return page === 'ellipsis';
  }

  asNumber(page: number | 'ellipsis'): number {
    return page as number;
  }

  isCustomSize(): boolean {
    return !this.pageSizeOptions.includes(this.pageSize());
  }
}
