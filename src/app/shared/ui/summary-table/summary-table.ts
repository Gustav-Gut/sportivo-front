import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Badge } from '../badge/badge';
import { TranslateModule } from '@ngx-translate/core';

export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'currency' | 'status' | 'member';
}

@Component({
  selector: 'app-summary-table',
  standalone: true,
  imports: [CommonModule, Badge, TranslateModule],
  templateUrl: './summary-table.html',
  styleUrls: ['./summary-table.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryTable {
  @Input({ required: true }) columns: TableColumn[] = [];
  @Input({ required: true }) data: any[] = [];
}
