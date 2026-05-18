import { Component, input, output, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type FilterFieldType =
  | 'text'
  | 'select'
  | 'multiselect'
  | 'multiselect-dropdown'
  | 'date'
  | 'date-range'
  | 'toggle';

export interface FilterOption {
  value: string | number;
  label: string;
  color?: string;
  icon?: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: FilterFieldType;
  icon?: string;
  options?: FilterOption[];
  placeholder?: string;
}

export type FilterValues = Record<string, string | string[] | boolean | null>;

@Component({
  selector: 'app-filter-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.html',
  styleUrl: './filter.scss'
})
export class FilterPanelComponent implements OnInit {

  readonly fields = input.required<FilterField[]>();
  readonly initialValues = input<FilterValues>({});
  readonly title = input<string>('Filters');

  readonly apply = output<FilterValues>();
  readonly close = output<void>();
  readonly reset = output<void>();

  values = signal<FilterValues>({});
  openDropdowns = signal<Set<string>>(new Set());

  readonly activeCount = computed(() => {
    const v = this.values();
    return Object.values(v).filter(val => {
      if (val === null || val === '' || val === false) return false;
      if (Array.isArray(val)) return val.length > 0;
      return true;
    }).length;
  });

  ngOnInit() {
    const init: FilterValues = {};
    this.fields().forEach(f => {
      init[f.key] = this.initialValues()[f.key] ?? (
        f.type === 'multiselect' || f.type === 'multiselect-dropdown' ? [] :
          f.type === 'toggle' ? false : ''
      );
    });
    this.values.set({ ...init, ...this.initialValues() });
  }

  getValue(key: string): string {
    return (this.values()[key] as string) ?? '';
  }

  getArrayValue(key: string): string[] {
    return (this.values()[key] as string[]) ?? [];
  }

  getBoolValue(key: string): boolean {
    return (this.values()[key] as boolean) ?? false;
  }

  setValue(key: string, value: string | boolean | null) {
    this.values.update(v => ({ ...v, [key]: value }));
  }

  toggleMultiOption(key: string, value: string) {
    const current = this.getArrayValue(key);
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    this.values.update(v => ({ ...v, [key]: updated }));
  }

  isSelected(key: string, value: string): boolean {
    return this.getArrayValue(key).includes(value);
  }

  clearArray(key: string) {
    this.values.update(v => ({ ...v, [key]: [] }));
  }

  // ── Dropdown ───────────────────────────────────────────
  isDropdownOpen(key: string): boolean {
    return this.openDropdowns().has(key);
  }

  toggleDropdown(key: string, event: Event) {
    event.stopPropagation();
    this.openDropdowns.update(set => {
      const next = new Set(set);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.clear();
        next.add(key);
      }
      return next;
    });
  }

  closeAllDropdowns() {
    this.openDropdowns.set(new Set());
  }

  getDropdownLabel(key: string, options: FilterOption[] = []): string {
    const selected = this.getArrayValue(key);
    if (selected.length === 0) return 'All';
    if (selected.length === 1) {
      const opt = options.find(o => o.value.toString() === selected[0]);
      return opt?.label ?? '1 selected';
    }
    return `${selected.length} selected`;
  }

  getSelectedOptions(key: string, options: FilterOption[] = []): FilterOption[] {
    const selected = this.getArrayValue(key);
    return options.filter(o => selected.includes(o.value.toString()));
  }

  onApply() {
    this.closeAllDropdowns();
    this.apply.emit(this.values());
  }

  onReset() {
    const empty: FilterValues = {};
    this.fields().forEach(f => {
      empty[f.key] = f.type === 'multiselect' || f.type === 'multiselect-dropdown'
        ? [] : f.type === 'toggle' ? false : '';
    });
    this.values.set(empty);
    this.closeAllDropdowns();
    this.reset.emit();
  }

  onClose() {
    this.closeAllDropdowns();
    this.close.emit();
  }

  onOverlayClick() { this.onClose(); }
}