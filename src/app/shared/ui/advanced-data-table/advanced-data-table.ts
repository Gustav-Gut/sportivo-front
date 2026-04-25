import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Badge } from '../badge/badge';

export interface TableAction {
  label: string;
  icon?: string;
  callback: (row: any) => void;
}

export interface AdvanceTableColumn {
  key: string;
  label: string;
  type: 'text' | 'currency' | 'status' | 'member' | 'actions';
  actions?: TableAction[];
}

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-advanced-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, Badge, TranslateModule],
  templateUrl: './advanced-data-table.html',
  styleUrls: ['./advanced-data-table.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvancedDataTable implements OnChanges {
  @Input({ required: true }) columns: AdvanceTableColumn[] = [];
  @Input({ required: true }) data: any[] = [];
  @Input() pageSize: number = 10;
  @Input() title: string = 'Data Table';

  // Internal State
  filteredData: any[] = [];
  paginatedData: any[] = [];

  // Controls
  searchText: string = '';
  statusFilter: string = 'All';
  currentPage: number = 1;
  totalPages: number = 1;

  // Available Statuses dynamically extracted
  availableStatuses: string[] = ['All'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.extractStatuses();
      this.applyFilters();
    }
  }

  extractStatuses() {
    const statuses = new Set<string>();
    this.data.forEach(item => {
      // Assuming 'status' is a key if status filtering is applicable
      if (item.status) statuses.add(item.status);
    });
    this.availableStatuses = ['All', ...Array.from(statuses)];
  }

  onSearchChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  selectStatus(status: string) {
    this.statusFilter = status;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    let temp = this.data;

    if (this.searchText) {
      const lowerQuery = this.searchText.toLowerCase();
      temp = temp.filter(item =>
        JSON.stringify(item).toLowerCase().includes(lowerQuery)
      );
    }

    if (this.statusFilter !== 'All') {
      temp = temp.filter(item => item.status === this.statusFilter);
    }

    this.filteredData = temp;
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize) || 1;
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
}
