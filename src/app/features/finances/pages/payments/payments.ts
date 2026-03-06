import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvancedDataTable, AdvanceTableColumn } from '../../../../shared/ui/advanced-data-table/advanced-data-table';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, AdvancedDataTable],
  templateUrl: './payments.html',
  styleUrls: ['./payments.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Payments {

  columns: AdvanceTableColumn[] = [
    { key: 'invoiceId', label: 'Invoice ID', type: 'text' },
    { key: 'member', label: 'Member', type: 'member' },
    { key: 'date', label: 'Billing Date', type: 'text' },
    { key: 'amount', label: 'Amount', type: 'currency' },
    { key: 'status', label: 'Status', type: 'status' }
  ];

  // Generate 55 dummy records for pagination testing
  paymentsData = Array.from({ length: 55 }, (_, i) => {
    const statuses = ['Paid', 'Pending', 'Overdue'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomAmount = Math.floor(Math.random() * 500) + 50;

    return {
      invoiceId: `INV-2026-${(1000 + i).toString()}`,
      member: {
        initials: String.fromCharCode(65 + (i % 26)) + String.fromCharCode(65 + ((i + 1) % 26)),
        name: `Member Name ${i + 1}`
      },
      date: `Oct ${Math.floor(Math.random() * 30) + 1}, 2026`,
      amount: randomAmount,
      status: randomStatus
    };
  });
}
