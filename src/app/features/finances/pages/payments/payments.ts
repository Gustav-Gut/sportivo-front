import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdvancedDataTable, AdvanceTableColumn } from '../../../../shared/ui/advanced-data-table/advanced-data-table';
import { InvoiceModal } from '../../../../shared/ui/invoice-modal/invoice-modal';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, AdvancedDataTable, InvoiceModal, TranslateModule],
  templateUrl: './payments.html',
  styleUrls: ['./payments.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Payments {
  private translate = inject(TranslateService);
  isInvoiceModalOpen = false;

  openInvoiceModal() {
    this.isInvoiceModalOpen = true;
  }

  closeInvoiceModal() {
    this.isInvoiceModalOpen = false;
  }

  columns: AdvanceTableColumn[] = [
    { key: 'invoiceId', label: 'COMMON.TABLE.INVOICE_ID', type: 'text' },
    { key: 'member', label: 'COMMON.TABLE.MEMBER', type: 'member' },
    { key: 'date', label: 'COMMON.TABLE.BILLING_DATE', type: 'text' },
    { key: 'amount', label: 'COMMON.TABLE.AMOUNT', type: 'currency' },
    { key: 'status', label: 'COMMON.TABLE.STATUS', type: 'status' }
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
