import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdvancedDataTable, AdvanceTableColumn } from '../../../../shared/ui/advanced-data-table/advanced-data-table';
import { DrawerComponent } from '../../../../shared/ui/drawer/drawer';
import { DrawerSectionComponent } from '../../../../shared/ui/drawer-section/drawer-section';
import { PageLayoutComponent } from '../../../../shared/ui/page-layout/page-layout';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    AdvancedDataTable,
    DrawerComponent,
    DrawerSectionComponent,
    PageLayoutComponent,
    PageHeaderComponent,
  ],
  templateUrl: './payments.html',
  styleUrls: ['./payments.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Payments implements OnInit {
  private translate = inject(TranslateService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  showDrawer = signal(false);
  isSubmitting = false;
  openSection = signal<number>(1);

  invoiceForm = this.fb.group({
    studentId: ['', Validators.required],
    concept: ['', Validators.required],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    dueDate: ['', Validators.required],
    paymentMethod: ['card', Validators.required]
  });

  openDrawer() { this.showDrawer.set(true); }

  closeDrawer() {
    this.invoiceForm.reset({ paymentMethod: 'card' });
    this.openSection.set(1);
    this.showDrawer.set(false);
  }

  toggleSection(n: number) {
    this.openSection.set(this.openSection() === n ? 0 : n);
  }

  onSubmit() {
    if (this.invoiceForm.invalid) return;
    this.isSubmitting = true;
    setTimeout(() => {
      this.toastService.success('NOTIFICATIONS.INVOICE_CREATED', {
        id: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
        name: 'Selected Student'
      });
      this.isSubmitting = false;
      this.closeDrawer();
    }, 800);
  }

  columns: AdvanceTableColumn[] = [
    { key: 'invoiceId', label: 'COMMON.TABLE.INVOICE_ID', type: 'text' },
    { key: 'member', label: 'COMMON.TABLE.MEMBER', type: 'member' },
    { key: 'date', label: 'COMMON.TABLE.BILLING_DATE', type: 'text' },
    { key: 'amount', label: 'COMMON.TABLE.AMOUNT', type: 'currency' },
    { key: 'status', label: 'COMMON.TABLE.STATUS', type: 'status' }
  ];

  paymentsData: any[] = [];

  ngOnInit() {
    this.generateData();
    this.translate.onLangChange.subscribe(() => this.generateData());
  }

  generateData() {
    this.paymentsData = Array.from({ length: 55 }, (_, i) => {
      const statuses = ['Paid', 'Pending', 'Overdue'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomAmount = Math.floor(Math.random() * 500) + 50;
      const month = this.translate.instant('COMMON.MONTHS.OCT');

      return {
        invoiceId: `INV-2026-${(1000 + i).toString()}`,
        member: {
          initials: String.fromCharCode(65 + (i % 26)) + String.fromCharCode(65 + ((i + 1) % 26)),
          name: `Member Name ${i + 1}`
        },
        date: `${month} ${Math.floor(Math.random() * 30) + 1}, 2026`,
        amount: randomAmount,
        status: randomStatus
      };
    });
  }
}
